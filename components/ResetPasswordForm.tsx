'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';

export default function ResetPasswordForm() {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [token, setToken] = useState('');
  
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const tokenParam = searchParams.get('token');
    if (!tokenParam) {
      setError('Отсутствует токен восстановления');
    } else {
      setToken(tokenParam);
    }
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (newPassword.length < 6) {
      setError('Пароль должен быть минимум 6 символов');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Пароли не совпадают');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, newPassword })
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Ошибка при сбросе пароля');
        return;
      }

      setSuccess(true);
      setTimeout(() => router.push('/login'), 3000);

    } catch (err) {
      setError('Произошла ошибка. Попробуйте позже.');
    } finally {
      setLoading(false);
    }
  };

  if (!token && !error) {
    return (
      <div style={{ 
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'var(--background-primary)'
      }}>
        <div style={{
          width: '100%',
          maxWidth: '480px',
          padding: '48px',
          background: '#ffffff',
          borderRadius: '24px',
          boxShadow: '0 4px 24px rgba(0, 0, 0, 0.08)',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '15px', color: 'var(--text-secondary)' }}>
            Загрузка...
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ 
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'var(--background-primary)'
    }}>
      <div style={{
        width: '100%',
        maxWidth: '480px',
        padding: '48px',
        background: '#ffffff',
        borderRadius: '24px',
        boxShadow: '0 4px 24px rgba(0, 0, 0, 0.08)'
      }}>
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <Link href="/" style={{ textDecoration: 'none', color: 'inherit' }}>
            <div style={{ fontSize: '28px', fontWeight: 600, marginBottom: '8px' }}>
              Металл Вектор
            </div>
            <div style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>
              Аналитика. Фокус. Результат.
            </div>
          </Link>
        </div>

        <h1 style={{ 
          fontSize: '24px', 
          fontWeight: 600,
          marginBottom: '8px',
          textAlign: 'center'
        }}>
          Новый пароль
        </h1>
        
        <p style={{ 
          fontSize: '15px', 
          color: 'var(--text-secondary)', 
          marginBottom: '32px',
          textAlign: 'center'
        }}>
          Введите новый пароль для вашего аккаунта
        </p>

        {success ? (
          <div style={{
            padding: '24px',
            background: '#e8f0fe',
            borderRadius: '12px',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '17px', fontWeight: 600, marginBottom: '8px' }}>
              Пароль успешно изменён!
            </div>
            <div style={{ fontSize: '15px', color: 'var(--text-secondary)' }}>
              Перенаправляем на страницу входа...
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: '24px' }}>
              <label style={{
                display: 'block',
                fontSize: '15px',
                fontWeight: 500,
                marginBottom: '8px'
              }}>
                Новый пароль
              </label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Минимум 6 символов"
                required
                disabled={loading}
                style={{
                  width: '100%',
                  padding: '14px 16px',
                  fontSize: '15px',
                  border: 'none',
                  borderRadius: '12px',
                  background: '#e8f0fe',
                  outline: 'none',
                  fontFamily: 'inherit'
                }}
              />
            </div>

            <div style={{ marginBottom: '24px' }}>
              <label style={{
                display: 'block',
                fontSize: '15px',
                fontWeight: 500,
                marginBottom: '8px'
              }}>
                Подтвердите пароль
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Повторите новый пароль"
                required
                disabled={loading}
                style={{
                  width: '100%',
                  padding: '14px 16px',
                  fontSize: '15px',
                  border: 'none',
                  borderRadius: '12px',
                  background: '#e8f0fe',
                  outline: 'none',
                  fontFamily: 'inherit'
                }}
              />
            </div>

            {error && (
              <div style={{
                marginBottom: '24px',
                padding: '12px',
                background: 'rgba(255, 59, 48, 0.1)',
                color: '#d32f2f',
                borderRadius: '8px',
                fontSize: '15px',
                textAlign: 'center'
              }}>
                {error}
              </div>
            )}

            <button 
              type="submit" 
              disabled={loading}
              style={{
                width: '100%',
                padding: '14px',
                fontSize: '16px',
                fontWeight: 600,
                color: '#ffffff',
                background: '#1d1d1f',
                border: 'none',
                borderRadius: '12px',
                cursor: loading ? 'not-allowed' : 'pointer',
                opacity: loading ? 0.6 : 1
              }}
            >
              {loading ? 'Изменение пароля...' : 'Сохранить новый пароль'}
            </button>
          </form>
        )}

        <div style={{ 
          marginTop: '24px', 
          textAlign: 'center', 
          fontSize: '15px',
          color: 'var(--text-secondary)'
        }}>
          <Link 
            href="/login" 
            style={{ 
              color: 'inherit',
              textDecoration: 'none'
            }}
          >
            ← Вернуться ко входу
          </Link>
        </div>
      </div>
    </div>
  );
}
