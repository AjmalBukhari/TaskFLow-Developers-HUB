import { motion } from "framer-motion";
import { useNotifications } from "../../context/NotificationContext";

const typeIcons = {
  task_shared: '🔗',
  task_updated: '✏️',
  task_completed: '✅'
};

export default function Notifications({ showToast }) {
  const { notifications, deleteNotification, clearAllNotifications, markNotificationAsRead } = useNotifications();

  const handleDelete = async (id, e) => {
    e.stopPropagation();
    try {
      await deleteNotification(id);
      showToast("Notification deleted", "success");
    } catch {
      showToast("Failed to delete", "error");
    }
  };

  const handleClearAll = async () => {
    try {
      await clearAllNotifications();
      showToast("All notifications cleared", "success");
    } catch {
      showToast("Failed to clear notifications", "error");
    }
  };

  const handleRead = async (n) => {
    if (!n?.id || n.read) return;
    try { await markNotificationAsRead(n.id); } catch {}
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-5">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-semibold dark:text-white">Notifications</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {notifications.filter(n => !n.read).length} unread
          </p>
        </div>
        {notifications.length > 0 && (
          <button onClick={handleClearAll}
            className="px-4 py-2 text-sm bg-red-100 dark:bg-red-900/50 text-red-600 dark:text-red-400 rounded-lg hover:bg-red-200 dark:hover:bg-red-800 transition">
            Clear All
          </button>
        )}
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm dark:shadow-gray-900/50">
        {notifications.length === 0 ? (
          <div className="p-8 text-center text-gray-400 dark:text-gray-500">
            <p className="text-4xl mb-2">🔔</p>
            <p className="text-sm">No notifications yet</p>
          </div>
        ) : (
          <div className="divide-y dark:divide-gray-700">
            {notifications.filter(n => n?.id).map((n) => (
              <motion.div
                key={n.id}
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                onClick={() => handleRead(n)}
                className={`flex items-start gap-3 p-4 cursor-pointer transition-colors ${
                  !n.read
                    ? 'bg-indigo-50 dark:bg-indigo-900/20'
                    : 'hover:bg-gray-50 dark:hover:bg-gray-700/50'
                }`}
              >
                <span className="text-xl mt-0.5">{typeIcons[n.type] || '🔔'}</span>
                <div className="flex-1 min-w-0">
                  <p className={`text-sm ${!n.read ? 'font-semibold' : ''} dark:text-gray-100`}>
                    {n.message}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    {new Date(n.createdAt).toLocaleString()}
                  </p>
                </div>
                {!n.read && (
                  <span className="w-2 h-2 bg-indigo-500 rounded-full mt-2 shrink-0" />
                )}
                <button onClick={(e) => handleDelete(n.id, e)}
                  className="text-gray-400 hover:text-red-500 dark:hover:text-red-400 transition shrink-0 p-1">
                  ✕
                </button>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
}
