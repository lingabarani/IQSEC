import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CheckCircle, Warning, Info, XCircle, X } from '@phosphor-icons/react';

export interface ToastMessage {
  id: string;
  text: string;
  type: 'info' | 'success' | 'warning' | 'error';
}

interface ToastProps {
  toasts: ToastMessage[];
  onDismiss: (id: string) => void;
}

export const Toast: React.FC<ToastProps> = ({ toasts, onDismiss }) => {
  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2.5 max-w-sm pointer-events-none">
      <AnimatePresence>
        {toasts.map(toast => {
          const getIcon = () => {
            switch (toast.type) {
              case 'success':
                return <CheckCircle size={18} weight="fill" className="text-emerald-400 shrink-0" />;
              case 'warning':
                return <Warning size={18} weight="fill" className="text-amber-400 shrink-0" />;
              case 'error':
                return <XCircle size={18} weight="fill" className="text-rose-400 shrink-0" />;
              default:
                return <Info size={18} weight="fill" className="text-cyan-400 shrink-0" />;
            }
          };

          return (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="pointer-events-auto p-4 rounded-xl bg-slate-900/95 border border-white/10 shadow-2xl glass-panel-elevated flex items-start gap-3 text-xs"
            >
              {getIcon()}
              <div className="flex-1 font-medium text-slate-200">
                {toast.text}
              </div>
              <button
                onClick={() => onDismiss(toast.id)}
                className="text-slate-400 hover:text-white transition-colors cursor-pointer"
              >
                <X size={14} />
              </button>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
};
