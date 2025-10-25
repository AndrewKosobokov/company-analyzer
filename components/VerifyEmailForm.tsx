'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';

export default function VerifyEmailForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const token = searchParams.get('token');
    
    if (!token) {
      setStatus('error');
      setMessage('Токен не предоставлен');
      return;
    }

    // Call verification API
    fetch(`/api/auth/verify-email?token=${token}`)
      .then(async (res) => {
        if (res.redirected) {
          // API redirected to login
          router.push('/login?verified=true');
        } else if (!res.ok) {
          const data = await res.json();
          setStatus('error');
          setMessage(data.error || 'Ошибка верификации');
        } else {
          setStatus('success');
          setTimeout(() => router.push('/login'), 2000);
        }
      })
      .catch(() => {
        setStatus('error');
        setMessage('Ошибка сервера');
      });
  }, [searchParams, router]);

  return (
    <div style={{ 
      minHeight: '100vh', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center',
      padding: '20px',
      background: '#f5f5f7'
    }}>
      <div style={{ 
        maxWidth: '400px', 
        textAlign: 'center',
        background: '#ffffff',
        border: '1px solid #d2d2d7',
        borderRadius: '12px',
        padding: '40px'
      }}>
        {status === 'loading' && (
          <>
            <h1 style={{ 
              fontSize: '24px', 
              marginBottom: '16px',
              color: '#1d1d1f',
              fontWeight: '600'
            }}>
              Проверка email...
            </h1>
            <p style={{ color: '#6e6e73' }}>Пожалуйста, подождите</p>
          </>
        )}
        
        {status === 'success' && (
          <>
            <h1 style={{ 
              fontSize: '24px', 
              marginBottom: '16px',
              color: '#1d1d1f',
              fontWeight: '600'
            }}>
              Email подтверждён!
            </h1>
            <p style={{ color: '#6e6e73' }}>
              Перенаправление на страницу входа...
            </p>
          </>
        )}
        
        {status === 'error' && (
          <>
            <h1 style={{ 
              fontSize: '24px', 
              marginBottom: '16px', 
              color: '#ff3b30',
              fontWeight: '600'
            }}>
              Ошибка
            </h1>
            <p style={{ 
              color: '#6e6e73', 
              marginBottom: '24px' 
            }}>
              {message}
            </p>
            <button
              onClick={() => router.push('/login')}
              style={{
                padding: '12px 24px',
                background: '#000000',
                color: '#ffffff',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '16px',
                fontWeight: '500'
              }}
            >
              Вернуться на вход
            </button>
          </>
        )}
      </div>
    </div>
  );
}
