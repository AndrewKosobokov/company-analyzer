import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { callVertexAI } from '@/lib/vertexai';
import prisma from '@/app/lib/prisma';
import { checkRateLimit, analyzeLimiter } from '@/app/lib/rateLimiter';
import { validateRequest } from '@/app/lib/validateRequest';
import { productAnalyzeSchema } from '@/app/lib/schemas';

export async function POST(request: Request) {
  try {
    // 1. GET USER ID FROM TOKEN (already validated by middleware)
    const accessToken = request.cookies.get('access_token')?.value;
    const authHeader = request.headers.get('Authorization');
    const headerToken = authHeader?.startsWith('Bearer ') ? authHeader.substring(7) : null;
    const token = accessToken || headerToken;

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Decode token (no need to verify - middleware already did)
    const decoded = jwt.decode(token) as { userId: string };
    if (!decoded || !decoded.userId) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const userId = decoded.userId;
    
    // RATE LIMITING
    const rateLimitResult = await checkRateLimit(userId, analyzeLimiter);
    if (!rateLimitResult.success) {
      console.warn(`[RateLimit] User ${userId} exceeded product-analyze limit`);
      return NextResponse.json(
        { error: 'Слишком много запросов. Попробуйте позже.' },
        { status: 429, headers: { 'Retry-After': rateLimitResult.retryAfter!.toString() } }
      );
    }

    // 2. ВАЛИДАЦИЯ ВХОДНЫХ ДАННЫХ
    const validation = await validateRequest(request, productAnalyzeSchema);
    if (!validation.success) return validation.response;
    
    const productNameTrimmed = validation.data.productName;

    // 3. BUILD PROMPT
    const prompt = `Role: Ты — ведущий аналитик рынка B2B и эксперт по лидогенерации. Твоя задача — дать исчерпывающую карту рынка для менеджера по продажам.

Context: Пользователь продает товар: "${productNameTrimmed}".

Goal: Составить максимально полный список РЕАЛЬНЫХ целевых предприятий.
ВАЖНО: Количество компаний в списке должно определяться ТОЛЬКО объемом рынка, а не искусственными рамками.

Task 1: Анализ и Стратификация
1. Определи тип товара (Сырье, Химия, Электроника, Оборудование).
2. Определи структуру рынка:
   - Это узкая ниша? (Всего 2-5 игроков на всю страну).
   - Или это массовый рынок? (Сотни заводов).
3. Наметь стратегию поиска:
   - Промышленные гиганты и холдинги.
   - Крупные частные заводы и специализированные производители (лидеры в своих нишах).
   - Узкоспециализированные КБ, НПП и интеграторы (скрытые чемпионы).

Task 2: Список целевых предприятий (Strict Market Reality Mode)
Перечисли российские предприятия, сгруппированные по сегментам/отраслям.

ПРАВИЛА КОЛИЧЕСТВА (CRITICAL):
1. **Если рынок узкий (Niche):** Перечисли ВСЕХ найденных игроков (даже если их всего 3). НЕ выдумывай лишних, чтобы сделать список длиннее.
2. **Если рынок широкий (Mass Market):** Не ограничивайся 10 компаниями. Пиши максимально подробный список (20, 30, 40 позиций), пока не перечислишь всех значимых платежеспособных игроков. Охвати и Москву, и регионы.
3. **Баланс:** Список должен содержать и Госзаказчиков (ВПК, Космос), и Частный бизнес (Коммерческие продукты).

ПРАВИЛА СОДЕРЖАНИЯ:
1. Включай только реально существующие компании РФ.
2. **Адаптивная форма:**
   - Для Металла/Химии -> Укажи "В каком виде/таре".
   - Для Комплектующих -> Укажи "Применение/Узел" (куда ставится).

Формат пункта списка:
* **Название (Город)** — *Статус (Гос/Частный/Холдинг)*
    * *Потребность:* **[Вид поставки / Узел применения]**
    * *Обоснование:* Производят [Конечное изделие], технология которого требует "${productNameTrimmed}".

ВАЖНО: НЕ указывай ИНН компаний в списке.

Task 3: Таблица стратегии продаж
Колонки:
1. "Сегмент / Тип клиента" (например: Частные производители оборудования vs Госкорпорации).
2. "Специфика закупки" (Тендеры / Прямые договоры / Работа через дилеров).
3. "Технический аргумент" (Уникальный заход для этого сегмента).

Таблицу форматируй в Markdown:
| Сегмент / Тип клиента | Специфика закупки | Технический аргумент |
|-----------------------|-------------------|---------------------|
| ... | ... | ... |

Input Variable:
Товар: ${productNameTrimmed}

ФОРМАТ ОТВЕТА:
- Используй Markdown разметку
- Заголовки: ## для основных разделов (Task 1, Task 2, Task 3)
- Списки: используй * для предприятий с вложенностью для деталей
- Таблица: используй Markdown формат
- Жирный текст: **текст** для названий компаний и статусов
- Не пиши вступлений ("Конечно, вот список..."). Сразу давай анализ и список.
- Список должен быть полным, не обрывай его
- Не останавливайся на середине ответа — доведи все разделы до конца

ФОРМАТ ЗАГОЛОВКОВ (КРИТИЧНО):
- НЕ используй префиксы вроде "Task X:" или английские комментарии в скобках
- Используй только чистые русские заголовки
- ПРАВИЛЬНЫЕ заголовки (используй их без изменений):
  1. Анализ и Стратификация
  2. Список целевых предприятий
  3. Таблица стратегии продаж
- НЕПРАВИЛЬНЫЕ варианты (НЕ используй их): 
  Task 1: Анализ и Стратификация (Deep Dive), Task 2: Список целевых предприятий (Strict Mode), Task 3: Таблица стратегии продаж
`;

    // 4. CALL VERTEX AI
    console.log(`[Product Analyze] Analyzing product: ${productNameTrimmed}`);
    
    // Шаг 1: основной отчёт
    console.log('[Product Analysis] Step 1: Generating main report...');
    const reportResult = await callVertexAI(prompt, true);
    const finalReport = reportResult.text;
    
    // 5. SAVE TO DATABASE
    const analysis = await prisma.analysis.create({
      data: {
        userId: userId,
        companyName: productNameTrimmed, // название продукции
        companyInn: null, // для продукции нет ИНН
        reportText: finalReport,
        firstContactExample: null, // для продукции нет скрипта
        isNonTargetClient: false,
        creditsUsed: 0, // НЕ списываем баланс
        isDeleted: false,
      },
    });

    // НЕ уменьшаем баланс пользователя (не трогаем analysesRemaining)
    
    // 6. RETURN RESULT
    return NextResponse.json({
      id: analysis.id,
      analysisId: analysis.id,
      success: true,
      text: finalReport,
      citations: reportResult.citations || [],
    });

  } catch (error: any) {
    console.error('[Product Analyze] Error:', error);
    return NextResponse.json(
      { error: error.message || 'Ошибка при анализе продукции' },
      { status: 500 }
    );
  }
}
