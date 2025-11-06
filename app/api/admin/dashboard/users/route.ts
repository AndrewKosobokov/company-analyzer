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
    const result = await prisma.$queryRaw<Array<{ plan: string; count: bigint }>>`
      SELECT plan, COUNT(*) as count
      FROM "User"
      GROUP BY plan
    `;

    return NextResponse.json({
      Trial: Number(result.find(r => r.plan === 'trial')?.count || 0),
      Start: Number(result.find(r => r.plan === 'start')?.count || 0),
      Optimal: Number(result.find(r => r.plan === 'optimal')?.count || 0),
      Profi: Number(result.find(r => r.plan === 'profi')?.count || 0),
    });

  } catch (error) {
    console.error('Dashboard users error:', error);
    return NextResponse.json({ error: 'Failed to fetch user distribution' }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}

