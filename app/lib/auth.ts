import jwt from 'jsonwebtoken';
import { NextRequest } from 'next/server';
import { getAccessToken } from './cookies';

/**
 * Проверяет JWT-токен из httpOnly cookie или Authorization header.
 * @param req NextRequest
 * @returns Объект payload токена или null, если токен недействителен.
 */
export const verifyAuth = (req: NextRequest) => {
    // 1. Сначала проверяем httpOnly cookie
    const cookieToken = getAccessToken(req);
    
    // 2. Fallback на Authorization header (для обратной совместимости)
    const authHeader = req.headers.get('Authorization');
    const headerToken = authHeader?.startsWith('Bearer ') ? authHeader.split(' ')[1] : null;
    
    const token = cookieToken || headerToken;
    
    if (!token) {
        return null;
    }

    const JWT_SECRET = process.env.JWT_SECRET;

    if (!JWT_SECRET) {
        console.error("JWT_SECRET is not defined.");
        return null; 
    }

    try {
        const payload = jwt.verify(token, JWT_SECRET) as { 
            userId: string; 
            email: string;
            role: string;
            iat: number; 
            exp: number 
        };
        return payload;
    } catch (e) {
        return null;
    }
};

/**
 * @deprecated Используйте AuthContext.login(). Эта функция оставлена для обратной совместимости.
 */
export const login = (token: string) => {
  console.warn('login() from auth.ts is deprecated. Use AuthContext.login() instead.');
  if (typeof window !== 'undefined') {
    localStorage.setItem('authToken', token);
  }
};

/**
 * @deprecated Используйте AuthContext.logout(). Эта функция оставлена для обратной совместимости.
 */
export const logout = () => {
  console.warn('logout() from auth.ts is deprecated. Use AuthContext.logout() instead.');
  if (typeof window !== 'undefined') {
    localStorage.removeItem('authToken');
  }
};
