import { PrismaClient } from '@prisma/client'

declare global {
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined
}

let prisma: PrismaClient

if (process.env.NODE_ENV === 'production') {
  prisma = new PrismaClient({
    log: ['error'],
  })

  // Явное подключение при старте
  prisma.$connect().catch((e) => {
    console.error('❌ Prisma initial connect error:', e)
  })

  // Keep-alive механизм: запрос каждые 30 секунд
  setInterval(async () => {
    try {
      await prisma.$queryRaw`SELECT 1`
    } catch (e) {
      console.error('⚠️ Keep-alive query failed, reconnecting...', e)
      try {
        await prisma.$connect()
        console.log('✅ Prisma reconnected successfully')
      } catch (reconnectError) {
        console.error('❌ Prisma reconnection failed:', reconnectError)
      }
    }
  }, 30000)

  console.log('✅ Prisma Client initialized with keep-alive')
} else {
  if (!global.prisma) {
    global.prisma = new PrismaClient()
  }
  prisma = global.prisma
}

export default prisma



