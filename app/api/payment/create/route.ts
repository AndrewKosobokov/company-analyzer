import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import prisma from '@/app/lib/prisma';
import { getAccessToken } from '@/app/lib/cookies';
import { createPayment } from '@/lib/yukassa';

const PLANS = {
  unlimited: { price: 3500, name: 'Безлимит', subscriptionDays: 30 },
  // Legacy plans kept for backward compatibility with existing payments
  start: { price: 4500, name: 'Start', subscriptionDays: 0 },
  optimal: { price: 8500, name: 'Optimal', subscriptionDays: 0 },
  profi: { price: 12000, name: 'Profi', subscriptionDays: 0 },
} as const;

export async function POST(req: NextRequest) {
  try {
    const accessToken = getAccessToken(req);
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

    const { planId } = await req.json();
    const plan = PLANS[planId as keyof typeof PLANS];

    if (!plan) {
      return NextResponse.json({ error: 'Invalid plan' }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: { email: true },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const payment = await createPayment({
      amount: plan.price,
      description: planId === 'unlimited'
        ? 'MetalVector — Безлимитный доступ на 1 месяц'
        : `MetalVector - Тариф ${plan.name}`,
      metadata: {
        userId: decoded.userId,
        planName: plan.name,
        subscriptionDays: 30,
        userEmail: user.email,
      },
      returnUrl: `${process.env.NEXT_PUBLIC_APP_URL}/payment/success?paymentId={paymentId}`,
    });

    await prisma.payment.create({
      data: {
        userId: decoded.userId,
        amount: plan.price,
        status: payment.status,
        paymentId: payment.id,
        planName: plan.name,
        analysesCount: 0,
        metadata: payment.metadata as any,
      },
    });

    return NextResponse.json({
      paymentId: payment.id,
      confirmationUrl: payment.confirmation?.confirmation_url,
    });
  } catch (error) {
    console.error('Payment creation error:', error);
    return NextResponse.json(
      { error: 'Failed to create payment' },
      { status: 500 }
    );
  }
}
