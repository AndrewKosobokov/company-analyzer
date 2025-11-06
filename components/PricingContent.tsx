'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { getToken } from '@/app/lib/auth';

export default function PricingContent() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);
  
  useEffect(() => {
    const token = getToken();
    setIsLoggedIn(!!token);
  }, []);

  useEffect(() => {
    const checkAdmin = async () => {
      const token = getToken();
      if (!token) return;
      
      try {
        const res = await fetch('/api/auth/status', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();
        setIsAdmin(data.role === 'admin');
      } catch (err) {
        // Ignore errors
      }
    };
    
    checkAdmin();
  }, []);
  
  const handleLogout = () => {
    localStorage.clear();
    router.push('/');
  };

  const handleSelectPlan = async (planId: string) => {
    console.log('🎯 BUTTON CLICKED! Plan:', planId);
    setLoading(planId);

    try {
      const token = getToken();
      console.log('🔑 Token exists:', !!token);
      
      if (!token) {
        console.log('❌ No token, redirecting to /login');
        router.push('/login');
        return;
      }

      console.log('📤 Sending POST to /api/payment/create');
      const response = await fetch('/api/payment/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ planId }),
      });

      console.log('📥 Response status:', response.status);
      console.log('📥 Response ok:', response.ok);

      if (!response.ok) {
        const errorData = await response.json();
        console.error('❌ Error response:', errorData);
        throw new Error('Failed to create payment');
      }

      const data = await response.json();
      console.log('✅ Payment data:', data);
      console.log('🔗 Confirmation URL:', data.confirmationUrl);
      
      window.location.href = data.confirmationUrl;
    } catch (error) {
      console.error('💥 PAYMENT ERROR:', error);
      alert('Ошибка создания платежа. Попробуйте позже.');
    } finally {
      console.log('🏁 Finally block');
      setLoading(null);
    }
  };
  
  return (
    <div className="page-container">
      {/* Header */}
      <header className="header">
        <div className="header-container">
          {/* Logo + Subtitle */}
          <Link href={isLoggedIn ? "/analysis" : "/"} className="logo">
            <div style={{ fontSize: '24px', fontWeight: 600 }}>Металл Вектор</div>
            <div style={{ fontSize: '13px', color: 'var(--text-secondary)', fontWeight: 400, marginTop: '2px' }}>
              Аналитика. Фокус. Результат.
            </div>
          </Link>
          
          {/* Navigation */}
          {isLoggedIn ? (
            <nav className="nav">
              <Link href="/analysis" className="button-primary header-button">
                Анализ
              </Link>
              <Link href="/companies" className="nav-link">
                Отчеты
              </Link>
              <Link 
                href="/pricing" 
                className="nav-link"
                style={{ fontWeight: 600, color: 'var(--text-primary)' }}
              >
                Тарифы
              </Link>
              <Link href="/profile" className="nav-link">
                Профиль
              </Link>
              {isAdmin && (
                <>
                  <Link 
                    href="/admin/dashboard" 
                    className="nav-link"
                    style={{ 
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px'
                    }}
                  >
                    <span>📊</span>
                    <span>Аналитика</span>
                  </Link>
                  <Link href="/admin" className="nav-link">Админ-панель</Link>
                </>
              )}
              <button 
                onClick={handleLogout} 
                className="nav-link"
                style={{ background: 'none', border: 'none', cursor: 'pointer' }}
              >
                Выйти
              </button>
            </nav>
          ) : (
            <nav className="nav">
              <Link 
                href="/pricing" 
                className="nav-link"
                style={{ fontWeight: 600, color: 'var(--text-primary)' }}
              >
                Тарифы
              </Link>
              <Link 
                href="/login" 
                className="button-primary header-button"
              >
                Войти
              </Link>
            </nav>
          )}
        </div>
      </header>
      
      {/* Main Content */}
      <main className="container" style={{ paddingTop: '96px', paddingBottom: '96px' }}>
        <h1 style={{ fontSize: '48px', textAlign: 'center', marginBottom: '48px' }}>
          Тарифы
        </h1>
        
        {/* Pricing Grid */}
        <div className="pricing-grid">
          {/* Card 1 - Start */}
          <div className="pricing-card">
            <h3 style={{ fontSize: '28px', marginBottom: '8px' }}>
              Start
            </h3>
            <div className="price" style={{ 
              fontSize: '48px', 
              fontWeight: 600, 
              letterSpacing: '-0.025em',
              margin: 'var(--space-lg) 0'
            }}>
              4 500 ₽
            </div>
            <p style={{ 
              fontSize: '21px', 
              color: 'var(--text-secondary)', 
              fontWeight: 500,
              marginBottom: 'var(--space-lg)'
            }}>
              за 40 анализов
            </p>
            
            <ul style={{ 
              listStyle: 'none', 
              margin: 'var(--space-lg) 0',
              padding: 0
            }}>
              <li style={{ 
                padding: 'var(--space-sm) 0',
                color: 'var(--text-tertiary)',
                fontSize: '17px'
              }}>
                40 анализов компаний
              </li>
            </ul>
            
            <button 
              type="button"
              onClick={() => handleSelectPlan('start')}
              disabled={loading === 'start'}
              className="button-primary"
              style={{ width: '100%', marginTop: 'var(--space-lg)' }}
            >
              {loading === 'start' ? 'Загрузка...' : 'Выбрать Start'}
            </button>
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
          
          {/* Card 2 - Optimal (Recommended) */}
          <div className="pricing-card recommended" style={{ position: 'relative' }}>
            {/* Recommended Badge */}
            <div style={{
              position: 'absolute',
              top: '-12px',
              left: '50%',
              transform: 'translateX(-50%)',
              background: 'var(--button-primary)',
              color: 'white',
              padding: '6px 16px',
              borderRadius: '12px',
              fontSize: '13px',
              fontWeight: 500,
              whiteSpace: 'nowrap'
            }}>
              Рекомендуется
            </div>
            
            <h3 style={{ fontSize: '28px', marginBottom: '8px' }}>
              Optimal
            </h3>
            <div className="price" style={{ 
              fontSize: '48px', 
              fontWeight: 600, 
              letterSpacing: '-0.025em',
              margin: 'var(--space-lg) 0'
            }}>
              8 500 ₽
            </div>
            <p style={{ 
              fontSize: '21px', 
              color: 'var(--text-secondary)', 
              fontWeight: 500,
              marginBottom: 'var(--space-lg)'
            }}>
              за 80 анализов
            </p>
            
            <ul style={{ 
              listStyle: 'none', 
              margin: 'var(--space-lg) 0',
              padding: 0
            }}>
              <li style={{ 
                padding: 'var(--space-sm) 0',
                color: 'var(--text-tertiary)',
                fontSize: '17px'
              }}>
                80 анализов компаний
              </li>
            </ul>
            
            <button 
              type="button"
              onClick={() => handleSelectPlan('optimal')}
              disabled={loading === 'optimal'}
              className="button-primary"
              style={{ width: '100%', marginTop: 'var(--space-lg)' }}
            >
              {loading === 'optimal' ? 'Загрузка...' : 'Выбрать Optimal'}
            </button>
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
          
          {/* Card 3 - Profi */}
          <div className="pricing-card">
            <h3 style={{ fontSize: '28px', marginBottom: '8px' }}>
              Profi
            </h3>
            <div className="price" style={{ 
              fontSize: '48px', 
              fontWeight: 600, 
              letterSpacing: '-0.025em',
              margin: 'var(--space-lg) 0'
            }}>
              12 000 ₽
            </div>
            <p style={{ 
              fontSize: '21px', 
              color: 'var(--text-secondary)', 
              fontWeight: 500,
              marginBottom: 'var(--space-lg)'
            }}>
              за 200 анализов
            </p>
            
            <ul style={{ 
              listStyle: 'none', 
              margin: 'var(--space-lg) 0',
              padding: 0
            }}>
              <li style={{ 
                padding: 'var(--space-sm) 0',
                color: 'var(--text-tertiary)',
                fontSize: '17px'
              }}>
                200 анализов компаний
              </li>
            </ul>
            
            <button 
              type="button"
              onClick={() => handleSelectPlan('profi')}
              disabled={loading === 'profi'}
              className="button-primary"
              style={{ width: '100%', marginTop: 'var(--space-lg)' }}
            >
              {loading === 'profi' ? 'Загрузка...' : 'Выбрать Profi'}
            </button>
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
        </div>
        
        {/* Bottom Text */}
        <p style={{ 
          maxWidth: '900px', 
          margin: '64px auto 0', 
          textAlign: 'center', 
          fontSize: '17px', 
          color: 'var(--text-tertiary)',
          lineHeight: '1.6'
        }}>
          Получите максимум возможностей с любым тарифом: полный анализ компаний, сохранение и экспорт отчетов в PDF и Word. При этом, использование «Целевого предложения» внутри отчета не уменьшает количество доступных вам анализов.
        </p>
      </main>
    </div>
  );
}
