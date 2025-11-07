'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { getToken } from '@/app/lib/auth';
import { useAuth } from '@/app/context/AuthContext';
import { DollarSign, CreditCard, TrendingUp, RefreshCw, Users, AlertCircle } from 'lucide-react';
import { MetricCard } from './components/MetricCard';
import { UserDistributionChart } from './components/UserDistributionChart';
import { AIHealthStatus } from './components/AIHealthStatus';

interface MetricsData {
  revenue: {
    total: number;
    period: number;
    previousPeriod: number;
    change: number;
  };
  averageOrderValue: {
    current: number;
    previousPeriod: number;
    change: number;
  };
  conversionRate: {
    trialToPaid: number;
    previousPeriod: number;
    change: number;
  };
  repeatPurchases: {
    rate: number;
    previousPeriod: number;
    change: number;
  };
  newRegistrations: {
    count: number;
    previousPeriod: number;
    change: number;
  };
}

interface UsersData {
  distribution: {
    trial: number;
    start: number;
    optimal: number;
    profi: number;
  };
  totalUsers: number;
}

interface AIHealthData {
  errors24h: number;
  averageGenerationTime: number;
  successRate: number;
}

export default function DashboardPage() {
  const [metrics, setMetrics] = useState<MetricsData | null>(null);
  const [users, setUsers] = useState<UsersData | null>(null);
  const [aiHealth, setAIHealth] = useState<AIHealthData | null>(null);
  const [period, setPeriod] = useState(30);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const { logout } = useAuth();

  useEffect(() => {
    async function fetchData() {
      const token = getToken();
      if (!token) {
        router.push('/login');
        return;
      }

      setLoading(true);
      setError(null);
      
      try {
        const [metricsRes, usersRes, aiHealthRes] = await Promise.all([
          fetch(`/api/admin/dashboard/metrics?period=${period}`, {
            headers: { 'Authorization': `Bearer ${token}` }
          }),
          fetch('/api/admin/dashboard/users', {
            headers: { 'Authorization': `Bearer ${token}` }
          }),
          fetch('/api/admin/dashboard/ai-health', {
            headers: { 'Authorization': `Bearer ${token}` }
          })
        ]);
        
        if (metricsRes.status === 401 || usersRes.status === 401 || aiHealthRes.status === 401) {
          router.push('/login');
          return;
        }

        if (metricsRes.status === 403 || usersRes.status === 403 || aiHealthRes.status === 403) {
          setError('Доступ запрещён. Требуется роль администратора.');
          return;
        }
        
        if (!metricsRes.ok || !usersRes.ok || !aiHealthRes.ok) {
          throw new Error('Ошибка загрузки данных');
        }
        
        const metricsData = await metricsRes.json();
        const usersData = await usersRes.json();
        const aiHealthData = await aiHealthRes.json();
        
        setMetrics(metricsData);
        setUsers(usersData);
        setAIHealth(aiHealthData);
      } catch (err) {
        console.error('Ошибка загрузки данных дашборда:', err);
        setError('Не удалось загрузить данные. Проверьте подключение к серверу.');
      } finally {
        setLoading(false);
      }
    }
    
    fetchData();
  }, [period, router]);

  const handleLogout = () => {
    logout();
  };

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        backgroundColor: '#F5F5F7',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <div style={{ color: '#86868B', fontSize: '15px' }}>Загрузка...</div>
      </div>
    );
  }

  if (error) {
    return (
      <>
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
              <Link href="/profile" className="nav-link">Профиль</Link>
              <Link href="/admin" className="nav-link">Админ-панель</Link>
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

        <div style={{
          minHeight: 'calc(100vh - 80px)',
          backgroundColor: '#F5F5F7',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '24px'
        }}>
          <div style={{ 
            color: '#FF3B30', 
            fontSize: '15px',
            textAlign: 'center',
            maxWidth: '400px',
            padding: '24px',
            backgroundColor: 'white',
            borderRadius: '12px',
            border: '1px solid #D2D2D7'
          }}>
            <p style={{ marginBottom: '8px', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <AlertCircle size={20} color="#FF3B30" />
              {error}
            </p>
            <button
              onClick={() => window.location.reload()}
              style={{
                marginTop: '16px',
                padding: '10px 20px',
                backgroundColor: '#1D1D1F',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '13px',
                fontWeight: 500,
                transition: 'background-color 0.2s'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#424245';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#1D1D1F';
              }}
            >
              Попробовать снова
            </button>
          </div>
        </div>
      </>
    );
  }

  if (!metrics || !users || !aiHealth) {
    return null;
  }

  return (
    <>
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
            <Link href="/profile" className="nav-link">Профиль</Link>
            <Link href="/admin" className="nav-link">Админ-панель</Link>
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

      <div style={{ minHeight: 'calc(100vh - 80px)', backgroundColor: '#F5F5F7', paddingTop: '80px' }}>
        {/* Шапка */}
        <div style={{
          backgroundColor: 'white',
          borderBottom: '1px solid #D2D2D7'
        }}>
          <div style={{
            maxWidth: '1280px',
            margin: '0 auto',
            padding: '24px'
          }}>
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
            <h1 style={{
              fontSize: '34px',
              fontWeight: '600',
              color: '#1D1D1F',
              margin: 0
            }}>
              Аналитика
            </h1>
          </div>
        </div>

        <div style={{
          maxWidth: '1280px',
          margin: '0 auto',
          padding: '32px 24px'
        }}>
          {/* Переключатель периода */}
          <div style={{
            display: 'flex',
            gap: '8px',
            marginBottom: '32px'
          }}>
            {[7, 30, 90].map((days) => (
              <button
                key={days}
                onClick={() => setPeriod(days)}
                style={{
                  padding: '8px 16px',
                  borderRadius: '8px',
                  fontSize: '13px',
                  fontWeight: '500',
                  border: period === days ? 'none' : '1px solid #D2D2D7',
                  backgroundColor: period === days ? '#1D1D1F' : 'white',
                  color: period === days ? 'white' : '#1D1D1F',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  if (period !== days) {
                    e.currentTarget.style.backgroundColor = '#F5F5F7';
                  }
                }}
                onMouseLeave={(e) => {
                  if (period !== days) {
                    e.currentTarget.style.backgroundColor = 'white';
                  }
                }}
              >
                {days} дней
              </button>
            ))}
          </div>

          {/* Финансовые метрики */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: '16px',
            marginBottom: '32px'
          }}>
            <MetricCard
              icon={<DollarSign size={24} color="#1D1D1F" />}
              title="Доход"
              value={`${metrics.revenue.total.toLocaleString('ru-RU')} ₽`}
              subtitle={`за ${period} дней`}
              change={metrics.revenue.change}
            />
            
            <MetricCard
              icon={<CreditCard size={24} color="#1D1D1F" />}
              title="Средний чек"
              value={`${metrics.averageOrderValue.current.toLocaleString('ru-RU')} ₽`}
              change={metrics.averageOrderValue.change}
            />
            
            <MetricCard
              icon={<TrendingUp size={24} color="#1D1D1F" />}
              title="Конверсия"
              value={`${metrics.conversionRate.trialToPaid.toFixed(1)}%`}
              subtitle="Trial → Paid"
              change={metrics.conversionRate.change}
            />
            
            <MetricCard
              icon={<RefreshCw size={24} color="#1D1D1F" />}
              title="Повторные покупки"
              value={`${metrics.repeatPurchases.rate.toFixed(1)}%`}
              change={metrics.repeatPurchases.change}
            />

            <MetricCard
              icon={<Users size={24} color="#1D1D1F" />}
              title="Новые регистрации"
              value={metrics.newRegistrations.count}
              subtitle={`за ${period} дней`}
              change={metrics.newRegistrations.change}
            />
          </div>

          {/* Нижний блок: график + AI здоровье */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '24px'
          }}>
            {/* Круговая диаграмма */}
            <div style={{ minWidth: '300px' }}>
              <UserDistributionChart data={users.distribution} />
            </div>
            
            {/* AI здоровье */}
            <div style={{ minWidth: '300px' }}>
              <AIHealthStatus
                errors24h={aiHealth.errors24h}
                averageGenerationTime={aiHealth.averageGenerationTime}
                successRate={aiHealth.successRate}
              />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

