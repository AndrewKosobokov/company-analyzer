'use client';

import { useState, useEffect } from 'react';

interface Props {
  estimatedTimeSeconds?: number;
  onComplete?: () => void;
}

export const AnalysisProgressBar = ({ 
  estimatedTimeSeconds = 67,
  onComplete 
}: Props) => {
  const [progress, setProgress] = useState(0);
  const [stage, setStage] = useState(0);
  const [elapsedTime, setElapsedTime] = useState(0);
  
  // Этапы анализа (общая длительность ~67 секунд)
  const stages = [
    { name: 'Сбор информации о компании...', duration: 10 },
    { name: 'Поиск финансовых данных...', duration: 12 },
    { name: 'Анализ отрасли и потребностей...', duration: 15 },
    { name: 'Определение маржинальных позиций...', duration: 12 },
    { name: 'Формирование рекомендаций...', duration: 10 },
    { name: 'Генерация отчёта...', duration: 8 }
  ];
  
  useEffect(() => {
    const startTime = Date.now();
    
    const interval = setInterval(() => {
      const elapsed = (Date.now() - startTime) / 1000; // секунды
      setElapsedTime(Math.floor(elapsed));
      
      // Расчёт прогресса
      let calculatedProgress = (elapsed / estimatedTimeSeconds) * 100;
      
      // Эффект замедления на последних 15% для реалистичности
      // (AI иногда думает дольше на генерации)
      if (calculatedProgress > 85) {
        calculatedProgress = 85 + (calculatedProgress - 85) * 0.3;
      }
      
      // Никогда не показываем 100% пока не завершено реально
      calculatedProgress = Math.min(calculatedProgress, 95);
      
      setProgress(calculatedProgress);
      
      // Определение текущего этапа на основе времени
      let cumulativeTime = 0;
      for (let i = 0; i < stages.length; i++) {
        cumulativeTime += stages[i].duration;
        if (elapsed < cumulativeTime) {
          setStage(i);
          break;
        }
      }
      
      // Если сильно превысили estimated time - застываем на 95%
      if (elapsed > estimatedTimeSeconds * 1.3) {
        clearInterval(interval);
      }
    }, 100); // обновляем каждые 100ms для плавности
    
    return () => clearInterval(interval);
  }, [estimatedTimeSeconds]);
  
  return (
    <div style={{
      width: '100%',
      maxWidth: '600px',
      padding: '40px 32px'
    }}>
      {/* Процент */}
      <div style={{
        fontSize: '20px',
        fontWeight: '600',
        color: 'var(--text-primary)',
        textAlign: 'center',
        marginBottom: '16px'
      }}>
        {Math.round(progress)}%
      </div>
      
      {/* Прогресс-бар (тоньше, черный) */}
      <div style={{
        width: '100%',
        height: '4px',
        backgroundColor: 'var(--border-color)',
        borderRadius: '2px',
        overflow: 'hidden',
        marginBottom: '20px'
      }}>
        <div style={{
          height: '100%',
          backgroundColor: 'var(--button-primary)',
          width: `${progress}%`,
          transition: 'width 0.3s ease',
          borderRadius: '2px'
        }} />
      </div>
      
      {/* Текущий этап (по центру под линией) */}
      <div style={{
        fontSize: '15px',
        color: 'var(--text-secondary)',
        fontWeight: '500',
        textAlign: 'center',
        minHeight: '22px'
      }}>
        {stages[stage]?.name || 'Анализируем...'}
      </div>
    </div>
  );
};
