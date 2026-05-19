import { motion } from 'framer-motion';

export default function ProgressBar({ tasks = [] }) {
  const total = tasks.length;
  const completed = tasks.filter(t => t.status === 'Completed').length;
  const percent = total === 0 ? 0 : Math.round((completed / total) * 100);
  const getColor = () => {
    if (percent === 100) return 'bg-green-500';
    if (percent >= 50) return 'bg-indigo-500';
    return 'bg-yellow-500';
  };

  return (
    <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm dark:shadow-gray-900/50">
      <div className="flex justify-between items-center mb-2">
        <h3 className="text-sm font-medium text-gray-600 dark:text-gray-300">Progress</h3>
        <span className="text-sm font-semibold dark:text-gray-100">{percent}%</span>
      </div>
      <div className="w-full bg-gray-200 dark:bg-gray-700 h-3 rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${percent}%` }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className={`${getColor()} h-3 rounded-full`}
        />
      </div>
      <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-2">
        <span>{completed} completed</span>
        <span>{total} total</span>
      </div>
      {total === 0 && <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">No tasks available</p>}
    </div>
  );
}
