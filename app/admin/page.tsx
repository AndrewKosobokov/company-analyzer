'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/app/context/AuthContext';
import { TrendingUp, Users } from 'lucide-react';

export default function AdminDashboard() {
  const router = useRouter();
  const pathname = usePathname();
  const { logout } = useAuth();

  const handleLogout = () => {
    logout();
  };

  useEffect(() => {
    // Редирект на /admin/dashboard по умолчанию
    router.push('/admin/dashboard');
  }, [router]);

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
        <h1 style={{ fontSize: '36px', marginBottom: '32px' }}>Админ-панель</h1>

        {/* Навигация админки */}
        <div style={{ 
          marginTop: '24px', 
          marginBottom: '32px',
          padding: '16px',
          backgroundColor: '#FFFFFF',
          borderRadius: '12px',
          border: '1px solid #D2D2D7'
        }}>
          <Link 
            href="/admin/dashboard"
            style={{ 
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '12px 16px',
              color: pathname === '/admin/dashboard' ? '#007AFF' : '#1D1D1F',
              textDecoration: 'none',
              borderRadius: '8px',
              backgroundColor: pathname === '/admin/dashboard' ? '#F5F5F7' : 'transparent',
              fontWeight: pathname === '/admin/dashboard' ? 600 : 400,
              transition: 'all 0.2s ease',
              marginBottom: '4px'
            }}
          >
            <TrendingUp size={20} color={pathname === '/admin/dashboard' ? '#007AFF' : '#1D1D1F'} />
            Аналитика
          </Link>
          <Link 
            href="/admin/users"
            style={{ 
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '12px 16px',
              color: pathname === '/admin/users' ? '#007AFF' : '#1D1D1F',
              textDecoration: 'none',
              borderRadius: '8px',
              backgroundColor: pathname === '/admin/users' ? '#F5F5F7' : 'transparent',
              fontWeight: pathname === '/admin/users' ? 600 : 400,
              transition: 'all 0.2s ease'
            }}
          >
            <Users size={20} color={pathname === '/admin/users' ? '#007AFF' : '#1D1D1F'} />
            Пользователи
          </Link>
        </div>
      </main>
    </div>
  );
}
