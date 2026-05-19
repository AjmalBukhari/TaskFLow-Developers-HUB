import { useEffect, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  getProfile,
  updateProfile,
  deleteAccount
} from '../../services/api';

export default function Account({ showToast, onLogout }) {

  const [user, setUser] = useState(null);
  const [form, setForm] = useState({
    fullname: '',
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);

  // ================= FETCH USER =================
  const fetchUser = useCallback(async () => {
    try {
      const { data } = await getProfile();
      setUser(data.data);

      setForm({
        fullname: data.data.fullname || '',
        email: data.data.email || '',
        password: ''
      });

    } catch {
      showToast('Failed to load account', 'error');
    }
  }, [showToast]);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  // ================= HANDLE INPUT =================
  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value
    });
  };

  // ================= UPDATE ACCOUNT =================
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

  // ================= DELETE ACCOUNT =================
  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete your account? This will permanently delete your account and all tasks.')) return;

    try {
      setLoading(true);

      await deleteAccount({ password: form.password });

      showToast('Account deleted', 'error');

      localStorage.removeItem('token');
      onLogout();

    } catch {
      showToast('Failed to delete account', 'error');
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return <p className="text-gray-500">Loading...</p>;
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="max-w-3xl mx-auto space-y-6"
    >

      {/* HEADER */}
      <div>
        <h1 className="text-2xl font-semibold">Account Settings</h1>
        <p className="text-sm text-gray-500">
          Manage your personal information and account
        </p>
      </div>

      {/* ================= ACCOUNT FORM ================= */}
      <div className="bg-white p-6 rounded-xl shadow-sm border space-y-4">
        <h2 className="text-lg font-medium">Update Account</h2>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Full Name
          </label>
          <input
            name="fullname"
            type="text"
            value={form.fullname}
            onChange={handleChange}
            placeholder="Enter your full name"
            className="w-full border p-2 rounded focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Email
          </label>
          <input
            name="email"
            type="email"
            value={form.email}
            onChange={handleChange}
            placeholder="Enter your email"
            className="w-full border p-2 rounded focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            New Password (optional)
          </label>
          <input
            name="password"
            type="password"
            value={form.password}
            onChange={handleChange}
            placeholder="New password"
            className="w-full border p-2 rounded focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <button
          onClick={handleUpdate}
          disabled={loading}
          className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700 transition disabled:opacity-50"
        >
          {loading ? 'Updating...' : 'Update Account'}
        </button>
      </div>

      {/* User ID Display */}
      <div className="bg-white p-6 rounded-xl shadow-sm border space-y-2">
        <h2 className="text-lg font-medium">User Information</h2>
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">
            User ID
          </label>
          <div className="w-full bg-gray-50 border border-gray-200 p-2 rounded text-sm font-mono text-gray-600">
            {user._id}
          </div>
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">
            Email
          </label>
          <div className="text-sm text-gray-700">{user.email}</div>
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">
            Full Name
          </label>
          <div className="text-sm text-gray-700">{user.fullname}</div>
        </div>
      </div>

      {/* ================= DELETE ACCOUNT ================= */}
      <div className="bg-white p-6 rounded-xl shadow-sm border space-y-4">
        <h2 className="text-lg font-medium text-red-600">Danger Zone</h2>
        <p className="text-sm text-gray-500">
          Permanently delete your account and all your tasks.
        </p>
        <button
          onClick={handleDelete}
          disabled={loading}
          className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition disabled:opacity-50"
        >
          {loading ? 'Deleting...' : 'Delete Account'}
        </button>
      </div>

    </motion.div>
  );
}
