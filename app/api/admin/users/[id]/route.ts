import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    // 1. Проверка авторизации
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

    // 2. Проверка роли admin
    const admin = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: { role: true }
    });

    if (!admin || admin.role !== 'admin') {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    // 3. Получаем action и value
    const body = await request.json();
    const { action, value } = body;

    if (!action || value === undefined) {
      return NextResponse.json({ error: 'Missing action or value' }, { status: 400 });
    }

    // 4. Находим пользователя
    const user = await prisma.user.findUnique({
      where: { id: params.id }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // 5. Выполняем действие
    let updateData: any = {};

    switch (action) {
      case 'SET_PLAN':
        if (!['trial', 'start', 'optimal', 'profi'].includes(value)) {
          return NextResponse.json({ error: 'Invalid plan value' }, { status: 400 });
        }
        updateData.plan = value;
        break;

      case 'SET_REPORTS':
        const setValue = parseInt(value);
        if (isNaN(setValue) || setValue < 0) {
          return NextResponse.json({ error: 'Invalid reports value' }, { status: 400 });
        }
        updateData.analysesRemaining = setValue;
        break;

      case 'ADD_REPORTS':
        const addValue = parseInt(value);
        if (isNaN(addValue) || addValue < 0) {
          return NextResponse.json({ error: 'Invalid reports value' }, { status: 400 });
        }
        updateData.analysesRemaining = user.analysesRemaining + addValue;
        break;

      case 'SUBTRACT_REPORTS':
        const subtractValue = parseInt(value);
        if (isNaN(subtractValue) || subtractValue < 0) {
          return NextResponse.json({ error: 'Invalid reports value' }, { status: 400 });
        }
        updateData.analysesRemaining = Math.max(0, user.analysesRemaining - subtractValue);
        break;

      default:
        return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
    }

    // 6. Обновляем пользователя
    const updatedUser = await prisma.user.update({
      where: { id: params.id },
      data: updateData
    });

    return NextResponse.json({
      success: true,
      user: {
        id: updatedUser.id,
        email: updatedUser.email,
        plan: updatedUser.plan,
        analysesRemaining: updatedUser.analysesRemaining
      }
    });

  } catch (error) {
    console.error('[Admin Update User] Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}

