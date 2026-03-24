'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';
import { X, CheckCircle, AlertCircle, Info } from 'lucide-react';

interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
}

interface AlertContextType {
  showToast: (message: string, type?: 'success' | 'error' | 'info') => void;
  confirmAction: (message: string) => Promise<boolean>;
}

const AlertContext = createContext<AlertContextType | undefined>(undefined);

export function AlertProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [confirmState, setConfirmState] = useState<{ message: string; resolve: (value: boolean) => void } | null>(null);

  const showToast = React.useCallback((message: string, type: 'success' | 'error' | 'info' = 'info') => {
    const id = Math.random().toString(36).substr(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  }, []);

  React.useEffect(() => {
    const handleError = (e: Event) => {
      const customEvent = e as CustomEvent<string>;
      showToast(customEvent.detail, 'error');
    };
    const handleSuccess = (e: Event) => {
      const customEvent = e as CustomEvent<string>;
      showToast(customEvent.detail, 'success');
    };

    window.addEventListener('api-error', handleError);
    window.addEventListener('api-success', handleSuccess);

    return () => {
      window.removeEventListener('api-error', handleError);
      window.removeEventListener('api-success', handleSuccess);
    };
  }, [showToast]);

  const confirmAction = (message: string): Promise<boolean> => {
    return new Promise((resolve) => {
      setConfirmState({ message, resolve });
    });
  };

  const handleConfirm = (result: boolean) => {
    if (confirmState) {
      confirmState.resolve(result);
      setConfirmState(null);
    }
  };

  return (
    <AlertContext.Provider value={{ showToast, confirmAction }}>
      {children}

      {/* Toasts Container */}
      <div className="fixed top-4 right-4 z-[9999] flex flex-col gap-2 pointer-events-none">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg border ${
              toast.type === 'success' ? 'bg-green-50 border-green-200 text-green-800' :
              toast.type === 'error' ? 'bg-red-50 border-red-200 text-red-800' :
              'bg-blue-50 border-blue-200 text-blue-800'
            }`}
          >
            {toast.type === 'success' && <CheckCircle size={18} className="text-green-500" />}
            {toast.type === 'error' && <AlertCircle size={18} className="text-red-500" />}
            {toast.type === 'info' && <Info size={18} className="text-blue-500" />}
            <span className="text-sm font-medium">{toast.message}</span>
            <button
              onClick={() => setToasts((prev) => prev.filter((t) => t.id !== toast.id))}
              className="ml-2 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X size={16} />
            </button>
          </div>
        ))}
      </div>

      {/* Confirm Modal */}
      {confirmState && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl p-6 max-w-sm w-full">
            <h3 className="text-lg font-bold text-gray-900 mb-2">Please Confirm</h3>
            <p className="text-gray-600 text-sm mb-6">{confirmState.message}</p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => handleConfirm(false)}
                className="px-4 py-2 rounded-xl text-sm font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => handleConfirm(true)}
                className="px-4 py-2 rounded-xl text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 transition-colors"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </AlertContext.Provider>
  );
}

export function useAlert() {
  const context = useContext(AlertContext);
  if (context === undefined) {
    throw new Error('useAlert must be used within an AlertProvider');
  }
  return context;
}
