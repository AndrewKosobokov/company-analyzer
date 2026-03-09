import { NextResponse } from 'next/server';
import { clearAuthCookies } from '@/app/lib/cookies';

export async function POST() {
  const response = NextResponse.json({ success: true });
  return clearAuthCookies(response);
}
