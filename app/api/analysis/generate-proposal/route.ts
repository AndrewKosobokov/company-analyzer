import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';

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

export async function POST(request: NextRequest) {
  try {
    // Authentication
    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const token = authHeader.substring(7);
    try {
      jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    } catch {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const { reportText, companyName, companyInn, analysisId } = await request.json();

    console.log('💾 [API] Received proposal generation request');
    console.log('💾 [API] Analysis ID:', analysisId);
    console.log('💾 [API] Company:', companyName);

    if (!reportText) {
      return NextResponse.json({ error: 'Report text required' }, { status: 400 });
    }

    if (!analysisId) {
      console.error('❌ [API] Missing analysisId parameter!');
      return NextResponse.json({ error: 'Analysis ID required' }, { status: 400 });
    }

    // Call Gemini API
    const geminiApiKey = process.env.GEMINI_API_KEY;

    const workerUrl = process.env.CLOUDFLARE_WORKER_URL || 'https://metalvector-proxy.apiforjobproject.workers.dev';
    if (!geminiApiKey) {
      return NextResponse.json(
        { error: 'Gemini API key not configured' },
        { status: 500 }
      );
    }

    // Извлекаем только нужные разделы из отчёта
    const keySections = extractKeySections(reportText);

    const prompt = TARGET_PROPOSAL_PROMPT
      .replace('{companyInfo}', keySections.companyInfo)
      .replace('{insights}', keySections.insights)
      .replace('{keyRecommendations}', keySections.keyRecommendations)
      .replace('{companyName}', companyName || 'компанию');

    console.log('📏 Размер исходного отчёта:', reportText.length, 'символов');
    console.log('📏 Размер оптимизированного промпта:', prompt.length, 'символов');
    console.log('🤖 Using stable Gemini 2.5 Pro for production');
    const geminiResponse = await fetch(
      `${workerUrl}/v1beta/models/gemini-2.5-pro:generateContent?key=${geminiApiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ 
            parts: [{ text: prompt }] 
          }],
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 8000,
            topP: 0.95,
            topK: 40
            // NO responseMimeType - we want plain text
          }
        })
      }
    );

    if (!geminiResponse.ok) {
      const errorData = await geminiResponse.json();
      console.error('Gemini API Error:', errorData);
      return NextResponse.json(
        { error: 'Ошибка генерации предложения' },
        { status: 500 }
      );
    }

    const geminiData = await geminiResponse.json();
    
    // Extract text from response (plain text now)
    const parts = geminiData.candidates?.[0]?.content?.parts || [];
    let proposalText = parts.map((part: any) => part.text || '').join('');
    
    if (!proposalText) {
      console.error('No text in Gemini response');
      return NextResponse.json(
        { error: 'Не удалось получить предложение' },
        { status: 500 }
      );
    }

    // Clean up any introductory phrases that AI might still add
    const cleanProposal = (text: string): string => {
      // Remove common intro phrases
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
      
      // Replace "Шпаргалка" with "Вариант" if it wasn't changed by AI
      text = text.replace(
        /^#\s*Шпаргалка для первого звонка в/im,
        '# Вариант для первого звонка в'
      );
      
      return text.trim();
    };
    
    proposalText = cleanProposal(proposalText);

    // Save proposal to database
    try {
      console.log('💾 [API] Saving proposal to database...');
      console.log('💾 [API] Proposal length:', proposalText.length, 'characters');
      
      await prisma.analysis.update({
        where: { id: analysisId },
        data: { targetProposal: proposalText }
      });
      
      console.log(`✅ [API] Target proposal saved successfully for analysis ${analysisId}`);
      console.log(`✅ [API] Cached ${proposalText.length} characters in database`);
    } catch (dbError) {
      console.error('❌ [API] Failed to save proposal to database:', dbError);
      // Don't fail the request if DB save fails - still return the proposal
    } finally {
      await prisma.$disconnect();
    }

    // Return plain text
    console.log('💾 [API] Returning proposal to client');
    return NextResponse.json({ proposalText });

  } catch (error) {
    console.error('Proposal generation error:', error);
    return NextResponse.json(
      { error: 'Не удалось сгенерировать предложение' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}




