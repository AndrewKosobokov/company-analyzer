'use client';

import Link from 'next/link';
import { useAuth } from '@/app/context/AuthContext';
import { TrendingUp, Users } from 'lucide-react';

export default function AdminDashboard() {
  const { logout } = useAuth();

  const handleLogout = () => {
    logout();
  };

  return (
    <div>
      <header className="header">
        <div className="header-container">
          <Link href="/" className="logo">
            <div style={{ fontSize: '24px', fontWeight: 600 }}>Металл Вектор</div>
            <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Админ-панель</div>
          </Link>
          <nav className="nav">
            <Link href="/analysis" className="button-primary header-button">Анализ</Link>
            <Link href="/companies" className="nav-link">Отчеты</Link>
            <Link href="/pricing" className="nav-link">Тарифы</Link>
            <Link href="/profile" className="nav-link">Профиль</Link>
            <Link href="/admin" className="nav-link" style={{ fontWeight: 600 }}>Админ-панель</Link>
            <button onClick={handleLogout} className="nav-link" style={{ background: 'none', border: 'none', cursor: 'pointer' }}>Выйти</button>
          </nav>
        </div>
      </header>

      <main className="container" style={{ maxWidth: '1200px', paddingTop: '120px' }}>
        <h1 style={{ fontSize: '36px', marginBottom: '48px', fontWeight: 600, color: '#1D1D1F' }}>Админ-панель</h1>

        {/* Навигация админки - большие карточки */}
        <div style={{ 
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '24px',
          marginTop: '24px'
        }}>
          <Link 
            href="/admin/dashboard"
            style={{ 
              display: 'flex',
              flexDirection: 'column',
              gap: '16px',
              padding: '32px',
              backgroundColor: '#FFFFFF',
              border: '1px solid #E5E5E7',
              borderRadius: '12px',
              textDecoration: 'none',
              color: '#1D1D1F',
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              cursor: 'pointer'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.boxShadow = '0 4px 16px rgba(0, 0, 0, 0.08)';
              e.currentTarget.style.transform = 'translateY(-2px)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.boxShadow = 'none';
              e.currentTarget.style.transform = 'translateY(0)';
            }}
          >
            <TrendingUp size={32} color="#1D1D1F" />
            <div>
              <h2 style={{ 
                fontSize: '20px', 
                fontWeight: 600, 
                margin: 0,
                marginBottom: '8px',
                color: '#1D1D1F'
              }}>
                Аналитика
              </h2>
              <p style={{ 
                fontSize: '14px', 
                color: '#86868B',
                margin: 0
              }}>
                Метрики и статистика
              </p>
            </div>
          </Link>

          <Link 
            href="/admin/users"
            style={{ 
              display: 'flex',
              flexDirection: 'column',
              gap: '16px',
              padding: '32px',
              backgroundColor: '#FFFFFF',
              border: '1px solid #E5E5E7',
              borderRadius: '12px',
              textDecoration: 'none',
              color: '#1D1D1F',
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              cursor: 'pointer'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.boxShadow = '0 4px 16px rgba(0, 0, 0, 0.08)';
              e.currentTarget.style.transform = 'translateY(-2px)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.boxShadow = 'none';
              e.currentTarget.style.transform = 'translateY(0)';
            }}
          >
            <Users size={32} color="#1D1D1F" />
            <div>
              <h2 style={{ 
                fontSize: '20px', 
                fontWeight: 600, 
                margin: 0,
                marginBottom: '8px',
                color: '#1D1D1F'
              }}>
                Пользователи
              </h2>
              <p style={{ 
                fontSize: '14px', 
                color: '#86868B',
                margin: 0
              }}>
                Управление
              </p>
            </div>
          </Link>
        </div>
      </main>
    </div>
  );
}
