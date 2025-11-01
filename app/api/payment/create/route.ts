import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import prisma from '@/app/lib/prisma';
import { createPayment } from '@/lib/yukassa';

const PLANS = {
  start: { price: 4500, analyses: 40, name: 'Start' },
  optimal: { price: 8500, analyses: 80, name: 'Optimal' },
  profi: { price: 12000, analyses: 200, name: 'Profi' },
} as const;

export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.substring(7);
    let decoded: any;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    } catch {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const { planId } = await req.json();
    const plan = PLANS[planId as keyof typeof PLANS];
    
    if (!plan) {
      return NextResponse.json({ error: 'Invalid plan' }, { status: 400 });
    }

    // Получаем email пользователя
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: { email: true }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const payment = await createPayment({
      amount: plan.price,
      description: `MetalVector - Тариф ${plan.name}`,
      metadata: {
        userId: decoded.userId,
        planName: plan.name,
        analysesCount: plan.analyses,
        userEmail: user.email
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
        analysesCount: plan.analyses,
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


