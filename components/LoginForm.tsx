'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import PasswordInput from '@/app/components/PasswordInput';
import { getErrorMessage, translateError } from '@/utils/errorMessages';
import { useNotification } from '@/components/NotificationProvider';
import { login as saveToken } from '@/app/lib/auth';

export default function LoginForm() {
  const [activeTab, setActiveTab] = useState<'login' | 'register'>('login');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();
  const searchParams = useSearchParams();
  const verified = searchParams.get('verified') === 'true';
  const { showNotification } = useNotification();
  
  // Form fields state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || data.message || 'Invalid credentials');
      }
      
      saveToken(data.token);
      router.push('/analysis');
    } catch (err) {
      const errorMessage = getErrorMessage(err);
      setError(errorMessage);
      showNotification(errorMessage, 'error');
    } finally {
      setLoading(false);
    }
  };
  
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    if (password.length < 8) {
      setError(translateError('Password must be at least 8 characters'));
      setLoading(false);
      return;
    }
    
    if (password !== confirmPassword) {
      setError('Пароли не совпадают');
      setLoading(false);
      return;
    }
    
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || data.message || 'Registration failed');
      }
      
      // SUCCESS: Show email verification message
      showNotification(
        `Регистрация успешна! Проверьте вашу почту для подтверждения email.`,
        'success',
        6000
      );
      
      // Switch to login tab and clear form
      setActiveTab('login');
      setEmail('');
      setPassword('');
      setConfirmPassword('');
      setName('');
      
    } catch (err) {
      const errorMessage = getErrorMessage(err);
      setError(errorMessage);
      showNotification(errorMessage, 'error');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="auth-container page-container">
      <div className="auth-card">
        {/* Logo + Subtitle */}
        <div style={{ textAlign: 'center', marginBottom: 'var(--space-xl)' }}>
          <h1 style={{ fontSize: '32px', fontWeight: 600, marginBottom: 'var(--space-xs)' }}>
            Металл Вектор
          </h1>
          <p style={{ fontSize: '15px', color: 'var(--text-secondary)' }}>
            Аналитика. Фокус. Результат.
          </p>
        </div>

        {/* Tabs */}
        <div className="auth-tabs">
          <button
            type="button"
            className={`auth-tab ${activeTab === 'login' ? 'active' : ''}`}
            onClick={() => {
              setActiveTab('login');
              setError('');
            }}
          >
            Вход
          </button>
          <button
            type="button"
            className={`auth-tab ${activeTab === 'register' ? 'active' : ''}`}
            onClick={() => {
              setActiveTab('register');
              setError('');
            }}
          >
            Регистрация
          </button>
        </div>

        {/* Error Message */}
        {error && (
          <div style={{
            padding: '16px',
            background: 'rgba(255, 59, 48, 0.1)',
            color: '#d32f2f',
            borderRadius: 'var(--radius-md)',
            marginBottom: 'var(--space-lg)',
            fontSize: '15px',
            textAlign: 'center'
          }}>
            {error}
          </div>
        )}

        {/* Verification Success Message */}
        {verified && (
          <div style={{
            padding: '12px',
            background: '#f5f5f7',
            borderRadius: '8px',
            marginBottom: '20px',
            color: '#1d1d1f',
            textAlign: 'center',
            fontSize: '14px'
          }}>
            Email успешно подтверждён! Теперь вы можете войти.
          </div>
        )}

        {/* Login Form */}
        {activeTab === 'login' && (
          <form onSubmit={handleLogin}>
            <div className="form-group">
              <label htmlFor="login-email" className="form-label">
                Email
              </label>
              <input
                id="login-email"
                type="email"
                className="form-input"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="your@email.com"
                disabled={loading}
              />
            </div>

            <div className="form-group">
              <label htmlFor="login-password" className="form-label">
                Пароль
              </label>
              <PasswordInput
                id="login-password"
                value={password}
                onChange={setPassword}
                placeholder="Введите пароль"
                disabled={loading}
                autoComplete="current-password"
              />
              <div style={{ marginTop: '8px', textAlign: 'right' }}>
                <Link 
                  href="/forgot-password" 
                  style={{ 
                    fontSize: '14px', 
                    color: 'var(--text-secondary)',
                    textDecoration: 'none'
                  }}
                >
                  Забыли пароль?
                </Link>
              </div>
            </div>

            <button
              type="submit"
              className="button-primary"
              style={{ width: '100%' }}
              disabled={loading}
            >
              {loading ? 'Вход...' : 'Войти'}
            </button>
            <p className="text-xs text-gray-500 text-center mt-4">
              Используя сервис, вы соглашаетесь с{' '}
              <a href="/terms" target="_blank" className="text-gray-700 underline hover:text-gray-900">
                условиями использования
              </a>
              .
            </p>
          </form>
        )}

        {/* Register Form */}
        {activeTab === 'register' && (
          <form onSubmit={handleRegister}>
            <div className="form-group">
              <label htmlFor="register-name" className="form-label">
                Имя, либо организация
              </label>
              <input
                id="register-name"
                type="text"
                className="form-input"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                placeholder=""
                disabled={loading}
              />
            </div>

            <div className="form-group">
              <label htmlFor="register-email" className="form-label">
                Email
              </label>
              <input
                id="register-email"
                type="email"
                className="form-input"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="your@email.com"
                disabled={loading}
              />
            </div>

            <div className="form-group">
              <label htmlFor="register-password" className="form-label">
                Пароль
              </label>
              <PasswordInput
                id="register-password"
                value={password}
                onChange={setPassword}
                placeholder="Минимум 8 символов"
                disabled={loading}
                autoComplete="new-password"
                minLength={8}
              />
            </div>

            <div className="form-group">
              <label htmlFor="register-confirm-password" className="form-label">
                Подтвердите пароль
              </label>
              <PasswordInput
                id="register-confirm-password"
                value={confirmPassword}
                onChange={setConfirmPassword}
                placeholder="Повторите пароль"
                disabled={loading}
                autoComplete="new-password"
                minLength={8}
              />
            </div>

            <button
              type="submit"
              className="button-primary"
              style={{ width: '100%' }}
              disabled={loading}
            >
              {loading ? 'Регистрация...' : 'Зарегистрироваться'}
            </button>
            <p className="text-xs text-gray-500 text-center mt-4">
              Нажимая кнопку «Зарегистрироваться», вы соглашаетесь с условиями{' '}
              <a href="/offer" target="_blank" className="text-gray-700 underline hover:text-gray-900">
                Публичной оферты
              </a>
              ,{' '}
              <a href="/terms" target="_blank" className="text-gray-700 underline hover:text-gray-900">
                Пользовательского соглашения
              </a>
              {' '}и{' '}
              <a href="/privacy" target="_blank" className="text-gray-700 underline hover:text-gray-900">
                Политики конфиденциальности
              </a>
              .
            </p>
          </form>
        )}

        {/* Footer Link */}
        <div style={{ 
          marginTop: 'var(--space-xl)', 
          textAlign: 'center' 
        }}>
          <Link 
            href="/"
            style={{
              color: 'var(--text-secondary)',
              textDecoration: 'none',
              fontSize: '15px',
              transition: 'color var(--transition-fast)'
            }}
          >
            ← Вернуться на главную
          </Link>
        </div>
      </div>
    </div>
  );
}
