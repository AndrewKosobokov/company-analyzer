'use client';

import React from 'react';

type ToastProps = {
  id: string;
  message: string;
  onClose: (id: string) => void;
};

export default function Toast({ id, message, onClose }: ToastProps) {
  return (
    <div
      className="pointer-events-auto w-full max-w-[400px] rounded-[12px] border border-[#D2D2D7] bg-white/80 backdrop-blur-md text-[#1D1D1F] shadow-sm ring-1 ring-black/5 transition-all duration-300 ease-out"
      role="status"
      aria-live="polite"
    >
      <div className="flex items-start gap-3 p-4">
        <div className="flex-1 text-[15px] leading-snug">
          {message}
        </div>
        <button
          aria-label="Закрыть"
          onClick={() => onClose(id)}
          className="shrink-0 rounded-full p-1 text-[#86868B] hover:text-[#1D1D1F] transition-colors"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M6 6L18 18M6 18L18 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
        </button>
      </div>
    </div>
  );
}



