'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/app/context/AuthContext';

export default function PricingContent() {
  const [isMounted, setIsMounted] = useState(false);
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);
  const [subscriptionEnd, setSubscriptionEnd] = useState<string | null>(null);
  const { isAuthenticated, user } = useAuth();

  useEffect(() => {
    setTimeout(() => setIsMounted(true), 50);
  }, []);

  useEffect(() => {
    if (user?.planStartDate && user?.plan !== 'trial') {
      const end = new Date(user.planStartDate);
      end.setMonth(end.getMonth() + 1);
      if (end > new Date()) {
        setSubscriptionEnd(end.toLocaleDateString('ru-RU'));
      } else {
        setSubscriptionEnd(null);
      }
    } else {
      setSubscriptionEnd(null);
    }
  }, [user]);

  const handleSelectPlan = async (planId: string) => {
    setLoading(planId);

    try {
      if (!isAuthenticated) {
        router.push('/login');
        return;
      }

      const response = await fetch('/api/payment/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ planId }),
      });

      if (!response.ok) {
        throw new Error('Failed to create payment');
      }

      const data = await response.json();
      window.location.href = data.confirmationUrl;
    } catch (error) {
      console.error('Payment error:', error);
      alert('Ошибка создания платежа. Попробуйте позже.');
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="page-container">
      <main
        className="container"
        style={{
          paddingTop: '96px',
          paddingBottom: '96px',
          opacity: isMounted ? 1 : 0,
          transform: isMounted ? 'translateY(0)' : 'translateY(-10px)',
          transition: 'opacity 0.3s ease-in-out, transform 0.3s ease-in-out',
          display: 'flex',
          justifyContent: 'center',
        }}
      >
        <div
          className="pricing-card"
          style={{
            maxWidth: '400px',
            width: '100%',
            opacity: isMounted ? 1 : 0,
            transform: isMounted ? 'translateY(0) scale(1)' : 'translateY(20px) scale(0.95)',
            transition: 'opacity 0.4s ease-out, transform 0.4s ease-out',
            transitionDelay: '0.1s',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(0) scale(1.02)';
            e.currentTarget.style.borderColor = 'var(--button-primary)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0) scale(1)';
            e.currentTarget.style.borderColor = '';
          }}
        >
          <h3 style={{ fontSize: '28px', marginBottom: '8px' }}>
            Безлимит
          </h3>
          <div
            className="price"
            style={{
              fontSize: '48px',
              fontWeight: 600,
              letterSpacing: '-0.025em',
              margin: 'var(--space-lg) 0',
            }}
          >
            4 500 ₽
          </div>
          <p
            style={{
              fontSize: '21px',
              color: 'var(--text-secondary)',
              fontWeight: 500,
              marginBottom: 'var(--space-lg)',
            }}
          >
            1 месяц — безлимитный доступ
          </p>

          <ul style={{ listStyle: 'none', margin: 'var(--space-lg) 0', padding: 0 }}>
            <li
              style={{
                padding: 'var(--space-sm) 0',
                color: 'var(--text-tertiary)',
                fontSize: '17px',
              }}
            >
              Неограниченное количество анализов компаний
            </li>
          </ul>

          {subscriptionEnd ? (
            <>
              <div style={{
                padding: '16px',
                background: 'var(--background-secondary)',
                borderRadius: '12px',
                textAlign: 'center',
                marginTop: 'var(--space-lg)'
              }}>
                <p style={{ fontSize: '15px', color: 'var(--text-secondary)', marginBottom: '4px' }}>Подписка активна до</p>
                <p style={{ fontSize: '21px', fontWeight: 600, color: 'var(--text-primary)' }}>{subscriptionEnd}</p>
              </div>
              <button
                type="button"
                onClick={() => handleSelectPlan('unlimited')}
                disabled={loading === 'unlimited'}
                className="button-secondary"
                style={{ width: '100%', marginTop: 'var(--space-md)' }}
              >
                {loading === 'unlimited' ? 'Загрузка...' : 'Продлить подписку'}
              </button>
            </>
          ) : (
            <button
              type="button"
              onClick={() => handleSelectPlan('unlimited')}
              disabled={loading === 'unlimited'}
              className="button-primary"
              style={{
                width: '100%',
                marginTop: 'var(--space-lg)',
                transition: 'all 0.3s ease',
              }}
              onMouseEnter={(e) => {
                if (loading !== 'unlimited') {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                }
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
              }}
              onMouseDown={(e) => {
                e.currentTarget.style.transform = 'scale(0.98)';
              }}
              onMouseUp={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
              }}
            >
              {loading === 'unlimited' ? 'Загрузка...' : 'Подключить'}
            </button>
          )}
          <p className="text-xs text-gray-500 text-center mt-3">
            Оплачивая услугу, вы подтверждаете согласие с{' '}
            <a href="/offer" target="_blank" className="text-gray-700 underline hover:text-gray-900">
              Публичной офертой
            </a>
            {' '}и{' '}
            <a href="/privacy" target="_blank" className="text-gray-700 underline hover:text-gray-900">
              Политикой конфиденциальности
            </a>
            .
          </p>
        </div>
      </main>
    </div>
  );
}
