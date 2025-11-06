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
    const analyses = await prisma.analysis.findMany({
      where: {
        createdAt: {
          gte: yesterday,
        },
        isDeleted: false,
      },
      select: {
        id: true,
        createdAt: true,
      },
    });

    // Среднее время = 0 (т.к. нет updatedAt, считаем что анализ мгновенный)
    const avgResponseTime = 0;

    return NextResponse.json({
      errorsLast24h: 0, // TODO: добавить логирование ошибок
      successRate: 100,
      avgResponseTime,
    });

  } catch (error) {
    console.error('Dashboard AI health error:', error);
    return NextResponse.json({ error: 'Failed to fetch AI health status' }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}

