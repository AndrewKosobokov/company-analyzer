'use client';

import { useEffect } from 'react';

export default function SuccessToast({ 
  message, 
  onClose 
}: { 
  message: string; 
  onClose: () => void; 
}) {
  useEffect(() => {
    const timer = setTimeout(onClose, 2000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div style={{
      position: 'fixed',
      top: '24px',
      right: '24px',
      background: '#1d1d1f',
      color: '#ffffff',
      padding: '16px 24px',
      borderRadius: '12px',
      boxShadow: '0 8px 24px rgba(0, 0, 0, 0.2)',
      zIndex: 10000,
      animation: 'toast-slide-in 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
      fontSize: '15px',
      fontWeight: '500',
      border: '1px solid rgba(255, 255, 255, 0.1)'
    }}>
      {message}
    </div>
  );
}































