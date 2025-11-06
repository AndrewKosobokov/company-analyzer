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

    const { searchParams } = new URL(request.url);
    const period = parseInt(searchParams.get('period') || '30');
    
    // 1. Доход (Revenue) - текущий период
    const revenueResult = await prisma.$queryRaw<Array<{ sum: number | null }>>`
      SELECT SUM(amount) as sum
      FROM "Payment"
      WHERE status = 'succeeded' AND "createdAt" >= NOW() - INTERVAL '${period} days'
    `;
    
    const totalRevenue = Number(revenueResult[0]?.sum || 0);
    
    // Доход за предыдущий период
    const previousRevenueResult = await prisma.$queryRaw<Array<{ sum: number | null }>>`
      SELECT SUM(amount) as sum
      FROM "Payment"
      WHERE status = 'succeeded' 
        AND "createdAt" >= NOW() - INTERVAL '${period * 2} days'
        AND "createdAt" < NOW() - INTERVAL '${period} days'
    `;
    
    const previousRevenue = Number(previousRevenueResult[0]?.sum || 0);
    const revenueChange = previousRevenue > 0 
      ? ((totalRevenue - previousRevenue) / previousRevenue) * 100 
      : (totalRevenue > 0 ? 100 : 0);
    
    // 2. Средний чек (Average Order Value) - текущий период
    const avgOrderResult = await prisma.$queryRaw<Array<{ avg: number | null }>>`
      SELECT AVG(amount) as avg
      FROM "Payment"
      WHERE status = 'succeeded' AND "createdAt" >= NOW() - INTERVAL '${period} days'
    `;
    
    const avgOrderValue = Number(avgOrderResult[0]?.avg || 0);
    
    // Средний чек за предыдущий период
    const previousAvgOrderResult = await prisma.$queryRaw<Array<{ avg: number | null }>>`
      SELECT AVG(amount) as avg
      FROM "Payment"
      WHERE status = 'succeeded'
        AND "createdAt" >= NOW() - INTERVAL '${period * 2} days'
        AND "createdAt" < NOW() - INTERVAL '${period} days'
    `;
    
    const previousAvgOrderValue = Number(previousAvgOrderResult[0]?.avg || 0);
    const avgOrderValueChange = previousAvgOrderValue > 0
      ? ((avgOrderValue - previousAvgOrderValue) / previousAvgOrderValue) * 100
      : (avgOrderValue > 0 ? 100 : 0);
    
    // 3. Конверсия Trial → Paid
    const conversionResult = await prisma.$queryRaw<Array<{ 
      converted: number;
      total: bigint;
    }>>`
      SELECT 
        COUNT(DISTINCT CASE WHEN p.status = 'succeeded' THEN p."userId" END)::float / NULLIF(COUNT(DISTINCT u.id), 0) * 100 as converted,
        COUNT(DISTINCT u.id) as total
      FROM "User" u
      LEFT JOIN "Payment" p ON u.id = p."userId" 
        AND p."createdAt" >= NOW() - INTERVAL '${period} days'
      WHERE u."createdAt" >= NOW() - INTERVAL '${period} days'
    `;
    
    const conversionRate = Number(conversionResult[0]?.converted || 0);
    const totalUsers = Number(conversionResult[0]?.total || 0);
    
    // Конверсия за предыдущий период
    const previousConversionResult = await prisma.$queryRaw<Array<{ 
      converted: number;
      total: bigint;
    }>>`
      SELECT 
        COUNT(DISTINCT CASE WHEN p.status = 'succeeded' THEN p."userId" END)::float / NULLIF(COUNT(DISTINCT u.id), 0) * 100 as converted,
        COUNT(DISTINCT u.id) as total
      FROM "User" u
      LEFT JOIN "Payment" p ON u.id = p."userId" 
        AND p."createdAt" >= NOW() - INTERVAL '${period * 2} days'
        AND p."createdAt" < NOW() - INTERVAL '${period} days'
      WHERE u."createdAt" >= NOW() - INTERVAL '${period * 2} days'
        AND u."createdAt" < NOW() - INTERVAL '${period} days'
    `;
    
    const previousConversionRate = Number(previousConversionResult[0]?.converted || 0);
    
    const conversionRateChange = previousConversionRate > 0
      ? conversionRate - previousConversionRate
      : (conversionRate > 0 ? conversionRate : 0);
    
    // 4. Повторные покупки
    const repeatUsersResult = await prisma.$queryRaw<Array<{ count: bigint }>>`
      SELECT COUNT(DISTINCT "userId") as count
      FROM "Payment"
      WHERE status = 'succeeded' 
        AND "createdAt" >= NOW() - INTERVAL '${period} days'
      GROUP BY "userId"
      HAVING COUNT(*) > 1
    `;
    
    const repeatUsers = Number(repeatUsersResult[0]?.count || 0);
    
    const totalPayingUsersResult = await prisma.$queryRaw<Array<{ count: bigint }>>`
      SELECT COUNT(DISTINCT "userId") as count
      FROM "Payment"
      WHERE status = 'succeeded'
        AND "createdAt" >= NOW() - INTERVAL '${period} days'
    `;
    
    const totalPayingUsers = Number(totalPayingUsersResult[0]?.count || 0);
    const repeatPurchaseRate = totalPayingUsers > 0
      ? (repeatUsers / totalPayingUsers) * 100
      : 0;
    
    // Повторные покупки за предыдущий период
    const previousRepeatUsersResult = await prisma.$queryRaw<Array<{ count: bigint }>>`
      SELECT COUNT(DISTINCT "userId") as count
      FROM "Payment"
      WHERE status = 'succeeded'
        AND "createdAt" >= NOW() - INTERVAL '${period * 2} days'
        AND "createdAt" < NOW() - INTERVAL '${period} days'
      GROUP BY "userId"
      HAVING COUNT(*) > 1
    `;
    
    const previousRepeatUsers = Number(previousRepeatUsersResult[0]?.count || 0);
    
    const previousTotalPayingUsersResult = await prisma.$queryRaw<Array<{ count: bigint }>>`
      SELECT COUNT(DISTINCT "userId") as count
      FROM "Payment"
      WHERE status = 'succeeded'
        AND "createdAt" >= NOW() - INTERVAL '${period * 2} days'
        AND "createdAt" < NOW() - INTERVAL '${period} days'
    `;
    
    const previousTotalPayingUsers = Number(previousTotalPayingUsersResult[0]?.count || 0);
    const previousRepeatPurchaseRate = previousTotalPayingUsers > 0
      ? (previousRepeatUsers / previousTotalPayingUsers) * 100
      : 0;
    
    const repeatPurchaseRateChange = previousRepeatPurchaseRate > 0
      ? repeatPurchaseRate - previousRepeatPurchaseRate
      : (repeatPurchaseRate > 0 ? repeatPurchaseRate : 0);
    
    // 5. Новые регистрации
    const newRegistrationsResult = await prisma.$queryRaw<Array<{ count: bigint }>>`
      SELECT COUNT(*) as count
      FROM "User"
      WHERE "createdAt" >= NOW() - INTERVAL '${period} days'
    `;
    
    const newRegistrations = Number(newRegistrationsResult[0]?.count || 0);
    
    const previousNewRegistrationsResult = await prisma.$queryRaw<Array<{ count: bigint }>>`
      SELECT COUNT(*) as count
      FROM "User"
      WHERE "createdAt" >= NOW() - INTERVAL '${period * 2} days'
        AND "createdAt" < NOW() - INTERVAL '${period} days'
    `;
    
    const previousNewRegistrations = Number(previousNewRegistrationsResult[0]?.count || 0);
    const newRegistrationsChange = previousNewRegistrations > 0
      ? ((newRegistrations - previousNewRegistrations) / previousNewRegistrations) * 100
      : (newRegistrations > 0 ? 100 : 0);
    
    return NextResponse.json({
      revenue: {
        total: Math.round(totalRevenue),
        period,
        previousPeriod: Math.round(previousRevenue),
        change: Math.round(revenueChange * 10) / 10
      },
      averageOrderValue: {
        current: Math.round(avgOrderValue),
        previousPeriod: Math.round(previousAvgOrderValue),
        change: Math.round(avgOrderValueChange * 10) / 10
      },
      conversionRate: {
        trialToPaid: Math.round(conversionRate * 10) / 10,
        previousPeriod: Math.round(previousConversionRate * 10) / 10,
        change: Math.round(conversionRateChange * 10) / 10
      },
      repeatPurchases: {
        rate: Math.round(repeatPurchaseRate * 10) / 10,
        previousPeriod: Math.round(previousRepeatPurchaseRate * 10) / 10,
        change: Math.round(repeatPurchaseRateChange * 10) / 10
      },
      newRegistrations: {
        count: newRegistrations,
        previousPeriod: previousNewRegistrations,
        change: Math.round(newRegistrationsChange * 10) / 10
      }
    });

  } catch (error) {
    console.error('Dashboard metrics error:', error);
    return NextResponse.json({ error: 'Failed to fetch metrics' }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}

