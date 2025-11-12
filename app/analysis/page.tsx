'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import ProgressBar from '@/components/ProgressBar';
import { useNotification } from '@/components/NotificationProvider';
import { getToken } from '@/app/lib/auth';
import { useAuth } from '@/app/context/AuthContext';

export default function AnalysisPage() {
  const [url, setUrl] = useState('');
  const [inn, setInn] = useState('');
  const [noWebsite, setNoWebsite] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [stage, setStage] = useState<'fetching' | 'analyzing' | 'generating'>('fetching');
  const [progress, setProgress] = useState(0);
  const [progressMessage, setProgressMessage] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);
  const [analysesRemaining, setAnalysesRemaining] = useState<number | null>(null);
  const [showLimitModal, setShowLimitModal] = useState(false);
  const [showUrlErrorModal, setShowUrlErrorModal] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [showProgress, setShowProgress] = useState(false);
  const innInputRef = useRef<HTMLInputElement | null>(null);
  const router = useRouter();
  const { showNotification } = useNotification();
  const { logout } = useAuth();
  
  const handleInnChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '');
    setInn(value);
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!noWebsite && !url.trim()) {
      setError('Введите сайт компании или отметьте "Сайт отсутствует"');
      return;
    }
    
    if (noWebsite && !inn.trim()) {
      setError('Введите ИНН компании');
      return;
    }

    // Pre-check user limit before attempting request
    if (typeof analysesRemaining === 'number' && analysesRemaining <= 0) {
      setShowLimitModal(true);
      return;
    }
    
    setLoading(true);
    setProgress(0);
    setProgressMessage('Инициализация анализа...');
    // Show progress bar with fade in
    setTimeout(() => setShowProgress(true), 100);
    
    // Simulate progress with realistic stages
    const progressInterval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 95) {
          clearInterval(progressInterval);
          return 95; // Stop at 95%, jump to 100% when done
        }
        // Slow down as we approach the end
        const increment = prev < 30 ? 3 : prev < 60 ? 2 : 1;
        return prev + increment;
      });
    }, 1400); // Update every 800ms
    
    // Update messages at different stages
    setTimeout(() => setProgressMessage('Сбор данных о компании...'), 5000);
    setTimeout(() => setProgressMessage('Анализ информации...'), 20000);
    setTimeout(() => setProgressMessage('Генерация отчёта...'), 40000);
    setTimeout(() => setProgressMessage('Финализация...'), 60000);
    
    try {
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getToken()}`
        },
        body: JSON.stringify({ 
          url: noWebsite ? '' : url.trim(), 
          inn: inn.trim() 
        }),
      });
      
      clearInterval(progressInterval);
      setProgress(100);
      setProgressMessage('Готово!');
      
      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        // If limit exceeded on server
        if (response.status === 403 && (data?.analysesRemaining === 0 || (data?.error || '').includes('Лимит анализов'))) {
          setShowLimitModal(true);
          throw new Error(data?.error || 'Лимит анализов исчерпан');
        }
        // If URL path failed and user tried URL
        if (!noWebsite) {
          setShowUrlErrorModal(true);
        }
        throw new Error(data?.error || 'Ошибка анализа');
      }
      
      const data = await response.json();
      
      // Small delay to show completion
      setTimeout(() => {
        router.push(`/report/${data.id}`);
      }, 500);
      
    } catch (err) {
      clearInterval(progressInterval);
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
      const token = getToken();
      if (!token) return;
      
      try {
        const res = await fetch('/api/auth/status', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
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
      {/* Header */}
      <header className="header">
        <div className="header-container">
          {/* Logo + Subtitle */}
          <Link href="/analysis" className="logo">
            <div style={{ fontSize: '24px', fontWeight: 600 }}>Металл Вектор</div>
            <div style={{ fontSize: '13px', color: 'var(--text-secondary)', fontWeight: 400, marginTop: '2px' }}>
              Аналитика. Фокус. Результат.
            </div>
          </Link>
          
          {/* Navigation */}
          <nav className="nav">
            <Link 
              href="/analysis" 
              className="button-primary header-button"
            >
              Анализ
            </Link>
            <Link href="/companies" className="nav-link">
              Отчеты
            </Link>
            <Link href="/pricing" className="nav-link">
              Тарифы
            </Link>
            <Link href="/profile" className="nav-link">
              Профиль
            </Link>
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
        <h1 style={{ 
          fontSize: '36px', 
          textAlign: 'center', 
          marginBottom: 'var(--space-2xl)',
          fontWeight: 600,
          letterSpacing: '-0.022em'
        }}>
          Анализ компании
        </h1>
        
        <div 
          className="card"
          style={{
            opacity: isMounted ? 1 : 0,
            transform: isMounted ? 'translateY(0)' : 'translateY(10px)',
            transition: 'opacity 0.3s ease-in-out, transform 0.3s ease-in-out',
            transitionDelay: '0.1s'
          }}
        >
          <form onSubmit={handleSubmit}>
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
            
            {/* URL Input with inline checkbox */}
            <div className="form-group">
            <div style={{ 
              display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                marginBottom: 'var(--space-sm)'
              }}>
                <label className="form-label">Введите главную страницу сайта компании</label>
                
                {/* Apple-style checkbox */}
                <label style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  fontSize: '15px',
                  color: 'var(--text-secondary)',
                  cursor: 'pointer',
                  userSelect: 'none',
                  transition: 'color var(--transition-fast)'
                }}>
                  <input
                    type="checkbox"
                    checked={noWebsite}
                    onChange={(e) => {
                      setNoWebsite(e.target.checked);
                      if (!e.target.checked) {
                        setInn('');
                      } else {
                        setUrl('');
                      }
                    }}
                    style={{
                      width: '20px',
                      height: '20px',
                      cursor: 'pointer',
                      accentColor: 'var(--button-primary)'
                    }}
                  />
                  Сайт отсутствует
                </label>
              </div>
              
                <input
                  type="url"
                  className="form-input"
                placeholder="https://example.com"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                disabled={noWebsite || loading}
                style={{
                  opacity: noWebsite ? 0.5 : 1,
                  cursor: noWebsite ? 'not-allowed' : 'text',
                  transition: 'opacity var(--transition-base)'
                }}
                />
              </div>
              
            {/* INN Field - smooth fade in/out */}
            <div style={{
              maxHeight: noWebsite ? '200px' : '0',
              opacity: noWebsite ? 1 : 0,
              overflow: 'hidden',
              transition: 'all var(--transition-base)',
              marginBottom: noWebsite ? 'var(--space-md)' : '0'
            }}>
              <div className="form-group">
                <label className="form-label">ИНН</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="1234567890"
                  maxLength={12}
                  value={inn}
                  onChange={handleInnChange}
                  disabled={loading}
                  ref={innInputRef}
                />
              </div>
            </div>
            
            {/* Dynamic hint text */}
            {!noWebsite && (
              <p className="form-hint" style={{
                fontSize: '15px', 
                color: 'var(--text-secondary)',
                lineHeight: 1.5,
                marginBottom: 'var(--space-lg)'
              }}>
                Если сайт недоступен, отметьте "Сайт отсутствует"
              </p>
            )}
            
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
                background: loading ? '#6e6e73' : '#000000',
                cursor: loading ? 'not-allowed' : 'pointer',
                transition: 'all 0.3s ease',
                opacity: loading ? 0.6 : 1,
                transform: loading ? 'scale(0.98)' : 'scale(1)'
              }}
            >
              {loading ? 'Анализ...' : 'Анализировать компанию'}
            </button>
            
            {loading && (
              <div 
                style={{ 
                  marginTop: '32px', 
                  textAlign: 'center',
                  opacity: showProgress ? 1 : 0,
                  transform: showProgress ? 'translateY(0)' : 'translateY(-10px)',
                  transition: 'opacity 0.3s ease-in-out, transform 0.3s ease-in-out'
                }}
              >
                <ProgressBar 
                  progress={progress} 
                  message={progressMessage}
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

      {/* URL analysis error modal */}
      {showUrlErrorModal && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm" 
          onClick={() => setShowUrlErrorModal(false)}
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
            <button onClick={() => setShowUrlErrorModal(false)} className="absolute top-6 right-6 text-gray-400 hover:text-black" aria-label="Закрыть">×</button>
            <h2 className="text-2xl font-semibold text-black mb-4">Ошибка анализа</h2>
            <p className="text-base text-[#1d1d1f] leading-relaxed mb-8">Попробуйте ввести ИНН организации</p>
            <div className="flex gap-4 justify-end">
              <button onClick={() => setShowUrlErrorModal(false)} className="text-gray-600 hover:text-black rounded-xl px-8 py-3 font-medium transition-colors">Закрыть</button>
              <button
                onClick={() => {
                  setShowUrlErrorModal(false);
                  setNoWebsite(true);
                  setUrl('');
                  setTimeout(() => {
                    innInputRef.current?.focus();
                  }, 50);
                }}
                className="bg-black text-white hover:bg-gray-800 rounded-xl px-8 py-3 font-medium transition-colors"
              >
                Ввести ИНН
              </button>
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





