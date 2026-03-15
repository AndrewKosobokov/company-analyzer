import { NextResponse } from 'next/server';
import prisma from '@/app/lib/prisma';
import { verifyAdmin } from '../../../lib/verifyAdmin';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    // Проверка админских прав
    await verifyAdmin();

    const count = await prisma.analysis.count({
      where: {
        userId: params.id,
        isDeleted: false
      }
    });

    return NextResponse.json({ count });
    
  } catch (error: any) {
    console.error('❌ Admin user analyses count error:', error);
    
    if (error.message === 'UNAUTHORIZED' || error.message === 'INVALID_TOKEN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    if (error.message === 'ACCESS_DENIED') {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }
    
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
