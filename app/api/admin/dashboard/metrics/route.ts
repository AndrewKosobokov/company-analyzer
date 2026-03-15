import { NextResponse } from 'next/server';
import prisma from '@/app/lib/prisma';
import { verifyAdmin } from '../../lib/verifyAdmin';

export async function GET(request: Request) {
  try {
    // Проверка админских прав
    await verifyAdmin();

    const { searchParams } = new URL(request.url);
    const period = parseInt(searchParams.get('period') || '30');
    
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - period);
    
    const previousStartDate = new Date();
    previousStartDate.setDate(previousStartDate.getDate() - (period * 2));
    
    // 1. Доход (Revenue) - текущий период
    const revenueResult = await prisma.payment.aggregate({
      where: {
        createdAt: { gte: startDate },
        status: 'succeeded'
      },
      _sum: { amount: true },
      _count: true
    });
    
    const totalRevenue = revenueResult._sum.amount || 0;
    const paymentsCount = revenueResult._count || 0;
    
    // Доход за предыдущий период
    const previousRevenueResult = await prisma.payment.aggregate({
      where: {
        createdAt: { gte: previousStartDate, lt: startDate },
        status: 'succeeded' // ← ИСПРАВЛЕНО!
      },
      _sum: { amount: true }
    });
    
    const previousRevenue = previousRevenueResult._sum.amount || 0;
    const revenueChange = previousRevenue > 0 
      ? ((totalRevenue - previousRevenue) / previousRevenue) * 100 
      : (totalRevenue > 0 ? 100 : 0);
    
    // 2. Средний чек (Average Order Value) - текущий период
    const payments = await prisma.payment.findMany({
      where: {
        createdAt: { gte: startDate },
        status: 'succeeded' // ← ИСПРАВЛЕНО!
      },
      select: { amount: true }
    });
    
    const avgOrderValue = payments.length > 0
      ? payments.reduce((sum, p) => sum + p.amount, 0) / payments.length
      : 0;
    
    // Средний чек за предыдущий период
    const previousPayments = await prisma.payment.findMany({
      where: {
        createdAt: { gte: previousStartDate, lt: startDate },
        status: 'succeeded' // ← ИСПРАВЛЕНО!
      },
      select: { amount: true }
    });
    
    const previousAvgOrderValue = previousPayments.length > 0
      ? previousPayments.reduce((sum, p) => sum + p.amount, 0) / previousPayments.length
      : 0;
    
    const avgOrderValueChange = previousAvgOrderValue > 0
      ? ((avgOrderValue - previousAvgOrderValue) / previousAvgOrderValue) * 100
      : (avgOrderValue > 0 ? 100 : 0);
    
    // 3. КОНВЕРСИЯ (Trial → Paid)
    // ЛОГИКА: Считаем всех новых пользователей за период,
    // затем из них тех, кто совершил успешный платеж.
    // ВАЖНО: НЕ фильтруем по plan, т.к. после оплаты он меняется!
    
    // Все новые пользователи за период (база для конверсии)
    const newUsersCount = await prisma.user.count({
      where: {
        createdAt: { gte: startDate }
      }
    });
    
    // Из них те, кто совершил успешный платеж в этом же периоде
    const convertedUsersCount = await prisma.user.count({
      where: {
        createdAt: { gte: startDate },
        payments: {
          some: {
            status: 'succeeded',
            createdAt: { gte: startDate }
          }
        }
      }
    });
    
    const conversionRate = newUsersCount > 0
      ? (convertedUsersCount / newUsersCount) * 100
      : 0;
    
    // Конверсия за предыдущий период
    const previousNewUsersCount = await prisma.user.count({
      where: {
        createdAt: { gte: previousStartDate, lt: startDate }
      }
    });
    
    const previousConvertedUsersCount = await prisma.user.count({
      where: {
        createdAt: { gte: previousStartDate, lt: startDate },
        payments: {
          some: {
            status: 'succeeded',
            createdAt: { gte: previousStartDate, lt: startDate }
          }
        }
      }
    });
    
    const previousConversionRate = previousNewUsersCount > 0
      ? (previousConvertedUsersCount / previousNewUsersCount) * 100
      : 0;
    
    // Процентное изменение (относительный рост)
    // Пример: 5% → 10% = +100% (удвоение)
    const conversionRateChange = previousConversionRate > 0
      ? ((conversionRate - previousConversionRate) / previousConversionRate) * 100
      : (conversionRate > 0 ? 100 : 0);
    
    // 4. Повторные покупки
    // Пользователи с более чем одной покупкой
    const usersWithMultiplePayments = await prisma.user.findMany({
      where: {
        payments: {
          some: {
            status: 'succeeded', // ← ИСПРАВЛЕНО!
            createdAt: { gte: startDate }
          }
        }
      },
      include: {
        payments: {
          where: {
            status: 'succeeded', // ← ИСПРАВЛЕНО!
            createdAt: { gte: startDate }
          }
        }
      }
    });
    
    const usersWithRepeatPurchases = usersWithMultiplePayments.filter(
      user => user.payments.length > 1
    ).length;
    
    const totalPayingUsers = usersWithMultiplePayments.length;
    
    const repeatPurchaseRate = totalPayingUsers > 0
      ? (usersWithRepeatPurchases / totalPayingUsers) * 100
      : 0;
    
    // Повторные покупки за предыдущий период
    const previousUsersWithMultiplePayments = await prisma.user.findMany({
      where: {
        payments: {
          some: {
            status: 'succeeded', // ← ИСПРАВЛЕНО!
            createdAt: { gte: previousStartDate, lt: startDate }
          }
        }
      },
      include: {
        payments: {
          where: {
            status: 'succeeded', // ← ИСПРАВЛЕНО!
            createdAt: { gte: previousStartDate, lt: startDate }
          }
        }
      }
    });
    
    const previousUsersWithRepeatPurchases = previousUsersWithMultiplePayments.filter(
      user => user.payments.length > 1
    ).length;
    
    const previousTotalPayingUsers = previousUsersWithMultiplePayments.length;
    
    const previousRepeatPurchaseRate = previousTotalPayingUsers > 0
      ? (previousUsersWithRepeatPurchases / previousTotalPayingUsers) * 100
      : 0;
    
    // Процентное изменение (относительный рост)
    const repeatPurchaseRateChange = previousRepeatPurchaseRate > 0
      ? ((repeatPurchaseRate - previousRepeatPurchaseRate) / previousRepeatPurchaseRate) * 100
      : (repeatPurchaseRate > 0 ? 100 : 0);
    
    // 5. Новые регистрации
    const newRegistrations = await prisma.user.count({
      where: {
        createdAt: { gte: startDate }
      }
    });
    
    const previousNewRegistrations = await prisma.user.count({
      where: {
        createdAt: { gte: previousStartDate, lt: startDate }
      }
    });
    
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

  } catch (error: any) {
    console.error('❌ Dashboard metrics API error:', error);
    
    if (error.message === 'UNAUTHORIZED' || error.message === 'INVALID_TOKEN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    if (error.message === 'ACCESS_DENIED') {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }
    
    return NextResponse.json({ error: 'Failed to fetch metrics' }, { status: 500 });
  }
}
