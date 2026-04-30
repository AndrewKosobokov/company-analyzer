'use client';

import React, { useCallback, useMemo } from 'react';
import { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/app/context/AuthContext';
import { ThemeToggle } from '@/components/ThemeToggle';

function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isAdmin, logout } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleLogout = useCallback(() => {
    setIsMenuOpen(false);
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
        <Link href="/" className="logo" onClick={() => setIsMenuOpen(false)}>
          <div className="logo-title" style={{ fontSize: '24px', fontWeight: 600 }}>Металл Вектор</div>
          <div className="logo-subtitle" style={{ 
            fontSize: '13px', 
            color: 'var(--text-secondary)', 
            fontWeight: 400, 
            marginTop: '2px'
          }}>
            Аналитика. Фокус. Результат.
          </div>
        </Link>

        {/* Navigation */}
        <nav className="nav nav-desktop">
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

        <button
          type="button"
          className="hamburger-btn"
          aria-label="Открыть меню"
          aria-expanded={isMenuOpen}
          onClick={() => setIsMenuOpen((prev) => !prev)}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="3" y1="6" x2="21" y2="6" />
            <line x1="3" y1="12" x2="21" y2="12" />
            <line x1="3" y1="18" x2="21" y2="18" />
          </svg>
        </button>
      </div>

      {isMenuOpen && (
        <div className="mobile-menu">
          {user ? (
            <>
              <Link href="/analysis" onClick={() => setIsMenuOpen(false)}>Анализ</Link>
              <Link href="/companies" onClick={() => setIsMenuOpen(false)}>Отчеты</Link>
              <Link href="/pricing" onClick={() => setIsMenuOpen(false)}>Тариф</Link>
              <Link href="/profile" onClick={() => setIsMenuOpen(false)}>Профиль</Link>
              {isAdmin && (
                <Link href="/admin" onClick={() => setIsMenuOpen(false)}>Админ-панель</Link>
              )}
              <button type="button" onClick={handleLogout}>Выйти</button>
            </>
          ) : (
            <>
              <Link href="/pricing" onClick={() => setIsMenuOpen(false)}>Тариф</Link>
              <Link href="/login" onClick={() => setIsMenuOpen(false)}>Войти</Link>
            </>
          )}
        </div>
      )}
    </header>
  );
}

export default React.memo(Header);
