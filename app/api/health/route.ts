import { NextResponse } from 'next/server';
import { prisma } from '@/app/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    await prisma.$queryRaw`SELECT 1`;
    const memoryUsage = process.memoryUsage();
    
    return NextResponse.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: Math.floor(process.uptime()),
      memory: {
        rss: `${Math.round(memoryUsage.rss / 1024 / 1024)}MB`,
        heapUsed: `${Math.round(memoryUsage.heapUsed / 1024 / 1024)}MB`,
      }
    }, { status: 200 });
  } catch (error) {
    console.error('Health check failed:', error);
    return NextResponse.json({ 
      status: 'unhealthy',
      error: String(error)
    }, { status: 503 });
  }
}
