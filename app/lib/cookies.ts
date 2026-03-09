import { NextRequest, NextResponse } from 'next/server';

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict' as const,
  path: '/',
};

export function setAuthCookies(
  response: NextResponse,
  accessToken: string,
  refreshToken: string
) {
  // Access token (15 минут)
  response.cookies.set('access_token', accessToken, {
    ...COOKIE_OPTIONS,
    maxAge: 15 * 60, // 15 минут
  });

  // Refresh token (30 дней)
  response.cookies.set('refresh_token', refreshToken, {
    ...COOKIE_OPTIONS,
    maxAge: 30 * 24 * 60 * 60, // 30 дней
  });

  return response;
}

export function clearAuthCookies(response: NextResponse) {
  response.cookies.delete('access_token');
  response.cookies.delete('refresh_token');
  return response;
}

export function getAccessToken(request: NextRequest): string | null {
  return request.cookies.get('access_token')?.value || null;
}

export function getRefreshToken(request: NextRequest): string | null {
  return request.cookies.get('refresh_token')?.value || null;
}
