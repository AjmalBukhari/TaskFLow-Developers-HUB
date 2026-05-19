import { motion, AnimatePresence } from 'framer-motion';
import { useEffect } from 'react';

export default function Toast({ toasts = [], removeToast }) {
  useEffect(() => {
    const timers = toasts.map((t) => setTimeout(() => removeToast(t.id), 3000));
    return () => timers.forEach(clearTimeout);
  }, [toasts, removeToast]);

  return (
    <div className="fixed top-5 right-5 z-50 space-y-3">
      <AnimatePresence>
        {toasts.map((toast) => {
          const colors = {
            success: 'bg-green-500', error: 'bg-red-500',
            info: 'bg-blue-500', warning: 'bg-yellow-500 text-black'
          };
          return (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 50 }}
              transition={{ duration: 0.25 }}
              className={`${colors[toast.type] || 'bg-gray-800 dark:bg-gray-900'} text-white dark:text-gray-100 px-4 py-3 rounded-lg shadow-lg min-w-[220px] max-w-xs flex items-center justify-between gap-3`}
            >
              <span className="text-sm dark:text-gray-200">{toast.message}</span>
              <button onClick={() => removeToast(toast.id)} className="text-white/80 hover:text-white text-sm dark:text-gray-200">✕</button>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
