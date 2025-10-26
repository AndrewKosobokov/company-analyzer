'use client';

interface LoadingSpinnerProps {
  size?: number;
  message?: string;
}

export default function LoadingSpinner({ size = 40, message }: LoadingSpinnerProps) {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: '16px',
    }}>
      {/* Spinner */}
      <div style={{
        width: size,
        height: size,
        border: '3px solid #d2d2d7',
        borderTop: '3px solid #1d1d1f',
        borderRadius: '50%',
        animation: 'spin 0.8s linear infinite',
      }} />
      
      {message && (
        <div style={{
          fontSize: '15px',
          color: '#6e6e73',
          textAlign: 'center',
        }}>
          {message}
        </div>
      )}
      
      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}


















