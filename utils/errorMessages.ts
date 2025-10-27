// Map English errors to Russian translations
export const ERROR_MESSAGES: Record<string, string> = {
  // Authentication errors
  'Invalid credentials': 'Неверный email или пароль',
  'Invalid email or password': 'Неверный email или пароль',
  'Wrong password': 'Неверный пароль',
  'User not found': 'Пользователь не найден',
  'Email already exists': 'Email уже зарегистрирован',
  'Email is already registered': 'Email уже зарегистрирован',
  'User already exists': 'Email уже зарегистрирован',
  'Invalid email': 'Неверный формат email',
  'Invalid email format': 'Неверный формат email',
  
  // Password validation
  'Password too short': 'Пароль слишком короткий (минимум 8 символов)',
  'Password must be at least 8 characters': 'Пароль должен содержать минимум 8 символов',
  'Password is required': 'Введите пароль',
  'Passwords do not match': 'Пароли не совпадают',
  'Password must be at least 8 characters long': 'Пароль должен содержать минимум 8 символов',
  
  // Email verification
  'Email not verified': 'Email не подтверждён. Проверьте почту',
  'Please verify your email': 'Пожалуйста, подтвердите email',
  'Verification token invalid': 'Неверная ссылка подтверждения',
  'Token expired': 'Ссылка подтверждения истекла',
  
  // General errors
  'Required field': 'Обязательное поле',
  'Network error': 'Ошибка сети. Проверьте подключение к интернету',
  'Server error': 'Ошибка сервера. Попробуйте позже',
  'Something went wrong': 'Что-то пошло не так',
  'Session expired': 'Сессия истекла. Войдите снова',
  'Unauthorized': 'Необходима авторизация',
  'Access denied': 'Доступ запрещён',
  
  // Registration errors
  'Registration failed': 'Ошибка регистрации',
  'Please fill all fields': 'Заполните все поля',
  'Name is required': 'Введите имя',
  'Email and password are required': 'Введите email и пароль',
  
  // Login errors
  'Login failed': 'Ошибка входа',
  
  // Default
  'Unknown error': 'Неизвестная ошибка'
};

/**
 * Translate error message from English to Russian
 * @param error - Error message string
 * @returns Translated error message or original if no translation found
 */
export function translateError(error: string): string {
  // Direct match
  if (ERROR_MESSAGES[error]) {
    return ERROR_MESSAGES[error];
  }
  
  // If already in Russian, return as is
  if (/[а-яА-ЯёЁ]/.test(error)) {
    return error;
  }
  
  // Fallback: try to find partial match
  for (const [key, value] of Object.entries(ERROR_MESSAGES)) {
    if (error.toLowerCase().includes(key.toLowerCase())) {
      return value;
    }
  }
  
  return error || 'Неизвестная ошибка';
}

/**
 * Extract and translate error message from various error formats
 * @param error - Error object, string, or response
 * @returns Translated Russian error message
 */
export function getErrorMessage(error: any): string {
  // String error
  if (typeof error === 'string') {
    return translateError(error);
  }
  
  // Error object with message
  if (error?.message) {
    return translateError(error.message);
  }
  
  // Fetch response error
  if (error?.response?.data?.message) {
    return translateError(error.response.data.message);
  }
  
  if (error?.response?.data?.error) {
    return translateError(error.response.data.error);
  }
  
  // Error object with error property
  if (error?.error) {
    return translateError(error.error);
  }
  
  return 'Неизвестная ошибка';
}





























