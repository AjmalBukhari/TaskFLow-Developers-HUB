import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNotifications } from "../../context/NotificationContext";
import { useTheme } from "../../context/ThemeContext";

export default function Header({ onSearch, onLogout, onNavigate }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [notificationOpen, setNotificationOpen] = useState(false);
  const { notifications, unreadCount, markAllAsRead } = useNotifications();
  const { dark, toggle } = useTheme();

  const handleLogout = () => {
    localStorage.removeItem("token");
    if (onLogout) onLogout();
    window.location.reload();
  };

  return (
    <div className="bg-white dark:bg-gray-800 border-b dark:border-gray-700 px-6 py-3 flex justify-between items-center">
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 bg-indigo-600 dark:bg-indigo-500 text-white flex items-center justify-center rounded-lg font-bold">T</div>
        <h1 className="text-lg font-semibold dark:text-white">TaskFlow</h1>
      </div>
      <div className="flex items-center gap-3">
        <div className="relative">
          <button
            onClick={() => setNotificationOpen(!notificationOpen)}
            className="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-600 transition relative"
          >
            🔔
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>
          <AnimatePresence>
            {notificationOpen && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="absolute right-0 mt-2 w-72 bg-white dark:bg-gray-800 shadow-lg dark:shadow-gray-900/50 rounded-lg overflow-hidden border dark:border-gray-700 max-h-96 overflow-y-auto"
              >
                <div className="px-4 py-2 text-sm font-semibold border-b dark:border-gray-700 flex justify-between items-center dark:text-gray-100">
                  <span>Notifications</span>
                  {unreadCount > 0 && (
                    <button onClick={markAllAsRead} className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline">Mark all read</button>
                  )}
                </div>
                {notifications.length === 0 ? (
                  <div className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">No notifications</div>
                ) : (
                  notifications.slice(0, 5).map(notification => (
                    <div key={notification._id} className={`px-4 py-2 border-b last:border-0 ${!notification.read ? 'bg-indigo-50 dark:bg-indigo-900/30' : ''}`}>
                      <p className="text-sm dark:text-gray-200">{notification.message}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        {new Date(notification.createdAt).toLocaleTimeString()}
                      </p>
                    </div>
                  ))
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <button
          onClick={toggle}
          className="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-600 transition text-lg"
          title={dark ? "Switch to Light Mode" : "Switch to Dark Mode"}
        >
          {dark ? '☀️' : '🌙'}
        </button>

        <div className="relative">
          <div
            onClick={() => setMenuOpen(!menuOpen)}
            className="w-10 h-10 rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center cursor-pointer hover:scale-105 transition"
          >👤</div>
          <AnimatePresence>
            {menuOpen && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="absolute right-0 mt-2 w-44 bg-white dark:bg-gray-800 shadow-lg dark:shadow-gray-900/50 rounded-lg overflow-hidden border dark:border-gray-700"
              >
                <div className="px-4 py-2 text-sm text-gray-600 dark:text-gray-400 border-b dark:border-gray-700">Signed in</div>
                <button
                  className="w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 text-sm dark:text-gray-200"
                  onClick={() => { setMenuOpen(false); onNavigate && onNavigate("Account"); }}
                >Account</button>
                <button
                  className="w-full text-left px-4 py-2 hover:bg-red-50 dark:hover:bg-red-900/30 text-red-600 dark:text-red-400 text-sm"
                  onClick={handleLogout}
                >Logout</button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
