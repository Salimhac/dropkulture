import React from 'react';
import { CheckCircle, Info, AlertTriangle, X } from 'lucide-react';
import { useApp } from '../context/AppContext';

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useApp();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-20 sm:bottom-6 right-4 sm:right-6 z-50 flex flex-col gap-2 pointer-events-none max-w-sm w-full">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className="pointer-events-auto flex items-center justify-between gap-3 p-3.5 rounded-xl bg-black/95 backdrop-blur-xl border border-[#2B2B2B] text-white shadow-[0_10px_30px_rgba(0,0,0,0.8)] animate-in slide-in-from-bottom-5 duration-300"
        >
          <div className="flex items-center gap-2.5">
            {toast.type === 'success' && <CheckCircle className="w-4 h-4 text-white flex-shrink-0" />}
            {toast.type === 'info' && <Info className="w-4 h-4 text-[#C0C0C0] flex-shrink-0" />}
            {toast.type === 'warn' && <AlertTriangle className="w-4 h-4 text-white flex-shrink-0" />}
            <p className="text-xs font-medium text-[#D9D9D9]">{toast.message}</p>
          </div>
          <button
            onClick={() => removeToast(toast.id)}
            className="text-[#8E8E93] hover:text-white p-0.5"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      ))}
    </div>
  );
};
