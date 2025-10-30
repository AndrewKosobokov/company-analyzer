'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useToast } from '@/components/ui/ToastProvider';

interface CompanyDetail {
  id: string;
  companyName: string;
  companyInn: string;
  reportText: string;
  createdAt: string;
}

export default function CompanyDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { showToast } = useToast();
  const [company, setCompany] = useState<CompanyDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  useEffect(() => {
    const fetchCompany = async () => {
      try {
        const response = await fetch(`/api/analysis/${params.id}`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        
        if (!response.ok) throw new Error('Компания не найдена');
        
        const data = await response.json();
        setCompany(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Не удалось загрузить данные компании');
      } finally {
        setLoading(false);
      }
    };
    
    fetchCompany();
  }, [params.id]);

  const handleDelete = async () => {
    if (!confirm('Удалить этот анализ?')) return;

    try {
      const response = await fetch('/api/analysis/manage', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ 
          analysisId: params.id, 
          isDeleted: true 
        }),
      });

      if (response.ok) {
        showToast('Анализ удален', { variant: 'success' });
        router.push('/companies');
      } else {
        showToast('Ошибка удаления', { variant: 'error' });
      }
    } catch (err) {
      showToast('Ошибка удаления', { variant: 'error' });
    }
  };
  
  const handleLogout = () => {
    localStorage.clear();
    router.push('/');
  };

  const shareToTelegram = () => {
    if (!company) return;
    const shareUrl = `${window.location.origin}/public/report/${company.id}?v=2`;
    const message = `Отчет по закупкам компании "${company.companyName}"\n${shareUrl}`;
    window.open(`https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(message)}`, '_blank');
  };

  const shareToWhatsApp = () => {
    if (!company) return;
    const shareUrl = `${window.location.origin}/public/report/${company.id}?v=2`;
    const message = `Отчет по закупкам компании "${company.companyName}"\n${shareUrl}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, '_blank');
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
  if (error || !company) {
    return (
      <>
        <header className="header">
          <div className="header-container">
            <Link href="/analysis" className="logo">
              <div style={{ fontSize: '24px', fontWeight: 600 }}>Вектор.Про</div>
              <div style={{ fontSize: '13px', color: 'var(--text-secondary)', fontWeight: 400, marginTop: '2px' }}>
                Аналитика. Фокус. Результат.
              </div>
            </Link>
            
            <nav className="nav">
              <Link href="/analysis" className="nav-link">Анализ</Link>
              <Link href="/companies" className="nav-link">Компании</Link>
              <Link href="/pricing" className="nav-link">Тарифы</Link>
              <Link href="/profile" className="nav-link">Профиль</Link>
              <button onClick={handleLogout} className="button-secondary header-button">
                Выйти
              </button>
            </nav>
          </div>
        </header>
        
        <div className="container" style={{ maxWidth: '800px', paddingTop: '64px' }}>
          <div className="card" style={{ textAlign: 'center', padding: 'var(--space-2xl)' }}>
            <p style={{ 
              color: 'var(--text-secondary)', 
              marginBottom: 'var(--space-lg)',
              fontSize: '17px'
            }}>
              {error}
            </p>
            <Link 
              href="/companies" 
              style={{ 
                color: 'var(--text-secondary)', 
                textDecoration: 'none',
                fontSize: '17px',
                transition: 'color var(--transition-fast)'
              }}
            >
              ← Вернуться к списку
            </Link>
          </div>
        </div>
      </>
    );
  }
  
  // Success State - Show Company Detail
  return (
    <>
      {/* Header */}
      <header className="header">
        <div className="header-container">
          <Link href="/analysis" className="logo">
            <div style={{ fontSize: '24px', fontWeight: 600 }}>Вектор.Про</div>
            <div style={{ fontSize: '13px', color: 'var(--text-secondary)', fontWeight: 400, marginTop: '2px' }}>
              Аналитика. Фокус. Результат.
            </div>
          </Link>
          
          <nav className="nav">
            <Link href="/analysis" className="nav-link">Анализ</Link>
            <Link 
              href="/companies" 
              className="nav-link"
              style={{ fontWeight: 600, color: 'var(--text-primary)' }}
            >
              Компании
            </Link>
            <Link href="/pricing" className="nav-link">Тарифы</Link>
            <Link href="/profile" className="nav-link">Профиль</Link>
            
            <button 
              onClick={handleLogout}
              className="button-secondary header-button"
            >
              Выйти
            </button>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="container" style={{ maxWidth: '900px', paddingTop: '64px', paddingBottom: '64px' }}>
        {/* Back Link */}
          <Link
            href="/companies"
            style={{
              color: 'var(--text-secondary)',
            fontSize: '17px', 
              textDecoration: 'none',
            display: 'inline-block', 
            marginBottom: '32px',
            transition: 'color var(--transition-fast)'
            }}
          >
            ← Вернуться к списку
          </Link>
        
        {/* Company Detail Card */}
          <div className="card">
            {/* Header Section */}
          <div>
            <h1 style={{ fontSize: '36px', fontWeight: 600, marginBottom: '8px' }}>
                {company.companyName}
              </h1>
            <p style={{ fontSize: '17px', color: 'var(--text-secondary)' }}>
              ИНН: {company.companyInn} • {new Date(company.createdAt).toLocaleDateString('ru-RU')}
              </p>
            </div>

            {/* Action Buttons */}
          <div 
            style={{ 
              marginTop: '24px', 
              display: 'flex',
              gap: '16px',
              flexWrap: 'wrap'
            }}
            className="company-actions-detail"
          >
              <button
              onClick={() => showToast('Функция в разработке', { variant: 'warning' })}
              className="button-primary"
              >
                Скачать PDF
              </button>
              <button
              onClick={() => showToast('Функция в разработке', { variant: 'warning' })}
              className="button-secondary"
              >
                Скачать Word
              </button>
              
              {/* Share Buttons */}
              <button
                onClick={shareToTelegram}
                className="button-secondary"
                style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
                title="Поделиться в Telegram"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69.01-.03.01-.14-.07-.2-.08-.06-.19-.04-.27-.02-.12.02-1.99 1.27-5.62 3.72-.53.37-.89.55-1.09.54-.36-.01-1.05-.2-1.56-.37-.63-.2-1.12-.31-1.08-.66.02-.18.27-.36.74-.55 2.92-1.27 4.86-2.11 5.83-2.51 2.78-1.16 3.35-1.36 3.73-1.36.08 0 .27.02.39.12.1.08.13.19.14.27-.01.06.01.24 0 .38z"/>
                </svg>
                Telegram
              </button>
              
              <button
                onClick={shareToWhatsApp}
                className="button-secondary"
                style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
                title="Поделиться в WhatsApp"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                </svg>
                WhatsApp
              </button>
              
              <button
                onClick={handleDelete}
              className="button-secondary"
              >
                Удалить
              </button>
            </div>

            {/* Divider */}
          <div style={{ 
            borderTop: '1px solid var(--border-color)', 
            margin: '32px 0' 
          }} />

            {/* Report Text */}
            <div style={{
            whiteSpace: 'pre-wrap',
              lineHeight: '1.8',
            fontSize: '17px',
            color: 'var(--text-tertiary)'
            }}>
              {company.reportText}
            </div>
          </div>
      </main>

      {/* Responsive Styles */}
      <style jsx>{`
        @media (max-width: 768px) {
          .company-actions-detail {
            flex-direction: column !important;
          }
          
          .company-actions-detail button {
            width: 100%;
          }
        }
      `}</style>
    </>
  );
}
