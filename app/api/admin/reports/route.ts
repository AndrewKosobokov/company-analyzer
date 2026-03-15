import { NextResponse } from 'next/server';
import prisma from '@/app/lib/prisma';
import { verifyAdmin } from '../lib/verifyAdmin';

export async function GET() {
  try {
    // Проверка админских прав
    await verifyAdmin();

    const reports = await prisma.analysis.findMany({
      where: { isDeleted: false },
      include: {
        user: {
          select: {
            email: true,
            name: true
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: 100 // Limit to 100 most recent
    });

    return NextResponse.json({ reports });

  } catch (error: any) {
    console.error('❌ Admin reports error:', error);
    
    if (error.message === 'UNAUTHORIZED' || error.message === 'INVALID_TOKEN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    if (error.message === 'ACCESS_DENIED') {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }
    
    return NextResponse.json({ error: 'Failed to fetch reports' }, { status: 500 });
  }
}
































































