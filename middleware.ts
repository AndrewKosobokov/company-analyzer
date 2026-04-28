import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify } from 'jose';

const PUBLIC_PATHS = [
  '/',
  '/login', 
  '/register', 
  '/forgot-password', 
  '/reset-password', 
  '/verify-email',
  '/pricing',
  '/terms',
  '/privacy',
  '/public/report'
];

const API_PUBLIC_PATHS = [
  '/api/auth/login', 
  '/api/auth/register', 
  '/api/auth/forgot-password', 
  '/api/auth/reset-password',
  '/api/auth/verify-email',
  '/api/auth/refresh',
  '/api/payment/webhook',
  '/api/public/report',
  '/api/company/dadata'
];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Skip static files
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/favicon') ||
    pathname.includes('.')
  ) {
    return NextResponse.next();
  }
  
  // Skip public paths
  if (PUBLIC_PATHS.includes(pathname)) {
    return NextResponse.next();
  }
  
  if (API_PUBLIC_PATHS.some(path => pathname.startsWith(path))) {
    return NextResponse.next();
  }
  
  // Get access token from cookie
  const accessToken = request.cookies.get('access_token')?.value;
  if (pathname.startsWith('/api/payments')) {
    console.log('[Middleware] payments request, token exists:', !!accessToken);
  }
  
  // Also check Authorization header for backward compatibility
  const authHeader = request.headers.get('Authorization');
  const headerToken = authHeader?.startsWith('Bearer ') ? authHeader.substring(7) : null;
  
  const token = accessToken || headerToken;
  
  // No token - redirect to login or return 401
  if (!token) {
    if (pathname.startsWith('/api/')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.redirect(new URL('/login', request.url));
  }
  
  // Verify token using jose (Edge-compatible)
  try {
    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      console.error('JWT_SECRET is not configured');
      return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
    }
    
    const secret = new TextEncoder().encode(jwtSecret);
    await jwtVerify(token, secret);
    return NextResponse.next();
  } catch (error) {
    console.error('[Middleware] JWT verify error:', error instanceof Error ? error.message : error);
    // Token expired or invalid
    if (pathname.startsWith('/api/')) {
      const refreshToken = request.cookies.get('refresh_token')?.value;
      if (refreshToken) {
        try {
          const refreshSecret = new TextEncoder().encode(process.env.JWT_SECRET);
          await jwtVerify(refreshToken, refreshSecret);
          // refresh token валиден — редиректим на refresh endpoint
          const refreshUrl = new URL('/api/auth/refresh', request.url);
          refreshUrl.searchParams.set('redirect', pathname);
          return NextResponse.redirect(refreshUrl);
        } catch {}
      }
      return NextResponse.json(
        { error: 'Token expired', needsRefresh: true },
        { status: 401 }
      );
    }
    
    // Try to refresh token for page requests
    const refreshToken = request.cookies.get('refresh_token')?.value;
    if (refreshToken) {
      // Redirect to refresh endpoint
      return NextResponse.redirect(new URL('/api/auth/refresh?redirect=' + pathname, request.url));
    }
    
    return NextResponse.redirect(new URL('/login', request.url));
  }
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|public).*)',
  ],
};
