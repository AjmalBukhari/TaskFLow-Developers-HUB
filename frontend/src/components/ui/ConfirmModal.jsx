import { motion, AnimatePresence } from "framer-motion";

export default function ConfirmModal({
  isOpen, onClose, onConfirm,
  title = "Are you sure?", message = "This action cannot be undone.",
  confirmText = "Confirm", cancelText = "Cancel", type = "default"
}) {
  if (!isOpen) return null;

  const typeStyles = {
    default: "bg-indigo-600 dark:bg-indigo-500 hover:bg-indigo-700",
    danger: "bg-red-600 dark:bg-red-500 hover:bg-red-700",
    warning: "bg-amber-600 hover:bg-amber-700"
  };

  return (
    <AnimatePresence>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={onClose}>
        <motion.div initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-md w-full p-6"
          onClick={(e) => e.stopPropagation()}>
          <h3 className="text-lg font-semibold mb-2 text-gray-800 dark:text-gray-100">{title}</h3>
          <p className="text-sm text-gray-600 dark:text-gray-300 mb-6">{message}</p>
          <div className="flex gap-3 justify-end">
            <button onClick={onClose}
              className="px-4 py-2 text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition">{cancelText}</button>
            <button onClick={() => { onConfirm(); onClose(); }}
              className={`px-4 py-2 text-sm text-white rounded-lg transition ${typeStyles[type]}`}>{confirmText}</button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
