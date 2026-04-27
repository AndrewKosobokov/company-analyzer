import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { generatePrompt } from '@/utils/prompt';
import { formatAnalysisText } from '@/utils/formatAnalysisText';
import { extractAndValidateInn } from '@/utils/extractInn';
import prisma from '@/app/lib/prisma';
import { checkRateLimit, analyzeLimiter } from '@/app/lib/rateLimiter';
import { validateRequest } from '@/app/lib/validateRequest';
import { analyzeSchema } from '@/app/lib/schemas';

// Simple retry function with exponential backoff
async function retryWithExponentialBackoff<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  initialDelay: number = 1000
): Promise<T> {
  let lastError: unknown;
  
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

export async function POST(request: NextRequest) {
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('🔍 STARTING ANALYSIS');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  
  console.log('📊 Environment Variables:');
  console.log('  GOOGLE_CLOUD_PROJECT:', process.env.GOOGLE_CLOUD_PROJECT || 'NOT SET');
  console.log('  GOOGLE_APPLICATION_CREDENTIALS:', process.env.GOOGLE_APPLICATION_CREDENTIALS || 'NOT SET');
  console.log('  GCLOUD_LOCATION:', process.env.GCLOUD_LOCATION || 'NOT SET (will use us-central1)');
  console.log('  VERTEX_AI_LOCATION:', process.env.VERTEX_AI_LOCATION || 'NOT SET (will use us-central1)');
  
  // Проверка существования credentials файла
  const fs = require('fs');
  const credPath = process.env.GOOGLE_APPLICATION_CREDENTIALS;
  if (credPath) {
    const exists = fs.existsSync(credPath);
    console.log('  Credentials file exists:', exists);
    if (!exists) {
      console.error('❌ CREDENTIALS FILE NOT FOUND AT:', credPath);
    } else {
      console.log('✅ Credentials file found at:', credPath);
    }
  } else {
    console.error('❌ GOOGLE_APPLICATION_CREDENTIALS not set in environment');
  }
  
  const analysisStartTime = Date.now();
  
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
    
    // RATE LIMITING (защита от злоупотребления дорогими AI запросами)
    const rateLimitResult = await checkRateLimit(userId, analyzeLimiter);
    
    if (!rateLimitResult.success) {
      console.warn(`[RateLimit] User ${userId} exceeded analyze limit`);
      return NextResponse.json(
        { 
          error: 'Слишком много запросов на анализ. Попробуйте позже.',
          retryAfter: rateLimitResult.retryAfter 
        },
        { 
          status: 429,
          headers: { 'Retry-After': rateLimitResult.retryAfter!.toString() }
        }
      );
    }

    // 2. ВАЛИДАЦИЯ ВХОДНЫХ ДАННЫХ
    const validation = await validateRequest(request, analyzeSchema);
    if (!validation.success) return validation.response;
    
    const { url, inn } = validation.data;
    const finalUrl = url;
    const finalInn = inn;

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
        console.log(`[Website] Fetching: ${finalUrl}`);
        const fetchStartTime = Date.now();

        const siteResponse = await fetch(finalUrl, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Accept': 'text/html,application/xhtml+xml',
            'Accept-Language': 'ru-RU,ru;q=0.9,en;q=0.8',
          },
          signal: AbortSignal.timeout(5000) // 5 секунд вместо 15
        });

        const fetchTime = Date.now() - fetchStartTime;
        console.log(`[Website] Response in ${fetchTime}ms, status: ${siteResponse.status}`);

        if (siteResponse.ok) {
          const html = await siteResponse.text();

          // Улучшенная очистка HTML
          siteText = html
            .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
            .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')
            .replace(/<noscript\b[^<]*(?:(?!<\/noscript>)<[^<]*)*<\/noscript>/gi, '')
            .replace(/<!--[\s\S]*?-->/g, '')
            .replace(/<svg\b[^<]*(?:(?!<\/svg>)<[^<]*)*<\/svg>/gi, '')
            .replace(/<[^>]+>/g, ' ')
            .replace(/\s+/g, ' ')
            .replace(/&nbsp;/g, ' ')
            .replace(/&[a-z]+;/g, '')
            .trim()
            .substring(0, 30000); // 30k символов

          console.log(`✅ [Website] Parsed ${siteText.length} chars`);
          
          if (siteText.length < 100) {
            console.warn(`⚠️ [Website] Very little content (${siteText.length} chars), may be blocked`);
          }
        } else {
          console.warn(`⚠️ [Website] HTTP ${siteResponse.status}, continuing without site content`);
          siteText = '';
        }
      } catch (error: unknown) {
        const err = error as { name?: string; message?: string };
        if (err.name === 'AbortError' || err.name === 'TimeoutError') {
          console.warn(`⚠️ [Website] Timeout after 5s for ${finalUrl}`);
        } else {
          console.warn(`⚠️ [Website] Error:`, err.message || error);
        }
        siteText = '';
      }
    } else {
      console.log('[Website] No URL provided, INN-only analysis');
    }

    let companyNameFromDadata: string | null = null;
    if (finalInn) {
      try {
        const dadataResponse = await fetch(
          'https://suggestions.dadata.ru/suggestions/api/4_1/rs/findById/party',
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Accept: 'application/json',
              Authorization: `Token ${process.env.DADATA_API_KEY || ''}`
            },
            body: JSON.stringify({ query: finalInn })
          }
        );
        if (dadataResponse.ok) {
          const dadataResult = await dadataResponse.json();
          const dadataData = dadataResult?.suggestions?.[0]?.data;
          companyNameFromDadata = dadataData?.name?.short_with_opf ?? dadataData?.name?.full_with_opf ?? null;
        }
      } catch (error) {
        console.warn('⚠️ [DaData] Failed to fetch company name:', error);
      }
    }

    // 5. GENERATE PROMPT
    const prompt = generatePrompt(siteText, finalUrl, finalInn, companyNameFromDadata ?? undefined);
    console.log(`📝 Generated prompt (${prompt.length} chars, site: ${siteText.length} chars)`);

    // 6. CALL VERTEX AI (MAIN ANALYSIS + MIND MAP)
    console.log('🤖 Calling Vertex AI...');
    const { callVertexAI } = await import('@/lib/vertexai');
    let aiResponse;
    try {
      // Step 1: Main report with Google Search
      console.log('[Analysis] Step 1: Generating main report...');
      const reportResult = await retryWithExponentialBackoff(
        () => callVertexAI(prompt, true),
        3,
        1000
      );
      console.log(`✅ Received ${reportResult.text.length} characters from Vertex AI (main report)`);

      const finalReport = reportResult.text;

      aiResponse = {
        text: finalReport,
        citations: reportResult.citations,
      };
    } catch (error) {
      console.error('❌ Vertex AI Error:', error);
      return NextResponse.json({ error: 'Ошибка при анализе компании через Vertex AI' }, { status: 500 });
    }

    const rawAnalysisText = aiResponse.text;
    const analysisText = formatAnalysisText(rawAnalysisText);

    // 7. CHECK IF NON-TARGET CLIENT
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

    const creditsUsed = 1;

    const analysis = await prisma.analysis.create({
      data: {
        userId: userId,
        companyName: companyName,
        companyInn: finalCompanyInn,
        reportText: analysisText,
        firstContactExample: null, // Больше не генерируем
        isNonTargetClient: isNonTargetClient,
        creditsUsed: creditsUsed,
      },
    });

    // 9. UPDATE USER ANALYSES COUNT
    // Всегда списывать анализ
    await prisma.user.update({
      where: { id: userId },
      data: { analysesRemaining: { decrement: 1 } }
    });
    const updatedAnalysesRemaining = user.analysesRemaining - 1;
    console.log(`✅ Analysis count decremented. Remaining: ${updatedAnalysesRemaining}. Non-target client: ${isNonTargetClient}`);

    console.log(`✅ Analysis saved. ID: ${analysis.id}, User remaining: ${updatedAnalysesRemaining}`);
    
    // Статистика для мониторинга
    const totalTime = Date.now() - analysisStartTime;
    console.log(`[Stats] Analysis completed:`, {
      userId,
      url: finalUrl || 'none',
      inn: finalInn || 'none',
      siteContentLength: siteText.length,
      isNonTargetClient,
      totalTimeMs: totalTime,
    });

    // 10. RETURN RESPONSE
    return NextResponse.json({
      id: analysis.id,
      analysisId: analysis.id,
      message: isNonTargetClient ? 'Анализ завершён (нецелевой клиент)' : 'Анализ завершён',
      analysesRemaining: updatedAnalysesRemaining,
      isNonTargetClient: isNonTargetClient
    });

  } catch (error) {
    console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.error('❌ ANALYSIS FAILED');
    console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.error('Error name:', (error as Error).name);
    console.error('Error message:', (error as Error).message);
    console.error('Error stack:', (error as Error).stack);
    
    console.error('❌ Unexpected error:', error);
    return NextResponse.json(
      { 
        error: 'Ошибка при создании анализа',
        details: (error as Error).message 
      },
      { status: 500 }
    );
  }
}
