'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

const TOKEN_STORAGE_KEYS = ['auth_token', 'authToken'] as const;

export default function ImpersonationBanner() {
  const [isImpersonating, setIsImpersonating] = useState(false);
  const [userEmail, setUserEmail] = useState('');
  const router = useRouter();

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const impersonating = window.localStorage.getItem('impersonating');
    if (impersonating === 'true') {
      setIsImpersonating(true);

      const storedEmail = window.localStorage.getItem('impersonated_user_email');
      if (storedEmail) {
        setUserEmail(storedEmail);
        return;
      }

      const token = TOKEN_STORAGE_KEYS.map((key) => window.localStorage.getItem(key)).find(Boolean);
      if (token) {
        try {
          const payloadSegment = token.split('.')[1];
          if (!payloadSegment) throw new Error('Malformed token');
          const decoded = JSON.parse(atob(payloadSegment.replace(/-/g, '+').replace(/_/g, '/')));
          setUserEmail(decoded.email || decoded.userId || 'неизвестный пользователь');
        } catch (error) {
          console.error('Failed to parse token payload:', error);
          setUserEmail('неизвестный пользователь');
        }
      } else {
        setUserEmail('неизвестный пользователь');
      }
    }
  }, []);

  const handleExitImpersonation = () => {
    if (typeof window === 'undefined') return;

    const adminToken = window.localStorage.getItem('admin_return_token');
    if (adminToken) {
      TOKEN_STORAGE_KEYS.forEach((key) => window.localStorage.setItem(key, adminToken));
    }

    window.localStorage.removeItem('impersonating');
    window.localStorage.removeItem('admin_return_token');
    window.localStorage.removeItem('impersonated_user_email');

    router.push('/admin/users');
  };

  if (!isImpersonating) {
    return null;
  }

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        backgroundColor: '#FFB300',
        color: '#1D1D1F',
        padding: '12px 24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '16px',
        zIndex: 9999,
        boxShadow: '0 2px 12px rgba(0, 0, 0, 0.2)',
        fontSize: '15px',
        fontWeight: 600,
      }}
    >
      <span>
        ⚠️ Вы вошли как: <strong>{userEmail || 'неизвестный пользователь'}</strong>
      </span>
      <button
        type="button"
        onClick={handleExitImpersonation}
        style={{
          padding: '6px 16px',
          backgroundColor: '#FFFFFF',
          color: '#FF9500',
          border: 'none',
          borderRadius: '6px',
          fontSize: '14px',
          fontWeight: 600,
          cursor: 'pointer',
          boxShadow: '0 4px 10px rgba(0, 0, 0, 0.12)',
        }}
      >
        Вернуться в админку
      </button>
    </div>
  );
}

