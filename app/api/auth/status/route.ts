import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import prisma from '@/app/lib/prisma';
import { getAccessToken } from '@/app/lib/cookies';

export async function GET(request: NextRequest) {
  try {
    // Получаем токен из httpOnly cookie
    const accessToken = getAccessToken(request);
    
    // Fallback на Authorization header для обратной совместимости
    const authHeader = request.headers.get('Authorization');
    const headerToken = authHeader?.startsWith('Bearer ') ? authHeader.substring(7) : null;
    
    const token = accessToken || headerToken;
    
    if (!token) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    // Verify JWT token
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET!) as { 
        userId: string; 
        email: string;
        role: string;
      };
    } catch (err) {
      return NextResponse.json(
        { error: 'Invalid token', needsRefresh: true },
        { status: 401 }
      );
    }
    
    // Find user
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        email: true,
        name: true,
        organizationName: true,
        phone: true,
        plan: true,
        analysesRemaining: true,
        analysesInitial: true,
        planStartDate: true,
        isEmailVerified: true,
        role: true,
        createdAt: true,
      },
    });
    
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        organizationName: user.organizationName,
        phone: user.phone,
        plan: user.plan,
        analysesRemaining: user.analysesRemaining,
        analysesInitial: user.analysesInitial,
        planStartDate: user.planStartDate,
        role: user.role
      },
      // Также возвращаем поля на верхнем уровне для обратной совместимости
      name: user.name,
      email: user.email,
      plan: user.plan,
      analysesRemaining: user.analysesRemaining,
      analysesInitial: user.analysesInitial,
      planStartDate: user.planStartDate,
      role: user.role
    });
    
  } catch (error) {
    console.error('Get user status error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch user' },
      { status: 500 }
    );
  }
}
