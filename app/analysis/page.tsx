// app/analysis/page.tsx
'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import ProgressBar from '@/components/ProgressBar';
import { useNotification } from '@/components/NotificationProvider';
import { getToken } from '@/app/lib/auth';

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
  const innInputRef = useRef<HTMLInputElement | null>(null);
  const router = useRouter();
  const { showNotification } = useNotification();
  
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

    if (typeof analysesRemaining === 'number' && analysesRemaining <= 0) {
      setShowLimitModal(true);
      return;
    }
    
    setLoading(true);
    setProgress(0);
    setProgressMessage('Инициализация анализа...');
    
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
        if (response.status === 403 && (data?.analysesRemaining === 0 || (data?.error || '').includes('Лимит анализов'))) {
          setShowLimitModal(true);
          throw new Error(data?.error || 'Лимит анализов исчерпан');
        }
        if (!noWebsite) {
          setShowUrlErrorModal(true);
        }
        throw new Error(data?.error || 'Ошибка анализа');
      }
      
      const data = await response.json();
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
    }
  };
  
  const handleLogout = () => {
    localStorage.clear();
    router.push('/');
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
      } catch {}
    };
    
    checkStatus();
  }, []);

  useEffect(() => {
    if (loading) {
      const interval = setInterval(() => {
        setProgress(prev => {
          const newProgress = Math.min(prev + 2, 95);
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
    // ... остальная часть без изменений
  );
}
