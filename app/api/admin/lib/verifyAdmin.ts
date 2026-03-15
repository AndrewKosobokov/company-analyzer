import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import prisma from '@/app/lib/prisma';

/**
 * Проверяет что пользователь авторизован и является админом.
 * Используется для всех admin API endpoints.
 * 
 * @returns userId если пользователь админ
 * @throws Error если не авторизован или не админ
 */
export async function verifyAdmin(): Promise<string> {
  // 1. Получить токен из httpOnly cookie
  const cookieStore = cookies();
  const token = cookieStore.get('access_token')?.value;
  
  if (!token) {
    throw new Error('UNAUTHORIZED');
  }
  
  // 2. Проверить и декодировать токен
  let decoded: { userId: string };
  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET!) as { userId: string };
  } catch {
    throw new Error('INVALID_TOKEN');
  }
  
  // 3. Проверить что пользователь существует и является админом
  const user = await prisma.user.findUnique({
    where: { id: decoded.userId },
    select: { role: true }
  });
  
  if (!user) {
    throw new Error('USER_NOT_FOUND');
  }
  
  if (user.role !== 'admin') {
    throw new Error('ACCESS_DENIED');
  }
  
  return decoded.userId;
}
