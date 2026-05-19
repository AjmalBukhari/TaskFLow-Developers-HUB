import { useEffect, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { getProfile, updateProfile, deleteAccount } from '../../services/api';

export default function Account({ showToast, onLogout }) {
  const [user, setUser] = useState(null);
  const [form, setForm] = useState({ fullname: '', email: '', password: '' });
  const [deletePassword, setDeletePassword] = useState('');
  const [loading, setLoading] = useState(false);

  const fetchUser = useCallback(async () => {
    try {
      const { data } = await getProfile();
      const userData = data.data?.user || data.data;
      setUser(userData);
      setForm({ fullname: userData.fullname || '', email: userData.email || '', password: '' });
    } catch {
      showToast('Failed to load account', 'error');
    }
  }, [showToast]);

  useEffect(() => { fetchUser(); }, [fetchUser]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleUpdate = async () => {
    try {
      setLoading(true);
      await updateProfile(form);
      showToast('Account updated');
      setForm({ ...form, password: '' });
    } catch {
      showToast('Update failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deletePassword) {
      showToast('Please enter your current password to delete account', 'error');
      return;
    }
    if (!window.confirm('Are you sure you want to delete your account? This will permanently delete your account and all tasks.')) return;
    try {
      setLoading(true);
      await deleteAccount({ password: deletePassword });
      showToast('Account deleted', 'error');
      localStorage.removeItem('token');
      onLogout();
    } catch {
      showToast('Failed to delete account', 'error');
    } finally {
      setLoading(false);
    }
  };

  if (!user) return <p className="text-gray-500 dark:text-gray-400">Loading...</p>;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-semibold dark:text-white">Account Settings</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">Manage your personal information and account</p>
      </div>

      <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm dark:shadow-gray-900/50 border dark:border-gray-700 space-y-4">
        <h2 className="text-lg font-medium dark:text-gray-100">Update Account</h2>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">Full Name</label>
          <input
            name="fullname"
            type="text"
            value={form.fullname}
            onChange={handleChange}
            placeholder="Enter your full name"
            className="w-full border dark:border-gray-600 p-2 rounded focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">Email</label>
          <input
            name="email"
            type="email"
            value={form.email}
            placeholder="Enter your email"
            className="w-full border dark:border-gray-600 p-2 rounded bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed"
            readOnly
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">New Password (optional)</label>
          <input
            name="password"
            type="password"
            value={form.password}
            onChange={handleChange}
            placeholder="New password"
            className="w-full border dark:border-gray-600 p-2 rounded focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400"
          />
        </div>
        <button
          onClick={handleUpdate}
          disabled={loading}
          className="bg-indigo-600 dark:bg-indigo-500 text-white px-4 py-2 rounded hover:bg-indigo-700 transition disabled:opacity-50"
        >
          {loading ? 'Updating...' : 'Update Account'}
        </button>
      </div>

      <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm dark:shadow-gray-900/50 border dark:border-gray-700 space-y-4">
        <h2 className="text-lg font-medium dark:text-gray-100 text-red-600 dark:text-red-400">Danger Zone</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400">Permanently delete your account and all your tasks.</p>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
            Current Password <span className="text-red-500 dark:text-red-400">*</span>
          </label>
          <input
            type="password"
            value={deletePassword}
            onChange={(e) => setDeletePassword(e.target.value)}
            placeholder="Enter your current password"
            className="w-full border dark:border-gray-600 p-2 rounded focus:ring-2 focus:ring-red-500"
          />
        </div>
        <button
          onClick={handleDelete}
          disabled={loading}
          className="bg-red-600 dark:bg-red-500 text-white px-4 py-2 rounded hover:bg-red-700 transition disabled:opacity-50"
        >
          {loading ? 'Deleting...' : 'Delete Account'}
        </button>
      </div>
    </motion.div>
  );
}
