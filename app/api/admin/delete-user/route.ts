import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();

export async function DELETE(request: Request) {
  try {
    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.substring(7);
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key') as { userId: string; email?: string };

    const adminUser = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: { id: true, email: true, role: true }
    });

    if (!adminUser || adminUser.role !== 'admin') {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    const { email } = await request.json();

    if (!email) {
      return NextResponse.json({ error: 'Email required' }, { status: 400 });
    }

    // Prevent self-delete
    if (adminUser.email === email) {
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
    console.error('Delete user error:', error);
    return NextResponse.json({ error: error.message || 'Failed to delete user' }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}


