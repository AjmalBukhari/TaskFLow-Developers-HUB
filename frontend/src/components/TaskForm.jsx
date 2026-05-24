import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { createTask, updateTask } from '../services/api';

const initialState = {
  title: '', description: '', status: 'Pending',
  priority: 'Low', dueDate: '', pinned: false
};

export default function TaskForm({ task, onClose, onSaved, showToast }) {
  const [form, setForm] = useState(initialState);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (task) {
      setForm({
        title: task.title || '', description: task.description || '',
        status: task.status || 'Pending', priority: task.priority || 'Low',
        dueDate: task.dueDate?.slice(0, 10) || '', pinned: task.pinned || false
      });
    } else setForm(initialState);
  }, [task]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleSubmit = async () => {
    if (!form.title.trim()) return showToast('Title is required', 'warning');
    try {
      setLoading(true);
      let savedTask;
      if (task) {
        await updateTask(task.id, form);
        showToast(`Task "${task.title}" updated`, 'info');
        savedTask = task;
      } else {
        const res = await createTask(form);
        showToast('Task created');
        setForm(initialState);
        savedTask = res?.data?.data;
      }
      if (onSaved) onSaved(savedTask?.id);
    } catch (err) {
      showToast(err.response?.data?.message || 'Error saving task', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }}
      className="bg-white dark:bg-gray-800 p-5 rounded-xl shadow-sm dark:shadow-gray-900/50 border dark:border-gray-700 max-w-xl mx-auto">
      <h2 className="text-lg font-semibold dark:text-gray-100 mb-4">{task ? 'Edit Task' : 'Add New Task'}</h2>
      <div className="space-y-3">
        <input name="title" placeholder="Task title" value={form.title} onChange={handleChange}
          className="w-full border dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 p-2 rounded focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400" />
        <textarea name="description" placeholder="Description" value={form.description} onChange={handleChange}
          className="w-full border dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 p-2 rounded focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400" />
        <div className="grid grid-cols-2 gap-3">
          <select name="status" value={form.status} onChange={handleChange}
            className="border dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 p-2 rounded">
            <option>Pending</option><option>In Progress</option><option>Completed</option>
          </select>
          <select name="priority" value={form.priority} onChange={handleChange}
            className="border dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 p-2 rounded">
            <option>Low</option><option>Medium</option><option>High</option>
          </select>
        </div>
        <input type="date" name="dueDate" value={form.dueDate} onChange={handleChange}
          className="w-full border dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 p-2 rounded" />
        <label className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
          <input type="checkbox" name="pinned" checked={form.pinned} onChange={handleChange} /> Pin this task
        </label>
        <div className="flex gap-2 pt-2">
          <button onClick={handleSubmit} disabled={loading}
            className="bg-indigo-600 dark:bg-indigo-500 text-white px-4 py-2 rounded">
            {loading ? 'Saving...' : task ? 'Update' : 'Create'}
          </button>
          <button onClick={onClose} className="border dark:border-gray-600 dark:text-gray-300 px-4 py-2 rounded">Cancel</button>
        </div>
      </div>
    </motion.div>
  );
}
