'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/app/context/AuthContext';

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, hydrated, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // НЕ редиректим пока идёт загрузка
    if (loading) {
      return;
    }

    // Редиректим только ПОСЛЕ завершения проверки
    if (!isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, loading, router]);

  // Сначала проверяем hydrated (клиент готов?)
  if (!hydrated) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        backgroundColor: '#FFFFFF'
      }}>
        <div style={{
          fontSize: '14px',
          color: '#86868B'
        }}>Загрузка...</div>
      </div>
    );
  }

  // Показываем loader пока идёт проверка
  if (loading) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        fontSize: '16px',
        color: '#86868B'
      }}>
        Загрузка...
      </div>
    );
  }

  // Показываем children только если авторизован
  if (!loading && isAuthenticated) {
    return <>{children}</>;
  }

  // Если не авторизован, показываем loader (редирект уже идёт)
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
      fontSize: '16px',
      color: '#86868B'
    }}>
      Перенаправление...
    </div>
  );
}
