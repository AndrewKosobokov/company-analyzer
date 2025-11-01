import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST() {
  try {
    // Set admin role for owner
    const updated = await prisma.user.update({
      where: { email: 'kosobokov90@yandex.ru' },
      data: { role: 'admin' }
    });

    return NextResponse.json({ 
      success: true, 
      message: 'Admin role set successfully',
      user: updated.email 
    });
  } catch (error) {
    return NextResponse.json({ 
      error: 'Failed to set admin role' 
    }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}








































