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
  const [isMounted, setIsMounted] = useState(false);
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
        // Trigger fade in animation after content is loaded
        setTimeout(() => setIsMounted(true), 50);
      } catch {
        setError('Ошибка проверки авторизации');
        setLoading(false);
      }
    };
    
    checkAuth();
  }, [router]);

  if (loading) {
    return (
      <>
        <p>Загрузка...</p>
      </>
    );
  }

  if (error) {
    return (
      <>
        <p>{error}</p>
      </>
    );
  }

  return (
    <>
      <main 
        className="container" 
        style={{ 
          maxWidth: '1400px', 
          paddingTop: '120px',
          opacity: isMounted ? 1 : 0,
          transform: isMounted ? 'translateY(0)' : 'translateY(-10px)',
          transition: 'opacity 0.3s ease-in-out, transform 0.3s ease-in-out'
        }}
      >
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
        <div
          style={{
            opacity: isMounted ? 1 : 0,
            transform: isMounted ? 'translateY(0)' : 'translateY(10px)',
            transition: 'opacity 0.4s ease-out, transform 0.4s ease-out',
            transitionDelay: '0.1s'
          }}
        >
          <UsersTable />
        </div>
      </main>
    </>
  );
}

