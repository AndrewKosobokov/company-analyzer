import { NextResponse } from 'next/server';
import prisma from '@/app/lib/prisma';
import { verifyAdmin } from '../lib/verifyAdmin';

export async function GET() {
  try {
    // Проверка админских прав
    await verifyAdmin();

    const totalUsers = await prisma.user.count();
    const totalAnalyses = await prisma.analysis.count();
    
    const planCounts = await prisma.user.groupBy({
      by: ['plan'],
      _count: true
    });

    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    const activeUsers = await prisma.analysis.findMany({
      where: { createdAt: { gte: sevenDaysAgo } },
      distinct: ['userId']
    });

    return NextResponse.json({
      totalUsers,
      activeUsers: activeUsers.length,
      totalAnalyses,
      planDistribution: planCounts
    });

  } catch (error: any) {
    console.error('❌ Admin stats error:', error);
    
    if (error.message === 'UNAUTHORIZED' || error.message === 'INVALID_TOKEN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    if (error.message === 'ACCESS_DENIED') {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }
    
    return NextResponse.json({ error: 'Failed to fetch stats' }, { status: 500 });
  }
}
