'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import ScrollToTop from '@/components/ScrollToTop';
import ReportTOC from '@/app/components/ReportTOC';
import { useToast } from '@/components/ui/ToastProvider';
import { getToken } from '@/app/lib/auth';
import { useAuth } from '@/app/context/AuthContext';

interface ReportData {
  id: string;
  companyName: string;
  companyInn: string;
  reportText: string;
  firstContactExample?: string | null;
  createdAt: string;
}

// Extract company info from report text
function extractCompanyInfo(reportText: string): { companyName: string | null; inn: string | null } {
  // Extract company name from "**Компания:** Full Name"
  const companyMatch = reportText.match(/\*\*Компания:\*\*\s*(.+?)(?=\n|\*\*|$)/);
  let companyName = companyMatch ? companyMatch[1].replace(/\*\*/g, '').trim() : null;
  
  // Clean up markdown symbols
  if (companyName) {
    companyName = companyName.replace(/[\*_]/g, '').trim();
  }
  
  // Extract INN from "**ИНН:** 1234567890"
  const innMatch = reportText.match(/\*\*ИНН:\*\*\s*(\d+)/);
  const inn = innMatch ? innMatch[1] : null;
  
  return { companyName, inn };
}

// Navigation items for Table of Contents
const navigationItems = [
  { id: 'financial-analysis', title: 'Финансовый Анализ' },
  { id: 'procurement', title: 'Закупки' },
  { id: 'high-margin', title: 'Маржинальные позиции' },
  { id: 'strategy', title: 'Стратегия Взаимодействия' },
  { id: 'recommendations', title: 'Ключевые Рекомендации' },
];

