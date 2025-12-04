'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { getToken } from '@/app/lib/auth';
import { useAuth } from '@/app/context/AuthContext';

export default function PricingContent() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);
  const { logout } = useAuth();
  
  useEffect(() => {
    const token = getToken();
    setIsLoggedIn(!!token);
    // Trigger fade in animation after component mounts
    setTimeout(() => setIsMounted(true), 50);
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
    logout();
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
      
      {/* Main Content */}
      <main 
        className="container" 
        style={{ 
          paddingTop: '96px', 
          paddingBottom: '96px',
          opacity: isMounted ? 1 : 0,
          transform: isMounted ? 'translateY(0)' : 'translateY(-10px)',
          transition: 'opacity 0.3s ease-in-out, transform 0.3s ease-in-out'
        }}
      >
        {/* Pricing Grid */}
        <div className="pricing-grid">
          {/* Card 1 - Start */}
          <div 
            className="pricing-card"
            style={{
              opacity: isMounted ? 1 : 0,
              transform: isMounted ? 'translateY(0) scale(1)' : 'translateY(20px) scale(0.95)',
              transition: 'opacity 0.4s ease-out, transform 0.4s ease-out',
              transitionDelay: '0.1s'
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
              style={{ 
                width: '100%', 
                marginTop: 'var(--space-lg)',
                transition: 'all 0.3s ease'
              }}
              onMouseEnter={(e) => {
                if (loading !== 'start') {
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
          <div 
            className="pricing-card recommended" 
            style={{ 
              position: 'relative',
              opacity: isMounted ? 1 : 0,
              transform: isMounted ? 'translateY(0) scale(1)' : 'translateY(20px) scale(0.95)',
              transition: 'opacity 0.4s ease-out, transform 0.4s ease-out',
              transitionDelay: '0.2s'
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
              style={{ 
                width: '100%', 
                marginTop: 'var(--space-lg)',
                transition: 'all 0.3s ease'
              }}
              onMouseEnter={(e) => {
                if (loading !== 'optimal') {
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
          <div 
            className="pricing-card"
            style={{
              opacity: isMounted ? 1 : 0,
              transform: isMounted ? 'translateY(0) scale(1)' : 'translateY(20px) scale(0.95)',
              transition: 'opacity 0.4s ease-out, transform 0.4s ease-out',
              transitionDelay: '0.3s'
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
              style={{ 
                width: '100%', 
                marginTop: 'var(--space-lg)',
                transition: 'all 0.3s ease'
              }}
              onMouseEnter={(e) => {
                if (loading !== 'profi') {
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
      </main>
    </div>
  );
}
