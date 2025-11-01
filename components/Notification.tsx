'use client';

import { useEffect, useState } from 'react';

interface NotificationProps {
  message: string;
  type?: 'success' | 'error' | 'info';
  duration?: number;
  onClose?: () => void;
}

export default function Notification({ 
  message, 
  type = 'success', 
  duration = 5000,
  onClose 
}: NotificationProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [isLeaving, setIsLeaving] = useState(false);

  useEffect(() => {
    // Slide in animation
    setTimeout(() => setIsVisible(true), 10);

    // Auto close after duration
    const timer = setTimeout(() => {
      handleClose();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration]);

  const handleClose = () => {
    setIsLeaving(true);
    setTimeout(() => {
      setIsVisible(false);
      onClose?.();
    }, 300);
  };

  const getBackgroundColor = () => {
    switch (type) {
      case 'success':
        return '#1d1d1f';
      case 'error':
        return '#2c2c2e';
      case 'info':
        return '#1d1d1f';
      default:
        return '#1d1d1f';
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        top: isVisible && !isLeaving ? '20px' : '-100px',
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 9999,
        transition: 'top 0.3s ease-out',
        pointerEvents: 'auto',
      }}
    >
      <div
        style={{
          background: getBackgroundColor(),
          color: '#ffffff',
          padding: '16px 24px',
          borderRadius: '12px',
          boxShadow: '0 10px 40px rgba(0, 0, 0, 0.3)',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          minWidth: '320px',
          maxWidth: '500px',
        }}
      >
        <div style={{ flex: 1, fontSize: '15px', lineHeight: '1.4' }}>
          {message}
        </div>
        <button
          onClick={handleClose}
          style={{
            background: 'transparent',
            border: 'none',
            color: '#8e8e93',
            cursor: 'pointer',
            fontSize: '20px',
            padding: '0',
            width: '24px',
            height: '24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: '4px',
            transition: 'color 0.15s ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = '#ffffff';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = '#8e8e93';
          }}
        >
          ×
        </button>
      </div>
    </div>
  );
}



































