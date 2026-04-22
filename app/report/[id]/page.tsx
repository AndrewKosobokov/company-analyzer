'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import ScrollToTop from '@/components/ScrollToTop';
import ReportTOC from '@/app/components/ReportTOC';
import { useToast } from '@/components/ui/ToastProvider';
import { useAuth } from '@/app/context/AuthContext';
import { wrapCallInfoSection } from '@/utils/markdownFormatter';

interface ReportData {
  id: string;
  companyName: string;
  companyInn: string;
  reportText: string;
  firstContactExample?: string | null;
  createdAt: string;
  analysisType?: string | null;
}

type CompanyDetails = {
  ogrn: string | null;
  inn: string | null;
  kpp: string | null;
  capital: string | null;
  activity: string | null;
  address: string | null;
  director: string | null;
};

function sanitizeReportText(reportText: string): string {
  return reportText.replace(/^["']?\s*Анализирую компанию с ИНН[^\n]*["']?\s*\n+/i, '');
}

// Extract company info from report text
function extractCompanyInfo(reportText: string): { companyName: string | null; inn: string | null } {
  reportText = sanitizeReportText(reportText);

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
const companyNavigationItems = [
  { id: 'call-info', title: 'Информация для звонка' },
  { id: 'financial-analysis', title: 'Финансовый Анализ' },
  { id: 'procurement', title: 'Закупки' },
  { id: 'high-margin', title: 'Маржинальные позиции' },
  { id: 'strategy', title: 'Стратегия Взаимодействия' },
  { id: 'recommendations', title: 'Ключевые Рекомендации' },
];

const productNavigationItems = [
  { id: 'analysis', title: 'Анализ и Стратификация' },
  { id: 'enterprises', title: 'Список целевых предприятий' },
  { id: 'sales-strategy', title: 'Таблица стратегии продаж' },
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
  const [companyDetails, setCompanyDetails] = useState<CompanyDetails | null>(null);
  const { showToast } = useToast();
  const { logout } = useAuth();
  const isProductAnalysis = !report?.companyInn || report?.companyInn === '';
  const navigationItems = isProductAnalysis ? productNavigationItems : companyNavigationItems;
  const reportText = sanitizeReportText(report?.reportText || '');
  
  // Оборачиваем раздел "ИНФОРМАЦИЯ ДЛЯ ЗВОНКА" в HTML-блок для стилизации
  const processedMarkdown = wrapCallInfoSection(reportText);
  
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
      try {
        const res = await fetch('/api/auth/status', {
          credentials: 'include'
        });
        if (!res.ok) return;
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
          credentials: 'include'
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

  useEffect(() => {
    const fetchCompanyDetails = async () => {
      if (!report) {
        setCompanyDetails(null);
        return;
      }

      const { inn } = extractCompanyInfo(report.reportText);
      const displayInn = inn || report.companyInn;

      if (!displayInn) {
        setCompanyDetails(null);
        return;
      }

      try {
        const response = await fetch(`/api/company/dadata?inn=${encodeURIComponent(displayInn)}`);
        if (!response.ok) {
          setCompanyDetails(null);
          return;
        }

        const data: CompanyDetails = await response.json();
        const hasAnyValue = Object.values(data).some(value => value !== null);
        setCompanyDetails(hasAnyValue ? data : null);
      } catch (error) {
        setCompanyDetails(null);
      }
    };

    fetchCompanyDetails();
  }, [report]);


  // STEP 1: Debug - Show actual h2 headers from report
  useEffect(() => {
    if (report?.reportText) {
      console.log('\n=== FULL REPORT TEXT ===');
      console.log(reportText);
      console.log('=== END REPORT ===\n');
      
      // Extract all h2 headers from markdown
      const h2Matches = reportText.match(/^##\s+.+$/gm);
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
  }, [report, reportText]);

  const handleDelete = async () => {
    try {
      const response = await fetch(`/api/analysis/manage`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
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
      <>
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
      </>
    );
  }
  
  // Error State
  if (error || !report) {
    return (
      <>
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
          {/* Left Column: TOC */}
          <div style={{
            position: 'sticky',
            top: '96px',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px',
            alignSelf: 'flex-start'
          }}>
            {/* Table of Contents */}
            <ReportTOC items={navigationItems} />
          </div>
          
          {/* Report Card */}
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
                  {companyDetails && (
                    <div style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                      gap: '16px',
                      margin: '20px 0',
                      padding: '20px',
                      background: 'var(--background-secondary)',
                      borderRadius: '12px',
                      border: '1px solid var(--border-color)'
                    }}>
                      {[
                        { label: 'ОГРН', value: companyDetails.ogrn },
                        { label: 'ИНН / КПП', value: companyDetails.inn && companyDetails.kpp ? `${companyDetails.inn} / ${companyDetails.kpp}` : companyDetails.inn },
                        { label: 'Уставный капитал', value: companyDetails.capital },
                        { label: 'Основной вид деятельности', value: companyDetails.activity },
                        { label: 'Юридический адрес', value: companyDetails.address },
                        { label: 'Руководитель', value: companyDetails.director },
                      ].filter(item => item.value).map(item => (
                        <div key={item.label}>
                          <div style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '4px' }}>{item.label}</div>
                          <div style={{ fontSize: '15px', color: 'var(--text-primary)', fontWeight: 700 }}>{item.value}</div>
                        </div>
                      ))}
                    </div>
                  )}
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
            
            {/* Кнопка Печать */}
            <button 
              onClick={() => window.print()}
              className="button-secondary no-print"
              style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
            >
              <svg width="20" height="20" viewBox="0 0 512 512" fill="currentColor">
                <path d="M128 0C92.7 0 64 28.7 64 64v96h64V64H354.7L384 93.3V160h64V93.3c0-17-6.7-33.3-18.7-45.3L400 18.7C388 6.7 371.7 0 354.7 0H128zM384 352v32 64H128V384 368 352H384zm64 32h32c17.7 0 32-14.3 32-32V256c0-35.3-28.7-64-64-64H64c-35.3 0-64 28.7-64 64v96c0 17.7 14.3 32 32 32H64v64c0 35.3 28.7 64 64 64H384c35.3 0 64-28.7 64-64V384zM432 248a24 24 0 1 1 0 48 24 24 0 1 1 0-48z"/>
              </svg>
              Печать
            </button>
            
            {/* Кнопка PDF */}
            <button 
              onClick={() => {
                window.open(`/api/export/pdf?id=${report.id}`, '_blank');
              }}
              className="button-secondary no-print"
              style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
            >
              <svg width="20" height="20" viewBox="0 0 384 512" fill="currentColor">
                <path d="M64 0C28.7 0 0 28.7 0 64V448c0 35.3 28.7 64 64 64H320c35.3 0 64-28.7 64-64V160H256c-17.7 0-32-14.3-32-32V0H64zM256 0V128H384L256 0zM112 256H272c8.8 0 16 7.2 16 16s-7.2 16-16 16H112c-8.8 0-16-7.2-16-16s7.2-16 16-16zm0 64H272c8.8 0 16 7.2 16 16s-7.2 16-16 16H112c-8.8 0-16-7.2-16-16s7.2-16 16-16zm0 64H272c8.8 0 16 7.2 16 16s-7.2 16-16 16H112c-8.8 0-16-7.2-16-16s7.2-16 16-16z"/>
              </svg>
              PDF
            </button>
            
            {/* Word Button */}
            <button 
              onClick={async () => {
                const { companyName, inn } = extractCompanyInfo(report.reportText);
                const displayName = companyName || report.companyName;
                const displayInn = inn || report.companyInn;
                const { exportToWord } = await import('@/utils/exportReport');
                await exportToWord(displayName, displayInn, reportText);
              }}
              className="button-secondary"
              style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
              title="Скачать Word"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                <polyline points="14 2 14 8 20 8"/>
                <path d="M9 13h6"/><path d="M9 17h6"/>
              </svg>
              Word
            </button>

            {/* Copy Button */}
            <button 
              onClick={async () => {
                const { copyToClipboard } = await import('@/utils/exportReport');
                const success = await copyToClipboard(reportText);
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
                const shareUrl = `https://metalvector.ru/public/report/${params.id}`;
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
                const shareUrl = `https://metalvector.ru/public/report/${params.id}`;
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

              {/* Обложка для печати */}
              <div className="report-cover print-only">
                {(() => {
                  const { companyName, inn } = extractCompanyInfo(report.reportText);
                  const displayName = companyName || report.companyName;
                  const displayInn = inn || report.companyInn;
                  
                  return (
                    <>
                      <h1>АНАЛИТИЧЕСКИЙ ОТЧЁТ</h1>
                      <div className="company-name">{displayName}</div>
                      {displayInn && <div className="inn">ИНН: {displayInn}</div>}
                      <div className="date">
                        {new Date(report.createdAt).toLocaleDateString('ru-RU', {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric'
                        })}
                      </div>
                    </>
                  );
                })()}
              </div>

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
                rehypePlugins={[rehypeRaw]}
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
                  
                  // Detect inline anchor {#id}
                  const anchorMatch = normalized.match(/\{#([a-z0-9\-]+)\}\s*$/i);
                  const normalizedWithoutAnchors = normalized.replace(/\s*\{#([^\}]+)\}\s*$/i, '').trim();
                      
                    // Convert to lowercase
                  const cleanText = normalizedWithoutAnchors.toLowerCase();
                    console.log('[H2 DEBUG] CLEAN TEXT:', cleanText);
                    console.log('[H2 DEBUG] Clean bytes:', Array.from(cleanText).map(c => c.charCodeAt(0)));
                      
                    // STEP 3: Comprehensive mapping with ALL variations
                    const titleMapping: Record<string, string> = {
                      // Call Info variations
                      'информация для звонка': 'call-info',
                      'боевая карточка для звонка': 'call-info',
                      'боевая карточка': 'call-info',
                      
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
                      'выводы': 'recommendations',
                      
                      // Product analysis variations
                      'анализ и стратификация': 'analysis',
                      'анализа и стратификация': 'analysis',
                      'список целевых предприятий': 'enterprises',
                      'таблица стратегии продаж': 'sales-strategy',
                      
                      // Visualization
                      'визуализация стратегии': 'visualization',
                      'визуализация стратегии mind map': 'visualization'
                    };
                      
                    // Find matching ID - try exact match first, then partial
                    let customId: string | undefined = anchorMatch ? anchorMatch[1] : undefined;
                      
                    // Try exact match first
                    if (!customId && titleMapping[cleanText]) {
                      customId = titleMapping[cleanText];
                      console.log(`[H2 DEBUG] ✅ EXACT MATCH: "${cleanText}" → ${customId}`);
                    } else if (!customId) {
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

                    // Специальное выделение для раздела "ИНФОРМАЦИЯ ДЛЯ ЗВОНКА"
                    if (customId === 'call-info' || cleanText.includes('информация для звонка') || cleanText.includes('боевая карточка')) {
                      return (
                        <h2 
                          id={customId || 'call-info'}
                          style={{
                            fontSize: '26px',
                            fontWeight: '700',
                            color: '#1D1D1F',
                            margin: '0 0 12px 0',
                            letterSpacing: '-0.5px',
                            scrollMarginTop: '96px'
                          }}
                        >
                          {props.children}
                        </h2>
                      );
                    }

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
                  
                  code: ({ node, inline, children, ...props }: any) => {
                    if (inline) {
                      return (
                        <code
                          style={{
                            background: '#F5F5F7',
                            padding: '2px 6px',
                            borderRadius: '4px',
                            fontSize: '14px',
                            fontFamily: 'Monaco, Courier, monospace',
                          }}
                          {...props}
                        >
                          {children}
                        </code>
                      );
                    }
                    
                    return (
                      <code
                        style={{
                          display: 'block',
                          background: '#F5F5F7',
                          padding: '16px',
                          borderRadius: '8px',
                          fontSize: '14px',
                          fontFamily: 'Monaco, Courier, monospace',
                          overflowX: 'auto',
                          marginBottom: '16px',
                        }}
                        {...props}
                      >
                        {children}
                      </code>
                    );
                  },
                  
                  // Tables
                  table: ({node, ...props}) => (
                    <div style={{ overflowX: 'auto', marginTop: '0', marginBottom: '24px' }}>
                      <table style={{
                        width: '100%',
                        tableLayout: 'fixed',
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
                      color: 'var(--text-primary)',
                      wordBreak: 'break-word',
                      overflowWrap: 'break-word',
                      whiteSpace: 'normal'
                    }} {...props} />
                  ),
                  
                  // Images - не рендерить пустые/битые (черный квадрат в PDF)
                  img: ({node, src, ...props}: any) => {
                    if (!src || src.trim() === '') return null;
                    return <img src={src} alt={props.alt || ''} loading="lazy" className="report-img" {...props} />;
                  },

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
                {processedMarkdown || ''}
              </ReactMarkdown>
              </div>
            </div>
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

      {/* Маркер для Puppeteer - показывает что страница загружена */}
      <div 
        id="report-ready-marker" 
        style={{ display: 'none' }}
        data-ready="true"
      />

      {/* Responsive Styles */}
      <style jsx global>{`
        /* Offset для якорей (учитывает высоту Header ~80px + отступ) */
        .markdown-content [id],
        .markdown-content h2[id],
        .markdown-content h3[id] {
          scroll-margin-top: 96px;
        }

        /* Стилизация раздела "ИНФОРМАЦИЯ ДЛЯ ЗВОНКА" через HTML wrapper */
        .markdown-content .call-info-section {
          background-color: #FFF9E6;
          border-left: 4px solid #FF9500;
          padding: 28px;
          border-radius: 8px;
          margin: 40px 0;
          box-shadow: 0 2px 8px rgba(255, 149, 0, 0.1);
        }

        .markdown-content .call-info-section h2 {
          font-size: 26px;
          font-weight: 700;
          color: #1D1D1F;
          margin: 0 0 12px 0;
          letter-spacing: -0.5px;
        }

        .markdown-content .call-info-section h3 {
          font-size: 18px;
          font-weight: 600;
          color: #1D1D1F;
          margin: 24px 0 12px 0;
        }

        /* Разделитель между подразделами */
        .markdown-content .call-info-section h3:not(:first-of-type) {
          border-top: 1px solid rgba(255, 149, 0, 0.15);
          padding-top: 20px;
        }

        .markdown-content .call-info-section p,
        .markdown-content .call-info-section ul,
        .markdown-content .call-info-section ol {
          color: #1D1D1F;
          line-height: 1.6;
          margin-bottom: 16px;
        }
        
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
          table-layout: fixed;
          border-collapse: collapse;
          margin: 24px 0;
        }
        
        .markdown-content table th,
        .markdown-content table td {
          padding: 12px;
          text-align: left;
          border: 1px solid var(--border-color);
          word-break: break-word;
          overflow-wrap: break-word;
          white-space: normal;
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
        
        @media print {
          /* СКРЫВАЕМ ВСЁ ЛИШНЕЕ */
          header,
          footer,
          nav,
          button,
          aside,
          .print-button,
          .report-actions,
          .report-layout > div:first-child,
          a[href^="/"] {
            display: none !important;
          }

          /* СБРОС body */
          body {
            margin: 0 !important;
            padding: 0 !important;
            background: white !important;
            width: 100% !important;
          }

          /* КОНТЕНТ НА ВСЮ ШИРИНУ - АГРЕССИВНО */
          body * {
            max-width: none !important;
          }

          main,
          .container,
          .page-container,
          .report-content,
          .card,
          div[style*="max-width"],
          div[style*="maxWidth"] {
            max-width: 100% !important;
            width: 100% !important;
            margin: 0 !important;
            padding: 0 !important;
            box-shadow: none !important;
            border: none !important;
          }

          /* Поля страницы */
          @page {
            margin: 2cm;
            size: A4 portrait;
          }

          /* Контент с правильными отступами */
          main > *,
          .report-content > * {
            padding-left: 0 !important;
            padding-right: 0 !important;
          }

          .report-layout {
            display: block !important;
            width: 100% !important;
            max-width: 100% !important;
          }

          /* Текст читаемый */
          body, p, div, span {
            font-size: 12pt !important;
            line-height: 1.5 !important;
            color: #000 !important;
          }

          /* Заголовки */
          h1 { 
            font-size: 24pt !important; 
            page-break-after: avoid !important;
            color: #000 !important;
          }
          h2 { 
            font-size: 18pt !important; 
            page-break-after: avoid !important;
            color: #000 !important;
          }
          h3 { 
            font-size: 14pt !important; 
            page-break-after: avoid !important;
            color: #000 !important;
          }

          /* Избегаем разрывов */
          p {
            orphans: 3 !important;
            widows: 3 !important;
            color: #000 !important;
          }

          .markdown-content {
            color: #000 !important;
            max-width: 100% !important;
            width: 100% !important;
          }

          .markdown-content p,
          .markdown-content li {
            color: #000 !important;
          }

          /* КРИТИЧНО: убираем все inline стили которые ограничивают ширину */
          [style*="maxWidth"],
          [style*="max-width"],
          [style*="maxWidth"],
          [style*="MaxWidth"] {
            max-width: none !important;
            width: 100% !important;
          }

          [style*="margin: 0 auto"],
          [style*="margin:0 auto"],
          [style*="margin: 0px auto"],
          [style*="margin:0px auto"],
          [style*="marginLeft"],
          [style*="marginRight"] {
            margin: 0 !important;
            margin-left: 0 !important;
            margin-right: 0 !important;
          }

          /* Перебиваем inline стили main и container */
          main.container,
          main[class*="container"],
          main[style*="maxWidth"],
          main[style*="max-width"] {
            max-width: 100% !important;
            width: 100% !important;
            margin: 0 !important;
            padding: 0 !important;
          }
        }
      `}</style>
    </>
  );
}
