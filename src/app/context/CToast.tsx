'use client';
import React, { createContext, useContext, useState, ReactNode } from 'react';
import '@/app/assets/css/toast.css'; 

type ToastType = 'success' | 'error' | 'info';

interface Toast {
  id: number;
  message: string;
  type: ToastType;
}

interface ToastContextProps {
  showToast: (message: string, type?: ToastType, duration?: number) => void;
}

const ToastContext = createContext<ToastContextProps | undefined>(undefined);

export const ToastProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = (message: string, type: ToastType = 'success', duration = 3000) => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, duration);
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="toast-container">
        {toasts.map((toast) => (
          <div key={toast.id} className={`toast toast-${toast.type}`}>
            <span className="toast-icon">
  {toast.type === 'success' && (
    <img src="https://cdn-icons-png.flaticon.com/128/5709/5709755.png" alt="success" />
  )}
  {toast.type === 'error' && (
    <img src="https://cdn-icons-png.flaticon.com/128/753/753345.png" alt="error" />
  )}
  {toast.type === 'info' && (
    <img src="https://cdn-icons-png.flaticon.com/128/1946/1946488.png" alt="info" />
  )}
</span>

            <span>{toast.message}</span>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = (): ToastContextProps => {
  const context = useContext(ToastContext);
  if (!context) throw new Error('useToast must be used within a ToastProvider');
  return context;
};
