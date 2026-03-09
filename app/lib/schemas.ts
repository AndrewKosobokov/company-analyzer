import { z } from 'zod';

/**
 * Zod схемы для валидации API requests
 */

// ===== AUTH SCHEMAS =====

export const loginSchema = z.object({
  email: z.string()
    .email('Некорректный email')
    .toLowerCase()
    .trim(),
  password: z.string()
    .min(1, 'Пароль обязателен')
    .max(100, 'Пароль максимум 100 символов'),
});

export const registerSchema = z.object({
  email: z.string()
    .email('Некорректный email')
    .toLowerCase()
    .trim(),
  password: z.string()
    .min(8, 'Пароль минимум 8 символов')
    .max(100, 'Пароль максимум 100 символов'),
  name: z.string()
    .min(2, 'Имя минимум 2 символа')
    .max(100, 'Имя максимум 100 символов')
    .optional(),
  organization: z.string()
    .max(200, 'Название организации максимум 200 символов')
    .optional(),
  phone: z.string()
    .max(20, 'Телефон максимум 20 символов')
    .optional(),
});

export const forgotPasswordSchema = z.object({
  email: z.string()
    .email('Некорректный email')
    .toLowerCase()
    .trim(),
});

export const resetPasswordSchema = z.object({
  token: z.string().min(1, 'Token обязателен'),
  password: z.string()
    .min(8, 'Пароль минимум 8 символов')
    .max(100, 'Пароль максимум 100 символов'),
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Текущий пароль обязателен'),
  newPassword: z.string()
    .min(8, 'Новый пароль минимум 8 символов')
    .max(100, 'Пароль максимум 100 символов'),
});

// ===== ANALYSIS SCHEMAS =====

export const analyzeSchema = z.object({
  url: z.string()
    .trim()
    .optional()
    .transform(val => val || ''),
  inn: z.string()
    .trim()
    .optional()
    .transform(val => val || ''),
}).refine(
  data => data.url || data.inn,
  { message: 'Укажите сайт или ИНН компании' }
).refine(
  data => {
    if (data.inn && data.inn.length > 0) {
      return /^\d{10}$|^\d{12}$/.test(data.inn);
    }
    return true;
  },
  { message: 'ИНН должен содержать 10 или 12 цифр', path: ['inn'] }
);

export const productAnalyzeSchema = z.object({
  productName: z.string()
    .min(2, 'Название продукта минимум 2 символа')
    .max(200, 'Название продукта максимум 200 символов')
    .trim(),
});

// ===== ADMIN SCHEMAS =====

export const updateUserSchema = z.object({
  plan: z.enum(['trial', 'start', 'optimal', 'profi']).optional(),
  analysesRemaining: z.number()
    .int('Должно быть целое число')
    .min(0, 'Не может быть отрицательным')
    .max(100000, 'Максимум 100000')
    .optional(),
  role: z.enum(['user', 'admin']).optional(),
});

// Экспорт типов для TypeScript
export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type AnalyzeInput = z.infer<typeof analyzeSchema>;
export type ProductAnalyzeInput = z.infer<typeof productAnalyzeSchema>;
