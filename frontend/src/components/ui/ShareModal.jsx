import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";

export default function ShareModal({
  isOpen, onClose, onShare,
  title = "Share Task", message = "Enter user IDs to share with (comma separated):"
}) {
  const [userIds, setUserIds] = useState("");

  const handleShare = () => {
    if (!userIds.trim()) return;
    onShare(userIds.split(',').map(id => id.trim()).filter(id => id));
    setUserIds("");
    onClose();
  };

  const handleKeyPress = (e) => { if (e.key === 'Enter') handleShare(); };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={onClose}>
        <motion.div initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="bg-white dark:bg-gray-800 rounded-xl shadow-xl dark:shadow-gray-900/50 max-w-md w-full p-6"
          onClick={(e) => e.stopPropagation()}>
          <h3 className="text-lg font-semibold mb-2">{title}</h3>
          <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">{message}</p>
          <input type="text" value={userIds} onChange={(e) => setUserIds(e.target.value)}
            onKeyPress={handleKeyPress} placeholder="user1, user2, user3" autoFocus
            className="w-full border dark:border-gray-600 p-2 rounded focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 mb-4" />
          <div className="flex gap-3 justify-end">
            <button onClick={onClose}
              className="px-4 py-2 text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition">Cancel</button>
            <button onClick={handleShare} disabled={!userIds.trim()}
              className="px-4 py-2 text-sm bg-indigo-600 dark:bg-indigo-500 text-white rounded-lg hover:bg-indigo-700 transition disabled:opacity-50">Share</button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
