import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/app/lib/prisma';
import { verifyAuth } from '@/app/lib/auth';

export async function PATCH(req: NextRequest) {
  try {
    const authPayload = verifyAuth(req);
    if (!authPayload) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const userId = authPayload.userId;
    const { analysisId, label } = await req.json();

    // Валидация: только разрешённые цвета
    const allowedLabels = ['gray', 'red', 'yellow', 'green'];
    if (!allowedLabels.includes(label)) {
      return NextResponse.json({ error: 'Invalid label' }, { status: 400 });
    }

    // Проверка что отчёт принадлежит пользователю
    const analysis = await prisma.analysis.findFirst({
      where: {
        id: analysisId,
        userId: userId,
        isDeleted: false
      }
    });

    if (!analysis) {
      return NextResponse.json({ error: 'Analysis not found' }, { status: 404 });
    }

    // Обновление метки
    await prisma.analysis.update({
      where: { id: analysisId },
      data: { label }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating label:', error);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}

