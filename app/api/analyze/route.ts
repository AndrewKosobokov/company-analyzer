import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';
import { generatePrompt } from '@/utils/prompt';
import { formatAnalysisText } from '@/utils/formatAnalysisText';
import { extractAndValidateInn } from '@/utils/extractInn';

const prisma = new PrismaClient();

// Функция для извлечения только нужных разделов из отчёта
function extractKeySections(reportText: string) {
  const sections = {
    companyInfo: '',
    keyRecommendations: '',
    insights: ''
  };
  
  // Извлекаем информацию о компании (первые 500 символов до первого ##)
  const headerMatch = reportText.match(/^([\s\S]*?)(?=##)/);
  if (headerMatch) {
    sections.companyInfo = headerMatch[1].trim();
  }
  
  // Извлекаем "КЛЮЧЕВЫЕ РЕКОМЕНДАЦИИ"
  const keyRecsMatch = reportText.match(/## КЛЮЧЕВЫЕ РЕКОМЕНДАЦИИ[\s\S]*?(?=##|$)/);
  if (keyRecsMatch) {
    sections.keyRecommendations = keyRecsMatch[0];
  }
  
  // Извлекаем "ИНСАЙТЫ И СТРАТЕГИЯ ВЗАИМОДЕЙСТВИЯ"
  const insightsMatch = reportText.match(/## ИНСАЙТЫ И СТРАТЕГИЯ ВЗАИМОДЕЙСТВИЯ[\s\S]*?(?=##|$)/);
  if (insightsMatch) {
    sections.insights = insightsMatch[0];
  }
  
  return sections;
}

const TARGET_PROPOSAL_PROMPT = `
ВАЖНО: Начни ответ СРАЗУ с заголовка. БЕЗ вступительных фраз типа "Отлично, задача ясна", "Я проанализировал", "Хорошо, создам предложение" и т.п.

КТО ТЫ И ЧТО ДЕЛАТЬ

Твоя роль: Ты — опытный бизнес-аналитик, который помогает компаниям наладить B2B-закупки.

Твоя задача: Посмотри на этот аналитический отчет о заводе (промышленном предприятии).

Что нужно сделать (результат): Напиши для менеджера по продажам (сейлза) понятную и полезную "вариант для первого звонка".

Зачем это нужно: С этим "вариантом" менеджер будет впервые звонить или писать начальнику отдела снабжения (закупщику) на этом предприятии.

Главная цель: Помочь менеджеру показать себя как эксперта, который пришел не просто "продавать болты" (номенклатуру), а помочь решить реальные проблемы их отдела снабжения (например, вечную загруженность, риски срыва поставок, общую эффективность).

ПЛАН ТВОЕГО ОТВЕТА (Обязательные разделы)

Ты должен дать ответ строго по этому плану. НАЧНИ СРАЗУ С ЗАГОЛОВКА:

Раздел 1: КАК ПРЕДСТАВИТЬСЯ

Задача: Сформулируй для менеджера вступительную фразу. Она должна быть правдоподобной и сразу смещать фокус с "купи-продай" на "решение проблем". Менеджер должен представиться сотрудником своей компании, но сразу обозначить ценность, которую он несет отделу снабжения.

Как НЕ надо: "Я менеджер по продажам..." (слишком банально), "Я консультант по оптимизации..." (фальшиво и оторвано от жизни), "Я специалист по снижению рисков..." (непонятно).

Как сделать: Предложи 2-3 варианта готовой фразы, которая начинается с реального представления (Имя, Компания), но тут же переходит к пользе для процесса снабжения.

Примеры (как должны выглядеть твои предложения):

"Добрый день. Меня зовут [Имя], я из [Компания N]. Мы — поставщики, но работаем не как все: мы помогаем производствам, как ваше, снять с отдела снабжения головную боль по целым категориям закупок. Я как раз хотел..."

"Здравствуйте. [Имя], [Компания N]. Я специализируюсь на работе с крупными заводами и отвечаю за то, чтобы поставки приходили вовремя и без хаоса в документах. У меня есть пара мыслей по вашему предприятию..."

"Добрый день. [Имя], [Компания N]. Мы помогаем таким предприятиям, как ваше, наладить бесперебойные поставки и сократить число мелких контрагентов. Хотел бы задать пару вопросов по вашим процессам..."

Суть: Фраза должна быть "человеческой", правдоподобной и сразу показывать, что менеджер понимает процессы снабжения, а не просто смотрит в каталог.

Раздел 2: "БОЛЬНЫЕ МЕСТА" (На что "надавить" в разговоре)

Задача: Найди в отчете 1-2 самые вероятные системные проблемы их отдела снабжения (не "им не хватает гаек", а "у них хаос в логистике"). Это покажет, что менеджер понимает их внутреннюю кухню.

Как сделать: Сформулируй эти проблемы как вежливые вопросы-предположения о том, как у них все устроено.

Важно: Говорим о процессах, а не о товарах.

Плохо: "Я вижу, у вас проблемы с покупкой титановых сплавов..."

Хорошо: "Руководители снабжения на похожих заводах часто жалуются, что уйма времени уходит на возню с десятками мелких поставщиков. У вас так же?"

Или: "Судя по вашим объемам, вам, наверное, важно, чтобы поставки шли без сбоев, и при этом не приходилось платить кучу авансов. Я прав в своих догадках?"

Или: "Наверное, при таких закупках, как у вас, непросто следить, чтобы и качество не плавало, и все документы от поставщиков были в идеальном порядке. Сталкиваетесь с таким?"

Раздел 3: ЧТО КОНКРЕТНО ПРЕДЛОЖИТЬ (Главная польза)

Задача: Дай 3 четких предложения, которые решают проблемы снабженца и доказывают, что менеджер — полезный партнер, а не просто "впариватель".

Польза 1 (Решение большой проблемы): Предложи забрать у них самую головную боль — целую категорию закупок. Не один товар, а группу.

Пример: "Мы можем полностью закрыть всю вашу потребность в метизах и крепеже, держать их у себя на складе и привозить за 48 часов, чтобы ваши инженеры не простаивали".

Польза 2 (Снижение рисков и рутины): Предложи что-то, что снимет с них ежедневную головную боль (логистика, контроль, деньги).

Пример: "Мы готовы работать с отсрочкой платежа и держать под вас запас самых важных позиций на нашем складе. Это снизит ваши риски и нагрузку на бюджет".

Польза 3 (Все в одном окне): Предложи упростить им жизнь, став "одним окном" для разных мелочей.

Пример: "Кроме основных позиций, мы можем привозить вам всю 'мелочевку', которая нужна регулярно — от перчаток до расходников. Вы получите один договор и один счет вместо десяти, а ваши люди смогут заняться более важными делами".

ВАЖНЫЕ ПРАВИЛА:

НЕ ИСПОЛЬЗУЙ ЭМОДЗИ.

Твой ответ должен быть четко структурированным текстом.

Используй понятные заголовки для каждого раздела.

Пиши по делу, профессионально, но человеческим языком.

ИНФОРМАЦИЯ О КОМПАНИИ:
{companyInfo}

{insights}

{keyRecommendations}

ФОРМАТ ОТВЕТА:
Начни ответ ПРЯМО с заголовка:

# Вариант для первого звонка в {companyName}

Затем следуй плану разделов выше.

НАПОМИНАНИЕ: БЕЗ вступлений, БЕЗ фраз "Отлично, задача ясна", "Я проанализировал". Начни СРАЗУ с заголовка "# Вариант для первого звонка в {companyName}".
`;

// Simple retry function with exponential backoff
async function retryWithExponentialBackoff<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  initialDelay: number = 1000
): Promise<T> {
  let lastError: any;
  
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      if (attempt < maxRetries - 1) {
        const delay = initialDelay * Math.pow(2, attempt);
        console.log(`Retry attempt ${attempt + 1}/${maxRetries} after ${delay}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }
  
  throw lastError;
}

// Clean up any introductory phrases that AI might still add
function cleanProposal(text: string): string {
  const introPatterns = [
    /^Отлично[,.]?\s*задача ясна[.!]?\s*/i,
    /^Я проанализировал[^.!\n]*[.!\n]\s*/i,
    /^Хорошо[,.]?\s*[^.!\n]*[.!\n]\s*/i,
    /^Понятно[,.]?\s*[^.!\n]*[.!\n]\s*/i,
    /^Конечно[,.]?\s*[^.!\n]*[.!\n]\s*/i,
    /^Ясно[,.]?\s*[^.!\n]*[.!\n]\s*/i,
    /^Хорошо[,.]?\s*создам предложение[.!]?\s*/i,
    /^Сейчас[,.]?\s*[^.!\n]*[.!\n]\s*/i,
  ];
  
  for (const pattern of introPatterns) {
    text = text.replace(pattern, '');
  }
  
  text = text.replace(
    /^#\s*Шпаргалка для первого звонка в/im,
    '# Вариант для первого звонка в'
  );
  
  return text.trim();
}

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
    const { url, inn } = await request.json();

    const finalUrl = url?.trim() || '';
    const finalInn = inn?.trim() || '';

    // Validation: at least one must be provided
    if (!finalUrl && !finalInn) {
      return NextResponse.json(
        { error: 'Укажите сайт или ИНН компании' },
        { status: 400 }
      );
    }

    // Validate INN format (10 or 12 digits)
    if (finalInn && (finalInn.length !== 10 && finalInn.length !== 12)) {
      return NextResponse.json(
        { error: 'ИНН должен содержать 10 или 12 цифр' },
        { status: 400 }
      );
    }

    if (finalInn && !/^\d+$/.test(finalInn)) {
      return NextResponse.json(
        { error: 'ИНН должен содержать только цифры' },
        { status: 400 }
      );
    }

    // 3. CHECK USER LIMITS
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { analysesRemaining: true, plan: true }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    if (user.analysesRemaining <= 0) {
      return NextResponse.json({
        error: 'Лимит анализов исчерпан. Обновите тариф.',
        analysesRemaining: 0
      }, { status: 403 });
    }

    // 4. FETCH WEBSITE CONTENT (ONLY if URL provided)
    let siteText = '';

    if (finalUrl) {
      try {
        console.log('📥 Fetching website:', finalUrl);

        const siteResponse = await fetch(finalUrl, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
          },
          signal: AbortSignal.timeout(15000) // 15 second timeout
        });

        if (siteResponse.ok) {
          const html = await siteResponse.text();

          // Extract text from HTML (remove scripts, styles, tags)
          siteText = html
            .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
            .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')
            .replace(/<[^>]+>/g, ' ')
            .replace(/\s+/g, ' ')
            .trim()
            .substring(0, 50000); // Limit to 50k characters

          console.log(`✅ Fetched ${siteText.length} characters from website`);
        } else {
          console.warn(`⚠️ Could not fetch website (${siteResponse.status}). Continuing with analysis...`);
        }
      } catch (error) {
        console.warn('⚠️ Error fetching website:', error);
        // Continue with analysis even if fetch fails
      }
    } else {
      console.log('📝 Analysis by INN only (no website parsing)');
    }

    // 5. GENERATE PROMPT
    const prompt = generatePrompt(siteText, finalUrl, finalInn);
    console.log(`📝 Generated prompt (${prompt.length} chars)`);

    // 6. CALL VERTEX AI (MAIN ANALYSIS)
    console.log('🤖 Calling Vertex AI...');
    const { callVertexAI } = await import('@/lib/vertexai');
    let aiResponse;
    try {
      aiResponse = await retryWithExponentialBackoff(
        () => callVertexAI(prompt, true),  // true = с Google Search
        3,
        1000
      );
      console.log(`✅ Received ${aiResponse.text.length} characters from Vertex AI`);
    } catch (error) {
      console.error('❌ Vertex AI Error:', error);
      return NextResponse.json({ error: 'Ошибка при анализе компании через Vertex AI' }, { status: 500 });
    }

    const rawAnalysisText = aiResponse.text;
    const analysisText = formatAnalysisText(rawAnalysisText);

    // 7. ГЕНЕРАЦИЯ "ПРИМЕР ПЕРВОГО КОНТАКТА"
    let firstContactExample: string | null = null;

    try {
      console.log('📞 Generating "First Contact Example" (without Google Search)...');
      
      // Извлекаем только нужные разделы из отчёта
      const keySections = extractKeySections(analysisText);
      
      // Определяем имя компании из отчета
      const companyNameMatch = analysisText.match(/\*\*Компания:\*\*\s*(.+?)(?=\n|\*\*|$)/);
      let companyName = companyNameMatch ? companyNameMatch[1].replace(/\*\*/g, '').trim() : 
        (finalUrl ? `Компания ${finalUrl}` : `Компания ИНН ${finalInn || 'Не указан'}`);
      
      const targetPrompt = TARGET_PROPOSAL_PROMPT
        .replace('{companyInfo}', keySections.companyInfo)
        .replace('{insights}', keySections.insights)
        .replace('{keyRecommendations}', keySections.keyRecommendations)
        .replace('{companyName}', companyName || 'компанию');
      
      const contactResponse = await retryWithExponentialBackoff(
        () => callVertexAI(targetPrompt, false),  // false = БЕЗ Google Search
        3,
        1000
      );
      
      firstContactExample = cleanProposal(contactResponse.text);
      console.log(`✅ Generated first contact example: ${firstContactExample.length} characters`);
      
    } catch (error) {
      console.error('⚠️ Failed to generate first contact example:', error);
      firstContactExample = null;
    }

    // CHECK IF NON-TARGET CLIENT
    const isNonTargetClient = analysisText.includes("## АНАЛИЗ НЕЦЕЛЕСООБРАЗЕН");
    console.log(`🎯 [QUALIFICATION] Is non-target client: ${isNonTargetClient}`);

    // EXTRACT INN FROM REPORT (if AI found it)
    const extractedInn = extractAndValidateInn(analysisText);

    // INN priority: User provided > Extracted from report > null
    const finalCompanyInn = finalInn || extractedInn || null;

    // Add detailed logging for debugging
    console.log('📊 [INN] User provided INN:', finalInn || 'None');
    console.log('📊 [INN] Extracted from report:', extractedInn || 'Not found');
    console.log('📊 [INN] Final INN to save:', finalCompanyInn || 'None');

    // 8. SAVE TO DATABASE
    const companyName = finalUrl
      ? `Компания ${finalUrl}`
      : `Компания ИНН ${finalCompanyInn || 'Не указан'}`;

    const creditsUsed = isNonTargetClient ? 0 : 1;

    const analysis = await prisma.analysis.create({
      data: {
        userId: userId,
        companyName: companyName,
        companyInn: finalCompanyInn,
        reportText: analysisText,
        firstContactExample: firstContactExample,
        isNonTargetClient: isNonTargetClient,
        creditsUsed: creditsUsed,
      },
    });

    // 9. UPDATE USER ANALYSES COUNT (ONLY for target clients)
    let updatedAnalysesRemaining = user.analysesRemaining;
    if (!isNonTargetClient) {
      await prisma.user.update({
        where: { id: userId },
        data: { analysesRemaining: { decrement: 1 } }
      });
      updatedAnalysesRemaining = user.analysesRemaining - 1;
      console.log(`✅ Analysis count decremented for target client. Remaining: ${updatedAnalysesRemaining}`);
    } else {
      console.log(`ℹ️ Analysis count NOT decremented for non-target client. Remaining: ${updatedAnalysesRemaining}`);
    }

    console.log(`✅ Analysis saved. ID: ${analysis.id}, User remaining: ${updatedAnalysesRemaining}`);

    // 10. RETURN RESPONSE
    return NextResponse.json({
      analysisId: analysis.id,
      hasFirstContact: !!firstContactExample,
      message: isNonTargetClient ? 'Анализ завершён (нецелевой клиент)' : 'Анализ завершён',
      analysesRemaining: updatedAnalysesRemaining,
      isNonTargetClient: isNonTargetClient
    });

  } catch (error) {
    console.error('❌ Unexpected error:', error);
    return NextResponse.json(
      { error: 'Ошибка при создании анализа' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
