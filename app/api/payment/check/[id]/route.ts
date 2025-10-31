import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import prisma from '@/app/lib/prisma';
import { getPayment } from '@/lib/yukassa';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const authHeader = req.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.substring(7);
    try {
      jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    } catch {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const paymentId = params.id;

    const yukassaPayment = await getPayment(paymentId);

    const dbPayment = await prisma.payment.findUnique({ where: { paymentId } });

    if (dbPayment && dbPayment.status !== yukassaPayment.status) {
      await prisma.payment.update({ where: { paymentId }, data: { status: yukassaPayment.status } });

      if (yukassaPayment.status === 'succeeded') {
        await prisma.user.update({
          where: { id: dbPayment.userId },
          data: { analysesRemaining: { increment: dbPayment.analysesCount } },
        });
      }
    }

    return NextResponse.json({
      status: yukassaPayment.status,
      paid: yukassaPayment.paid,
    });
  } catch (error) {
    console.error('Payment check error:', error);
    return NextResponse.json({ error: 'Failed to check payment' }, { status: 500 });
  }
}


