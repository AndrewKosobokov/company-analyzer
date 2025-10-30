'use client';

import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import Toast from './Toast';

type ToastItem = {
  id: string;
  message: string;
};

type ToastContextValue = {
  showToast: (message: string) => void;
};

const ToastContext = createContext<ToastContextValue | undefined>(undefined);

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within ToastProvider');
  return ctx;
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const timersRef = useRef<Record<string, number>>({});

  const remove = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
    const t = timersRef.current[id];
    if (t) {
      window.clearTimeout(t);
      delete timersRef.current[id];
    }
  }, []);

  const showToast = useCallback((message: string) => {
    const id = Math.random().toString(36).slice(2);
    setToasts(prev => [{ id, message }, ...prev]);
    timersRef.current[id] = window.setTimeout(() => remove(id), 4000);
  }, [remove]);

  // Clear timers on unmount
  useEffect(() => {
    return () => {
      Object.values(timersRef.current).forEach(window.clearTimeout);
      timersRef.current = {};
    };
  }, []);

  const value = useMemo(() => ({ showToast }), [showToast]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      {typeof window !== 'undefined' && createPortal(
        <div className="pointer-events-none fixed left-1/2 top-6 z-[1000] -translate-x-1/2 px-4 sm:px-0" style={{ width: '100%' }}>
          <div className="mx-auto flex w-full max-w-[400px] flex-col items-center gap-2 sm:px-0">
            {toasts.map((t) => (
              <div
                key={t.id}
                className="w-full transform transition-all duration-300 ease-out animate-[fadeSlideIn_0.3s_ease-out] will-change-transform"
              >
                <Toast id={t.id} message={t.message} onClose={remove} />
              </div>
            ))}
          </div>
          <style jsx global>{`
            @keyframes fadeSlideIn {
              from { opacity: 0; transform: translateY(-6px); }
              to { opacity: 1; transform: translateY(0); }
            }
          `}</style>
        </div>,
        document.body
      )}
    </ToastContext.Provider>
  );
}



