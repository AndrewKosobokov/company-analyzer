'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { exportToPDF, exportToWord, shareToTelegram, shareToWhatsApp, copyToClipboard } from '@/utils/exportReport';
import ScrollToTop from '@/components/ScrollToTop';
import SearchBar from '../components/SearchBar';
import SuccessToast from '../components/SuccessToast';
import CardSkeleton from '@/components/CardSkeleton';
import { getToken } from '@/app/lib/auth';
import { useAuth } from '@/app/context/AuthContext';

interface Company {
  id: string;
  companyName: string;
  companyInn: string;
  reportText?: string;
  createdAt: string;
}

export default function CompaniesPage() {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [copySuccess, setCopySuccess] = useState<string | null>(null);
  const [shareOpen, setShareOpen] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);
  const router = useRouter();
  const { logout } = useAuth();
  
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
    const fetchCompanies = async () => {
      try {
        const response = await fetch('/api/analysis/manage?isDeleted=false', {
          headers: {
            'Authorization': `Bearer ${getToken()}`
          }
        });
        if (!response.ok) throw new Error('Ошибка загрузки');
        const companiesList = await response.json();
        
        const companiesWithReports = await Promise.all(
          companiesList.map(async (company: Company) => {
            try {
              const reportResponse = await fetch(`/api/analysis/report/${company.id}`, {
                headers: {
                  'Authorization': `Bearer ${getToken()}`
                }
              });
              if (reportResponse.ok) {
                const reportData = await reportResponse.json();
                return { ...company, reportText: reportData.reportText };
              }
            } catch (err) {
              console.error(`Ошибка загрузки отчёта для ${company.id}:`, err);
            }
            return company;
          })
        );
        
        setCompanies(companiesWithReports);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Не удалось загрузить список компаний');
      } finally {
        setLoading(false);
      }
    };
    
    fetchCompanies();
  }, []);

  // Filter companies based on search query
  const filteredCompanies = useMemo(() => {
    if (!searchQuery.trim()) {
      return companies;
    }

    const query = searchQuery.toLowerCase().trim();
    
    return companies.filter(company => {
      const companyMatch = company.reportText?.match(/\*\*Компания:\*\*\s*(.+?)(?=\n|\*\*|$)/);
      const innMatch = company.reportText?.match(/\*\*ИНН:\*\*\s*(\d+)/);
      const displayName = companyMatch ? companyMatch[1].replace(/\*\*/g, '').trim() : company.companyName;
      const displayInn = innMatch ? innMatch[1] : company.companyInn;
      
      return (
        (displayName?.toLowerCase().includes(query) || false) ||
        (displayInn?.includes(query) || false) ||
        (company.companyName?.toLowerCase().includes(query) || false) ||
        (company.companyInn?.includes(query) || false)
      );
    });
  }, [companies, searchQuery]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('.share-dropdown-container')) {
        setShareOpen(null);
      }
    };

    if (shareOpen) {
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [shareOpen]);

  // Keyboard shortcuts: CMD/CTRL+K to focus search, ESC to clear
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // CMD+K or CTRL+K to focus search
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        const searchInput = document.querySelector('input[type="text"]') as HTMLInputElement;
        if (searchInput) {
          searchInput.focus();
        }
      }
      
      // ESC to clear search
      if (e.key === 'Escape' && searchQuery) {
        setSearchQuery('');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [searchQuery]);

  const handleDelete = async (id: string) => {
    try {
      const response = await fetch('/api/analysis/manage', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getToken()}`
        },
        body: JSON.stringify({ 
          analysisId: id, 
          isDeleted: true 
        }),
      });
      
      if (response.ok) {
        setCompanies((prev) => prev.filter(c => c.id !== id));
        setSuccessMessage('Отчёт удалён');
      } else {
        setError('Ошибка удаления');
      }
    } catch (err) {
      setError('Ошибка удаления');
    } finally {
      setShowDeleteModal(false);
      setDeleteTarget(null);
    }
  };

  const handleLogout = () => {
    logout();
  };

  if (loading) {
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
              <Link href="/companies" className="nav-link" style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                Отчеты
              </Link>
              <Link href="/pricing" className="nav-link">Тарифы</Link>
              <Link href="/profile" className="nav-link">Профиль</Link>
              {isAdmin && (
                <Link href="/admin" className="nav-link">Админ-панель</Link>
              )}
              <button onClick={handleLogout} className="nav-link" style={{ background: 'none', border: 'none', cursor: 'pointer' }}>Выйти</button>
            </nav>
          </div>
        </header>
        
        <main className="container" style={{ maxWidth: '1000px', paddingTop: '64px', paddingBottom: '64px' }}>
          <h1 style={{ fontSize: '48px', fontWeight: 600, marginBottom: '48px', textAlign: 'center' }}>Отчеты</h1>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {[1, 2, 3].map(i => (
              <div key={i} style={{
                padding: '24px',
                background: 'var(--background-primary)',
                borderRadius: 'var(--radius-xl)',
                border: '1px solid var(--border-color)',
                animation: 'skeleton-pulse 1.5s ease-in-out infinite'
              }}>
                {/* Company name skeleton */}
                <div style={{
                  height: '24px',
                  width: '60%',
                  background: 'var(--background-secondary)',
                  borderRadius: '4px',
                  marginBottom: '12px'
                }} />
                {/* INN skeleton */}
                <div style={{
                  height: '16px',
                  width: '30%',
                  background: 'var(--background-secondary)',
                  borderRadius: '4px'
                }} />
              </div>
            ))}
          </div>
        </main>
      </>
    );
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
            <Link href="/companies" className="nav-link" style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
              Отчеты
            </Link>
            <Link href="/pricing" className="nav-link">Тарифы</Link>
            <Link href="/profile" className="nav-link">Профиль</Link>
            {isAdmin && (
              <Link href="/admin" className="nav-link">Админ-панель</Link>
            )}
            <button onClick={handleLogout} className="nav-link" style={{ background: 'none', border: 'none', cursor: 'pointer' }}>Выйти</button>
          </nav>
        </div>
      </header>
      
      <main className="container page-container" style={{ maxWidth: '1000px', paddingTop: '64px', paddingBottom: '64px' }}>
        <h1 style={{ fontSize: '48px', fontWeight: 600, marginBottom: '48px', textAlign: 'center' }}>Отчеты</h1>
        
        {/* Search Bar - Show if there are companies or if searching */}
        {(companies.length > 0 || searchQuery) && !error && (
          <SearchBar
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Поиск по названию или ИНН..."
            resultsCount={filteredCompanies.length}
            totalCount={companies.length}
          />
        )}
        
        {error && (
          <div className="card" style={{ textAlign: 'center', padding: '32px' }}>
            <p style={{ color: 'var(--text-secondary)', fontSize: '17px' }}>{error}</p>
          </div>
        )}
        
        {/* Empty State - No companies at all */}
        {!error && companies.length === 0 && !searchQuery && (
          <div style={{ textAlign: 'center', padding: '48px 24px', color: 'var(--text-secondary)' }}>
            <p style={{ fontSize: '20px', fontWeight: 500, marginBottom: '12px', color: 'var(--text-primary)' }}>
              У вас пока нет отчетов
            </p>
            <p style={{ fontSize: '17px', marginBottom: '32px' }}>
              Создайте первый анализ компании
            </p>
            <Link href="/analysis" className="button-primary" style={{ display: 'inline-block', padding: '12px 32px' }}>
              Создать первый анализ
            </Link>
          </div>
        )}

        {/* No Search Results State */}
        {!error && companies.length > 0 && filteredCompanies.length === 0 && searchQuery && (
          <div style={{ 
            textAlign: 'center', 
            padding: '64px 24px',
            color: 'var(--text-secondary)',
            animation: 'fadeIn 0.3s ease'
          }}>
            <p style={{ fontSize: '20px', fontWeight: 500, marginBottom: '12px', color: 'var(--text-primary)' }}>
              Ничего не найдено
            </p>
            <p style={{ fontSize: '17px', marginBottom: '8px' }}>
              Попробуйте изменить поисковый запрос
            </p>
            <p style={{ fontSize: '15px' }}>
              Поиск: &quot;{searchQuery}&quot;
            </p>
          </div>
        )}
        
        {/* Loading State */}
        {loading && (
          <div className="companies-list">
            <CardSkeleton />
            <CardSkeleton />
            <CardSkeleton />
          </div>
        )}

        {/* Companies List */}
        {!error && !loading && filteredCompanies.length > 0 && (
          <div className="companies-list">
            {filteredCompanies.map((company) => {
              const companyMatch = company.reportText?.match(/\*\*Компания:\*\*\s*(.+?)(?=\n|\*\*|$)/);
              const innMatch = company.reportText?.match(/\*\*ИНН:\*\*\s*(\d+)/);
              const displayName = companyMatch ? companyMatch[1].replace(/\*\*/g, '').trim() : company.companyName;
              const displayInn = innMatch ? innMatch[1] : company.companyInn;

              return (
                <div key={company.id} className={`company-item card-hover ${shareOpen === company.id ? 'menu-open' : ''}`}>
                  <div className="company-info">
                    <Link href={`/report/${company.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                      <h3 className="company-name">
                        {displayName}
                      </h3>
                    </Link>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>
                      ИНН: {displayInn} • {new Date(company.createdAt).toLocaleDateString('ru-RU')}
                    </p>
                  </div>
                  
                  <div className="company-actions">
                    <Link href={`/report/${company.id}`} className="button-primary" style={{ fontSize: '14px', padding: '6px 12px' }}>
                      Открыть
                    </Link>
                    
                    <div className="share-dropdown-container" style={{ position: 'relative' }}>
                      <button 
                        onClick={(e) => { 
                          e.preventDefault(); 
                          e.stopPropagation(); 
                          setShareOpen(shareOpen === company.id ? null : company.id); 
                        }} 
                        className="button-secondary" 
                        style={{ fontSize: '14px', padding: '6px 12px', display: 'flex', alignItems: 'center', gap: '4px' }}
                      >
                        Поделиться
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ transform: shareOpen === company.id ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }}>
                          <polyline points="6 9 12 15 18 9"/>
                        </svg>
                      </button>
                      
                      {shareOpen === company.id && (
                        <div 
                          className="share-dropdown-menu"
                        >
                          <button
                            onClick={async (e) => { 
                              e.preventDefault(); 
                              e.stopPropagation(); 
                              try { 
                                await exportToPDF(displayName, displayInn, company.reportText || ''); 
                                setShareOpen(null);
                              } catch (error) { 
                                setError('Ошибка экспорта'); 
                              }
                            }}
                          >
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                              <polyline points="14 2 14 8 20 8"/>
                            </svg>
                            PDF
                          </button>
                    
                          <button
                            onClick={async (e) => { 
                              e.preventDefault(); 
                              e.stopPropagation(); 
                              try { 
                                await exportToWord(displayName, displayInn, company.reportText || ''); 
                                setShareOpen(null);
                              } catch (error) { 
                                setError('Ошибка экспорта'); 
                              }
                            }}
                          >
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                              <polyline points="14 2 14 8 20 8"/>
                              <path d="M9 13h6"/><path d="M9 17h6"/>
                            </svg>
                            Word
                          </button>

                          <button
                            onClick={async (e) => { 
                              e.preventDefault(); 
                              e.stopPropagation(); 
                              const success = await copyToClipboard(company.reportText || ''); 
                              if (success) { 
                                setCopySuccess(company.id); 
                                setTimeout(() => setCopySuccess(null), 2000); 
                                setShareOpen(null);
                              } else { 
                                setError('Ошибка копирования');
                              }
                            }}
                          >
                            {copySuccess === company.id ? (
                              <>
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                  <polyline points="20 6 9 17 4 12"/>
                                </svg>
                                Скопировано
                              </>
                            ) : (
                              <>
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                  <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
                                  <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
                                </svg>
                                Копировать
                              </>
                            )}
                          </button>
                    
                          <button
                            onClick={(e) => { 
                              e.preventDefault(); 
                              e.stopPropagation(); 
                              shareToTelegram(displayName, displayInn, company.reportText || ''); 
                              setShareOpen(null);
                            }}
                          >
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69.01-.03.01-.14-.07-.2-.08-.06-.19-.04-.27-.02-.12.02-1.99 1.27-5.62 3.72-.53.37-.89.55-1.09.54-.36-.01-1.05-.2-1.56-.37-.63-.2-1.12-.31-1.08-.66.02-.18.27-.36.74-.55 2.92-1.27 4.86-2.11 5.83-2.51 2.78-1.16 3.35-1.36 3.73-1.36.08 0 .27.02.39.12.1.08.13.19.14.27-.01.06.01.24 0 .38z"/>
                            </svg>
                            Telegram
                          </button>
                    
                          <button
                            onClick={(e) => { 
                              e.preventDefault(); 
                              e.stopPropagation(); 
                              shareToWhatsApp(displayName, displayInn, company.reportText || ''); 
                              setShareOpen(null);
                            }}
                          >
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                            </svg>
                            WhatsApp
                          </button>
                        </div>
                      )}
                    </div>
                    
                    <button onClick={(e) => { e.preventDefault(); e.stopPropagation(); setDeleteTarget(company.id); setShowDeleteModal(true); }} className="button-secondary" style={{ fontSize: '14px', padding: '6px 12px', color: 'var(--text-primary)', fontWeight: '600' }} title="Удалить">
                      Удалить
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      <ScrollToTop />

      {showDeleteModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0, 0, 0, 0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ backgroundColor: 'white', borderRadius: '12px', padding: '32px', maxWidth: '400px', width: '90%', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)' }}>
            <h3 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '16px' }}>Удалить отчёт?</h3>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '24px' }}>
              Это действие нельзя отменить. Отчёт будет удалён навсегда.
            </p>
            <div style={{ display: 'flex', gap: '12px' }}>
              <button onClick={() => { setShowDeleteModal(false); setDeleteTarget(null); }} className="button-secondary" style={{ flex: 1 }}>
                Отмена
              </button>
              <button onClick={() => handleDelete(deleteTarget!)} className="button-primary" style={{ flex: 1 }}>
                Удалить
              </button>
            </div>
          </div>
        </div>
      )}
      
      {successMessage && (
        <SuccessToast 
          message={successMessage} 
          onClose={() => setSuccessMessage('')} 
        />
      )}
    </>
  );
}