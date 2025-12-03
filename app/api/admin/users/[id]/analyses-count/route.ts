import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import prisma from '@/app/lib/prisma';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { role: string };
    if (decoded.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const count = await prisma.analysis.count({
      where: {
        userId: params.id,
        isDeleted: false
      }
    });

    return NextResponse.json({ count });
  } catch (error) {
    return NextResponse.json({ error: 'Error' }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}
