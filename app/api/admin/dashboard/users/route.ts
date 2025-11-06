import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function GET() {
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

    // Распределение пользователей по тарифам
    const result = await prisma.$queryRaw<Array<{ plan: string; count: bigint }>>`
      SELECT plan, COUNT(*) as count
      FROM "User"
      GROUP BY plan
    `;

    const distribution = {
      Trial: Number(result.find(r => r.plan === 'trial')?.count || 0),
      Start: Number(result.find(r => r.plan === 'start')?.count || 0),
      Optimal: Number(result.find(r => r.plan === 'optimal')?.count || 0),
      Profi: Number(result.find(r => r.plan === 'profi')?.count || 0),
    };

    return NextResponse.json(distribution);
  } catch (error) {
    console.error('[Admin Dashboard Users] Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch user distribution' },
      { status: 500 }
    );
  }
}