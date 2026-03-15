import { NextResponse } from 'next/server';
import prisma from '@/app/lib/prisma';
import { verifyAdmin } from '../../lib/verifyAdmin';

export async function DELETE(
  _request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await verifyAdmin();

    const user = await prisma.user.findUnique({
      where: { id: params.id }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    await prisma.user.delete({
      where: { id: params.id }
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('❌ Admin delete user error:', error);

    if (error.message === 'UNAUTHORIZED' || error.message === 'INVALID_TOKEN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    if (error.message === 'ACCESS_DENIED') {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    // Проверка админских прав
    await verifyAdmin();

    // Получаем action и value
    const body = await request.json();
    const { action, value } = body;

    if (!action || value === undefined) {
      return NextResponse.json({ error: 'Missing action or value' }, { status: 400 });
    }

    // Находим пользователя
    const user = await prisma.user.findUnique({
      where: { id: params.id }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Выполняем действие
    let updateData: any = {};

    switch (action) {
      case 'SET_PLAN':
        // Лимиты анализов для каждого тарифа
        const planLimits: Record<string, number> = {
          'trial': 3,
          'start': 40,
          'optimal': 100,
          'profi': 200
        };

        if (!planLimits.hasOwnProperty(value)) {
          return NextResponse.json(
            { error: 'Invalid plan value' }, 
            { status: 400 }
          );
        }

        // При смене тарифа обновляем ВСЕ связанные поля
        updateData.plan = value;
        updateData.analysesInitial = planLimits[value];
        updateData.analysesRemaining = planLimits[value];
        updateData.planStartDate = new Date();
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

    // Обновляем пользователя
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

  } catch (error: any) {
    console.error('❌ Admin update user error:', error);
    
    if (error.message === 'UNAUTHORIZED' || error.message === 'INVALID_TOKEN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    if (error.message === 'ACCESS_DENIED') {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }
    
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

