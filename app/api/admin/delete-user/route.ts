import { NextResponse } from 'next/server';
import prisma from '@/app/lib/prisma';
import { verifyAdmin } from '../lib/verifyAdmin';

export async function DELETE(request: Request) {
  try {
    // Проверка админских прав и получение userId админа
    const adminUserId = await verifyAdmin();
    
    // Получить email админа для проверки самоудаления
    const adminUser = await prisma.user.findUnique({
      where: { id: adminUserId },
      select: { email: true }
    });

    const { email } = await request.json();

    if (!email) {
      return NextResponse.json({ error: 'Email required' }, { status: 400 });
    }

    // Prevent self-delete
    if (adminUser && adminUser.email === email) {
      return NextResponse.json({ error: 'Нельзя удалить самого себя' }, { status: 400 });
    }

    const targetUser = await prisma.user.findUnique({ where: { email }, select: { id: true } });
    if (!targetUser) {
      return NextResponse.json({ error: 'Пользователь не найден' }, { status: 404 });
    }

    // Delete related analyses first due to FK constraints
    await prisma.analysis.deleteMany({ where: { userId: targetUser.id } });

    // Delete the user
    await prisma.user.delete({ where: { id: targetUser.id } });

    return NextResponse.json({ success: true, message: 'Пользователь успешно удалён' });
    
  } catch (error: any) {
    console.error('❌ Delete user error:', error);
    
    if (error.message === 'UNAUTHORIZED' || error.message === 'INVALID_TOKEN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    if (error.message === 'ACCESS_DENIED') {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }
    
    return NextResponse.json({ error: error.message || 'Failed to delete user' }, { status: 500 });
  }
}


