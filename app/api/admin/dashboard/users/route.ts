import { NextResponse } from 'next/server';
import prisma from '@/app/lib/prisma';
import { verifyAdmin } from '../../lib/verifyAdmin';

export async function GET() {
  try {
    // Проверка админских прав
    await verifyAdmin();

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

  } catch (error: any) {
    console.error('❌ Dashboard users API error:', error);
    
    if (error.message === 'UNAUTHORIZED' || error.message === 'INVALID_TOKEN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    if (error.message === 'ACCESS_DENIED') {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }
    
    return NextResponse.json({ error: 'Failed to fetch user distribution' }, { status: 500 });
  }
}

