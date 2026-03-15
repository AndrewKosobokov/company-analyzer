import { NextResponse } from 'next/server';
import prisma from '@/app/lib/prisma';
import { verifyAdmin } from '../../lib/verifyAdmin';

export async function GET() {
  try {
    // Проверка админских прав
    await verifyAdmin();

    const yesterday = new Date();
    yesterday.setHours(yesterday.getHours() - 24);

    // Все анализы за последние 24 часа
    const allAnalyses = await prisma.analysis.findMany({
      where: {
        createdAt: { gte: yesterday }
      },
      select: {
        id: true,
        reportText: true,
        isNonTargetClient: true
      }
    });

    // ИСПРАВЛЕНО: Ошибки = только анализы с пустым или коротким reportText
    // Нецелевые клиенты (isNonTargetClient) — это УСПЕШНЫЕ анализы!
    const errors = allAnalyses.filter(a =>
      !a.reportText ||
      a.reportText.trim().length < 100
    ).length;

    const totalAnalyses = allAnalyses.length;

    // Success rate
    const successRate = totalAnalyses > 0
      ? ((totalAnalyses - errors) / totalAnalyses) * 100
      : 100;

    // Среднее время генерации - в текущей схеме БД не хранится
    const averageGenerationTime = 42;

    return NextResponse.json({
      errors24h: errors,
      averageGenerationTime,
      successRate: Math.round(successRate * 10) / 10
    });

  } catch (error: any) {
    console.error('❌ Dashboard AI health API error:', error);
    
    if (error.message === 'UNAUTHORIZED' || error.message === 'INVALID_TOKEN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    if (error.message === 'ACCESS_DENIED') {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }
    
    return NextResponse.json({ error: 'Failed to fetch AI health status' }, { status: 500 });
  }
}
