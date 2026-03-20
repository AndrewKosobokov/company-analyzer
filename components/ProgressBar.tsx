'use client';

interface ProgressBarProps {
  progress: number; // 0-100
  message?: string;
}

export default function ProgressBar({ progress, message }: ProgressBarProps) {
  const isDark = typeof document !== 'undefined' && document.documentElement.classList.contains('dark');

  return (
    <div style={{
      width: '100%',
      maxWidth: '400px',
      margin: '0 auto',
    }}>
      {message && (
        <div style={{
          fontSize: '15px',
          color: isDark ? '#f5f5f7' : '#1d1d1f',
          marginBottom: '12px',
          textAlign: 'center',
          fontWeight: 500,
        }}>
          {message}
        </div>
      )}
      
      {/* Progress bar container */}
      <div style={{
        width: '100%',
        height: '4px',
        background: isDark ? '#3a3a3c' : '#d2d2d7',
        borderRadius: '2px',
        overflow: 'hidden',
      }}>
        {/* Progress fill */}
        <div style={{
          width: `${progress}%`,
          height: '100%',
          background: isDark ? '#f5f5f7' : '#1d1d1f',
          transition: 'width 0.3s ease-out',
          borderRadius: '2px',
        }} />
      </div>
      
      {/* Percentage */}
      <div style={{
        fontSize: '13px',
        color: isDark ? '#f5f5f7' : '#6e6e73',
        marginTop: '8px',
        textAlign: 'center',
      }}>
        {Math.round(progress)}%
      </div>
    </div>
  );
}



























































