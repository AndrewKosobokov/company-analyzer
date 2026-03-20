'use client';

interface ProgressBarProps {
  progress: number; // 0-100
  message?: string;
}

export default function ProgressBar({ progress, message }: ProgressBarProps) {
  return (
    <div style={{
      width: '100%',
      maxWidth: '400px',
      margin: '0 auto',
    }}>
      {message && (
        <div style={{
          fontSize: '15px',
          color: 'var(--text-primary)',
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
        background: 'var(--border-color)',
        borderRadius: '2px',
        overflow: 'hidden',
      }}>
        {/* Progress fill */}
        <div style={{
          width: `${progress}%`,
          height: '100%',
          background: 'var(--button-primary)',
          transition: 'width 0.3s ease-out',
          borderRadius: '2px',
        }} />
      </div>
      
      {/* Percentage */}
      <div style={{
        fontSize: '13px',
        color: 'var(--text-secondary)',
        marginTop: '8px',
        textAlign: 'center',
      }}>
        {Math.round(progress)}%
      </div>
    </div>
  );
}



























































