import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Extract key sections from full analysis report to keep prompt focused
function extractKeySections(reportText: string) {
  const sections = {
    companyInfo: '',
    keyRecommendations: '',
    insights: ''
  };

  const headerMatch = reportText.match(/^([\s\S]*?)(?=##)/);
  if (headerMatch) {
    sections.companyInfo = headerMatch[1].trim();
  }

  const keyRecsMatch = reportText.match(/## КЛЮЧЕВЫЕ РЕКОМЕНДАЦИИ[\s\S]*?(?=##|$)/);
  if (keyRecsMatch) {
    sections.keyRecommendations = keyRecsMatch[0];
  }

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

Раздел 2: "БОЛЬНЫЕ МЕСТА" (На что "надавить" в разговоре)

Задача: Найди в отчете 1-2 самые вероятные системные проблемы их отдела снабжения (не "им не хватает гаек", а "у них хаос в логистике"). Это покажет, что менеджер понимает их внутреннюю кухню.

Как сделать: Сформулируй эти проблемы как вежливые вопросы-предположения о том, как у них все устроено.

Важно: Говорим о процессах, а не о товарах.

Раздел 3: ЧТО КОНКРЕТНО ПРЕДЛОЖИТЬ (Главная польза)

Задача: Дай 3 четких предложения, которые решают проблемы снабженца и доказывают, что менеджер — полезный партнер, а не просто "впариватель".

Польза 1 (Решение большой проблемы): Предложи забрать у них самую головную боль — целую категорию закупок. Не один товар, а группу.

Польза 2 (Снижение рисков и рутины): Предложи что-то, что снимет с них ежедневную головную боль (логистика, контроль, деньги).

Польза 3 (Все в одном окне): Предложи упростить им жизнь, став "одним окном" для разных мелочей.

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

export async function POST(request: NextRequest, context: { params: { id: string } }) {
  const { params } = context;
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

    const analysisId = params.id;
    if (!analysisId) {
      return NextResponse.json({ error: 'Analysis ID required' }, { status: 400 });
    }

    // Load analysis from DB
    const analysis = await prisma.analysis.findUnique({
      where: { id: analysisId },
      select: { id: true, reportText: true, companyName: true, companyInn: true }
    });

    if (!analysis || !analysis.reportText) {
      return NextResponse.json({ error: 'Analysis not found' }, { status: 404 });
    }

    // Prepare prompt
    const keySections = extractKeySections(analysis.reportText);
    const prompt = TARGET_PROPOSAL_PROMPT
      .replace('{companyInfo}', keySections.companyInfo)
      .replace('{insights}', keySections.insights)
      .replace('{keyRecommendations}', keySections.keyRecommendations)
      .replace('{companyName}', analysis.companyName || 'компанию');

    console.log('📏 [Target] Report length:', analysis.reportText.length);
    console.log('📏 [Target] Prompt length:', prompt.length);

    // Call Vertex AI WITHOUT Google Search
    const { callVertexAI } = await import('@/lib/vertexai');
    const ai = await callVertexAI(prompt, false);
    let proposalText = ai.text || '';

    if (!proposalText) {
      return NextResponse.json({ error: 'Не удалось получить предложение' }, { status: 500 });
    }

    // Cleanup intro phrases
    const cleanProposal = (text: string): string => {
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
      for (const pattern of introPatterns) text = text.replace(pattern, '');
      text = text.replace(/^#\s*Шпаргалка для первого звонка в/im, '# Вариант для первого звонка в');
      return text.trim();
    };
    proposalText = cleanProposal(proposalText);

    // Save to DB (best-effort)
    try {
      await prisma.analysis.update({
        where: { id: analysisId },
        data: { targetProposal: proposalText }
      });
    } catch (e) {
      console.warn('⚠️ [Target] Failed to cache proposal in DB:', e);
    }

    return NextResponse.json({ proposalText });
  } catch (error) {
    console.error('[Target API] Error:', error);
    return NextResponse.json({ error: 'Ошибка генерации предложения' }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}


