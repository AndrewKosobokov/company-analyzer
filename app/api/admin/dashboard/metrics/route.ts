import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifyToken } from '../../../lib/auth';
import prisma from '../../../lib/prisma';

export async function GET(request: Request) {
  try {
    const cookieStore = cookies();
    const token = cookieStore.get('auth_token')?.value;

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const payload = await verifyToken(token);
    if (!payload || payload.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const days = parseInt(searchParams.get('days') || '30');

    // Доход за период
    const revenueResult = await prisma.$queryRaw<Array<{ sum: number | null }>>`
      SELECT SUM(amount) as sum
      FROM "Payment"
      WHERE status = 'succeeded'
        AND "createdAt" >= NOW() - INTERVAL '${days} days'
    `;
    const revenue = Number(revenueResult[0]?.sum || 0);

    // Средний чек
    const avgOrderResult = await prisma.$queryRaw<Array<{ avg: number | null }>>`
      SELECT AVG(amount) as avg
      FROM "Payment"
      WHERE status = 'succeeded'
        AND "createdAt" >= NOW() - INTERVAL '${days} days'
    `;
    const avgOrderValue = Number(avgOrderResult[0]?.avg || 0);

    // Конверсия (процент пользователей совершивших покупку)
    const conversionResult = await prisma.$queryRaw<Array<{ rate: number | null }>>`
      SELECT 
        (COUNT(DISTINCT CASE WHEN p.status = 'succeeded' THEN p."userId" END)::float / 
         NULLIF(COUNT(DISTINCT u.id), 0) * 100) as rate
      FROM "User" u
      LEFT JOIN "Payment" p ON u.id = p."userId" 
        AND p."createdAt" >= NOW() - INTERVAL '${days} days'
      WHERE u."createdAt" >= NOW() - INTERVAL '${days} days'
    `;
    const conversionRate = Number(conversionResult[0]?.rate || 0);

    // Повторные покупки
    const repeatResult = await prisma.$queryRaw<Array<{ count: bigint }>>`
      SELECT COUNT(DISTINCT "userId") as count
      FROM "Payment"
      WHERE status = 'succeeded'
      GROUP BY "userId"
      HAVING COUNT(*) > 1
    `;
    const totalBuyersResult = await prisma.$queryRaw<Array<{ count: bigint }>>`
      SELECT COUNT(DISTINCT "userId") as count
      FROM "Payment"
      WHERE status = 'succeeded'
    `;
    const repeatBuyers = Number(repeatResult[0]?.count || 0);
    const totalBuyers = Number(totalBuyersResult[0]?.count || 0);
    const repeatPurchaseRate = totalBuyers > 0 ? (repeatBuyers / totalBuyers) * 100 : 0;

    // Новые регистрации
    const newUsersResult = await prisma.$queryRaw<Array<{ count: bigint }>>`
      SELECT COUNT(*) as count
      FROM "User"
      WHERE "createdAt" >= NOW() - INTERVAL '${days} days'
    `;
    const newUsers = Number(newUsersResult[0]?.count || 0);

    return NextResponse.json({
      revenue,
      avgOrderValue,
      conversionRate,
      repeatPurchaseRate,
      newUsers,
    });
  } catch (error) {
    console.error('[Admin Dashboard Metrics] Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch metrics' },
      { status: 500 }
    );
  }
}