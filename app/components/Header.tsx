'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useAuth } from '@/app/context/AuthContext';
import { getToken } from '@/app/lib/auth';

export default function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const { logout } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    setToken(getToken());
  }, []);

  useEffect(() => {
    const checkAdmin = async () => {
      const currentToken = getToken();
      setToken(currentToken);
      
      // Проверка по userId (временное решение)
      try {
        if (currentToken) {
          const payload = JSON.parse(atob(currentToken.split('.')[1]));
          if (payload.userId === '6c499a0a-cddf-4bf2-8ac5-8a98d90bac4a') {
            setIsAdmin(true);
            return;
          }
        }
      } catch (e) {
        console.error('Token parse error:', e);
      }

      if (!currentToken) {
        setIsAdmin(false);
        return;
      }

      try {
        const response = await fetch('/api/auth/status', {
          headers: { Authorization: `Bearer ${currentToken}` },
        });
        if (response.ok) {
          const data = await response.json();
          setIsAdmin(data.user?.role === 'admin');
        }
      } catch (error) {
        console.error('Error checking admin status:', error);
      }
    };
    checkAdmin();
  }, [token]);
  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  // Определяем активную страницу
  const isActive = (path: string) => {
    if (path === '/analysis') {
      return pathname === '/analysis' || pathname.startsWith('/analysis');
    }
    if (path === '/companies') {
      return pathname === '/companies' || pathname.startsWith('/report/') || pathname.startsWith('/companies/');
    }
    if (path === '/admin') {
      return pathname.startsWith('/admin');
    }
    return pathname === path;
  };

  return (
    <header className="header">
      <div className="header-container">
        {/* Logo + Subtitle */}
        <Link href="/analysis" className="logo">
          <div style={{ fontSize: '24px', fontWeight: 600 }}>Металл Вектор</div>
          <div style={{ 
            fontSize: '13px', 
            color: 'var(--text-secondary)', 
            fontWeight: 400, 
            marginTop: '2px' 
          }}>
            Аналитика. Фокус. Результат.
          </div>
        </Link>

        {/* Navigation */}
{/* Navigation */}
<nav className="nav">
  {token ? (
    // Меню для залогиненных пользователей
    <>
      <Link
        href="/analysis"
        className={isActive('/analysis') ? 'button-primary header-button' : 'nav-link'}
      >
        Анализ
      </Link>
      <Link 
        href="/companies" 
        className={isActive('/companies') ? 'button-primary header-button' : 'nav-link'}
      >
        Отчеты
      </Link>
      <Link 
        href="/pricing" 
        className={isActive('/pricing') ? 'button-primary header-button' : 'nav-link'}
      >
        Тарифы
      </Link>
      <Link 
        href="/profile" 
        className={isActive('/profile') ? 'button-primary header-button' : 'nav-link'}
      >
        Профиль
      </Link>
      {isAdmin && (
        <Link 
          href="/admin" 
          className={isActive('/admin') ? 'button-primary header-button' : 'nav-link'}
        >
          Админ-панель
        </Link>
      )}
      <button
        onClick={handleLogout}
        className="nav-link"
        style={{ background: 'none', border: 'none', cursor: 'pointer' }}
      >
        Выйти
      </button>
    </>
  ) : (
    // Меню для НЕзалогиненных пользователей
    <>
      <Link 
        href="/pricing" 
        className="nav-link"
      >
        Тарифы
      </Link>
      <Link 
        href="/login" 
        className="button-primary header-button"
      >
        Войти
      </Link>
    </>
  )}
</nav>
      </div>
    </header>
  );
}
