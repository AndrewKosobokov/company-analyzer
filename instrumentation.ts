let isKeepAliveRunning = false;
let keepAliveTimeout: NodeJS.Timeout;

async function keepAlive() {
  if (isKeepAliveRunning) return;
  
  isKeepAliveRunning = true;
  try {
    const { prisma } = await import('@/app/lib/prisma');
    await prisma.$queryRaw`SELECT 1`;
    console.log('✅ Keep-alive OK', new Date().toISOString().slice(11, 19));
  } catch (error) {
    console.error('❌ Keep-alive failed, app will restart by PM2:', error);
  } finally {
    isKeepAliveRunning = false;
    keepAliveTimeout = setTimeout(keepAlive, 30000);
  }
}

export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    const { prisma } = await import('@/app/lib/prisma');
    
    let connected = false;
    let attempts = 0;
    while (!connected && attempts < 5) {
      try {
        await prisma.$connect();
        console.log('✅ Prisma connected successfully');
        connected = true;
      } catch (e) {
        attempts++;
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    }
    
    keepAlive();
    
    process.on('SIGTERM', () => {
      clearTimeout(keepAliveTimeout);
      prisma.$disconnect();
    });
  }
}
