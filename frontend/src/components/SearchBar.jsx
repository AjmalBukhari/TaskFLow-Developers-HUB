import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

export default function SearchBar({ onSearch, onFilter }) {
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState('');

  useEffect(() => {
    const timer = setTimeout(() => { if (onSearch) onSearch(query); }, 400);
    return () => clearTimeout(timer);
  }, [query, onSearch]);

  const handleFilter = (value) => {
    setStatus(value);
    if (onFilter) onFilter(value);
  };

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }} className="flex flex-col md:flex-row gap-3 mb-4">
      <input type="text" placeholder="Search tasks..." value={query} onChange={(e) => setQuery(e.target.value)}
        className="flex-1 bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400 border dark:border-gray-600 px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 transition placeholder-gray-400 dark:placeholder-gray-500" />
      <select value={status} onChange={(e) => handleFilter(e.target.value)}
        className="bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400 border dark:border-gray-600 px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400">
        <option value="">All Status</option>
        <option value="Pending">Pending</option>
        <option value="In Progress">In Progress</option>
        <option value="Completed">Completed</option>
      </select>
    </motion.div>
  );
}
