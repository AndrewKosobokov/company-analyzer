'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../context/AuthContext';

export default function MobileMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const { user, logout } = useAuth();
  const router = useRouter();

  const handleNavigation = (path: string) => {
    router.push(path);
    setIsOpen(false);
  };

  const handleLogout = () => {
    logout();
    router.push('/login');
    setIsOpen(false);
  };

  if (!user) return null;

  return (
    <>
      {/* Бургер кнопка */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          display: 'none',
          position: 'fixed',
          top: '20px',
          right: '20px',
          zIndex: 1001,
          background: '#1D1D1F',
          border: 'none',
          borderRadius: '8px',
          width: '44px',
          height: '44px',
          cursor: 'pointer',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          gap: '4px'
        }}
        className="mobile-menu-btn"
      >
        <span style={{ width: '20px', height: '2px', background: '#FFF', transition: '0.3s' }} />
        <span style={{ width: '20px', height: '2px', background: '#FFF', transition: '0.3s' }} />
        <span style={{ width: '20px', height: '2px', background: '#FFF', transition: '0.3s' }} />
      </button>

      {/* Overlay */}
      {isOpen && (
        <div
          onClick={() => setIsOpen(false)}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.5)',
            zIndex: 999
          }}
        />
      )}

      {/* Меню */}
      <div
        style={{
          position: 'fixed',
          top: 0,
          right: isOpen ? 0 : '-280px',
          width: '280px',
          height: '100vh',
          background: '#FFFFFF',
          zIndex: 1000,
          transition: 'right 0.3s ease',
          boxShadow: '-2px 0 10px rgba(0,0,0,0.1)',
          display: 'flex',
          flexDirection: 'column',
          padding: '80px 24px 24px'
        }}
      >
        <div style={{ fontSize: '16px', fontWeight: 600, marginBottom: '24px', color: '#1D1D1F' }}>
          {user.email}
        </div>

        <nav style={{ display: 'flex', flexDirection: 'column', gap: '4px', flex: 1 }}>
          <button
            onClick={() => handleNavigation('/analysis')}
            style={{
              background: 'none',
              border: 'none',
              padding: '16px',
              textAlign: 'left',
              fontSize: '16px',
              color: '#1D1D1F',
              cursor: 'pointer',
              borderRadius: '8px',
              transition: 'background 0.2s'
            }}
            onMouseEnter={(e) => e.currentTarget.style.background = '#F5F5F7'}
            onMouseLeave={(e) => e.currentTarget.style.background = 'none'}
          >
            Анализ
          </button>

          <button
            onClick={() => handleNavigation('/companies')}
            style={{
              background: 'none',
              border: 'none',
              padding: '16px',
              textAlign: 'left',
              fontSize: '16px',
              color: '#1D1D1F',
              cursor: 'pointer',
              borderRadius: '8px',
              transition: 'background 0.2s'
            }}
            onMouseEnter={(e) => e.currentTarget.style.background = '#F5F5F7'}
            onMouseLeave={(e) => e.currentTarget.style.background = 'none'}
          >
            Отчёты
          </button>

          <button
            onClick={() => handleNavigation('/profile')}
            style={{
              background: 'none',
              border: 'none',
              padding: '16px',
              textAlign: 'left',
              fontSize: '16px',
              color: '#1D1D1F',
              cursor: 'pointer',
              borderRadius: '8px',
              transition: 'background 0.2s'
            }}
            onMouseEnter={(e) => e.currentTarget.style.background = '#F5F5F7'}
            onMouseLeave={(e) => e.currentTarget.style.background = 'none'}
          >
            Профиль
          </button>

          {(user as any).role === 'admin' && (
            <button
              onClick={() => handleNavigation('/admin/dashboard')}
              style={{
                background: 'none',
                border: 'none',
                padding: '16px',
                textAlign: 'left',
                fontSize: '16px',
                color: '#1D1D1F',
                cursor: 'pointer',
                borderRadius: '8px',
                transition: 'background 0.2s'
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = '#F5F5F7'}
              onMouseLeave={(e) => e.currentTarget.style.background = 'none'}
            >
              Админ-панель
            </button>
          )}
        </nav>

        <button
          onClick={handleLogout}
          style={{
            background: '#FF3B30',
            color: '#FFF',
            border: 'none',
            padding: '16px',
            fontSize: '16px',
            fontWeight: 600,
            borderRadius: '12px',
            cursor: 'pointer',
            marginTop: 'auto',
            minHeight: '44px'
          }}
        >
          Выйти
        </button>
      </div>

      <style jsx global>{`
        @media (max-width: 768px) {
          .mobile-menu-btn {
            display: flex !important;
          }
        }
      `}</style>
    </>
  );
}

