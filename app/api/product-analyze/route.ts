import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';
import { callVertexAI } from '@/lib/vertexai';

const prisma = new PrismaClient();

export async function POST(request: Request) {
  try {
    // 1. AUTHENTICATION
    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.substring(7);
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key') as { userId: string };
    } catch (err) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const userId = decoded.userId;

    // 2. GET INPUT DATA
    const { productName } = await request.json();

    if (!productName || !productName.trim()) {
      return NextResponse.json(
        { error: 'Введите название продукции' },
        { status: 400 }
      );
    }

    const productNameTrimmed = productName.trim();

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
        analysisType: "product", // тип анализа
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
  } finally {
    await prisma.$disconnect();
  }
}

