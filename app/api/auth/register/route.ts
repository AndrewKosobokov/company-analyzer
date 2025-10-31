import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { sendEmail, getEmailVerificationTemplate } from '@/utils/email';

const prisma = new PrismaClient();

export async function POST(request: Request) {
  try {
    const { email, password, name, organization, phone } = await request.json();
    
    // Validation
    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }
    
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
  } finally {
    await prisma.$disconnect();
  }
}
