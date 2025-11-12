'use client';

import React, { useState } from 'react';

type ToastVariant = 'info' | 'success' | 'error' | 'warning';

type ToastProps = {
  id: string;
  message: string;
  variant?: ToastVariant;
  onClose: (id: string) => void;
};

export default function Toast({ id, message, variant = 'info', onClose }: ToastProps) {
  const [isClosing, setIsClosing] = useState(false);
  
  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => onClose(id), 300);
  };
  
  const baseClasses = `pointer-events-auto w-full max-w-[400px] rounded-2xl shadow-lg ring-1 transition-all duration-300 ease-in-out ${isClosing ? 'opacity-0 translate-x-full' : 'opacity-100 translate-x-0'}`;

  const variantClasses =
    variant === 'error'
      ? 'bg-black text-white ring-black/5'
      : variant === 'warning'
      ? 'bg-[#f5f5f7] text-[#1d1d1f] ring-black/5 border border-black/10'
      : 'bg-white text-black ring-black/5 border border-black/10'; // info/success

  const icon = (
    <div className="mt-[2px] text-[#86868B]">
      {variant === 'error' ? (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.5" />
          <path d="M12 7v7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          <circle cx="12" cy="17" r="1" fill="currentColor" />
        </svg>
      ) : variant === 'warning' ? (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 4l8 14H4l8-14z" stroke="currentColor" strokeWidth="1.5" fill="none" />
          <path d="M12 9v5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          <circle cx="12" cy="16" r="1" fill="currentColor" />
        </svg>
      ) : (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.5" />
          <path d="M8.5 12.5l2.5 2.5 4.5-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      )}
    </div>
  );

  return (
    <div className={`${baseClasses} ${variantClasses}`} role="status" aria-live="polite">
      <div className="flex items-start gap-3 p-4">
        {icon}
        <div className="flex-1 text-[15px] leading-snug">
          {message}
        </div>
        <button
          aria-label="Закрыть"
          onClick={handleClose}
          className="shrink-0 rounded-full p-1 text-[#86868B] hover:text-black transition-colors"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M6 6L18 18M6 18L18 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
        </button>
      </div>
    </div>
  );
}



