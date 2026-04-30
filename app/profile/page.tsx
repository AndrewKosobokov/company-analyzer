'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import SuccessToast from '../components/SuccessToast';
import { useAuth } from '@/app/context/AuthContext';

interface UserProfile {
  name: string;
  email: string;
  organization?: string;
  phone?: string;
  plan: string;
  analysesRemaining: number;
  analysesInitial: number;
  planStartDate: string | null;
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
  const [isMounted, setIsMounted] = useState(false);
  const router = useRouter();
  const { logout } = useAuth();
  
  useEffect(() => {
    const checkAdmin = async () => {
      try {
        const res = await fetch('/api/auth/status', {
          credentials: 'include'
        });
        if (!res.ok) return;
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
        // Fetch profile
        const profileRes = await fetch('/api/auth/status', {
          credentials: 'include'
        });
        if (profileRes.ok) {
          const profileData = await profileRes.json();
          setProfile(profileData);
        }
        
        // Fetch payments
        const paymentsRes = await fetch('/api/payments/history', {
          credentials: 'include'
        });
        if (paymentsRes.ok) {
          const paymentsData = await paymentsRes.json();
          setPayments(paymentsData);
        }
      } catch (err) {
        setError('Ошибка загрузки данных профиля');
      } finally {
        setLoading(false);
        // Trigger fade in animation after content is loaded
        setTimeout(() => setIsMounted(true), 50);
      }
    };
    
    fetchData();
    
    // ← ДОБАВИТЬ: Автообновление если вернулись с оплаты
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('from') === 'payment') {
      // Обновить ещё раз через 2 секунды
      setTimeout(() => {
        fetchData();
      }, 2000);
    }
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
          'Content-Type': 'application/json'
        },
        credentials: 'include',
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
    logout();
  };
  
  const getPlanName = (plan: string) => {
    const plans: Record<string, string> = {
      start: 'Start',
      optimal: 'Optimal',
      profi: 'Profi',
      trial: 'Trial'
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
      {/* Main Content */}
      <main 
        className="container" 
        style={{ 
          maxWidth: '900px', 
          paddingTop: '64px', 
          paddingBottom: '64px',
          opacity: isMounted ? 1 : 0,
          transform: isMounted ? 'translateY(0)' : 'translateY(-10px)',
          transition: 'opacity 0.3s ease-in-out, transform 0.3s ease-in-out'
        }}
      >
        {/* Section 1: Personal Info */}
        <div 
          className="profile-section"
          style={{
            opacity: isMounted ? 1 : 0,
            transform: isMounted ? 'translateY(0)' : 'translateY(10px)',
            transition: 'opacity 0.4s ease-out, transform 0.4s ease-out',
            transitionDelay: '0.1s'
          }}
        >
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
        <div 
          className="profile-section"
          style={{
            opacity: isMounted ? 1 : 0,
            transform: isMounted ? 'translateY(0)' : 'translateY(10px)',
            transition: 'opacity 0.4s ease-out, transform 0.4s ease-out',
            transitionDelay: '0.2s'
          }}
        >
          <h2 style={{ 
            fontSize: '28px', 
            marginBottom: 'var(--space-lg)',
            paddingBottom: 'var(--space-md)',
            borderBottom: '1px solid var(--border-color)'
          }}>
            Подписка
          </h2>
          
          <div className="card">
            {!profile.planStartDate || profile.plan === 'trial' ? (
              <>
                <p style={{ fontSize: '17px', color: 'var(--text-secondary)', marginBottom: 'var(--space-lg)' }}>
                  Активная подписка отсутствует
                </p>
                <Link 
                  href="/pricing" 
                  className="button-primary"
                  style={{ display: 'inline-block' }}
                >
                  Подключить
                </Link>
              </>
            ) : (
              <>
                <div style={{ marginBottom: 'var(--space-md)' }}>
                  <div style={{ display: 'flex', gap: 'var(--space-md)', marginBottom: 'var(--space-sm)' }}>
                    <span style={{ fontSize: '15px', color: 'var(--text-secondary)', minWidth: '140px' }}>Дата начала:</span>
                    <span style={{ fontSize: '15px', color: 'var(--text-primary)' }}>
                      {new Date(profile.planStartDate).toLocaleDateString('ru-RU')}
                    </span>
                  </div>
                  <div style={{ display: 'flex', gap: 'var(--space-md)' }}>
                    <span style={{ fontSize: '15px', color: 'var(--text-secondary)', minWidth: '140px' }}>Действует до:</span>
                    <span style={{ fontSize: '15px', color: 'var(--text-primary)' }}>
                      {(() => { const end = new Date(profile.planStartDate); end.setMonth(end.getMonth() + 1); return end.toLocaleDateString('ru-RU'); })()}
                    </span>
                  </div>
                </div>
                <Link 
                  href="/pricing" 
                  className="button-primary"
                  style={{ display: 'inline-block', marginTop: 'var(--space-lg)' }}
                >
                  Продлить подписку
                </Link>
              </>
            )}
          </div>
        </div>
        
        {/* Section 3: Security */}
        <div 
          className="profile-section"
          style={{
            opacity: isMounted ? 1 : 0,
            transform: isMounted ? 'translateY(0)' : 'translateY(10px)',
            transition: 'opacity 0.4s ease-out, transform 0.4s ease-out',
            transitionDelay: '0.3s'
          }}
        >
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
        <div 
          className="profile-section"
          style={{
            opacity: isMounted ? 1 : 0,
            transform: isMounted ? 'translateY(0)' : 'translateY(10px)',
            transition: 'opacity 0.4s ease-out, transform 0.4s ease-out',
            transitionDelay: '0.4s'
          }}
        >
          <h2 style={{ 
            fontSize: '28px', 
            marginBottom: 'var(--space-lg)',
            paddingBottom: 'var(--space-md)',
            borderBottom: '1px solid var(--border-color)'
          }}>
            История платежей
          </h2>
          
          <div className="card">
            {payments.length === 0 ? (
              <p style={{ color: 'var(--text-secondary)', fontSize: '15px' }}>
                У вас пока нет платежей
              </p>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', fontSize: '15px' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
                      <th style={{ padding: '12px', textAlign: 'left', fontWeight: 600 }}>Дата</th>
                      <th style={{ padding: '12px', textAlign: 'left', fontWeight: 600 }}>Описание</th>
                      <th style={{ padding: '12px', textAlign: 'right', fontWeight: 600 }}>Сумма</th>
                    </tr>
                  </thead>
                  <tbody>
                    {payments.map((payment) => (
                      <tr key={payment.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                        <td style={{ padding: '12px' }}>
                          {new Date(payment.date).toLocaleDateString('ru-RU')}
                        </td>
                        <td style={{ padding: '12px' }}>
                          Тариф {getPlanName(payment.plan)}
                        </td>
                        <td style={{ padding: '12px', textAlign: 'right', fontWeight: 600 }}>
                          {payment.amount} ₽
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
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
