/**
 * Error Handling and Logging Utility
 * Provides centralized error handling, logging, and user-friendly error responses
 */

import { NextResponse } from 'next/server'

export enum ErrorType {
  VALIDATION = 'VALIDATION_ERROR',
  AUTHENTICATION = 'AUTHENTICATION_ERROR',
  AUTHORIZATION = 'AUTHORIZATION_ERROR',
  NOT_FOUND = 'NOT_FOUND_ERROR',
  RATE_LIMIT = 'RATE_LIMIT_ERROR',
  EXTERNAL_SERVICE = 'EXTERNAL_SERVICE_ERROR',
  DATABASE = 'DATABASE_ERROR',
  INTERNAL = 'INTERNAL_ERROR'
}

export interface ErrorLog {
  timestamp: string
  type: ErrorType
  message: string
  userId?: string
  ip?: string
  userAgent?: string
  stack?: string
  additionalData?: any
}

class ErrorHandler {
  private static instance: ErrorHandler

  static getInstance(): ErrorHandler {
    if (!ErrorHandler.instance) {
      ErrorHandler.instance = new ErrorHandler()
    }
    return ErrorHandler.instance
  }

  /**
   * Log error with structured data
   */
  logError(error: ErrorLog): void {
    // In production, this would integrate with a logging service (e.g., Sentry, LogRocket)
    console.error('🚨 ERROR:', {
      ...error,
      timestamp: new Date().toISOString()
    })

    // Additional logging for critical errors
    if (error.type === ErrorType.DATABASE || error.type === ErrorType.EXTERNAL_SERVICE) {
      console.error('🔴 CRITICAL ERROR - Immediate attention required:', error)
    }
  }

  /**
   * Handle API errors with user-friendly responses
   */
  handleApiError(
    error: Error,
    type: ErrorType,
    request?: Request,
    userId?: string
  ): NextResponse {
    const errorLog: ErrorLog = {
      timestamp: new Date().toISOString(),
      type,
      message: error.message,
      userId,
      ip: this.getClientIP(request),
      userAgent: request?.headers.get('user-agent') || undefined,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
      additionalData: {
        url: request?.url,
        method: request?.method
      }
    }

    this.logError(errorLog)

    // Return user-friendly error response
    switch (type) {
      case ErrorType.VALIDATION:
        return NextResponse.json(
          { error: 'Некорректные данные. Проверьте введенную информацию.' },
          { status: 400 }
        )

      case ErrorType.AUTHENTICATION:
        return NextResponse.json(
          { error: 'Требуется авторизация. Пожалуйста, войдите в систему.' },
          { status: 401 }
        )

      case ErrorType.AUTHORIZATION:
        return NextResponse.json(
          { error: 'Недостаточно прав для выполнения операции.' },
          { status: 403 }
        )

      case ErrorType.NOT_FOUND:
        return NextResponse.json(
          { error: 'Запрашиваемый ресурс не найден.' },
          { status: 404 }
        )

      case ErrorType.RATE_LIMIT:
        return NextResponse.json(
          { error: 'Слишком много запросов. Попробуйте позже.' },
          { status: 429 }
        )

      case ErrorType.EXTERNAL_SERVICE:
        return NextResponse.json(
          { error: 'Сервис временно недоступен. Повторите попытку через несколько минут.' },
          { status: 503 }
        )

      case ErrorType.DATABASE:
        return NextResponse.json(
          { error: 'Ошибка базы данных. Попробуйте позже.' },
          { status: 500 }
        )

      case ErrorType.INTERNAL:
      default:
        return NextResponse.json(
          { error: 'Внутренняя ошибка сервера. Попробуйте позже.' },
          { status: 500 }
        )
    }
  }

  /**
   * Handle Prisma database errors
   */
  handleDatabaseError(error: any, operation: string, userId?: string): NextResponse {
    const errorMessage = `Database error during ${operation}: ${error.message}`
    
    this.logError({
      timestamp: new Date().toISOString(),
      type: ErrorType.DATABASE,
      message: errorMessage,
      userId,
      additionalData: {
        operation,
        prismaError: error.code || 'UNKNOWN',
        meta: error.meta
      }
    })

    // Handle specific Prisma errors
    if (error.code === 'P2002') {
      return NextResponse.json(
        { error: 'Запись с такими данными уже существует.' },
        { status: 409 }
      )
    }

    if (error.code === 'P2025') {
      return NextResponse.json(
        { error: 'Запрашиваемая запись не найдена.' },
        { status: 404 }
      )
    }

    return NextResponse.json(
      { error: 'Ошибка базы данных. Попробуйте позже.' },
      { status: 500 }
    )
  }

  /**
   * Handle Gemini API errors
   */
  handleGeminiError(error: any, userId?: string): NextResponse {
    const errorMessage = `Gemini API error: ${error.message}`
    
    this.logError({
      timestamp: new Date().toISOString(),
      type: ErrorType.EXTERNAL_SERVICE,
      message: errorMessage,
      userId,
      additionalData: {
        geminiError: error.status || 'UNKNOWN',
        geminiResponse: error.response || null
      }
    })

    // Handle specific Gemini API errors
    if (error.status === 429) {
      return NextResponse.json(
        { error: 'Превышен лимит запросов к ИИ-сервису. Попробуйте через несколько минут.' },
        { status: 503 }
      )
    }

    if (error.status === 401 || error.status === 403) {
      return NextResponse.json(
        { error: 'Ошибка конфигурации ИИ-сервиса. Обратитесь в поддержку.' },
        { status: 503 }
      )
    }

    return NextResponse.json(
      { error: 'Сервис анализа временно недоступен. Повторите попытку.' },
      { status: 503 }
    )
  }

  /**
   * Extract client IP from request
   */
  private getClientIP(request?: Request): string | undefined {
    if (!request) return undefined
    
    const forwarded = request.headers.get('x-forwarded-for')
    const realIP = request.headers.get('x-real-ip')
    
    if (forwarded) {
      return forwarded.split(',')[0].trim()
    }
    
    if (realIP) {
      return realIP
    }
    
    return undefined
  }

  /**
   * Create a standardized error response
   */
  createErrorResponse(message: string, status: number, type: ErrorType): NextResponse {
    return NextResponse.json(
      { 
        error: message,
        type: type,
        timestamp: new Date().toISOString()
      },
      { status }
    )
  }
}

export const errorHandler = ErrorHandler.getInstance()

