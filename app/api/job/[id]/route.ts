import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const jobId = params.id;
    
    const job = await prisma.job.findUnique({
      where: { id: jobId }
    });

    if (!job) {
      return NextResponse.json({ error: 'Job not found' }, { status: 404 });
    }

    return NextResponse.json({
      id: job.id,
      status: job.status,
      resultId: job.resultId,
      error: job.error
    });
  } catch (error) {
    console.error('❌ Error fetching job:', error);
    return NextResponse.json(
      { error: 'Ошибка при получении статуса задачи' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

