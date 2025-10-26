import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';
import { generatePrompt } from '@/utils/prompt';
import { formatAnalysisText } from '@/utils/formatAnalysisText';
import { extractAndValidateInn } from '@/utils/extractInn';

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

    // 6. CALL GEMINI API VIA CLOUDFLARE WORKER
    console.log('🤖 Calling Gemini API via Cloudflare Worker...');

    const geminiApiKey = process.env.GEMINI_API_KEY;
    if (!geminiApiKey) {
      return NextResponse.json(
        { error: 'Gemini API key not configured' },
        { status: 500 }
      );
    }

    // ✅ ИЗМЕНЕНО: Используем Cloudflare Worker вместо прямого обращения к Google API
    const workerUrl = process.env.CLOUDFLARE_WORKER_URL || 'https://metalvector-proxy.apiforjobproject.workers.dev';
    
    console.log('🤖 Using stable Gemini 2.5 Pro via Cloudflare Worker');
    console.log('🔑 API Key:', geminiApiKey?.substring(0, 20) + '...');
    console.log('🌐 Worker URL:', workerUrl);
    console.log('🤖 Model: gemini-2.5-pro');
    
    const requestBody = {
      contents: [{
        parts: [{ text: prompt }]
      }],
      generationConfig: {
        temperature: 0.6,
        maxOutputTokens: 30000,  // Increased for thinking model (thinking phase + output)
        topP: 0.95,
        topK: 40,
      },
      tools: [{
        googleSearch: {}
      }]
    };

    console.log('📤 Отправляем в Gemini API:', JSON.stringify(requestBody, null, 2));
    
    const geminiResponse = await fetch(
      `${workerUrl}/v1beta/models/gemini-2.5-pro:generateContent?key=${geminiApiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody)
      }
    );

    if (!geminiResponse.ok) {
      const errorData = await geminiResponse.json();
      console.error('❌ Gemini API Error:', errorData);
      return NextResponse.json(
        { error: 'Ошибка анализа. Попробуйте позже.' },
        { status: 500 }
      );
    }

    const geminiData = await geminiResponse.json();

    // LOG FULL RESPONSE FOR DEBUGGING
    console.log('=== GEMINI RESPONSE ===');
    console.log(JSON.stringify(geminiData, null, 2));
    console.log('======================');

    // Combine ALL parts of the response (Gemini may split into multiple parts)
    const parts = geminiData.candidates?.[0]?.content?.parts || [];
    const rawAnalysisText = parts.map((part: any) => part.text || '').join('');

    if (!rawAnalysisText) {
      console.error('❌ No analysis text in response!');
      console.error('Response structure:', geminiData);
      return NextResponse.json(
        { error: 'Не удалось получить анализ от AI' },
        { status: 500 }
      );
    }

    console.log(`✅ Received ${rawAnalysisText.length} characters from Gemini`);

    // FORMAT TEXT: Remove *, #, format headers
    const analysisText = formatAnalysisText(rawAnalysisText);
    console.log(`✅ Formatted to ${analysisText.length} characters (clean Markdown)`);

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

    // 7. SAVE TO DATABASE
    const companyName = finalUrl
      ? `Компания ${finalUrl}`
      : `Компания ИНН ${finalCompanyInn || 'Не указан'}`;

    const analysis = await prisma.analysis.create({
      data: {
        userId: userId,
        companyName: companyName,
        companyInn: finalCompanyInn,
        reportText: analysisText,
        isDeleted: false,
        isNonTarget: isNonTargetClient,
      }
    });

    // 8. UPDATE USER ANALYSES COUNT (ONLY for target clients)
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

    // 9. RETURN RESPONSE
    return NextResponse.json({
      id: analysis.id,
      message: isNonTargetClient ? 'Анализ завершён (нецелевой клиент)' : 'Анализ завершён',
      analysesRemaining: updatedAnalysesRemaining,
      isNonTarget: isNonTargetClient
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
