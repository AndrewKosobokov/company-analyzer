'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { AnalysisProgressBar } from '@/components/AnalysisProgressBar';
import { useNotification } from '@/components/NotificationProvider';
import { useAuth } from '@/app/context/AuthContext';

export default function AnalysisPage() {
  const [companyIdentifier, setCompanyIdentifier] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [stage, setStage] = useState<'fetching' | 'analyzing' | 'generating'>('fetching');
  const [progress, setProgress] = useState(0);
  const [progressMessage, setProgressMessage] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);
  const [analysesRemaining, setAnalysesRemaining] = useState<number | null>(null);
  const [showLimitModal, setShowLimitModal] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [showProgress, setShowProgress] = useState(false);
  const router = useRouter();
  const { showNotification } = useNotification();
  const { logout } = useAuth();
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    let finalUrl = '';
    let finalInn = '';
    const trimmedIdentifier = companyIdentifier.trim();

    if (!trimmedIdentifier) {
      setError('Пожалуйста, введите данные');
      return;
    }

    const looksLikeUrl =
      /^https?:\/\//i.test(trimmedIdentifier) ||
      trimmedIdentifier.toLowerCase().includes('www.') ||
      trimmedIdentifier.includes('.');

    if (looksLikeUrl) {
      let normalizedUrl = trimmedIdentifier;
      if (!/^https?:\/\//i.test(normalizedUrl)) {
        normalizedUrl = `https://${normalizedUrl}`;
      }
      try {
        const parsedUrl = new URL(normalizedUrl);
        if (!parsedUrl.hostname.includes('.')) {
          throw new Error('invalid host');
        }
        finalUrl = normalizedUrl;
      } catch {
        setError('Введите корректный URL компании');
        return;
      }
    } else {
      const numericCandidate = trimmedIdentifier.replace(/\D/g, '');
      if (
        numericCandidate &&
        (numericCandidate.length === 10 || numericCandidate.length === 12) &&
        /^\d+$/.test(numericCandidate)
      ) {
        finalInn = numericCandidate;
      } else {
        setError('ИНН должен содержать 10 или 12 цифр');
        return;
      }
    }

    if (typeof analysesRemaining === 'number' && analysesRemaining <= 0) {
      setShowLimitModal(true);
      return;
    }
    
    setLoading(true);
    setProgress(0);
    setProgressMessage('Инициализация анализа...');
    setTimeout(() => setShowProgress(true), 100);
    
    const progressInterval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 95) {
          clearInterval(progressInterval);
          return 95;
        }
        const increment = prev < 30 ? 3 : prev < 60 ? 2 : 1;
        return prev + increment;
      });
    }, 1400);

    const stageTimeouts: ReturnType<typeof setTimeout>[] = [];
    const progressMessages = [
      'Сбор данных о компании...',
      'Анализ информации...',
      'Генерация отчёта...',
      'Финализация...'
    ];

    stageTimeouts.push(setTimeout(() => setProgressMessage(progressMessages[0]), 5000));
    stageTimeouts.push(setTimeout(() => setProgressMessage(progressMessages[1]), 20000));
    stageTimeouts.push(setTimeout(() => setProgressMessage(progressMessages[2]), 40000));
    stageTimeouts.push(setTimeout(() => setProgressMessage(progressMessages[3]), 60000));

    const cleanupProgress = () => {
      clearInterval(progressInterval);
      stageTimeouts.forEach(timeout => clearTimeout(timeout));
    };
    
    try {
      const endpoint = '/api/analyze';
      const payload = { url: finalUrl || undefined, inn: finalInn || undefined };

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify(payload),
      });
      
      cleanupProgress();
      setProgress(100);
      setProgressMessage('Готово!');
      
      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        if (
          response.status === 403 &&
          (data?.analysesRemaining === 0 || data?.subscriptionExpired || (data?.error || '').includes('Лимит анализов'))
        ) {
          setShowLimitModal(true);
          throw new Error(data?.error || 'Лимит анализов исчерпан');
        }
        throw new Error(data?.error || 'Ошибка анализа');
      }
      
      const data = await response.json();
      
      setTimeout(() => {
        showNotification('Анализ компании готов! Открываем отчет...', 'success');

        if (data.id) {
          router.push(`/report/${data.id}`);
        } else {
          console.warn('API не вернул id отчета, редирект на список');
          router.push('/companies');
        }
      }, 500);
      
    } catch (err) {
      cleanupProgress();
      const errorMessage = err instanceof Error ? err.message : 'Ошибка при анализе компании';
      setError(errorMessage);
      showNotification(errorMessage, 'error');
      setLoading(false);
      setProgress(0);
      setProgressMessage('');
      setShowProgress(false);
    }
  };
  
  const handleLogout = () => {
    logout();
  };

  useEffect(() => {
    const checkStatus = async () => {
      try {
        const res = await fetch('/api/auth/status', {
          credentials: 'include'
        });
        if (!res.ok) return;
        const data = await res.json();
        setIsAdmin(data.role === 'admin');
        if (typeof data.analysesRemaining === 'number') {
          setAnalysesRemaining(data.analysesRemaining);
        }
      } catch (err) {
        // Ignore errors
      }
    };
    
    checkStatus();
    // Trigger fade in animation after component mounts
    setTimeout(() => setIsMounted(true), 50);
  }, []);

  // Progress bar animation
  useEffect(() => {
    if (loading) {
      const interval = setInterval(() => {
        setProgress(prev => {
          const newProgress = Math.min(prev + 2, 95);
          
          // Update stage based on progress
          if (newProgress < 30) setStage('fetching');
          else if (newProgress < 70) setStage('analyzing');
          else setStage('generating');
          
          return newProgress;
        });
      }, 1400);
      
      return () => clearInterval(interval);
    } else {
      setProgress(0);
      setStage('fetching');
    }
  }, [loading]);
  
  return (
  <>
      
      {/* Main Content */}
      <main 
        className="page-container" 
        style={{ 
          maxWidth: '800px', 
          margin: '0 auto', 
          padding: 'var(--space-4xl) var(--space-lg)',
          opacity: isMounted ? 1 : 0,
          transform: isMounted ? 'translateY(0)' : 'translateY(-10px)',
          transition: 'opacity 0.3s ease-in-out, transform 0.3s ease-in-out'
        }}
      >
        <div 
          className="card"
          style={{
            opacity: isMounted ? 1 : 0,
            transform: isMounted ? 'translateY(0)' : 'translateY(10px)',
            transition: 'opacity 0.3s ease-in-out, transform 0.3s ease-in-out',
            transitionDelay: '0.1s'
          }}
        >
          <form onSubmit={handleSubmit} className="analysis-form">
            {/* Error Message */}
            {error && (
              <div style={{
                padding: '16px',
                background: 'rgba(255, 59, 48, 0.1)',
                color: '#d32f2f',
                borderRadius: 'var(--radius-md)',
                marginBottom: 'var(--space-lg)',
                fontSize: '15px',
                textAlign: 'center',
                opacity: 0,
                animation: 'fadeIn 0.3s ease-out forwards'
              }}>
                {error}
              </div>
            )}
            
            {/* Company Analysis Form */}
            <div className="form-group">
              <label className="form-label">
                Вставьте ИНН компании, либо ссылку на сайт
              </label>
              <input
                type="text"
                className="form-input"
                placeholder=""
                value={companyIdentifier}
                onChange={(e) => setCompanyIdentifier(e.target.value)}
                disabled={loading}
              />
            </div>
            
            <button 
              type="submit" 
              className="button-primary" 
              disabled={loading}
              style={{ 
                width: '100%',
                fontSize: '17px',
                fontWeight: 500,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: loading ? '#6e6e73' : '#1D1D1F',
                cursor: loading ? 'not-allowed' : 'pointer',
                transition: 'all 0.3s ease',
                opacity: loading ? 0.6 : 1,
                transform: loading ? 'scale(0.98)' : 'scale(1)',
                marginTop: 'var(--space-lg)'
              }}
              onMouseEnter={(e) => {
                if (!loading) {
                  e.currentTarget.style.background = '#2D2D2F';
                }
              }}
              onMouseLeave={(e) => {
                if (!loading) {
                  e.currentTarget.style.background = '#1D1D1F';
                }
              }}
            >
              {loading ? 'Анализ...' : 'Анализировать компанию'}
            </button>
            
            {loading && (
              <div 
                style={{ 
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  marginTop: '32px',
                  minHeight: '200px',
                  opacity: showProgress ? 1 : 0,
                  transform: showProgress ? 'translateY(0)' : 'translateY(-10px)',
                  transition: 'opacity 0.3s ease-in-out, transform 0.3s ease-in-out'
                }}
              >
                <AnalysisProgressBar 
                  estimatedTimeSeconds={67}
                />
              </div>
            )}
          </form>
        </div>
      </main>
      
      {/* Limit reached modal */}
      {showLimitModal && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm" 
          onClick={() => setShowLimitModal(false)}
          style={{
            opacity: 0,
            animation: 'fadeIn 0.2s ease-out forwards'
          }}
        >
          <div 
            className="relative bg-white rounded-2xl shadow-2xl max-w-lg w-full mx-4 px-10 py-8" 
            onClick={(e) => e.stopPropagation()}
            style={{
              transform: 'scale(0.95)',
              animation: 'modalSlideIn 0.3s ease-out forwards'
            }}
          >
            <button onClick={() => setShowLimitModal(false)} className="absolute top-6 right-6 text-gray-400 hover:text-black" aria-label="Закрыть">×</button>
            <h2 className="text-2xl font-semibold text-black mb-4">Лимит анализов исчерпан</h2>
            <p className="text-base text-[#1d1d1f] leading-relaxed mb-8">Для дальнейшего использования ознакомьтесь с тарифами</p>
            <div className="flex gap-4">
              <Link href="/pricing" className="bg-black text-white hover:bg-gray-800 rounded-xl px-8 py-3 font-medium transition-colors text-center">Посмотреть тарифы</Link>
              <button onClick={() => setShowLimitModal(false)} className="text-gray-600 hover:text-black rounded-xl px-8 py-3 font-medium transition-colors">Закрыть</button>
            </div>
          </div>
        </div>
      )}


      {/* Animation styles */}
      <style jsx global>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes modalSlideIn {
          from {
            transform: scale(0.95);
            opacity: 0;
          }
          to {
            transform: scale(1);
            opacity: 1;
          }
        }
      `}</style>
    </>
  );
}





