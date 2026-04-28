import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import prisma from '@/app/lib/prisma';

export async function GET(req: NextRequest) {
  try {
    const accessToken = req.cookies.get('access_token')?.value;
    const authHeader = req.headers.get('authorization');
    const headerToken = authHeader?.startsWith('Bearer ') ? authHeader.substring(7) : null;
    const token = accessToken || headerToken;

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    let decoded: any;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET!);
    } catch {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    // Получаем все успешные платежи пользователя
    const payments = await prisma.payment.findMany({
      where: {
        userId: decoded.userId,
        status: 'succeeded'
      },
      orderBy: {
        createdAt: 'desc'
      },
      select: {
        id: true,
        amount: true,
        planName: true,
        status: true,
        createdAt: true
      }
    });

    // Преобразуем в формат для фронтенда
    const formattedPayments = payments.map(payment => ({
      id: payment.id,
      amount: payment.amount.toString(),
      plan: payment.planName.toLowerCase(), // start, optimal, profi
      status: payment.status,
      date: payment.createdAt.toISOString()
    }));

    return NextResponse.json(formattedPayments);

  } catch (error) {
    console.error('Payments history error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch payment history' },
      { status: 500 }
    );
  }
}

