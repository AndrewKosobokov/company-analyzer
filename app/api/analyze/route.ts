import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();

export async function POST(request: Request) {
  try {
    // 1. AUTHENTICATION
    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.substring(7);
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key') as { userId: string };
    } catch (err) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const userId = decoded.userId;

    // 2. GET INPUT DATA
    const { url, inn } = await request.json();

    const finalUrl = url?.trim() || '';
    const finalInn = inn?.trim() || '';

    // Validation: at least one must be provided
    if (!finalUrl && !finalInn) {
      return NextResponse.json(
        { error: 'Укажите сайт или ИНН компании' },
        { status: 400 }
      );
    }

    // Validate INN format (10 or 12 digits)
    if (finalInn && (finalInn.length !== 10 && finalInn.length !== 12)) {
      return NextResponse.json(
        { error: 'ИНН должен содержать 10 или 12 цифр' },
        { status: 400 }
      );
    }

    if (finalInn && !/^\d+$/.test(finalInn)) {
      return NextResponse.json(
        { error: 'ИНН должен содержать только цифры' },
        { status: 400 }
      );
    }

    // 3. CHECK USER LIMITS
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { analysesRemaining: true, plan: true }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    if (user.analysesRemaining <= 0) {
      return NextResponse.json({
        error: 'Лимит анализов исчерпан. Обновите тариф.',
        analysesRemaining: 0
      }, { status: 403 });
    }

    // 4. CREATE JOB
    const job = await prisma.job.create({
      data: {
        userId: userId,
        type: 'analysis',
        status: 'pending',
        inputData: { url: finalUrl, inn: finalInn }
      }
    });

    console.log(`✅ Job created: ${job.id}`);

    // 5. RETURN JOB ID (мгновенно!)
    return NextResponse.json({
      jobId: job.id,
      status: 'pending',
      message: 'Анализ запущен. Ожидайте...'
    });

  } catch (error) {
    console.error('❌ Unexpected error:', error);
    return NextResponse.json(
      { error: 'Ошибка при создании анализа' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
