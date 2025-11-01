import { NextResponse } from 'next/server';
import { processJob } from '@/worker/processJobs';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(request: Request) {
  try {
    // Найти pending job
    const job = await prisma.job.findFirst({
      where: { status: 'pending' },
      orderBy: { createdAt: 'asc' }
    });

    if (!job) {
      return NextResponse.json({ message: 'No pending jobs' });
    }

    // Обработать асинхронно
    processJob(job.id).catch(console.error);

    return NextResponse.json({ message: 'Job started', jobId: job.id });

  } catch (error) {
    console.error('Worker error:', error);
    return NextResponse.json({ error: 'Worker failed' }, { status: 500 });
  }
}

