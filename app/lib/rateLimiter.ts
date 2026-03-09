import { RateLimiterMemory } from 'rate-limiter-flexible';

/**
 * Rate limiters для разных типов запросов
 * В production рекомендуется использовать RateLimiterRedis
 */

// Строгий limiter для авторизации (защита от брутфорса)
export const authLimiter = new RateLimiterMemory({
  points: 5,
  duration: 15 * 60,
  blockDuration: 15 * 60,
});

// Limiter для дорогих AI анализов
export const analyzeLimiter = new RateLimiterMemory({
  points: 10,
  duration: 60 * 60,
  blockDuration: 30 * 60,
});

// Limiter для сброса пароля (защита от email bombing)
export const passwordResetLimiter = new RateLimiterMemory({
  points: 3,
  duration: 60 * 60,
  blockDuration: 60 * 60,
});

// Общий IP-based limiter
export const ipLimiter = new RateLimiterMemory({
  points: 30,
  duration: 60,
  blockDuration: 60,
});

/**
 * Проверка rate limit
 */
export async function checkRateLimit(
  identifier: string,
  limiter: RateLimiterMemory
): Promise<{ 
  success: boolean; 
  retryAfter?: number;
  remaining?: number;
}> {
  try {
    const result = await limiter.consume(identifier);
    return { 
      success: true,
      remaining: result.remainingPoints
    };
  } catch (error: unknown) {
    const rateLimitError = error as { msBeforeNext?: number };
    return {
      success: false,
      retryAfter: Math.round((rateLimitError.msBeforeNext || 60000) / 1000)
    };
  }
}

/**
 * Получить идентификатор из request (IP)
 */
export function getIdentifier(request: Request): string {
  const forwarded = request.headers.get('x-forwarded-for');
  const realIp = request.headers.get('x-real-ip');
  return forwarded?.split(',')[0]?.trim() || realIp || 'unknown';
}
