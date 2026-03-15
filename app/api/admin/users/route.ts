import { NextResponse } from 'next/server';
import prisma from '@/app/lib/prisma';
import { verifyAdmin } from '../lib/verifyAdmin';

export async function GET() {
  try {
    // Проверка админских прав
    await verifyAdmin();

    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        plan: true,
        analysesRemaining: true,
        analysesInitial: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: { analyses: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json({ users });

  } catch (error: any) {
    console.error('❌ Admin users API error:', error);
    
    if (error.message === 'UNAUTHORIZED' || error.message === 'INVALID_TOKEN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    if (error.message === 'ACCESS_DENIED') {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }
    
    return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    // Проверка админских прав
    await verifyAdmin();

    const { userId, analysesRemaining } = await request.json();

    const updated = await prisma.user.update({
      where: { id: userId },
      data: { analysesRemaining: parseInt(analysesRemaining) }
    });

    return NextResponse.json({ success: true, user: updated });

  } catch (error: any) {
    console.error('❌ Admin update error:', error);
    
    if (error.message === 'UNAUTHORIZED' || error.message === 'INVALID_TOKEN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    if (error.message === 'ACCESS_DENIED') {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }
    
    return NextResponse.json({ error: 'Failed to update user' }, { status: 500 });
  }
}
