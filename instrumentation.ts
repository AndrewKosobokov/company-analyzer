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
    // НЕ пытаемся чинить! Просто логируем и ждём PM2
  } finally {
    isKeepAliveRunning = false;
    keepAliveTimeout = setTimeout(keepAlive, 30000); // 30 секунд вместо 10
  }
}

export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    const { prisma } = await import('@/app/lib/prisma');

    // Один раз подключаемся при старте
    let connected = false;
    let attempts = 0;
    while (!connected && attempts < 5) {
      try {
        await prisma.$connect();
        console.log('✅ Prisma connected successfully');
        connected = true;
      } catch (e) {
        attempts++;
        console.error(`Connection attempt ${attempts} failed`);
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    }

    // Запускаем keep-alive без реконнекта
    keepAlive();

    // Очистка при завершении
    process.on('SIGTERM', () => {
      clearTimeout(keepAliveTimeout);
      prisma.$disconnect();
    });
  }
}
