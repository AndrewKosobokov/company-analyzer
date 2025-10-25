'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useNotification } from '@/components/NotificationProvider';

export default function ForgotPasswordForm() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const { showNotification } = useNotification();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });

      const data = await res.json();
      
      if (res.ok) {
        showNotification(
          'Если email существует, на него отправлена ссылка для восстановления',
          'info',
          6000
        );
        setMessage('');
      } else {
        showNotification(data.message || 'Произошла ошибка. Попробуйте позже.', 'error');
        setMessage(data.message || 'Произошла ошибка. Попробуйте позже.');
      }

    } catch (error) {
      const errorMessage = 'Произошла ошибка. Попробуйте позже.';
      showNotification(errorMessage, 'error');
      setMessage(errorMessage);
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

        <h1 style={{ 
          fontSize: '24px', 
          fontWeight: 600,
          marginBottom: '8px',
          textAlign: 'center'
        }}>
          Восстановление пароля
        </h1>
        
        <p style={{ 
          fontSize: '15px', 
          color: 'var(--text-secondary)', 
          marginBottom: '32px',
          textAlign: 'center'
        }}>
          Введите email, который вы использовали при регистрации
        </p>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">
              Email
            </label>
            <input
              type="email"
              className="form-input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              required
              disabled={loading}
            />
          </div>

          <button 
            type="submit" 
            className="button-primary"
            style={{ width: '100%' }}
            disabled={loading}
          >
            {loading ? 'Отправка...' : 'Отправить ссылку'}
          </button>
        </form>

        {message && (
          <div style={{
            marginTop: '24px',
            padding: '16px',
            background: 'rgba(255, 59, 48, 0.1)',
            color: '#d32f2f',
            borderRadius: 'var(--radius-md)',
            fontSize: '15px',
            textAlign: 'center'
          }}>
            {message}
          </div>
        )}


        {/* Footer Link */}
        <div style={{ 
          marginTop: 'var(--space-xl)', 
          textAlign: 'center' 
        }}>
          <Link 
            href="/login"
            style={{
              color: 'var(--text-secondary)',
              textDecoration: 'none',
              fontSize: '15px',
              transition: 'color var(--transition-fast)'
            }}
          >
            ← Вернуться ко входу
          </Link>
        </div>
      </div>
    </div>
  );
}