export default function ReportPage() {
  const params = useParams();
  const router = useRouter();
  const [report, setReport] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [showFirstContact, setShowFirstContact] = useState(false);
  const { showToast } = useToast();
  const { logout } = useAuth();
  
  /**
   * Utility to safely and recursively extract clean text content from React children.
   * This handles nested Markdown elements robustly.
   */
  const getHeaderText = (children: React.ReactNode): string => {
    return React.Children.toArray(children).map(child => {
      if (typeof child === 'string') return child;

      // If it's a React element, recursively get its children's text
      if (React.isValidElement(child) && child.props.children) {
        return getHeaderText(child.props.children);
      }
      return '';
    }).join('');
  };
  
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
        // Ignore
      }
    };
    
    checkAdmin();
  }, []);

  useEffect(() => {
    const fetchReport = async () => {
      try {
        const response = await fetch(`/api/analysis/report/${params.id}`, {
          headers: {
            'Authorization': `Bearer ${getToken()}`
          }
        });
        
        if (!response.ok) throw new Error('Отчет не найден');
        
        const data = await response.json();
        setReport(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Не удалось загрузить отчет');
      } finally {
        setLoading(false);
      }
    };
    
    fetchReport();
  }, [params.id]);


  // STEP 1: Debug - Show actual h2 headers from report
  useEffect(() => {
    if (report?.reportText) {
      console.log('\n=== FULL REPORT TEXT ===');
      console.log(report.reportText);
      console.log('=== END REPORT ===\n');
      
      // Extract all h2 headers from markdown
      const h2Matches = report.reportText.match(/^##\s+.+$/gm);
      console.log('=== FOUND H2 HEADERS ===');
      if (h2Matches) {
        h2Matches.forEach((header, index) => {
          console.log(`${index + 1}. ${header}`);
        });
      } else {
        console.log('No h2 headers found!');
      }
      console.log('=== END H2 HEADERS ===\n');
    }
  }, [report]);

  const handleDelete = async () => {
    try {
      const response = await fetch(`/api/analysis/manage`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getToken()}`
        },
        body: JSON.stringify({
          analysisId: report!.id,
          isDeleted: true
        })
      });

      if (response.ok) {
        router.push('/companies');
      } else {
        showToast('Ошибка удаления', { variant: 'error' });
      }
    } catch (error) {
      showToast('Ошибка удаления', { variant: 'error' });
    } finally {
      setShowDeleteModal(false);
    }
  };
  
  const handleLogout = () => {
    logout();
  };
  
  // Loading State
  if (loading) {
    return (
      <div style={{ 
        minHeight: '100vh', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        flexDirection: 'column',
        gap: '16px'
      }}>
        <p style={{ fontSize: '17px', color: 'var(--text-secondary)' }}>
          Загрузка отчета...
        </p>
      </div>
    );
  }
  
  // Error State
  if (error || !report) {
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
              {isAdmin && (
                <Link href="/admin" className="nav-link">Админ-панель</Link>
              )}
              <button onClick={handleLogout} className="nav-link" style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
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
              href="/analysis" 
              style={{ 
                color: 'var(--text-secondary)', 
                textDecoration: 'none',
                fontSize: '17px',
                transition: 'color var(--transition-fast)'
              }}
            >
              ← Создать новый анализ
            </Link>
          </div>
        </div>
      </>
    );
  }
  
  // Success State - Show Report
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
            <Link href="/profile" className="nav-link">Профиль</Link>
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
      <main className="container" style={{ maxWidth: '1400px', paddingTop: '0', paddingBottom: '64px' }}>
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
          ← Список отчетов
        </Link>
        
        {/* Report Layout with TOC */}
        <div className="report-layout">
          {/* Left Column: TOC + Script Button */}
          <div style={{
            position: 'sticky',
            top: '96px',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px',
            alignSelf: 'flex-start'
          }}>
            {/* Table of Contents */}
            {!showFirstContact && <ReportTOC items={navigationItems} />}
            
            {/* First Contact Example Button */}
            {!report.reportText.includes('АНАЛИЗ НЕЦЕЛЕСООБРАЗЕН') && report.firstContactExample && (
              <button
                onClick={() => setShowFirstContact(!showFirstContact)}
                style={{
                  width: '100%',
                  padding: '16px 20px',
                  background: '#1d1d1f',
                  color: 'white',
                  border: 'none',
                  borderRadius: 'var(--radius-lg)',
                  fontSize: '15px',
                  fontWeight: '500',
                  letterSpacing: '-0.011em',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: 'var(--shadow-md)',
                  transition: 'all var(--transition-base)',
                  marginTop: '16px'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = '#424245';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = 'var(--shadow-lg)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = '#1d1d1f';
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = 'var(--shadow-md)';
                }}
              >
                {showFirstContact ? 'Показать основной отчёт' : 'Показать скрипт первого касания'}
              </button>
            )}
          </div>
          
          {/* Report Card - Only show when NOT viewing script */}
          {!showFirstContact && (
          <div className="card">
          {/* Header Section */}
          <div>
            {(() => {
              const { companyName, inn } = extractCompanyInfo(report.reportText);
              const displayName = companyName || report.companyName;
              const displayInn = inn || report.companyInn;
              
              return (
                <>
            <h1 style={{ fontSize: '48px', fontWeight: 600, marginBottom: '8px' }}>
                    {displayName}
            </h1>
            <p style={{ fontSize: '17px', color: 'var(--text-secondary)' }}>
                    ИНН: {displayInn} • {new Date(report.createdAt).toLocaleDateString('ru-RU')}
              </p>
                </>
              );
            })()}
            </div>

            {/* Action Buttons */}
          <div 
            style={{ 
              marginTop: '24px', 
              display: 'flex',
              gap: '16px',
              flexWrap: 'wrap',
              alignItems: 'center'
            }}
            className="report-actions"
          >
            {/* Save button removed */}
            
            <button 
              onClick={async () => {
                try {
                  const { exportToPDF } = await import('@/utils/exportReport');
                  const { companyName, inn } = extractCompanyInfo(report.reportText);
                  
                  // Проверяем, мобильное устройство или нет
                  const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
                  
                  if (isMobile) {
                    // На мобильных: открываем в новой вкладке
                    const html2pdf = (await import('html2pdf.js')).default;
                    const element = document.createElement('div');
                    const htmlContent = report.reportText
                      .replace(/## (.+)/g, '<h2 style="font-size: 16pt; font-weight: bold; margin-top: 20px; margin-bottom: 10px; color: #1a1a1a;">$1</h2>')
                      .replace(/### (.+)/g, '<h3 style="font-size: 13pt; font-weight: bold; margin-top: 15px; margin-bottom: 8px; color: #333;">$1</h3>')
                      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
                      .replace(/\*(.+?)\*/g, '<em>$1</em>')
                      .replace(/^\s*[-*+]\s+(.+)$/gm, '<li style="margin-left: 20px; margin-bottom: 5px;">$1</li>')
                      .replace(/\n\n/g, '</p><p style="margin: 8px 0; line-height: 1.5;">')
                      .replace(/\n/g, '<br/>');
                    
                    element.innerHTML = `
                      <div style="font-family: 'DejaVu Sans', Arial, sans-serif; padding: 20px; color: #1a1a1a; line-height: 1.6;">
                        <h1 style="font-size: 20pt; font-weight: bold; margin-bottom: 20px; text-align: center; color: #000;">АНАЛИТИЧЕСКИЙ ОТЧЕТ</h1>
                        <div style="background: #f5f5f5; padding: 15px; border-radius: 5px; margin-bottom: 20px;">
                          <p style="margin: 5px 0;"><strong>Компания:</strong> ${companyName || report.companyName}</p>
                          <p style="margin: 5px 0;"><strong>ИНН:</strong> ${inn || report.companyInn}</p>
                          <p style="margin: 5px 0;"><strong>Дата:</strong> ${new Date().toLocaleDateString('ru-RU')}</p>
                        </div>
                        <hr style="border: none; border-top: 2px solid #ddd; margin: 20px 0;" />
                        <div style="font-size: 10pt; line-height: 1.6;">
                          <p style="margin: 8px 0; line-height: 1.5;">${htmlContent}</p>
                        </div>
                      </div>
                    `;
                    
                    const opt = {
                      margin: [10, 15, 10, 15] as [number, number, number, number],
                      image: { type: 'jpeg' as const, quality: 0.98 },
                      html2canvas: { 
                        scale: 2,
                        useCORS: true,
                        letterRendering: true
                      },
                      jsPDF: { 
                        unit: 'mm' as const, 
                        format: 'a4' as const, 
                        orientation: 'portrait' as const,
                        compress: true
                      }
                    };
                    
                    const pdfBlob = await html2pdf().set(opt).from(element).outputPdf('blob');
                    const url = URL.createObjectURL(pdfBlob);
                    window.open(url, '_blank');
                    // URL будет освобожден после закрытия вкладки
                  } else {
                    // На десктопе: скачиваем файл
                    await exportToPDF(
                      companyName || report.companyName, 
                      inn || report.companyInn, 
                      report.reportText
                    );
                  }
                } catch (error) {
                  showToast('Ошибка экспорта в PDF', { variant: 'error' });
                }
              }} 
              className="button-secondary"
              style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
            >
              <svg width="20" height="20" viewBox="0 0 384 512" fill="currentColor">
                <path d="M369.9 97.9L286 14C277 5 264.8-.1 252.1-.1H48C21.5 0 0 21.5 0 48v416c0 26.5 21.5 48 48 48h288c26.5 0 48-21.5 48-48V131.9c0-12.7-5.1-25-14.1-34zM332.1 128H256V51.9l76.1 76.1zM48 464V48h160v104c0 13.3 10.7 24 24 24h104v288H48zm250.2-143.7c-12.2-12-47-8.7-64.4-6.5-17.2-10.5-28.7-25-36.8-46.3 3.9-16.1 10.1-40.6 5.4-56-4.2-26.2-37.8-23.6-42.6-5.9-4.4 16.1-.4 38.5 7 67.1-10 23.9-24.9 56-35.4 74.4-20 10.3-47 26.2-51 46.2-3.3 15.8 26 55.2 76.1-31.2 22.4-7.4 46.8-16.5 68.4-20.1 18.9 10.2 41 17 55.8 17 25.5 0 28-28.2 17.5-38.7zm-198.1 77.8c5.1-13.7 24.5-29.5 30.4-35-19 30.3-24.2 31.6-30.4 35zm81.6-190.6c7.4 0 6.7 32.1 1.8 40.8-4.4-13.9-4.3-40.8-1.8-40.8zm-24.4 136.6c9.7-16.9 18-37 24.7-54.7 8.3 15.1 18.9 27.2 30.1 35.5-20.8 4.3-38.9 13.1-54.8 19.2zm131.6-5s-5 6-37.3-7.8c35.1-2.6 40.9 5.4 37.3 7.8z"/>
              </svg>
              PDF
            </button>
            
            <button 
              onClick={async () => {
                try {
                  const { exportToWord } = await import('@/utils/exportReport');
                  const { companyName, inn } = extractCompanyInfo(report.reportText);
                  await exportToWord(
                    companyName || report.companyName, 
                    inn || report.companyInn, 
                    report.reportText
                  );
                } catch (error) {
                  showToast('Ошибка экспорта в Word', { variant: 'error' });
                }
              }} 
              className="button-secondary"
              style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
            >
              <svg width="20" height="20" viewBox="0 0 384 512" fill="currentColor">
                <path d="M369.9 97.9L286 14C277 5 264.8-.1 252.1-.1H48C21.5 0 0 21.5 0 48v416c0 26.5 21.5 48 48 48h288c26.5 0 48-21.5 48-48V131.9c0-12.7-5.1-25-14.1-34zM332.1 128H256V51.9l76.1 76.1zM48 464V48h160v104c0 13.3 10.7 24 24 24h104v288H48zm220.1-208c-5.7 0-10.6 4-11.7 9.5-20.6 97.7-20.4 95.4-21 103.5-.2-1.2-.4-2.6-.7-4.3-.8-5.1.3.2-23.6-99.5-1.3-5.4-6.1-9.2-11.7-9.2h-13.3c-5.5 0-10.3 3.8-11.7 9.1-24.4 99-24 96.2-24.8 103.7-.1-1.1-.2-2.5-.5-4.2-.7-5.2-14.1-73.3-19.1-99-1.1-5.6-6-9.7-11.8-9.7h-16.8c-7.8 0-13.5 7.3-11.7 14.8 8 32.6 26.7 109.5 33.2 136 1.3 5.4 6.1 9.1 11.7 9.1h25.2c5.5 0 10.3-3.7 11.6-9.1l17.9-71.4c1.5-6.2 2.5-12 3-17.3l2.9 17.3c.1.4 12.6 50.5 17.9 71.4 1.3 5.3 6.1 9.1 11.6 9.1h24.7c5.5 0 10.3-3.7 11.6-9.1 20.8-81.9 30.2-119 34.5-136 1.9-7.6-3.8-14.9-11.6-14.9h-15.8z"/>
              </svg>
              Word
            </button>


            {/* Copy Button */}
            <button 
              onClick={async () => {
                const { copyToClipboard } = await import('@/utils/exportReport');
                const success = await copyToClipboard(report.reportText);
                if (success) {
                  setCopySuccess(true);
                  setTimeout(() => setCopySuccess(false), 2000);
                } else {
                  showToast('Ошибка копирования', { variant: 'error' });
                }
              }} 
              className="button-secondary"
              style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
              title="Копировать текст"
            >
              {copySuccess ? (
                <>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="20 6 9 17 4 12"/>
                  </svg>
                  Скопировано!
                </>
              ) : (
                <>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
                    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
                  </svg>
                  Копировать
                </>
              )}
            </button>
            
            {/* Divider */}
            <div style={{ 
              height: '32px', 
              width: '1px', 
              backgroundColor: 'var(--border-color)' 
            }} />
            
            {/* Messenger buttons */}
            <button
              onClick={() => {
                const { companyName } = extractCompanyInfo(report.reportText);
                const displayName = companyName || report.companyName;
                const shareUrl = `https://metalvector.ru/report/${params.id}`;
                const text = `Отчёт: ${displayName}`;
                window.open(`https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(text)}`, '_blank');
              }}
              className="button-secondary"
              style={{ padding: '8px 16px' }}
              title="Отправить в Telegram"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69.01-.03.01-.14-.07-.2-.08-.06-.19-.04-.27-.02-.12.02-1.99 1.27-5.62 3.72-.53.37-.89.55-1.09.54-.36-.01-1.05-.2-1.56-.37-.63-.2-1.12-.31-1.08-.66.02-.18.27-.36.74-.55 2.92-1.27 4.86-2.11 5.83-2.51 2.78-1.16 3.35-1.36 3.73-1.36.08 0 .27.02.39.12.1.08.13.19.14.27-.01.06.01.24 0 .38z"/>
              </svg>
            </button>
            
            <button
              onClick={() => {
                const { companyName } = extractCompanyInfo(report.reportText);
                const displayName = companyName || report.companyName;
                const shareUrl = `https://metalvector.ru/report/${params.id}`;
                const text = `Отчёт: ${displayName}`;
                window.open(`https://wa.me/?text=${encodeURIComponent(text + ' ' + shareUrl)}`, '_blank');
              }}
              className="button-secondary"
              style={{ padding: '8px 16px' }}
              title="Отправить в WhatsApp"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
              </svg>
            </button>
            
            {/* Delete Button */}
            <button 
              onClick={() => setShowDeleteModal(true)}
              className="button-secondary"
              style={{ padding: '8px 16px', color: 'var(--text-primary)', fontWeight: '600' }}
              title="Удалить"
            >
              🗑️
            </button>
          </div>

            {/* Divider */}
          <div style={{ 
            borderTop: '1px solid var(--border-color)', 
            margin: '32px 0' 
          }} />

            {/* Report Text */}
            <div 
              className="markdown-content"
              style={{
              lineHeight: '1.8',
            fontSize: '17px',
            color: 'var(--text-tertiary)'
              }}
            >
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{
                  // Main sections (## with emojis)
                  h2: ({node, ...props}) => {
                    const textContent = getHeaderText(props.children).trim();
                      
                    // STEP 2: Debug - Show original text and cleaning process
                    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━');
                    console.log('[H2 DEBUG] ORIGINAL:', textContent);
                    console.log('[H2 DEBUG] Original bytes:', Array.from(textContent).map(c => c.charCodeAt(0)));
                      
                    // Remove emojis (ES5-compatible version)
                    const noEmojis = textContent
                      .replace(/[\uD800-\uDBFF][\uDC00-\uDFFF]/g, '') // Surrogate pairs (emojis)
                      .replace(/[\u2600-\u26FF\u2700-\u27BF]/g, ''); // Other symbols
                    console.log('[H2 DEBUG] After emoji removal:', noEmojis);
                      
                    // Normalize spacing
                    const normalized = noEmojis.replace(/\s+/g, ' ').trim();
                    console.log('[H2 DEBUG] After normalization:', normalized);
                      
                    // Convert to lowercase
                    const cleanText = normalized.toLowerCase();
                    console.log('[H2 DEBUG] CLEAN TEXT:', cleanText);
                    console.log('[H2 DEBUG] Clean bytes:', Array.from(cleanText).map(c => c.charCodeAt(0)));
                      
                    // STEP 3: Comprehensive mapping with ALL variations
                    const titleMapping: Record<string, string> = {
                      // Financial Analysis variations
                      'финансовый анализ': 'financial-analysis',
                      'финансовый анализ и надежность компании': 'financial-analysis',
                      'финансовое состояние': 'financial-analysis',
                      'надежность компании': 'financial-analysis',
                      'финансовая устойчивость': 'financial-analysis',
                      
                      // Procurement variations
                      'анализ закупочной деятельности': 'procurement',
                      'закупочная деятельность': 'procurement',
                      'закупки': 'procurement',
                      'закуп': 'procurement',
                      
                      // High-margin variations
                      'выявление высокомаржинальных и редких позиций': 'high-margin',
                      'высокомаржинальные позиции': 'high-margin',
                      'маржинальные позиции': 'high-margin',
                      'редкие позиции': 'high-margin',
                      'высокомаржинальных': 'high-margin',
                      'маржинальных': 'high-margin',
                      
                      // Strategy variations
                      'инсайты и стратегия взаимодействия': 'strategy',
                      'стратегия взаимодействия': 'strategy',
                      'инсайты': 'strategy',
                      'взаимодействие': 'strategy',
                      
                      // Recommendations variations
                      'ключевые рекомендации': 'recommendations',
                      'рекомендации': 'recommendations',
                      'выводы': 'recommendations'
                    };
                      
                    // Find matching ID - try exact match first, then partial
                    let customId: string | undefined;
                      
                    // Try exact match first
                    if (titleMapping[cleanText]) {
                      customId = titleMapping[cleanText];
                      console.log(`[H2 DEBUG] ✅ EXACT MATCH: "${cleanText}" → ${customId}`);
                    } else {
                      // Try partial match (contains)
                      for (const [keyword, id] of Object.entries(titleMapping)) {
                        if (cleanText.includes(keyword)) {
                          customId = id;
                          console.log(`[H2 DEBUG] ✅ PARTIAL MATCH: "${keyword}" in "${cleanText}" → ${customId}`);
                          break;
                        }
                      }
                    }
                    
                    if (!customId) {
                      console.error(`[H2 DEBUG] ❌ NO MATCH FOUND for: "${cleanText}"`);
                      console.log('[H2 DEBUG] Available keywords:', Object.keys(titleMapping));
                    }
                    console.log('━━━━━━━━━━━━━━━━━━━━━━━━\n');

                    return (
                      <h2 
                        id={customId}
                        style={{
                          fontSize: '32px',
                          fontWeight: '700',
                          marginTop: '0',
                          marginBottom: '24px',
                          color: 'var(--text-primary)',
                          paddingBottom: '12px',
                          borderBottom: '2px solid var(--border-color)',
                          scrollMarginTop: '96px'
                        }} 
                        {...props}
                      >
                        {props.children}
                      </h2>
                    );
                  },
                  
                  // Subsections (###)
                  h3: ({node, ...props}) => (
                    <h3 style={{
                      fontSize: '24px',
                      fontWeight: '700',
                      marginTop: '0',
                      marginBottom: '16px',
                      color: 'var(--text-primary)'
                    }} {...props} />
                  ),
                  
                  // Bold (**text**)
                  strong: ({node, ...props}) => (
                    <strong style={{
                      fontWeight: '700',
                      color: 'var(--text-primary)'
                    }} {...props} />
                  ),
                  
                  // Italic (*text*)
                  em: ({node, ...props}) => (
                    <em style={{
                      fontStyle: 'italic',
                      color: 'var(--text-secondary)'
                    }} {...props} />
                  ),
                  
                  // Paragraphs
                  p: ({node, ...props}) => (
                    <p style={{
                      marginTop: '0',
                      marginBottom: '16px',
                      lineHeight: '1.7',
                      color: 'var(--text-primary)'
                    }} {...props} />
                  ),
                  
                  // Lists
                  ul: ({node, ...props}) => (
                    <ul style={{
                      listStyleType: 'disc',
                      paddingLeft: '32px',
                      marginTop: '0',
                      marginBottom: '16px'
                    }} {...props} />
                  ),
                  
                  ol: ({node, ...props}) => (
                    <ol style={{
                      listStyleType: 'decimal',
                      paddingLeft: '32px',
                      marginTop: '0',
                      marginBottom: '16px'
                    }} {...props} />
                  ),
                  
                  li: ({node, ...props}) => (
                    <li style={{
                      marginBottom: '8px',
                      lineHeight: '1.6',
                      color: 'var(--text-primary)'
                    }} {...props} />
                  ),
                  
                  // Tables
                  table: ({node, ...props}) => (
                    <div style={{ overflowX: 'auto', marginTop: '0', marginBottom: '24px' }}>
                      <table style={{
                        width: '100%',
                        borderCollapse: 'collapse',
                        border: '1px solid var(--border-color)'
                      }} {...props} />
                    </div>
                  ),
                  
                  th: ({node, ...props}) => (
                    <th style={{
                      border: '1px solid var(--border-color)',
                      padding: '12px 16px',
                      backgroundColor: 'var(--background-secondary)',
                      fontWeight: '700',
                      textAlign: 'left',
                      color: 'var(--text-primary)'
                    }} {...props} />
                  ),
                  
                  td: ({node, ...props}) => (
                    <td style={{
                      border: '1px solid var(--border-color)',
                      padding: '12px 16px',
                      color: 'var(--text-primary)'
                    }} {...props} />
                  ),
                  
                  // Dividers
                  hr: ({node, ...props}) => (
                    <hr style={{
                      border: 'none',
                      borderTop: '2px solid var(--border-color)',
                      marginTop: '0',
                      marginBottom: '32px'
                    }} {...props} />
                  ),
                }}
              >
                {report.reportText}
              </ReactMarkdown>
            </div>

          </div>
          )}
          
          {/* Script Card - Only show when viewing script */}
          {showFirstContact && report.firstContactExample && (() => {
            const { companyName } = extractCompanyInfo(report.reportText);
            const displayName = companyName || report.companyName;
            
            return (
              <div className="card">
                {/* Header Section */}
                <div>
                  <h1 style={{ fontSize: '48px', fontWeight: 600, marginBottom: '8px' }}>
                    Скрипт первого касания для {displayName}
                  </h1>
                </div>

                {/* Action Buttons */}
                <div 
                  style={{ 
                    marginTop: '24px', 
                    display: 'flex',
                    gap: '16px',
                    flexWrap: 'wrap',
                    alignItems: 'center'
                  }}
                  className="report-actions"
                >
                  {/* Back Button */}
                  <button 
                    onClick={() => setShowFirstContact(false)}
                    className="button-secondary"
                    style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M19 12H5M12 19l-7-7 7-7"/>
                    </svg>
                    Назад к отчёту
                  </button>
                  
                  {/* Divider */}
                  <div style={{ 
                    height: '32px', 
                    width: '1px', 
                    backgroundColor: 'var(--border-color)' 
                  }} />
                  
                  <button 
                    onClick={async () => {
                      try {
                        const { exportToPDF } = await import('@/utils/exportReport');
                        const { companyName, inn } = extractCompanyInfo(report.reportText);
                        
                        // Проверяем, мобильное устройство или нет
                        const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
                        
                        if (isMobile) {
                          // На мобильных: открываем в новой вкладке
                          const html2pdf = (await import('html2pdf.js')).default;
                          const element = document.createElement('div');
                          const htmlContent = (report.firstContactExample || '')
                            .replace(/## (.+)/g, '<h2 style="font-size: 16pt; font-weight: bold; margin-top: 20px; margin-bottom: 10px; color: #1a1a1a;">$1</h2>')
                            .replace(/### (.+)/g, '<h3 style="font-size: 13pt; font-weight: bold; margin-top: 15px; margin-bottom: 8px; color: #333;">$1</h3>')
                            .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
                            .replace(/\*(.+?)\*/g, '<em>$1</em>')
                            .replace(/^\s*[-*+]\s+(.+)$/gm, '<li style="margin-left: 20px; margin-bottom: 5px;">$1</li>')
                            .replace(/\n\n/g, '</p><p style="margin: 8px 0; line-height: 1.5;">')
                            .replace(/\n/g, '<br/>');
                          
                          element.innerHTML = `
                            <div style="font-family: 'DejaVu Sans', Arial, sans-serif; padding: 20px; color: #1a1a1a; line-height: 1.6;">
                              <h1 style="font-size: 20pt; font-weight: bold; margin-bottom: 20px; text-align: center; color: #000;">Скрипт первого касания - ${companyName || report.companyName}</h1>
                              <div style="background: #f5f5f5; padding: 15px; border-radius: 5px; margin-bottom: 20px;">
                                <p style="margin: 5px 0;"><strong>Компания:</strong> ${companyName || report.companyName}</p>
                                <p style="margin: 5px 0;"><strong>ИНН:</strong> ${inn || report.companyInn}</p>
                                <p style="margin: 5px 0;"><strong>Дата:</strong> ${new Date().toLocaleDateString('ru-RU')}</p>
                              </div>
                              <hr style="border: none; border-top: 2px solid #ddd; margin: 20px 0;" />
                              <div style="font-size: 10pt; line-height: 1.6;">
                                <p style="margin: 8px 0; line-height: 1.5;">${htmlContent}</p>
                              </div>
                            </div>
                          `;
                          
                          const opt = {
                            margin: [10, 15, 10, 15] as [number, number, number, number],
                            image: { type: 'jpeg' as const, quality: 0.98 },
                            html2canvas: { 
                              scale: 2,
                              useCORS: true,
                              letterRendering: true
                            },
                            jsPDF: { 
                              unit: 'mm' as const, 
                              format: 'a4' as const, 
                              orientation: 'portrait' as const,
                              compress: true
                            }
                          };
                          
                          const pdfBlob = await html2pdf().set(opt).from(element).outputPdf('blob');
                          const url = URL.createObjectURL(pdfBlob);
                          window.open(url, '_blank');
                          // URL будет освобожден после закрытия вкладки
                        } else {
                          // На десктопе: скачиваем файл
                          await exportToPDF(
                            `Скрипт первого касания - ${companyName || report.companyName}`, 
                            inn || report.companyInn, 
                            report.firstContactExample || ''
                          );
                        }
                      } catch (error) {
                        showToast('Ошибка экспорта в PDF', { variant: 'error' });
                      }
                    }} 
                    className="button-secondary"
                    style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
                  >
                    <svg width="20" height="20" viewBox="0 0 384 512" fill="currentColor">
                      <path d="M369.9 97.9L286 14C277 5 264.8-.1 252.1-.1H48C21.5 0 0 21.5 0 48v416c0 26.5 21.5 48 48 48h288c26.5 0 48-21.5 48-48V131.9c0-12.7-5.1-25-14.1-34zM332.1 128H256V51.9l76.1 76.1zM48 464V48h160v104c0 13.3 10.7 24 24 24h104v288H48zm250.2-143.7c-12.2-12-47-8.7-64.4-6.5-17.2-10.5-28.7-25-36.8-46.3 3.9-16.1 10.1-40.6 5.4-56-4.2-26.2-37.8-23.6-42.6-5.9-4.4 16.1-.4 38.5 7 67.1-10 23.9-24.9 56-35.4 74.4-20 10.3-47 26.2-51 46.2-3.3 15.8 26 55.2 76.1-31.2 22.4-7.4 46.8-16.5 68.4-20.1 18.9 10.2 41 17 55.8 17 25.5 0 28-28.2 17.5-38.7zm-198.1 77.8c5.1-13.7 24.5-29.5 30.4-35-19 30.3-24.2 31.6-30.4 35zm81.6-190.6c7.4 0 6.7 32.1 1.8 40.8-4.4-13.9-4.3-40.8-1.8-40.8zm-24.4 136.6c9.7-16.9 18-37 24.7-54.7 8.3 15.1 18.9 27.2 30.1 35.5-20.8 4.3-38.9 13.1-54.8 19.2zm131.6-5s-5 6-37.3-7.8c35.1-2.6 40.9 5.4 37.3 7.8z"/>
                    </svg>
                    PDF
                  </button>

                  {/* Copy Button */}
                  <button 
                    onClick={async () => {
                      const { copyToClipboard } = await import('@/utils/exportReport');
                      const success = await copyToClipboard(report.firstContactExample || '');
                      if (success) {
                        setCopySuccess(true);
                        setTimeout(() => setCopySuccess(false), 2000);
                      } else {
                        showToast('Ошибка копирования', { variant: 'error' });
                      }
                    }} 
                    className="button-secondary"
                    style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
                    title="Копировать скрипт"
                  >
                    {copySuccess ? (
                      <>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <polyline points="20 6 9 17 4 12"/>
                        </svg>
                        Скопировано!
                      </>
                    ) : (
                      <>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
                          <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
                        </svg>
                        Копировать
                      </>
                    )}
                  </button>
                  
                  {/* Divider */}
                  <div style={{ 
                    height: '32px', 
                    width: '1px', 
                    backgroundColor: 'var(--border-color)' 
                  }} />
                  
                  {/* Messenger buttons */}
                  <button
                    onClick={() => {
                      const { companyName } = extractCompanyInfo(report.reportText);
                      const displayName = companyName || report.companyName;
                      const shareUrl = `https://metalvector.ru/report/${params.id}`;
                      const text = `Отчёт: ${displayName}`;
                      window.open(`https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(text)}`, '_blank');
                    }}
                    className="button-secondary"
                    style={{ padding: '8px 16px' }}
                    title="Отправить в Telegram"
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69.01-.03.01-.14-.07-.2-.08-.06-.19-.04-.27-.02-.12.02-1.99 1.27-5.62 3.72-.53.37-.89.55-1.09.54-.36-.01-1.05-.2-1.56-.37-.63-.2-1.12-.31-1.08-.66.02-.18.27-.36.74-.55 2.92-1.27 4.86-2.11 5.83-2.51 2.78-1.16 3.35-1.36 3.73-1.36.08 0 .27.02.39.12.1.08.13.19.14.27-.01.06.01.24 0 .38z"/>
                    </svg>
                  </button>
                  
                  <button
                    onClick={() => {
                      const { companyName } = extractCompanyInfo(report.reportText);
                      const displayName = companyName || report.companyName;
                      const shareUrl = `https://metalvector.ru/report/${params.id}`;
                      const text = `Отчёт: ${displayName}`;
                      window.open(`https://wa.me/?text=${encodeURIComponent(text + ' ' + shareUrl)}`, '_blank');
                    }}
                    className="button-secondary"
                    style={{ padding: '8px 16px' }}
                    title="Отправить в WhatsApp"
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                    </svg>
                  </button>
                </div>

                {/* Divider */}
                <div style={{ 
                  borderTop: '1px solid var(--border-color)', 
                  margin: '32px 0' 
                }} />

                {/* Script Content */}
                <div 
                  className="markdown-content"
                  style={{
                    lineHeight: '1.8',
                    fontSize: '17px',
                    color: 'var(--text-primary)'
                  }}
                >
                  <ReactMarkdown
                    remarkPlugins={[remarkGfm]}
                    components={{
                      // Main headings (##)
                      h2: ({node, ...props}) => (
                        <h2 style={{
                          fontSize: '28px',
                          fontWeight: '700',
                          marginTop: '0',
                          marginBottom: '20px',
                          color: 'var(--text-primary)',
                          paddingBottom: '12px',
                          borderBottom: '2px solid var(--border-color)'
                        }} {...props} />
                      ),
                      
                      // Subsections (###)
                      h3: ({node, ...props}) => (
                        <h3 style={{
                          fontSize: '22px',
                          fontWeight: '700',
                          marginTop: '0',
                          marginBottom: '16px',
                          color: 'var(--text-primary)'
                        }} {...props} />
                      ),
                      
                      // Bold (**text**)
                      strong: ({node, ...props}) => (
                        <strong style={{
                          fontWeight: '700',
                          color: 'var(--text-primary)'
                        }} {...props} />
                      ),
                      
                      // Italic (*text*)
                      em: ({node, ...props}) => (
                        <em style={{
                          fontStyle: 'italic',
                          color: 'var(--text-secondary)'
                        }} {...props} />
                      ),
                      
                      // Paragraphs
                      p: ({node, ...props}) => (
                        <p style={{
                          marginTop: '0',
                          marginBottom: '16px',
                          lineHeight: '1.7',
                          color: 'var(--text-primary)'
                        }} {...props} />
                      ),
                      
                      // Unordered lists
                      ul: ({node, ...props}) => (
                        <ul style={{
                          listStyleType: 'disc',
                          paddingLeft: '32px',
                          marginTop: '0',
                          marginBottom: '16px'
                        }} {...props} />
                      ),
                      
                      // Ordered lists
                      ol: ({node, ...props}) => (
                        <ol style={{
                          listStyleType: 'decimal',
                          paddingLeft: '32px',
                          marginTop: '0',
                          marginBottom: '16px'
                        }} {...props} />
                      ),
                      
                      // List items
                      li: ({node, ...props}) => (
                        <li style={{
                          marginBottom: '8px',
                          lineHeight: '1.6',
                          color: 'var(--text-primary)'
                        }} {...props} />
                      ),
                      
                      // Tables
                      table: ({node, ...props}) => (
                        <div style={{ overflowX: 'auto', marginTop: '0', marginBottom: '24px' }}>
                          <table style={{
                            width: '100%',
                            borderCollapse: 'collapse',
                            border: '1px solid var(--border-color)'
                          }} {...props} />
                        </div>
                      ),
                      
                      th: ({node, ...props}) => (
                        <th style={{
                          border: '1px solid var(--border-color)',
                          padding: '12px 16px',
                          backgroundColor: 'var(--background-secondary)',
                          fontWeight: '700',
                          textAlign: 'left',
                          color: 'var(--text-primary)'
                        }} {...props} />
                      ),
                      
                      td: ({node, ...props}) => (
                        <td style={{
                          border: '1px solid var(--border-color)',
                          padding: '12px 16px',
                          color: 'var(--text-primary)'
                        }} {...props} />
                      ),
                      
                      // Dividers
                      hr: ({node, ...props}) => (
                        <hr style={{
                          border: 'none',
                          borderTop: '2px solid var(--border-color)',
                          marginTop: '0',
                          marginBottom: '32px'
                        }} {...props} />
                      ),
                    }}
                  >
                    {report.firstContactExample}
                  </ReactMarkdown>
                </div>
              </div>
            );
          })()}
        </div>
      </main>

      {/* Delete Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="relative w-full max-w-lg mx-4 bg-white rounded-2xl shadow-2xl px-10 py-8">
            <button onClick={() => setShowDeleteModal(false)} aria-label="Закрыть" className="absolute top-6 right-6 text-gray-400 hover:text-black transition-colors">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
            <h3 className="text-2xl font-semibold text-black mb-4">Удалить отчёт?</h3>
            <p className="text-base text-[#1d1d1f] leading-relaxed mb-8">Это действие нельзя отменить. Отчёт будет удалён навсегда.</p>
            <div className="flex gap-4">
              <button onClick={() => setShowDeleteModal(false)} className="bg-transparent text-gray-600 hover:text-black rounded-xl px-8 py-3 font-medium transition-colors">Отмена</button>
              <button onClick={handleDelete} className="bg-black text-white hover:bg-gray-800 rounded-xl px-8 py-3 font-medium transition-colors">Удалить</button>
            </div>
          </div>
        </div>
      )}


      {/* Scroll to Top Button */}
      <ScrollToTop />

      {/* Responsive Styles */}
      <style jsx global>{`
        .markdown-content h1,
        .markdown-content h2,
        .markdown-content h3 {
          font-weight: 600;
          margin-top: 32px;
          margin-bottom: 16px;
          color: var(--text-primary);
        }
        
        .markdown-content h1 { 
          font-size: 28px;
        }
        .markdown-content h2 { 
          font-size: 24px;
        }
        .markdown-content h3 { 
          font-size: 20px;
        }
        
        .markdown-content p {
          margin-bottom: 16px;
        }
        
        .markdown-content strong {
          font-weight: 600;
          color: var(--text-primary);
        }
        
        .markdown-content ul,
        .markdown-content ol {
          margin-left: 24px;
          margin-bottom: 16px;
        }
        
        .markdown-content li {
          margin-bottom: 8px;
        }
        
        .markdown-content table {
          width: 100%;
          border-collapse: collapse;
          margin: 24px 0;
        }
        
        .markdown-content table th,
        .markdown-content table td {
          padding: 12px;
          text-align: left;
          border: 1px solid var(--border-color);
        }
        
        .markdown-content table th {
          background: var(--background-secondary);
          font-weight: 600;
        }
        
        @media (max-width: 768px) {
          .report-content {
            font-size: 16px;
            line-height: 1.6;
            padding: 16px;
          }
          
          .card {
            padding: 20px;
          }
          
          main.container {
            padding: 16px;
          }
          
          .report-actions {
            flex-direction: column !important;
          }
          
          .report-actions button,
          button.button-secondary,
          button.button-primary {
            min-height: 44px !important;
            padding: 16px 24px !important;
          }
          
          .report-actions button {
            width: 100%;
          }
          
          .report-layout > div:first-child {
            position: relative !important;
            top: 0 !important;
          }
        }
      `}</style>
    </>
  );
}
