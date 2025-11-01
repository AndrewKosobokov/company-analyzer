'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import SuccessToast from '../components/SuccessToast';
import { getToken } from '@/app/lib/auth';

interface UserProfile {
  name: string;
  email: string;
  organization?: string;
  phone?: string;
  plan: string;
  analysesRemaining: number;
  planStartDate: string;
}

interface Payment {
  id: string;
  amount: string;
  date: string;
  plan: string;
  status: string;
}

export default function ProfilePage() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);
  const router = useRouter();
  
  useEffect(() => {
    const checkAdmin = async () => {
      const token = getToken();
      if (!token) return;
      
      try {
        const res = await fetch('/api/auth/status', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();
        setIsAdmin(data.role === 'admin');
      } catch (err) {
        // Ignore errors
      }
    };
    
    checkAdmin();
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = getToken();
        
        // Fetch profile
        const profileRes = await fetch('/api/auth/status', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (profileRes.ok) {
          const profileData = await profileRes.json();
          setProfile(profileData);
        }
        
        // Fetch payments
        const paymentsRes = await fetch('/api/payments/history', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (paymentsRes.ok) {
          const paymentsData = await paymentsRes.json();
          setPayments(paymentsData);
        }
      } catch (err) {
        setError('Ошибка загрузки данных профиля');
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);
  
  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (newPassword !== confirmPassword) {
      setError('Пароли не совпадают');
      return;
    }
    
    if (newPassword.length < 8) {
      setError('Пароль должен быть не менее 8 символов');
      return;
    }
    
    try {
      const response = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getToken()}`
        },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      
      if (response.ok) {
        setSuccessMessage('Пароль успешно изменен');
        setShowPasswordForm(false);
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      } else {
        setError('Ошибка изменения пароля');
      }
    } catch (err) {
      setError('Ошибка изменения пароля');
    }
  };
  
  const handleLogout = () => {
    localStorage.clear();
    router.push('/');
  };
  
  const getPlanName = (plan: string) => {
    const plans: Record<string, string> = {
      start: 'Start',
      optimal: 'Optimal',
      profi: 'Profi',
      trial: 'Пробный'
    };
    return plans[plan] || plan;
  };
  
  // Loading State
  if (loading) {
    return (
      <div style={{ 
        minHeight: '100vh', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center' 
      }}>
        <p style={{ fontSize: '17px', color: 'var(--text-secondary)' }}>
          Загрузка...
        </p>
      </div>
    );
  }
  
  // Error State
  if (error || !profile) {
    return (
      <div className="container" style={{ maxWidth: '800px', paddingTop: '64px' }}>
        <div className="card" style={{ textAlign: 'center', padding: 'var(--space-2xl)' }}>
          <p style={{ color: 'var(--text-secondary)', fontSize: '17px' }}>
            {error || 'Не удалось загрузить профиль'}
          </p>
        </div>
      </div>
    );
  }
  
  return (
    <>
      {/* Header */}
      <header className="header">
        <div className="header-container">
          <Link href="/analysis" className="logo">
            <div style={{ fontSize: '24px', fontWeight: 600 }}>Металл Вектор</div>
            <div style={{ fontSize: '13px', color: 'var(--text-secondary)', fontWeight: 400, marginTop: '2px' }}>
              Аналитика. Фокус. Результат.
            </div>
          </Link>
          
          <nav className="nav">
            <Link href="/analysis" className="button-primary header-button">Анализ</Link>
            <Link href="/companies" className="nav-link">Отчеты</Link>
            <Link href="/pricing" className="nav-link">Тарифы</Link>
            <Link 
              href="/profile" 
              className="nav-link"
              style={{ fontWeight: 600, color: 'var(--text-primary)' }}
            >
              Профиль
            </Link>
            {isAdmin && (
              <Link href="/admin" className="nav-link">Админ-панель</Link>
            )}
            <button 
              onClick={handleLogout}
              className="nav-link"
              style={{ background: 'none', border: 'none', cursor: 'pointer' }}
            >
              Выйти
            </button>
          </nav>
        </div>
      </header>
      
      {/* Main Content */}
      <main className="container" style={{ maxWidth: '900px', paddingTop: '64px', paddingBottom: '64px' }}>
        <h1 style={{ fontSize: '36px', marginBottom: '32px' }}>
          Профиль
        </h1>
        
        {/* Section 1: Personal Info */}
        <div className="profile-section">
          <h2 style={{ 
            fontSize: '28px', 
            marginBottom: 'var(--space-lg)',
            paddingBottom: 'var(--space-md)',
            borderBottom: '1px solid var(--border-color)'
          }}>
            Личная информация
          </h2>
          
          <div className="profile-grid">
            <div className="profile-field">
              <label style={{ fontSize: '15px', color: 'var(--text-secondary)', fontWeight: 500 }}>
                Имя, либо организация
              </label>
              <p style={{ fontSize: '17px', color: 'var(--text-primary)', marginTop: 'var(--space-xs)' }}>
                {profile.name}
              </p>
            </div>
            
            <div className="profile-field">
              <label style={{ fontSize: '15px', color: 'var(--text-secondary)', fontWeight: 500 }}>
                Email
              </label>
              <p style={{ fontSize: '17px', color: 'var(--text-primary)', marginTop: 'var(--space-xs)' }}>
                {profile.email}
              </p>
            </div>
          </div>
        </div>
        
        {/* Section 2: Subscription */}
        <div className="profile-section">
          <h2 style={{ 
            fontSize: '28px', 
            marginBottom: 'var(--space-lg)',
            paddingBottom: 'var(--space-md)',
            borderBottom: '1px solid var(--border-color)'
          }}>
            Подписка
          </h2>
          
          <div className="profile-grid">
            <div className="profile-field">
              <label style={{ fontSize: '15px', color: 'var(--text-secondary)', fontWeight: 500 }}>
                Текущий тариф
              </label>
              <p style={{ fontSize: '17px', color: 'var(--text-primary)', marginTop: 'var(--space-xs)' }}>
                {getPlanName(profile.plan)}
              </p>
            </div>
            
            <div className="profile-field">
              <label style={{ fontSize: '15px', color: 'var(--text-secondary)', fontWeight: 500 }}>
                Осталось анализов
              </label>
              <p style={{ fontSize: '17px', color: 'var(--text-primary)', marginTop: 'var(--space-xs)' }}>
                {profile.analysesRemaining}
              </p>
            </div>
            
            <div className="profile-field">
              <label style={{ fontSize: '15px', color: 'var(--text-secondary)', fontWeight: 500 }}>
                Дата регистрации
              </label>
              <p style={{ fontSize: '17px', color: 'var(--text-primary)', marginTop: 'var(--space-xs)' }}>
                {profile.planStartDate && profile.planStartDate !== '0' && new Date(profile.planStartDate).getTime() > 0
                  ? new Date(profile.planStartDate).toLocaleDateString('ru-RU')
                  : 'Не указана'}
              </p>
            </div>
          </div>
          
          <Link 
            href="/pricing"
            className="button-primary"
            style={{ marginTop: 'var(--space-lg)' }}
          >
            Изменить тариф
          </Link>
        </div>
        
        {/* Section 3: Security */}
        <div className="profile-section">
          <h2 style={{ 
            fontSize: '28px', 
            marginBottom: 'var(--space-lg)',
            paddingBottom: 'var(--space-md)',
            borderBottom: '1px solid var(--border-color)'
          }}>
            Безопасность
          </h2>
          
          {!showPasswordForm ? (
            <button 
              onClick={() => setShowPasswordForm(true)}
              className="button-secondary"
            >
              Изменить пароль
            </button>
          ) : (
            <form onSubmit={handlePasswordChange}>
              <div className="form-group">
                <label htmlFor="current-password" className="form-label">
                  Текущий пароль
                </label>
                <input
                  id="current-password"
                  type="password"
                  className="form-input"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  required
                  placeholder="Введите текущий пароль"
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="new-password" className="form-label">
                  Новый пароль
                </label>
                <input
                  id="new-password"
                  type="password"
                  className="form-input"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  minLength={8}
                  placeholder="Минимум 8 символов"
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="confirm-password" className="form-label">
                  Подтвердите пароль
                </label>
                <input
                  id="confirm-password"
                  type="password"
                  className="form-input"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  placeholder="Повторите новый пароль"
                />
              </div>
              
              <div style={{ display: 'flex', gap: 'var(--space-md)', marginTop: 'var(--space-lg)' }}>
                <button type="submit" className="button-primary">
                  Сохранить
                </button>
                <button 
                  type="button"
                  onClick={() => {
                    setShowPasswordForm(false);
                    setCurrentPassword('');
                    setNewPassword('');
                    setConfirmPassword('');
                  }}
                  className="button-secondary"
                >
                  Отмена
                </button>
              </div>
            </form>
          )}
        </div>
        
        {/* Section 4: Payment History */}
        <div className="profile-section">
          <h2 style={{ 
            fontSize: '28px', 
            marginBottom: 'var(--space-lg)',
            paddingBottom: 'var(--space-md)',
            borderBottom: '1px solid var(--border-color)'
          }}>
            История платежей
          </h2>
          
          {payments.length === 0 ? (
            <p style={{ color: 'var(--text-secondary)', fontSize: '17px' }}>
              История платежей пуста
            </p>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table className="payments-table" style={{ 
                width: '100%', 
                borderCollapse: 'collapse',
                marginTop: 'var(--space-lg)'
              }}>
                <thead>
                  <tr>
                    <th style={{ 
                      padding: 'var(--space-md)',
                      textAlign: 'left',
                      borderBottom: '1px solid var(--border-color)',
                      fontWeight: 600,
                      color: 'var(--text-secondary)',
                      fontSize: '15px'
                    }}>
                      Дата
                    </th>
                    <th style={{ 
                      padding: 'var(--space-md)',
                      textAlign: 'left',
                      borderBottom: '1px solid var(--border-color)',
                      fontWeight: 600,
                      color: 'var(--text-secondary)',
                      fontSize: '15px'
                    }}>
                      Тариф
                    </th>
                    <th style={{ 
                      padding: 'var(--space-md)',
                      textAlign: 'left',
                      borderBottom: '1px solid var(--border-color)',
                      fontWeight: 600,
                      color: 'var(--text-secondary)',
                      fontSize: '15px'
                    }}>
                      Сумма
                    </th>
                    <th style={{ 
                      padding: 'var(--space-md)',
                      textAlign: 'left',
                      borderBottom: '1px solid var(--border-color)',
                      fontWeight: 600,
                      color: 'var(--text-secondary)',
                      fontSize: '15px'
                    }}>
                      Статус
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {payments.map((payment) => (
                    <tr key={payment.id}>
                      <td style={{ 
                        padding: 'var(--space-md)',
                        borderBottom: '1px solid var(--border-color)',
                        fontSize: '17px'
                      }}>
                        {new Date(payment.date).toLocaleDateString('ru-RU')}
                      </td>
                      <td style={{ 
                        padding: 'var(--space-md)',
                        borderBottom: '1px solid var(--border-color)',
                        fontSize: '17px'
                      }}>
                        {getPlanName(payment.plan)}
                      </td>
                      <td style={{ 
                        padding: 'var(--space-md)',
                        borderBottom: '1px solid var(--border-color)',
                        fontSize: '17px'
                      }}>
                        {payment.amount}
                      </td>
                      <td style={{ 
                        padding: 'var(--space-md)',
                        borderBottom: '1px solid var(--border-color)',
                        fontSize: '17px'
                      }}>
                        {payment.status}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
        
        {/* Logout Button */}
        <div style={{ textAlign: 'center', marginTop: '48px' }}>
          <button onClick={handleLogout} className="button-secondary">
            Выйти из аккаунта
          </button>
        </div>
      </main>
      
      {successMessage && (
        <SuccessToast 
          message={successMessage} 
          onClose={() => setSuccessMessage('')} 
        />
      )}
    </>
  );
}