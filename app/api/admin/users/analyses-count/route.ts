import { NextResponse } from 'next/server';
import prisma from '@/app/lib/prisma';
import { verifyAdmin } from '../../lib/verifyAdmin';

export async function GET(request: Request) {
  try {
    // Проверка админских прав
    await verifyAdmin();

    // Получаем userId из query параметра
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ error: 'Missing userId' }, { status: 400 });
    }

    const count = await prisma.analysis.count({
      where: {
        userId: userId,
        isDeleted: false
      }
    });

    return NextResponse.json({ count });
    
  } catch (error: any) {
    console.error('❌ Admin analyses count error:', error);
    
    if (error.message === 'UNAUTHORIZED' || error.message === 'INVALID_TOKEN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    if (error.message === 'ACCESS_DENIED') {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }
    
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

