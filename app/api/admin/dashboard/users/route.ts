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

    // Группировка пользователей по тарифам
    const distribution = await prisma.user.groupBy({
      by: ['plan'],
      _count: true
    });

    // Преобразуем в нужный формат
    const result = {
      trial: 0,
      start: 0,
      optimal: 0,
      profi: 0
    };

    distribution.forEach(item => {
      const plan = item.plan.toLowerCase();
      if (plan in result) {
        result[plan as keyof typeof result] = item._count;
      }
    });

    const totalUsers = Object.values(result).reduce((sum, n) => sum + n, 0);

    return NextResponse.json({
      distribution: result,
      totalUsers
    });

  } catch (error) {
    console.error('Dashboard users error:', error);
    return NextResponse.json({ error: 'Failed to fetch user distribution' }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}

