import { motion } from 'framer-motion';

export default function Sidebar({ active, onChange }) {
  const menuItems = [
    { name: 'Dashboard', icon: '📊' },
    { name: 'All Tasks', icon: '📋' },
    { name: 'Add Task', icon: '➕' },
    { name: 'Analytics', icon: '📈' },
    { name: 'Bin Task', icon: '🗑️' },
    { name: 'Profile', icon: '👤' },
  ];

  return (
    <div className="w-64 bg-white dark:bg-gray-800 border-r dark:border-gray-700 flex flex-col">
      <div className="p-5 border-b dark:border-gray-700">
        <h2 className="text-xl font-bold tracking-tight dark:text-white">TaskFlow</h2>
      </div>
      <nav className="flex-1 p-3 space-y-1">
        {menuItems.map((item) => {
          const isActive = active === item.name;
          return (
            <motion.div
              key={item.name}
              whileTap={{ scale: 0.97 }}
              onClick={() => onChange(item.name)}
              className={`flex items-center gap-3 px-3 py-2 rounded-lg cursor-pointer transition-all ${
                isActive
                  ? 'bg-indigo-50 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400 font-medium'
                  : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              <span className="text-lg">{item.icon}</span>
              <span className="text-sm">{item.name}</span>
              {isActive && (
                <motion.div layoutId="activeIndicator" className="ml-auto w-1.5 h-5 bg-indigo-500 rounded" />
              )}
            </motion.div>
          );
        })}
      </nav>
      <div className="p-4 border-t dark:border-gray-700 text-xs text-gray-400 dark:text-gray-500">
        © {new Date().getFullYear()} TaskFlow
      </div>
    </div>
  );
}
