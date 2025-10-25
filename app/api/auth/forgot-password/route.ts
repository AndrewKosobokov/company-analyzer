import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import crypto from 'crypto';
import { sendEmail, getPasswordResetEmailTemplate } from '@/utils/email';

const prisma = new PrismaClient();

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json(
        { error: 'Email обязателен' },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    // Always return success (protection against email enumeration)
    if (!user) {
      return NextResponse.json({
        message: 'Если email существует, на него отправлена ссылка для восстановления',
      });
    }

    // Generate token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetExpires = new Date(Date.now() + 3600000); // 1 hour

    await prisma.user.update({
      where: { email: email.toLowerCase() },
      data: {
        passwordResetToken: resetToken,
        passwordResetExpires: resetExpires,
      },
    });

    // Send email
    const resetUrl = `${process.env.NEXTAUTH_URL || process.env.NEXT_PUBLIC_APP_URL}/reset-password?token=${resetToken}`;
    const emailTemplate = getPasswordResetEmailTemplate(resetUrl, email);
    
    const result = await sendEmail({
      to: email,
      subject: 'Восстановление пароля - МеталлВектор',
      html: emailTemplate.html,
      text: emailTemplate.text,
    });

    if (!result.success) {
      console.error('Failed to send email:', result.error);
      // Don't expose email sending errors to user
    }

    console.log('Password reset requested for:', email);
    console.log('Reset link:', resetUrl);

    return NextResponse.json({
      message: 'Если email существует, на него отправлена ссылка для восстановления',
    });

  } catch (error) {
    console.error('Error forgot-password:', error);
    return NextResponse.json(
      { error: 'Ошибка сервера' },
      { status: 500 }
    );
  }
}