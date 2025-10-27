/**
 * Security Middleware
 * Provides CORS configuration and security headers
 */

import { NextRequest, NextResponse } from 'next/server'

interface SecurityConfig {
  corsOrigins: string[]
  enableHSTS: boolean
  hstsMaxAge: number
  cspPolicy: string
  enableCSP: boolean
}

class SecurityMiddleware {
  private static instance: SecurityMiddleware
  private config: SecurityConfig

  constructor() {
    this.config = {
      corsOrigins: this.getCORSOrigins(),
      enableHSTS: process.env.NODE_ENV === 'production',
      hstsMaxAge: parseInt(process.env.HSTS_MAX_AGE || '31536000'),
      cspPolicy: process.env.CSP_POLICY || this.getDefaultCSP(),
      enableCSP: process.env.NODE_ENV === 'production'
    }
  }

  static getInstance(): SecurityMiddleware {
    if (!SecurityMiddleware.instance) {
      SecurityMiddleware.instance = new SecurityMiddleware()
    }
    return SecurityMiddleware.instance
  }

  /**
   * Get CORS origins from environment
   */
  private getCORSOrigins(): string[] {
    const origins = process.env.CORS_ORIGINS || 'http://localhost:3000'
    return origins.split(',').map(origin => origin.trim())
  }

  /**
   * Get default Content Security Policy
   */
  private getDefaultCSP(): string {
    return "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self'; frame-ancestors 'none';"
  }

  /**
   * Apply security headers to response
   */
  applySecurityHeaders(response: NextResponse): NextResponse {
    // Content Security Policy
    if (this.config.enableCSP) {
      response.headers.set('Content-Security-Policy', this.config.cspPolicy)
    }

    // X-Content-Type-Options
    response.headers.set('X-Content-Type-Options', 'nosniff')

    // X-Frame-Options
    response.headers.set('X-Frame-Options', 'DENY')

    // X-XSS-Protection
    response.headers.set('X-XSS-Protection', '1; mode=block')

    // Referrer Policy
    response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')

    // Permissions Policy
    response.headers.set('Permissions-Policy', 'geolocation=(), microphone=(), camera=()')

    // Strict Transport Security (HTTPS only)
    if (this.config.enableHSTS) {
      response.headers.set(
        'Strict-Transport-Security',
        `max-age=${this.config.hstsMaxAge}; includeSubDomains; preload`
      )
    }

    // Remove server information
    response.headers.delete('X-Powered-By')
    response.headers.delete('Server')

    return response
  }

  /**
   * Handle CORS preflight requests
   */
  handleCORS(request: NextRequest): NextResponse | null {
    const origin = request.headers.get('origin')
    
    // Check if origin is allowed
    if (origin && this.config.corsOrigins.includes(origin)) {
      const response = new NextResponse(null, { status: 200 })
      
      // Set CORS headers
      response.headers.set('Access-Control-Allow-Origin', origin)
      response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
      response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization')
      response.headers.set('Access-Control-Allow-Credentials', 'true')
      response.headers.set('Access-Control-Max-Age', '86400') // 24 hours
      
      return this.applySecurityHeaders(response)
    }

    // Origin not allowed
    return new NextResponse('CORS policy violation', { status: 403 })
  }

  /**
   * Add CORS headers to response
   */
  addCORSHeaders(response: NextResponse, request: NextRequest): NextResponse {
    const origin = request.headers.get('origin')
    
    if (origin && this.config.corsOrigins.includes(origin)) {
      response.headers.set('Access-Control-Allow-Origin', origin)
      response.headers.set('Access-Control-Allow-Credentials', 'true')
    }

    return response
  }

  /**
   * Validate request origin
   */
  validateOrigin(request: NextRequest): boolean {
    const origin = request.headers.get('origin')
    
    if (!origin) {
      // Allow requests without origin (e.g., mobile apps, Postman)
      return true
    }

    return this.config.corsOrigins.includes(origin)
  }

  /**
   * Get security configuration
   */
  getConfig(): SecurityConfig {
    return { ...this.config }
  }

  /**
   * Update security configuration
   */
  updateConfig(newConfig: Partial<SecurityConfig>): void {
    this.config = { ...this.config, ...newConfig }
  }
}

export const securityMiddleware = SecurityMiddleware.getInstance()

/**
 * Security middleware wrapper for API routes
 */
export function withSecurity(handler: (req: NextRequest) => Promise<NextResponse>) {
  return async (req: NextRequest): Promise<NextResponse> => {
    // Handle CORS preflight
    if (req.method === 'OPTIONS') {
      const corsResponse = securityMiddleware.handleCORS(req)
      if (corsResponse) {
        return corsResponse
      }
    }

    // Validate origin
    if (!securityMiddleware.validateOrigin(req)) {
      return new NextResponse('Forbidden', { status: 403 })
    }

    try {
      // Execute the handler
      const response = await handler(req)
      
      // Add security headers
      const securedResponse = securityMiddleware.applySecurityHeaders(response)
      
      // Add CORS headers
      return securityMiddleware.addCORSHeaders(securedResponse, req)
    } catch (error) {
      console.error('Security middleware error:', error)
      return new NextResponse('Internal Server Error', { status: 500 })
    }
  }
}
















































