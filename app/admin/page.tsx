'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/app/context/AuthContext';
import { TrendingUp, Users } from 'lucide-react';

export default function AdminPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isMounted, setIsMounted] = useState(false);
  const router = useRouter();
  const { user, isAuthenticated, isAdmin } = useAuth();

  useEffect(() => {
    // Проверка авторизации через AuthContext
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }
    
    if (!isAdmin) {
      router.push('/');
      return;
    }
    
    setLoading(false);
    // Trigger fade in animation after content is loaded
    setTimeout(() => setIsMounted(true), 50);
  }, [isAuthenticated, isAdmin, router]);

  if (loading) {
    return (
      <div style={{ 
        minHeight: '100vh', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        backgroundColor: '#F5F5F7'
      }}>
        <p style={{ fontSize: '17px', color: '#86868B' }}>
          Загрузка...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ 
        minHeight: '100vh', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        backgroundColor: '#F5F5F7'
      }}>
        <p style={{ fontSize: '17px', color: '#FF3B30' }}>
          {error}
        </p>
      </div>
    );
  }

  return (
    <main 
      className="container" 
      style={{ 
        maxWidth: '1200px', 
        paddingTop: '120px',
        paddingBottom: '64px',
        opacity: isMounted ? 1 : 0,
        transform: isMounted ? 'translateY(0)' : 'translateY(-10px)',
        transition: 'opacity 0.3s ease-in-out, transform 0.3s ease-in-out'
      }}
    >
      <h1 style={{ 
        fontSize: '48px', 
        marginBottom: '48px', 
        fontWeight: 600, 
        color: '#1D1D1F',
        textAlign: 'center'
      }}>
        Админ-панель
      </h1>

      {/* Навигация админки - большие карточки */}
      <div style={{ 
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
        gap: '32px',
        maxWidth: '800px',
        margin: '0 auto'
      }}>
        <Link 
          href="/admin/dashboard"
          style={{ 
            display: 'flex',
            flexDirection: 'column',
            gap: '20px',
            padding: '48px 32px',
            backgroundColor: '#FFFFFF',
            border: '1px solid #E5E5E7',
            borderRadius: '16px',
            textDecoration: 'none',
            color: '#1D1D1F',
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            cursor: 'pointer',
            boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
            opacity: isMounted ? 1 : 0,
            transform: isMounted ? 'translateY(0)' : 'translateY(20px)',
            transitionDelay: '0.1s'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.boxShadow = '0 8px 24px rgba(0, 0, 0, 0.12)';
            e.currentTarget.style.transform = 'translateY(-4px)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.04)';
            e.currentTarget.style.transform = 'translateY(0)';
          }}
        >
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            width: '64px',
            height: '64px',
            backgroundColor: '#F5F5F7',
            borderRadius: '12px'
          }}>
            <TrendingUp size={32} color="#1D1D1F" />
          </div>
          <div>
            <h2 style={{ 
              fontSize: '24px', 
              fontWeight: 600, 
              margin: 0,
              color: '#1D1D1F'
            }}>
              Аналитика
            </h2>
          </div>
        </Link>

        <Link 
          href="/admin/users"
          style={{ 
            display: 'flex',
            flexDirection: 'column',
            gap: '20px',
            padding: '48px 32px',
            backgroundColor: '#FFFFFF',
            border: '1px solid #E5E5E7',
            borderRadius: '16px',
            textDecoration: 'none',
            color: '#1D1D1F',
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            cursor: 'pointer',
            boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
            opacity: isMounted ? 1 : 0,
            transform: isMounted ? 'translateY(0)' : 'translateY(20px)',
            transitionDelay: '0.2s'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.boxShadow = '0 8px 24px rgba(0, 0, 0, 0.12)';
            e.currentTarget.style.transform = 'translateY(-4px)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.04)';
            e.currentTarget.style.transform = 'translateY(0)';
          }}
        >
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            width: '64px',
            height: '64px',
            backgroundColor: '#F5F5F7',
            borderRadius: '12px'
          }}>
            <Users size={32} color="#1D1D1F" />
          </div>
          <div>
            <h2 style={{ 
              fontSize: '24px', 
              fontWeight: 600, 
              margin: 0,
              color: '#1D1D1F'
            }}>
              Пользователи
            </h2>
          </div>
        </Link>
      </div>
    </main>
  );
}
