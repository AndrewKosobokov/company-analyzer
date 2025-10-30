'use client';

import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import Toast from './Toast';

type ToastItem = {
  id: string;
  message: string;
  variant: 'info' | 'success' | 'error' | 'warning';
};

type ToastContextValue = {
  showToast: (message: string, options?: { variant?: 'info' | 'success' | 'error' | 'warning'; durationMs?: number }) => void;
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

  const showToast = useCallback((message: string, options?: { variant?: 'info' | 'success' | 'error' | 'warning'; durationMs?: number }) => {
    const id = Math.random().toString(36).slice(2);
    const variant = options?.variant ?? 'info';
    const duration = options?.durationMs ?? 4000;
    setToasts(prev => [{ id, message, variant }, ...prev]);
    timersRef.current[id] = window.setTimeout(() => remove(id), duration);
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
        <div className="pointer-events-none fixed top-6 right-6 z-[1000] px-4 sm:px-0">
          <div className="flex w-full max-w-[400px] flex-col items-end gap-2 sm:px-0">
            {toasts.map((t) => (
              <div
                key={t.id}
                className="w-full transform transition-all duration-300 ease-out animate-[fadeSlideIn_0.3s_ease-out] will-change-transform"
              >
                <Toast id={t.id} message={t.message} variant={t.variant} onClose={remove} />
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



