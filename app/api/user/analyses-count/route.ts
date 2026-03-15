import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import prisma from '@/app/lib/prisma';
import { getAccessToken } from '@/app/lib/cookies';

export async function GET(request: NextRequest) {
  try {
    const accessToken = getAccessToken(request);
    const authHeader = request.headers.get('authorization');
    const headerToken = authHeader?.startsWith('Bearer ') ? authHeader.substring(7) : null;
    const token = accessToken || headerToken;
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { userId: string };
    
    const count = await prisma.analysis.count({
      where: { 
        userId: decoded.userId,
        isDeleted: false
      }
    });

    return NextResponse.json({ count });
  } catch (error) {
    return NextResponse.json({ error: 'Error' }, { status: 500 });
  }
}

