'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { getToken } from '@/app/lib/auth';
import { useAuth } from '@/app/context/AuthContext';
import UsersTable from './components/UsersTable';

export default function UsersPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const router = useRouter();
  const { logout } = useAuth();

  const handleLogout = () => {
    logout();
  };

  useEffect(() => {
    // Проверка авторизации
    const checkAuth = async () => {
      const token = getToken();
      if (!token) {
        router.push('/login');
        return;
      }
      
      try {
        const res = await fetch('/api/auth/status', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();
        
        if (!res.ok || data.role !== 'admin') {
          router.push('/');
          return;
        }
        
        setLoading(false);
      } catch {
        setError('Ошибка проверки авторизации');
        setLoading(false);
      }
    };
    
    checkAuth();
  }, [router]);

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p>Загрузка...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p>{error}</p>
      </div>
    );
  }

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

      <main className="container" style={{ maxWidth: '1400px', paddingTop: '120px' }}>
        <Link 
          href="/admin"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '8px 16px',
            background: '#FFFFFF',
            border: '1px solid #E5E5E7',
            borderRadius: '8px',
            color: '#1D1D1F',
            fontSize: '14px',
            fontWeight: '500',
            textDecoration: 'none',
            transition: 'all 0.2s',
            cursor: 'pointer',
            marginBottom: '24px'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = '#F5F5F7';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = '#FFFFFF';
          }}
        >
          ← Назад
        </Link>
        <h1 style={{ fontSize: '36px', marginBottom: '32px' }}>Управление пользователями</h1>
        <UsersTable />
      </main>
    </div>
  );
}

