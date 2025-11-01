// File: app/lib/auth.ts (НОВЫЙ ФАЙЛ)

import jwt from 'jsonwebtoken';
import { NextRequest, NextResponse } from 'next/server';

/**
 * Проверяет JWT-токен из заголовка Authorization.
 * @param req NextRequest
 * @returns Объект payload токена (userId, userInn) или null, если токен недействителен.
 */
export const verifyAuth = (req: NextRequest) => {
    const authHeader = req.headers.get('Authorization');
    
    // 1. Проверка наличия заголовка
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return null;
    }

    const token = authHeader.split(' ')[1];
    const JWT_SECRET = process.env.JWT_SECRET;

    if (!JWT_SECRET) {
        console.error("JWT_SECRET is not defined.");
        // В продакшене это критическая ошибка конфигурации
        return null; 
    }

    try {
        // 2. Верификация токена и извлечение данных
        const payload = jwt.verify(token, JWT_SECRET) as { userId: string; userInn: string; iat: number; exp: number };
        return payload;
    } catch (e) {
        // Ошибка, если токен просрочен или невалиден (jwt.verify бросает исключение)
        return null;
    }
};

/**
 * Сохраняет JWT токен в localStorage
 * @param token JWT токен
 */
export const login = (token: string) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('authToken', token);
  }
};

/**
 * Удаляет JWT токен из localStorage
 */
export const logout = () => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('authToken');
  }
};

/**
 * Получает JWT токен из localStorage
 * @returns JWT токен или null
 */
export const getToken = (): string | null => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('authToken');
  }
  return null;
};