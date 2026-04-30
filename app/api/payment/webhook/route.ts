import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/app/lib/prisma';

export async function POST(req: NextRequest) {
  try {
    const body = await req.text();
    const event = JSON.parse(body);
    const payment = event.object;

    console.log('📥 Webhook received:', {
      type: event.type,
      paymentId: payment.id,
      status: payment.status,
    });

    if (payment.status === 'succeeded') {
      const dbPayment = await prisma.payment.findUnique({ where: { paymentId: payment.id } });

      if (!dbPayment) {
        console.error('❌ Payment not found in DB:', payment.id);
        return NextResponse.json({ error: 'Payment not found' }, { status: 404 });
      }

      await prisma.payment.update({ where: { paymentId: payment.id }, data: { status: 'succeeded' } });

      const meta = (dbPayment.metadata ?? {}) as Record<string, unknown>;
      const subscriptionDays = Number(meta.subscriptionDays) || 0;
      const isUnlimited = subscriptionDays > 0;

      if (isUnlimited) {
        // Subscription plan: extend existing subscription if still active
        const currentUser = await prisma.user.findUnique({
          where: { id: dbPayment.userId },
          select: { planStartDate: true },
        });

        let newStartDate: Date;
        if (currentUser?.planStartDate) {
          const currentEndDate = new Date(currentUser.planStartDate);
          currentEndDate.setMonth(currentEndDate.getMonth() + 1);
          if (currentEndDate > new Date()) {
            newStartDate = new Date(currentEndDate.getTime());
          } else {
            newStartDate = new Date();
          }
        } else {
          newStartDate = new Date();
        }

        await prisma.user.update({
          where: { id: dbPayment.userId },
          data: {
            plan: dbPayment.planName,
            planStartDate: newStartDate,
            analysesRemaining: 99999,
            analysesInitial: 99999,
          },
        });
        console.log('✅ Subscription activated:', {
          userId: dbPayment.userId,
          plan: dbPayment.planName,
          subscriptionDays,
        });
      } else {
        // Legacy per-analysis plan
        await prisma.user.update({
          where: { id: dbPayment.userId },
          data: {
            analysesRemaining: { increment: dbPayment.analysesCount },
            plan: dbPayment.planName,
          },
        });
        console.log('✅ Analyses credited:', {
          userId: dbPayment.userId,
          analyses: dbPayment.analysesCount,
          plan: dbPayment.planName,
        });
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 });
  }
}
