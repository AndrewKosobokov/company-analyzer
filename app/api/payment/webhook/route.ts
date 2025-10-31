import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/app/lib/prisma';
// import { verifyWebhookSignature } from '@/lib/yukassa';

export async function POST(req: NextRequest) {
  try {
    const body = await req.text();
    // const signature = req.headers.get('x-yookassa-signature');

    // if (signature && !verifyWebhookSignature(body, signature)) {
    //   return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
    // }

    const event = JSON.parse(body);
    const payment = event.object;

    console.log('📥 Webhook received:', {
      type: event.type,
      paymentId: payment.id,
      status: payment.status,
    });

    if (event.type === 'payment.succeeded' && payment.status === 'succeeded') {
      const dbPayment = await prisma.payment.findUnique({ where: { paymentId: payment.id } });

      if (!dbPayment) {
        console.error('❌ Payment not found in DB:', payment.id);
        return NextResponse.json({ error: 'Payment not found' }, { status: 404 });
      }

      await prisma.payment.update({ where: { paymentId: payment.id }, data: { status: 'succeeded' } });

      await prisma.user.update({
        where: { id: dbPayment.userId },
        data: {
          analysesRemaining: {
            increment: dbPayment.analysesCount,
          },
        },
      });

      console.log('✅ Payment processed:', { userId: dbPayment.userId, analyses: dbPayment.analysesCount });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 });
  }
}


