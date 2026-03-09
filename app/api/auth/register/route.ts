import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { sendEmail, getEmailVerificationTemplate } from '@/utils/email';
import prisma from '@/app/lib/prisma';
import { checkRateLimit, authLimiter, getIdentifier } from '@/app/lib/rateLimiter';
import { validateRequest } from '@/app/lib/validateRequest';
import { registerSchema } from '@/app/lib/schemas';

export async function POST(request: Request) {
  try {
    // Rate limiting по IP (защита от спама регистраций)
    const identifier = getIdentifier(request);
    const rateLimitResult = await checkRateLimit(identifier, authLimiter);
    
    if (!rateLimitResult.success) {
      console.warn(`[RateLimit] Registration blocked for ${identifier}`);
      return NextResponse.json(
        { error: 'Слишком много попыток регистрации. Попробуйте через 15 минут.' },
        { 
          status: 429,
          headers: { 'Retry-After': rateLimitResult.retryAfter!.toString() }
        }
      );
    }
    
    // Валидация входных данных
    const validation = await validateRequest(request, registerSchema);
    if (!validation.success) return validation.response;
    
    const { email, password, name, organization, phone } = validation.data;
    
    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });
    
    if (existingUser) {
      return NextResponse.json(
        { error: 'User already exists' },
        { status: 400 }
      );
    }
    
    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);
    
    // Generate verification token
    const verificationToken = crypto.randomBytes(32).toString('hex');
    const verificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
    
    // Create user (NOT verified yet)
    const user = await prisma.user.create({
      data: {
        email,
        passwordHash,
        name,
        organizationName: organization,
        phone,
        plan: 'trial',
        analysesRemaining: 3, // 3 бесплатных анализа при регистрации
        isEmailVerified: false,
        emailVerificationToken: verificationToken,
        emailVerificationExpires: verificationExpires,
      },
    });
    
    // Send verification email
    const verificationUrl = `${process.env.NEXTAUTH_URL || process.env.NEXT_PUBLIC_APP_URL}/verify-email?token=${verificationToken}`;
    const emailTemplate = getEmailVerificationTemplate(verificationUrl, email);
    
    const emailResult = await sendEmail({
      to: email,
      subject: 'Подтвердите ваш email - МеталлВектор',
      html: emailTemplate.html,
      text: emailTemplate.text,
    });

    if (!emailResult.success) {
      console.error('Failed to send verification email:', emailResult.error);
      // Continue anyway - user can request resend later
    }

    console.log('Verification email sent to:', email);
    console.log('Verification link:', verificationUrl);
    
    return NextResponse.json({
      message: 'Registration successful. Please check your email to verify your account.',
      email: user.email,
    });
    
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { error: 'Registration failed' },
      { status: 500 }
    );
  }
}
