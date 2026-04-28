'use client';

import React, { useCallback, useMemo } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/app/context/AuthContext';
import { ThemeToggle } from '@/components/ThemeToggle';

function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isAdmin, logout } = useAuth();

  const handleLogout = useCallback(() => {
    logout();
    router.push('/login');
  }, [logout, router]);

  // Определяем активную страницу
  const isActive = useCallback((path: string) => {
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
  }, [pathname]);

  return (
    <header className="header">
      <div className="header-container">
        {/* Logo + Subtitle */}
        <Link href="/" className="logo">
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
        <nav className="nav">
          {user ? (
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
                Тариф
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
              <ThemeToggle />
            </>
          ) : (
            // Меню для НЕзалогиненных пользователей
            <>
              <Link 
                href="/pricing" 
                className="nav-link"
              >
                Тариф
              </Link>
              <Link 
                href="/login" 
                className="button-primary header-button"
              >
                Войти
              </Link>
              <ThemeToggle />
            </>
          )}
        </nav>
      </div>
    </header>
  );
}

export default React.memo(Header);
