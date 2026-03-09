import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import prisma from '@/app/lib/prisma';
import { setAuthCookies } from '@/app/lib/cookies';
import { checkRateLimit, authLimiter, getIdentifier } from '@/app/lib/rateLimiter';
import { validateRequest } from '@/app/lib/validateRequest';
import { loginSchema } from '@/app/lib/schemas';

export async function POST(request: Request) {
  try {
    // Rate limiting по IP (защита от брутфорса)
    const identifier = getIdentifier(request);
    const rateLimitResult = await checkRateLimit(identifier, authLimiter);
    
    if (!rateLimitResult.success) {
      console.warn(`[RateLimit] Login blocked for ${identifier}`);
      return NextResponse.json(
        { error: 'Слишком много попыток входа. Попробуйте через 15 минут.' },
        { 
          status: 429,
          headers: { 'Retry-After': rateLimitResult.retryAfter!.toString() }
        }
      );
    }
    
    // Валидация входных данных
    const validation = await validateRequest(request, loginSchema);
    if (!validation.success) return validation.response;
    
    const { email, password } = validation.data;
    
    const user = await prisma.user.findUnique({
      where: { email }
    });
    
    if (!user) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
    }
    
    if (!user.isEmailVerified) {
      return NextResponse.json(
        { error: 'Please verify your email before logging in' },
        { status: 403 }
      );
    }
    
    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    
    if (!isPasswordValid) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
    }
    
    // Generate Access Token (15 минут)
    const accessToken = jwt.sign(
      { userId: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET!,
      { expiresIn: '15m' }
    );
    
    // Generate Refresh Token (30 дней)
    const refreshToken = jwt.sign(
      { userId: user.id, type: 'refresh' },
      process.env.JWT_SECRET!,
      { expiresIn: '30d' }
    );
    
    // Set httpOnly cookies
    const response = NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        organizationName: user.organizationName,
        phone: user.phone,
        plan: user.plan,
        analysesRemaining: user.analysesRemaining,
        role: user.role
      },
    });
    
    return setAuthCookies(response, accessToken, refreshToken);
    
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Login failed' },
      { status: 500 }
    );
  }
}
