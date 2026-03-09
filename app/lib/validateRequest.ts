import { NextResponse } from 'next/server';
import { ZodSchema, ZodError } from 'zod';

/**
 * Хелпер для валидации request body с помощью Zod
 */
export async function validateRequest<T>(
  request: Request,
  schema: ZodSchema<T>
): Promise<{ success: true; data: T } | { success: false; response: NextResponse }> {
  try {
    const body = await request.json();
    const data = schema.parse(body);
    
    return { success: true, data };
  } catch (error) {
    if (error instanceof ZodError) {
      const errors = error.issues.map(err => ({
        field: err.path.join('.'),
        message: err.message,
      }));
      
      console.warn('[Validation] Failed:', errors);
      
      return {
        success: false,
        response: NextResponse.json(
          { 
            error: errors[0]?.message || 'Ошибка валидации данных',
            details: process.env.NODE_ENV === 'development' ? errors : undefined,
          },
          { status: 400 }
        ),
      };
    }
    
    console.error('[Validation] JSON parse error:', error);
    return {
      success: false,
      response: NextResponse.json(
        { error: 'Некорректный формат запроса' },
        { status: 400 }
      ),
    };
  }
}

/**
 * Валидация URL параметров
 */
export function validateParams<T>(
  params: unknown,
  schema: ZodSchema<T>
): { success: true; data: T } | { success: false; response: NextResponse } {
  try {
    const data = schema.parse(params);
    return { success: true, data };
  } catch (error) {
    if (error instanceof ZodError) {
      const errors = error.issues.map(err => ({
        field: err.path.join('.'),
        message: err.message,
      }));
      
      return {
        success: false,
        response: NextResponse.json(
          { error: 'Некорректные параметры', details: errors },
          { status: 400 }
        ),
      };
    }
    
    return {
      success: false,
      response: NextResponse.json(
        { error: 'Некорректные параметры' },
        { status: 400 }
      ),
    };
  }
}
