'use client';

import dynamic from 'next/dynamic';
import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/app/context/AuthContext';

const ScrollToTop = dynamic(() => import('@/components/ScrollToTop'), { ssr: false });
const SearchBar = dynamic(() => import('../components/SearchBar'), { ssr: false });
const ExportButtons = dynamic(() => import('@/app/components/ExportButtons'), { ssr: false });
const SuccessToast = dynamic(() => import('../components/SuccessToast'), { ssr: false });
const CardSkeleton = dynamic(() => import('@/components/CardSkeleton'), { ssr: false });

interface Company {
  id: string;
  companyName: string;
  companyInn: string;
  reportText?: string;
  createdAt: string;
}

// Функция сокращения организационно-правовой формы ТОЛЬКО для списка отчётов
function formatCompanyNameForList(fullName: string): string {
  const opfMap: { [key: string]: string } = {
    // 🇷🇺 Россия
    'Общество с ограниченной ответственностью': 'ООО',
    'Акционерное общество': 'АО',
    'Публичное акционерное общество': 'ПАО',
    'Непубличное акционерное общество': 'НАО',
    'Индивидуальный предприниматель': 'ИП',
    'Производственный кооператив': 'ПК',
    'Крестьянское (фермерское) хозяйство': 'КФХ',
    'Государственное унитарное предприятие': 'ГУП',
    'Муниципальное унитарное предприятие': 'МУП',
    'Федеральное государственное унитарное предприятие': 'ФГУП',
    'Казенное предприятие': 'КП',
    'Федеральное казенное предприятие': 'ФКП',
    'Полное товарищество': 'ПТ',
    'Товарищество на вере': 'ТНВ',
    'Автономная некоммерческая организация': 'АНО',
    'Государственное бюджетное учреждение': 'ГБУ',
    'Муниципальное бюджетное учреждение': 'МБУ',
    'Федеральное государственное бюджетное учреждение': 'ФГБУ',
    'Казенное учреждение': 'КУ',
    'Гаражно-строительный кооператив': 'ГСК',
    'Жилищно-строительный кооператив': 'ЖСК',
    'Садоводческое некоммерческое товарищество': 'СНТ',
    'Товарищество собственников жилья': 'ТСЖ',
    'Товарищество собственников недвижимости': 'ТСН',
    'Общественная организация': 'ОО',
    'Закрытое акционерное общество': 'ЗАО',
    'Открытое акционерное общество': 'ОАО',
    
    // 🇰🇿 Казахстан
    'Товарищество с ограниченной ответственностью': 'ТОО',
    'Коммандитное товарищество': 'КТ',
    'Государственное предприятие': 'ГП',
    'Государственное казенное предприятие': 'ГКП',
    'Крестьянское хозяйство': 'КХ',
    'Фермерское хозяйство': 'ФХ',
    'Общественное объединение': 'ОО',
    
    // 🇧🇾 Беларусь
    'Унитарное предприятие': 'УП',
    'Частное унитарное предприятие': 'ЧУП',
    'Общество с дополнительной ответственностью': 'ОДО',
  };

  let result = fullName;
  
  // Регистронезависимый поиск и замена ОПФ
  // Сортируем по длине (более длинные первыми), чтобы избежать конфликтов
  const sortedEntries = Object.entries(opfMap).sort((a, b) => b[0].length - a[0].length);
  
  const lowerName = result.toLowerCase();
  for (const [full, abbr] of sortedEntries) {
    const lowerFull = full.toLowerCase();
    if (lowerName.includes(lowerFull)) {
      // Находим позицию начала ОПФ (регистронезависимо)
      const index = lowerName.indexOf(lowerFull);
      if (index !== -1) {
        // Заменяем с сохранением регистра начала строки
        const before = result.substring(0, index);
        const after = result.substring(index + full.length);
        result = before + abbr + after;
        break;
      }
    }
  }
  
  // Переводим в ВЕРХНИЙ РЕГИСТР
  return result.toUpperCase();
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
  const [isMounted, setIsMounted] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
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
    const fetchCompanies = async () => {
      try {
        const response = await fetch('/api/analysis/manage?isDeleted=false', {
          credentials: 'include'
        });
        if (!response.ok) throw new Error('Ошибка загрузки');
        const companiesList = await response.json();
        
        const companiesWithReports = await Promise.all(
          companiesList.map(async (company: Company) => {
            try {
              const reportResponse = await fetch(`/api/analysis/report/${company.id}`, {
                credentials: 'include'
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
        // Trigger fade in animation after content is loaded
        setTimeout(() => setIsMounted(true), 50);
      }
    };
    
    fetchCompanies();
  }, []);

  // Filter companies based on search query
  const filteredCompanies = useMemo(() => {
    if (!searchQuery.trim()) return companies;

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
    setDeletingId(id);
    try {
      const response = await fetch('/api/analysis/manage', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({ 
          analysisId: id, 
          isDeleted: true 
        }),
      });
      
      if (response.ok) {
        // Wait for fade out animation before removing
        setTimeout(() => {
          setCompanies((prev) => prev.filter(c => c.id !== id));
          setSuccessMessage('Отчёт удалён');
          setDeletingId(null);
        }, 300);
      } else {
        setError('Ошибка удаления');
        setDeletingId(null);
      }
    } catch (err) {
      setError('Ошибка удаления');
      setDeletingId(null);
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
        <main className="container" style={{ maxWidth: '1000px', paddingTop: '64px', paddingBottom: '64px' }}>
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
      <main 
        className="container page-container companies-container" 
        style={{ 
          maxWidth: '1000px', 
          paddingTop: '64px', 
          paddingBottom: '64px'
        }}
      >
        {/* Search Bar - Show if there are companies or if searching */}
        {(companies.length > 0 || searchQuery) && !error && (
          <SearchBar
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Поиск"
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
            <Link 
              href="/analysis" 
              className="button-primary" 
              style={{ 
                display: 'inline-block', 
                padding: '12px 32px', 
                transition: 'all 0.2s ease',
                background: '#1D1D1F'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = '#2D2D2F';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = '#1D1D1F';
              }}
            >
              Создать первый анализ
            </Link>
          </div>
        )}

        {/* No Search Results State */}
        {!error && companies.length > 0 && filteredCompanies.length === 0 && searchQuery && (
          <div style={{ 
            textAlign: 'center', 
            padding: '64px 24px',
            color: 'var(--text-secondary)'
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
            {filteredCompanies.map((company, index) => {
              const companyMatch = company.reportText?.match(/\*\*Компания:\*\*\s*(.+?)(?=\n|\*\*|$)/);
              const innMatch = company.reportText?.match(/\*\*ИНН:\*\*\s*(\d+)/);
              const displayName = companyMatch ? companyMatch[1].replace(/\*\*/g, '').trim() : company.companyName;
              const displayInn = innMatch ? innMatch[1] : company.companyInn;
              const isDeleting = deletingId === company.id;

              return (
                <div 
                  key={company.id} 
                  className={`company-item card-hover ${shareOpen === company.id ? 'menu-open' : ''}`}
                  style={{
                    opacity: isDeleting ? 0 : 1,
                    transform: isDeleting ? 'translateX(-20px)' : 'translateY(0)',
                    transition: isDeleting ? 'opacity 0.3s ease-in-out, transform 0.3s ease-in-out' : 'all 0.3s ease',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
                  }}
                  onMouseEnter={(e) => {
                    if (!isDeleting) {
                      e.currentTarget.style.transform = 'translateY(-4px)';
                      e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.12)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isDeleting) {
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.08)';
                    }
                  }}
                >
                  <div className="company-info">
                    <Link 
                      href={`/report/${company.id}`} 
                      style={{ 
                        textDecoration: 'none', 
                        color: 'inherit',
                        display: 'inline-block',
                        marginBottom: '4px'
                      }}
                    >
                      <h3
                        className="company-name"
                        style={{
                          margin: 0,
                          overflow: 'hidden',
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical' as const,
                          whiteSpace: 'normal'
                        }}
                      >
                        {formatCompanyNameForList(displayName)}
                      </h3>
                    </Link>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>
                      {displayInn ? `ИНН: ${displayInn} • ` : ''}{new Date(company.createdAt).toLocaleDateString('ru-RU')}
                    </p>
                  </div>
                  
                  <div className="company-actions">
                    <Link 
                      href={`/report/${company.id}`} 
                      className="button-primary" 
                      style={{ 
                        fontSize: '14px', 
                        padding: '6px 12px', 
                        transition: 'all 0.2s ease',
                        background: '#1D1D1F'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = '#2D2D2F';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = '#1D1D1F';
                      }}
                    >
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
                        style={{ fontSize: '14px', padding: '6px 12px', display: 'flex', alignItems: 'center', gap: '4px', transition: 'all 0.2s ease' }}
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
                          <ExportButtons
                            reportId={company.id}
                            reportTitle={displayName}
                            onClose={() => setShareOpen(null)}
                          />
                        </div>
                      )}
                    </div>
                    
                    <button onClick={(e) => { e.preventDefault(); e.stopPropagation(); setDeleteTarget(company.id); setShowDeleteModal(true); }} className="button-secondary" style={{ fontSize: '14px', padding: '6px 12px', color: 'var(--text-primary)', fontWeight: '600', transition: 'all 0.2s ease' }} title="Удалить">
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
        <div 
          style={{ 
            position: 'fixed', 
            top: 0, 
            left: 0, 
            right: 0, 
            bottom: 0, 
            backgroundColor: 'rgba(0, 0, 0, 0.5)', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            zIndex: 1000
          }}
        >
          <div 
            style={{ 
              backgroundColor: 'white', 
              borderRadius: '12px', 
              padding: '32px', 
              maxWidth: '400px', 
              width: '90%', 
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
              animation: 'modalSlideIn 0.3s ease-out'
            }}
          >
            <h3 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '16px' }}>Удалить отчёт?</h3>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '24px' }}>
              Это действие нельзя отменить. Отчёт будет удалён навсегда.
            </p>
            <div style={{ display: 'flex', gap: '12px' }}>
              <button onClick={() => { setShowDeleteModal(false); setDeleteTarget(null); }} className="button-secondary" style={{ flex: 1, transition: 'all 0.2s ease' }}>
                Отмена
              </button>
              <button 
                onClick={() => handleDelete(deleteTarget!)} 
                className="button-primary" 
                style={{ 
                  flex: 1, 
                  transition: 'all 0.2s ease',
                  background: '#1D1D1F'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = '#2D2D2F';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = '#1D1D1F';
                }}
              >
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

      {/* Animation styles */}
      <style jsx global>{`
        @keyframes modalSlideIn {
          from {
            transform: scale(0.9);
            opacity: 0;
          }
          to {
            transform: scale(1);
            opacity: 1;
          }
        }

        .company-item {
          transition: all 0.3s ease;
        }

        .company-item:hover {
          transform: translateY(-4px) !important;
        }

        .button-primary,
        .button-secondary {
          transition: all 0.2s ease;
        }

        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .companies-container {
          animation: fadeInUp 0.6s ease-out;
        }

        .company-item {
          animation: fadeInUp 0.5s ease-out;
          animation-fill-mode: both;
        }

        .company-item:nth-child(1) { animation-delay: 0.05s; }
        .company-item:nth-child(2) { animation-delay: 0.1s; }
        .company-item:nth-child(3) { animation-delay: 0.15s; }
        .company-item:nth-child(4) { animation-delay: 0.2s; }
        .company-item:nth-child(5) { animation-delay: 0.25s; }
        .company-item:nth-child(6) { animation-delay: 0.3s; }
        .company-item:nth-child(7) { animation-delay: 0.35s; }
        .company-item:nth-child(8) { animation-delay: 0.4s; }
        .company-item:nth-child(9) { animation-delay: 0.45s; }
        .company-item:nth-child(10) { animation-delay: 0.5s; }
      `}</style>
    </>
  );
}
