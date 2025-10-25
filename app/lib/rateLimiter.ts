/**
 * Rate Limiting Utility
 * Implements token bucket algorithm for API rate limiting
 */

import { NextRequest, NextResponse } from 'next/server'

interface RateLimitConfig {
  windowMs: number // Time window in milliseconds
  maxRequests: number // Maximum requests per window
  keyGenerator?: (req: NextRequest) => string // Custom key generator
}

interface RateLimitBucket {
  tokens: number
  lastRefill: number
}

class RateLimiter {
  private static instance: RateLimiter
  private buckets: Map<string, RateLimitBucket> = new Map()
  private configs: Map<string, RateLimitConfig> = new Map()

  static getInstance(): RateLimiter {
    if (!RateLimiter.instance) {
      RateLimiter.instance = new RateLimiter()
    }
    return RateLimiter.instance
  }

  /**
   * Configure rate limiting for a specific endpoint
   */
  configure(endpoint: string, config: RateLimitConfig): void {
    this.configs.set(endpoint, config)
  }

  /**
   * Check if request is within rate limit
   */
  checkLimit(req: NextRequest, endpoint: string): { allowed: boolean; remaining: number; resetTime: number } {
    const config = this.configs.get(endpoint)
    if (!config) {
      return { allowed: true, remaining: Infinity, resetTime: 0 }
    }

    const key = config.keyGenerator ? config.keyGenerator(req) : this.getDefaultKey(req)
    const bucket = this.getBucket(key, config)
    
    const now = Date.now()
    const timePassed = now - bucket.lastRefill
    const tokensToAdd = Math.floor(timePassed / config.windowMs) * config.maxRequests
    
    // Refill tokens
    bucket.tokens = Math.min(config.maxRequests, bucket.tokens + tokensToAdd)
    bucket.lastRefill = now

    if (bucket.tokens >= 1) {
      bucket.tokens -= 1
      return {
        allowed: true,
        remaining: bucket.tokens,
        resetTime: bucket.lastRefill + config.windowMs
      }
    }

    return {
      allowed: false,
      remaining: 0,
      resetTime: bucket.lastRefill + config.windowMs
    }
  }

  /**
   * Get or create rate limit bucket
   */
  private getBucket(key: string, config: RateLimitConfig): RateLimitBucket {
    if (!this.buckets.has(key)) {
      this.buckets.set(key, {
        tokens: config.maxRequests,
        lastRefill: Date.now()
      })
    }
    return this.buckets.get(key)!
  }

  /**
   * Generate default key based on user ID or IP
   */
  private getDefaultKey(req: NextRequest): string {
    // Try to get user ID from JWT token first
    const authHeader = req.headers.get('authorization')
    if (authHeader) {
      try {
        const token = authHeader.replace('Bearer ', '')
        const payload = JSON.parse(atob(token.split('.')[1]))
        if (payload.userId) {
          return `user:${payload.userId}`
        }
      } catch (error) {
        // Fall back to IP if JWT parsing fails
      }
    }

    // Fall back to IP address
    const ip = this.getClientIP(req)
    return `ip:${ip || 'unknown'}`
  }

  /**
   * Extract client IP from request
   */
  private getClientIP(req: NextRequest): string | undefined {
    const forwarded = req.headers.get('x-forwarded-for')
    const realIP = req.headers.get('x-real-ip')
    
    if (forwarded) {
      return forwarded.split(',')[0].trim()
    }
    
    if (realIP) {
      return realIP
    }
    
    return undefined
  }

  /**
   * Clean up expired buckets periodically
   */
  cleanup(): void {
    const now = Date.now()
    const maxAge = 60 * 60 * 1000 // 1 hour
    
    this.buckets.forEach((bucket, key) => {
      if (now - bucket.lastRefill > maxAge) {
        this.buckets.delete(key)
      }
    })
  }
}

export const rateLimiter = RateLimiter.getInstance()

/**
 * Rate limiting middleware factory
 */
export function createRateLimit(config: RateLimitConfig) {
  return function rateLimitMiddleware(req: NextRequest, endpoint: string) {
    const result = rateLimiter.checkLimit(req, endpoint)
    
    if (!result.allowed) {
      return NextResponse.json(
        { 
          error: 'Слишком много запросов. Попробуйте позже.',
          retryAfter: Math.ceil((result.resetTime - Date.now()) / 1000)
        },
        { 
          status: 429,
          headers: {
            'Retry-After': Math.ceil((result.resetTime - Date.now()) / 1000).toString(),
            'X-RateLimit-Limit': config.maxRequests.toString(),
            'X-RateLimit-Remaining': result.remaining.toString(),
            'X-RateLimit-Reset': result.resetTime.toString()
          }
        }
      )
    }

    return null // Allow request to proceed
  }
}

// Configure rate limits for different endpoints
rateLimiter.configure('analysis', {
  windowMs: 60 * 1000, // 1 minute
  maxRequests: 3, // 3 requests per minute
  keyGenerator: (req) => {
    // Use user ID if available, otherwise IP
    const authHeader = req.headers.get('authorization')
    if (authHeader) {
      try {
        const token = authHeader.replace('Bearer ', '')
        const payload = JSON.parse(atob(token.split('.')[1]))
        if (payload.userId) {
          return `analysis:user:${payload.userId}`
        }
      } catch (error) {
        // Fall back to IP
      }
    }
    
    const ip = req.headers.get('x-forwarded-for')?.split(',')[0].trim() || 
              req.headers.get('x-real-ip') || 
              'unknown'
    return `analysis:ip:${ip}`
  }
})

rateLimiter.configure('auth', {
  windowMs: 15 * 60 * 1000, // 15 minutes
  maxRequests: 5, // 5 login attempts per 15 minutes
})

rateLimiter.configure('general', {
  windowMs: 60 * 1000, // 1 minute
  maxRequests: 60, // 60 requests per minute
})

// Clean up expired buckets every 5 minutes
setInterval(() => {
  rateLimiter.cleanup()
}, 5 * 60 * 1000)
