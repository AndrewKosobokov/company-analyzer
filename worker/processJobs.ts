import { PrismaClient } from '@prisma/client';
import { callVertexAI } from '@/lib/vertexai';
import { generatePrompt } from '@/utils/prompt';
import { formatAnalysisText } from '@/utils/formatAnalysisText';
import { extractAndValidateInn } from '@/utils/extractInn';

const prisma = new PrismaClient();

export async function processJob(jobId: string) {
  console.log(`🔄 Processing job: ${jobId}`);
  
  const job = await prisma.job.findUnique({
    where: { id: jobId },
    include: { user: true }
  });

  if (!job || job.status !== 'pending') {
    return;
  }

  // Update status to processing
  await prisma.job.update({
    where: { id: jobId },
    data: { status: 'processing' }
  });

  try {
    const { url, inn } = job.inputData as { url?: string; inn?: string };
    const finalUrl = url?.trim() || '';
    const finalInn = inn?.trim() || '';

    // FETCH WEBSITE (если есть URL)
    let siteText = '';
    if (finalUrl) {
      try {
        const response = await fetch(finalUrl, {
          headers: { 'User-Agent': 'Mozilla/5.0' },
          signal: AbortSignal.timeout(15000)
        });
        if (response.ok) {
          const html = await response.text();
          siteText = html
            .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
            .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')
            .replace(/<[^>]+>/g, ' ')
            .replace(/\s+/g, ' ')
            .trim()
            .substring(0, 50000);
        }
      } catch (error) {
        console.warn('⚠️ Error fetching website:', error);
      }
    }

    // GENERATE PROMPT
    const prompt = generatePrompt(siteText, finalUrl, finalInn);

    // CALL VERTEX AI
    const aiResponse = await callVertexAI(prompt, true);
    const analysisText = formatAnalysisText(aiResponse.text);

    // CHECK NON-TARGET
    const isNonTargetClient = analysisText.includes('АНАЛИЗ НЕЦЕЛЕСООБРАЗЕН');
    const extractedInn = extractAndValidateInn(analysisText);
    const finalCompanyInn = finalInn || extractedInn || null;

    // SAVE ANALYSIS
    const companyName = finalUrl
      ? `Компания ${finalUrl}`
      : `Компания ИНН ${finalCompanyInn || 'Не указан'}`;

    const analysis = await prisma.analysis.create({
      data: {
        userId: job.userId,
        companyName,
        companyInn: finalCompanyInn,
        reportText: analysisText,
        isDeleted: false,
        isNonTarget: isNonTargetClient
      }
    });

    // UPDATE USER ANALYSES COUNT
    if (!isNonTargetClient) {
      await prisma.user.update({
        where: { id: job.userId },
        data: { analysesRemaining: { decrement: 1 } }
      });
    }

    // UPDATE JOB TO COMPLETED
    await prisma.job.update({
      where: { id: jobId },
      data: {
        status: 'completed',
        resultId: analysis.id
      }
    });

    console.log(`✅ Job completed: ${jobId}`);

  } catch (error) {
    console.error(`❌ Job failed: ${jobId}`, error);
    
    await prisma.job.update({
      where: { id: jobId },
      data: {
        status: 'failed',
        error: String(error)
      }
    });
  } finally {
    await prisma.$disconnect();
  }
}

