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
              <>
                <Link 
                  href="/admin/dashboard" 
                  className="nav-link"
                  style={{ 
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                >
                  <span>📊</span>
                  <span>Аналитика</span>
                </Link>
                <Link href="/admin" className="nav-link">Админ-панель</Link>
              </>
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
        
        {/* Warning: Low balance */}
        {profile.analysesRemaining <= 5 && profile.plan !== 'trial' && (
          <div className="card" style={{
            backgroundColor: '#FEF3C7',
            border: '1px solid #FDE047',
            marginBottom: 'var(--space-xl)'
          }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
              <span style={{ fontSize: '24px' }}>⚠️</span>
              <div>
                <h3 style={{ 
                  fontSize: '17px', 
                  fontWeight: 600,
                  marginBottom: '8px',
                  color: '#92400E'
                }}>
                  У вас заканчиваются отчёты
                </h3>
                <p style={{ 
                  fontSize: '15px', 
                  color: '#78350F',
                  marginBottom: 'var(--space-md)'
                }}>
                  Осталось всего {profile.analysesRemaining} {profile.analysesRemaining === 1 ? 'анализ' : 'анализа'}. 
                  Пополните баланс, чтобы не потерять доступ к генерации отчётов в важный момент.
                </p>
                <Link 
                  href="/pricing" 
                  className="button-primary"
                  style={{ display: 'inline-block' }}
                >
                  Пополнить сейчас
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* Section 2: My Tariff */}
        <div className="profile-section">
          <h2 style={{ 
            fontSize: '28px', 
            marginBottom: 'var(--space-lg)',
            paddingBottom: 'var(--space-md)',
            borderBottom: '1px solid var(--border-color)'
          }}>
            Мой тариф
          </h2>
          
          <div className="card">
            {/* Large counter */}
            <div style={{ textAlign: 'center', marginBottom: 'var(--space-xl)' }}>
              <div style={{ 
                fontSize: '72px', 
                fontWeight: 700, 
                color: 'var(--text-primary)',
                lineHeight: 1 
              }}>
                {profile.analysesRemaining}
              </div>
              <div style={{ 
                fontSize: '15px', 
                color: 'var(--text-secondary)', 
                marginTop: '8px' 
              }}>
                отчётов осталось
              </div>
            </div>

            {/* Progress bar */}
            {(() => {
              const initialLimits: Record<string, number> = { 
                trial: 10, 
                start: 40, 
                optimal: 80, 
                profi: 200 
              };
              const initialLimit = initialLimits[profile.plan as keyof typeof initialLimits] || 0;
              const used = Math.max(0, initialLimit - profile.analysesRemaining);
              const percentage = initialLimit > 0 ? (used / initialLimit) * 100 : 0;

              return (
                <div style={{ marginBottom: 'var(--space-lg)' }}>
                  <div style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between',
                    fontSize: '13px',
                    color: 'var(--text-secondary)',
                    marginBottom: '8px'
                  }}>
                    <span>Использовано: {used} из {initialLimit}</span>
                    <span>{percentage.toFixed(1)}%</span>
                  </div>
                  <div style={{ 
                    height: '8px', 
                    backgroundColor: 'var(--surface-secondary)',
                    borderRadius: '4px',
                    overflow: 'hidden'
                  }}>
                    <div style={{
                      height: '100%',
                      width: `${percentage}%`,
                      backgroundColor: 'var(--brand-primary)',
                      transition: 'width 0.3s ease'
                    }} />
                  </div>
                </div>
              );
            })()}

            {/* Plan info */}
            <div style={{ 
              marginBottom: 'var(--space-lg)',
              padding: 'var(--space-md)',
              backgroundColor: 'var(--surface-secondary)',
              borderRadius: 'var(--radius-md)',
              fontSize: '15px',
              color: 'var(--text-secondary)'
            }}>
              Текущий тариф: <strong style={{ color: 'var(--text-primary)' }}>{getPlanName(profile.plan)}</strong>
            </div>
            
            {/* Button */}
            <Link 
              href="/pricing" 
              className="button-primary"
              style={{ 
                display: 'block',
                textAlign: 'center',
                padding: '12px 24px',
                marginTop: 'var(--space-lg)'
              }}
            >
              Пополнить отчёты
            </Link>
          </div>
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
                      <th style={{ padding: '12px', textAlign: 'center', fontWeight: 600 }}>Чек</th>
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
                        <td style={{ padding: '12px', textAlign: 'center' }}>
                          {payment.status === 'succeeded' ? (
                            <button className="button-secondary" style={{ padding: '6px 12px', fontSize: '13px' }}>
                              Скачать
                            </button>
                          ) : (
                            <span style={{ color: 'var(--text-secondary)' }}>—</span>
                          )}
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