import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();

export async function GET(request: Request) {
  try {
    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.substring(7);
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key') as { userId: string };
    } catch {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: { role: true }
    });

    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

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
      // ← Убрали || a.isNonTargetClient
    ).length;

    const totalAnalyses = allAnalyses.length;

    // Success rate
    const successRate = totalAnalyses > 0
      ? ((totalAnalyses - errors) / totalAnalyses) * 100
      : 100;

    // Среднее время генерации - в текущей схеме БД не хранится
    // Можно добавить позже поле generationTime в модель Analysis
    // Пока возвращаем заглушку: среднее время ~40 секунд
    const averageGenerationTime = 42; // TODO: добавить поле generationTime в модель Analysis

    return NextResponse.json({
      errors24h: errors,
      averageGenerationTime,
      successRate: Math.round(successRate * 10) / 10
    });

  } catch (error) {
    console.error('Dashboard AI health error:', error);
    return NextResponse.json({ error: 'Failed to fetch AI health status' }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}
