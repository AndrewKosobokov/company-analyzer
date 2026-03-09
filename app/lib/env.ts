/**
 * Валидация обязательных environment variables при старте приложения
 * Если хотя бы одна переменная отсутствует - приложение не запустится
 */

const REQUIRED_ENV_VARS = [
  'JWT_SECRET',
  'DATABASE_URL',
] as const;

const REQUIRED_PROD_ENV_VARS = [
  'GOOGLE_CLOUD_PROJECT',
  'GOOGLE_APPLICATION_CREDENTIALS',
  'YUKASSA_SHOP_ID',
  'YUKASSA_SECRET_KEY',
  'SMTP_HOST',
  'SMTP_USER',
  'SMTP_PASSWORD',
] as const;

let validated = false;

export function validateEnv() {
  // Проверяем только один раз
  if (validated) return;
  
  const missing: string[] = [];
  
  // Проверка обязательных переменных
  for (const envVar of REQUIRED_ENV_VARS) {
    if (!process.env[envVar]) {
      missing.push(envVar);
    }
  }
  
  // В production проверяем дополнительные переменные
  if (process.env.NODE_ENV === 'production') {
    for (const envVar of REQUIRED_PROD_ENV_VARS) {
      if (!process.env[envVar]) {
        missing.push(envVar);
      }
    }
  }
  
  if (missing.length > 0) {
    const errorMessage = [
      '',
      '❌ CRITICAL: Missing required environment variables:',
      '',
      ...missing.map(v => `  - ${v}`),
      '',
      'Application cannot start without these variables.',
      'Please check your .env file.',
      '',
    ].join('\n');
    
    console.error(errorMessage);
    
    // В development только предупреждение, в production - ошибка
    if (process.env.NODE_ENV === 'production') {
      throw new Error(`Missing environment variables: ${missing.join(', ')}`);
    }
  }
  
  // Дополнительная валидация JWT_SECRET
  const jwtSecret = process.env.JWT_SECRET;
  if (jwtSecret && jwtSecret.length < 32) {
    console.warn(
      '⚠️ WARNING: JWT_SECRET should be at least 32 characters long for security.\n' +
      'Generate a strong secret: openssl rand -base64 32'
    );
  }
  
  validated = true;
  console.log('✅ Environment variables validated');
}

// Безопасный доступ к env переменным с fallback для development
export const env = {
  get JWT_SECRET(): string {
    const value = process.env.JWT_SECRET;
    if (!value) {
      if (process.env.NODE_ENV === 'production') {
        throw new Error('JWT_SECRET is required in production');
      }
      console.warn('⚠️ Using insecure default JWT_SECRET in development');
      return 'insecure-dev-secret-do-not-use-in-production';
    }
    return value;
  },
  
  get DATABASE_URL(): string {
    const value = process.env.DATABASE_URL;
    if (!value) {
      throw new Error('DATABASE_URL is required');
    }
    return value;
  },
  
  get GOOGLE_CLOUD_PROJECT(): string | undefined {
    return process.env.GOOGLE_CLOUD_PROJECT;
  },
  
  get GOOGLE_APPLICATION_CREDENTIALS(): string | undefined {
    return process.env.GOOGLE_APPLICATION_CREDENTIALS;
  },
  
  get NEXT_PUBLIC_APP_URL(): string {
    return process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  },
  
  get YUKASSA_SHOP_ID(): string | undefined {
    return process.env.YUKASSA_SHOP_ID;
  },
  
  get YUKASSA_SECRET_KEY(): string | undefined {
    return process.env.YUKASSA_SECRET_KEY;
  },
  
  get NODE_ENV(): string {
    return process.env.NODE_ENV || 'development';
  },
  
  get isProduction(): boolean {
    return process.env.NODE_ENV === 'production';
  },
  
  get isDevelopment(): boolean {
    return process.env.NODE_ENV !== 'production';
  },
} as const;
