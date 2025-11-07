'use client';

import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { useToast } from '@/components/ui/ToastProvider';
import { getToken } from '@/app/lib/auth';

interface Stats {
  totalUsers: number;
  activeUsers: number;
  totalAnalyses: number;
  planDistribution: Array<{ plan: string; _count: number }>;
}

interface User {
  id: string;
  email: string;
  name: string;
  plan: string;
  analysesRemaining: number;
  createdAt: string;
  _count: { analyses: number };
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [editingUser, setEditingUser] = useState<string | null>(null);
  const [newLimit, setNewLimit] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentEmail, setCurrentEmail] = useState<string>('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteTargetEmail, setDeleteTargetEmail] = useState<string>('');
  const [confirmEmail, setConfirmEmail] = useState<string>('');
  const [deleteError, setDeleteError] = useState<string>('');
  const [deleting, setDeleting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string>('');
  const router = useRouter();
  const pathname = usePathname();
  const { showToast } = useToast();

  const handleLogout = () => {
    localStorage.clear();
    router.push('/');
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    const token = getToken();
    if (!token) {
      router.push('/login');
      return;
    }

    try {
      // Fetch stats
      const statsRes = await fetch('/api/admin/stats', {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (statsRes.status === 403) {
        setError('Доступ запрещён');
        return;
      }

      if (statsRes.status === 401) {
        router.push('/login');
        return;
      }

      const statsData = await statsRes.json();
      setStats(statsData);

      // Fetch users
      const usersRes = await fetch('/api/admin/users', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const usersData = await usersRes.json();
      setUsers(usersData.users);

      // Fetch current admin email for self-delete prevention
      try {
        const meRes = await fetch('/api/auth/status', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (meRes.ok) {
          const me = await meRes.json();
          setCurrentEmail(me.email || '');
        }
      } catch {}

    } catch (err) {
      setError('Ошибка загрузки');
    } finally {
      setLoading(false);
    }
  };

  const updateLimit = async (userId: string) => {
    const token = getToken();
    try {
      await fetch('/api/admin/users', {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ userId, analysesRemaining: newLimit })
      });

      setEditingUser(null);
      setNewLimit('');
      fetchStats(); // Refresh data
    } catch (error) {
      showToast('Ошибка обновления', { variant: 'error' });
    }
  };

  const openDeleteModal = (email: string) => {
    setDeleteTargetEmail(email);
    setConfirmEmail('');
    setDeleteError('');
    setShowDeleteModal(true);
  };

  const closeDeleteModal = () => {
    setShowDeleteModal(false);
    setDeleteTargetEmail('');
    setConfirmEmail('');
    setDeleteError('');
  };

  const handleDeleteUser = async () => {
    if (confirmEmail !== deleteTargetEmail) {
      setDeleteError('Email не совпадает');
      return;
    }
    const token = getToken();
    try {
      setDeleting(true);
      const res = await fetch('/api/admin/delete-user', {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email: deleteTargetEmail })
      });
      const data = await res.json();
      if (!res.ok) {
        setDeleteError(data.error || 'Не удалось удалить пользователя');
        setDeleting(false);
        return;
      }
      setSuccessMessage('Пользователь успешно удалён');
      closeDeleteModal();
      await fetchStats();
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (e) {
      setDeleteError('Ошибка сети');
    } finally {
      setDeleting(false);
    }
  };

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
            <Link 
              href="/admin/dashboard" 
              className="nav-link"
              style={{ 
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                fontWeight: 500
              }}
            >
              <span>📊</span>
              <span>Аналитика</span>
            </Link>
            <Link href="/admin" className="nav-link" style={{ fontWeight: 600 }}>Админ-панель</Link>
            <button onClick={handleLogout} className="nav-link" style={{ background: 'none', border: 'none', cursor: 'pointer' }}>Выйти</button>
          </nav>
        </div>
      </header>

      <main className="container" style={{ maxWidth: '1200px', paddingTop: '120px' }}>
        <h1 style={{ fontSize: '36px', marginBottom: '32px' }}>Админ-панель</h1>

        {/* Навигация админки */}
        <div style={{ 
          marginTop: '24px', 
          marginBottom: '32px',
          padding: '16px',
          backgroundColor: '#FFFFFF',
          borderRadius: '12px',
          border: '1px solid #D2D2D7'
        }}>
          <Link 
            href="/admin/dashboard"
            style={{ 
              display: 'block',
              padding: '12px 16px',
              color: pathname === '/admin/dashboard' ? '#007AFF' : '#1D1D1F',
              textDecoration: 'none',
              borderRadius: '8px',
              backgroundColor: pathname === '/admin/dashboard' ? '#F5F5F7' : 'transparent',
              fontWeight: pathname === '/admin/dashboard' ? 600 : 400,
              transition: 'all 0.2s ease',
              marginBottom: '4px'
            }}
          >
            📊 Аналитика
          </Link>
          <Link 
            href="/admin"
            style={{ 
              display: 'block',
              padding: '12px 16px',
              color: pathname === '/admin' ? '#007AFF' : '#1D1D1F',
              textDecoration: 'none',
              borderRadius: '8px',
              backgroundColor: pathname === '/admin' ? '#F5F5F7' : 'transparent',
              fontWeight: pathname === '/admin' ? 600 : 400,
              transition: 'all 0.2s ease'
            }}
          >
            👥 Пользователи
          </Link>
        </div>

        {stats && (
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: '24px',
            marginBottom: '48px'
          }}>
            <div className="card" style={{ padding: '24px' }}>
              <div style={{ fontSize: '15px', color: 'var(--text-secondary)', marginBottom: '8px' }}>
                Всего пользователей
              </div>
              <div style={{ fontSize: '32px', fontWeight: 600 }}>
                {stats.totalUsers}
              </div>
            </div>

            <div className="card" style={{ padding: '24px' }}>
              <div style={{ fontSize: '15px', color: 'var(--text-secondary)', marginBottom: '8px' }}>
                Активных (7 дней)
              </div>
              <div style={{ fontSize: '32px', fontWeight: 600 }}>
                {stats.activeUsers}
              </div>
            </div>

            <div className="card" style={{ padding: '24px' }}>
              <div style={{ fontSize: '15px', color: 'var(--text-secondary)', marginBottom: '8px' }}>
                Всего анализов
              </div>
              <div style={{ fontSize: '32px', fontWeight: 600 }}>
                {stats.totalAnalyses}
              </div>
            </div>
          </div>
        )}

        <div className="card" style={{ padding: '32px' }}>
          <h2 style={{ fontSize: '24px', marginBottom: '16px' }}>Распределение по тарифам</h2>
          {stats && stats.planDistribution.map(plan => (
            <div key={plan.plan} style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              padding: '12px 0',
              borderBottom: '1px solid var(--border-color)'
            }}>
              <span style={{ fontSize: '15px' }}>{plan.plan}</span>
              <span style={{ fontSize: '15px', fontWeight: 600 }}>{plan._count}</span>
            </div>
          ))}
        </div>

        {/* User Management Table */}
        <div className="card" style={{ padding: '32px', marginTop: '32px' }}>
          <h2 style={{ fontSize: '24px', marginBottom: '24px' }}>Управление пользователями</h2>
          
          {users.length > 0 ? (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
                    <th style={{ padding: '12px', textAlign: 'left', fontSize: '15px', fontWeight: 600 }}>Email</th>
                    <th style={{ padding: '12px', textAlign: 'left', fontSize: '15px', fontWeight: 600 }}>Имя</th>
                    <th style={{ padding: '12px', textAlign: 'left', fontSize: '15px', fontWeight: 600 }}>План</th>
                    <th style={{ padding: '12px', textAlign: 'left', fontSize: '15px', fontWeight: 600 }}>Лимит</th>
                    <th style={{ padding: '12px', textAlign: 'left', fontSize: '15px', fontWeight: 600 }}>Анализов</th>
                    <th style={{ padding: '12px', textAlign: 'left', fontSize: '15px', fontWeight: 600 }}>Действия</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map(user => (
                    <tr key={user.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                      <td style={{ padding: '12px', fontSize: '15px' }}>{user.email}</td>
                      <td style={{ padding: '12px', fontSize: '15px' }}>{user.name}</td>
                      <td style={{ padding: '12px', fontSize: '15px' }}>{user.plan}</td>
                      <td style={{ padding: '12px', fontSize: '15px' }}>
                        {editingUser === user.id ? (
                          <input
                            type="number"
                            value={newLimit}
                            onChange={(e) => setNewLimit(e.target.value)}
                            className="input"
                            style={{ width: '80px', padding: '4px 8px' }}
                          />
                        ) : (
                          user.analysesRemaining
                        )}
                      </td>
                      <td style={{ padding: '12px', fontSize: '15px' }}>{user._count.analyses}</td>
                      <td style={{ padding: '12px' }}>
                        {editingUser === user.id ? (
                          <div style={{ display: 'flex', gap: '8px' }}>
                            <button 
                              onClick={() => updateLimit(user.id)}
                              className="button-primary"
                              style={{ padding: '4px 12px', fontSize: '13px' }}
                            >
                              Сохранить
                            </button>
                            <button 
                              onClick={() => { setEditingUser(null); setNewLimit(''); }}
                              className="button-secondary"
                              style={{ padding: '4px 12px', fontSize: '13px' }}
                            >
                              Отмена
                            </button>
                          </div>
                        ) : (
                          <div style={{ display: 'flex', gap: '8px' }}>
                            <button 
                              onClick={() => { 
                                setEditingUser(user.id); 
                                setNewLimit(user.analysesRemaining.toString()); 
                              }}
                              className="button-secondary"
                              style={{ padding: '4px 12px', fontSize: '13px' }}
                            >
                              Изменить
                            </button>
                            <button
                              onClick={() => openDeleteModal(user.email)}
                              className="bg-red-600 text-white"
                              style={{ padding: '4px 12px', fontSize: '13px', borderRadius: '8px', border: 'none', cursor: 'pointer', backgroundColor: '#dc2626' }}
                              disabled={user.email === currentEmail}
                              title={user.email === currentEmail ? 'Нельзя удалить самого себя' : 'Удалить пользователя'}
                            >
                              Удалить
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p>Загрузка пользователей...</p>
          )}
        </div>
        {successMessage && (
          <div className="card" style={{ marginTop: '16px', padding: '12px', color: '#065f46', background: '#ecfdf5', border: '1px solid #a7f3d0' }}>
            {successMessage}
          </div>
        )}
      </main>

      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="relative w-full max-w-lg mx-4 bg-white rounded-2xl shadow-2xl px-10 py-8">
            <button onClick={closeDeleteModal} aria-label="Закрыть" className="absolute top-6 right-6 text-gray-400 hover:text-black transition-colors">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
            <div className="border-b border-black/10 pb-6 mb-6">
              <h3 className="text-2xl font-semibold text-black">Удалить пользователя?</h3>
            </div>
            <div>
              <p className="mb-3 text-base text-[#1d1d1f]">Это действие необратимо! Все данные пользователя будут удалены.</p>
              <p className="mb-3 text-base text-[#1d1d1f]">Подтвердите удаление, введя точный email пользователя:</p>
              <div className="mb-4">
                <input
                  type="text"
                  value={confirmEmail}
                  onChange={(e) => { setConfirmEmail(e.target.value); if (deleteError) setDeleteError(''); }}
                  placeholder="Введите email для подтверждения"
                  className="w-full rounded-xl border border-black/10 px-3 py-2 focus:outline-none focus:ring-0"
                />
              </div>
              {deleteError && (
                <div className="text-sm text-[#1d1d1f] mb-4">{deleteError}</div>
              )}
              <div className="text-sm text-[#86868b] mb-8">Удаляемый email: <span className="font-semibold text-black">{deleteTargetEmail}</span></div>
            </div>
            <div className="flex justify-end gap-4">
              <button onClick={closeDeleteModal} className="bg-transparent text-gray-600 hover:text-black rounded-xl px-8 py-3 font-medium transition-colors">Отмена</button>
              <button
                onClick={handleDeleteUser}
                className="bg-black text-white hover:bg-gray-800 rounded-xl px-8 py-3 font-medium transition-colors"
                disabled={!confirmEmail || confirmEmail !== deleteTargetEmail || deleting}
              >
                {deleting ? 'Удаление...' : 'Удалить'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
