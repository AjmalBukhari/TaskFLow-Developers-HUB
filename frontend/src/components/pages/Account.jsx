import { useEffect, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  getProfile,
  updateProfile,
  deleteAccount,
  updatePassword
} from '../../services/api';

export default function Account({ showToast, onLogout }) {

  const [user, setUser] = useState(null);
  const [form, setForm] = useState({
    fullname: '',
    email: '',
    password: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
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

  // ================= CHANGE PASSWORD =================
  const handleChangePassword = async () => {
    if (!form.currentPassword || !form.newPassword || !form.confirmPassword) {
      return showToast("All fields are required", "warning");
    }

    if (form.newPassword !== form.confirmPassword) {
      return showToast("Passwords do not match", "warning");
    }

    if (form.newPassword.length < 6) {
      return showToast("Password must be at least 6 characters", "warning");
    }

    try {
      setLoading(true);

      await updatePassword({
        currentPassword: form.currentPassword,
        newPassword: form.newPassword
      });

      showToast("Password changed successfully");
      setForm({
        ...form,
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
    } catch {
      showToast("Failed to change password", "error");
    } finally {
      setLoading(false);
    }
  };

  // ================= DELETE ACCOUNT =================
  const handleDeleteAccount = async () => {
    const confirm = window.confirm(
      'Are you sure? This will permanently delete your account and all tasks.'
    );

    if (!confirm) return;

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

      {/* ================= CHANGE PASSWORD ================= */}
      <div className="bg-white p-6 rounded-xl shadow-sm border space-y-4">

        <h2 className="text-lg font-medium">Change Password</h2>

        <input
          name="currentPassword"
          type="password"
          value={form.currentPassword}
          onChange={handleChange}
          placeholder="Current Password"
          className="w-full border p-2 rounded focus:ring-2 focus:ring-indigo-500"
        />

        <input
          name="newPassword"
          type="password"
          value={form.newPassword}
          onChange={handleChange}
          placeholder="New Password"
          className="w-full border p-2 rounded focus:ring-2 focus:ring-indigo-500"
        />

        <input
          name="confirmPassword"
          type="password"
          value={form.confirmPassword}
          onChange={handleChange}
          placeholder="Confirm New Password"
          className="w-full border p-2 rounded focus:ring-2 focus:ring-indigo-500"
        />

        <button
          onClick={handleChangePassword}
          disabled={loading}
          className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700 transition disabled:opacity-50"
        >
          {loading ? 'Changing...' : 'Change Password'}
        </button>

      </div>

      {/* ================= ACCOUNT FORM ================= */}
      <div className="bg-white p-6 rounded-xl shadow-sm border space-y-4">

        <h2 className="text-lg font-medium">Account Information</h2>

        <input
          name="fullname"
          value={form.fullname}
          onChange={handleChange}
          placeholder="Full Name"
          className="w-full border p-2 rounded focus:ring-2 focus:ring-indigo-500"
        />

        <input
          name="email"
          value={form.email}
          onChange={handleChange}
          placeholder="Email"
          className="w-full border p-2 rounded focus:ring-2 focus:ring-indigo-500"
          disabled
        />

        {/* User ID Display */}
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">
            User ID
          </label>
          <div className="w-full bg-gray-50 border border-gray-200 p-2 rounded text-sm font-mono text-gray-600">
            {user._id}
          </div>
        </div>

        <input
          name="password"
          type="password"
          value={form.password}
          onChange={handleChange}
          placeholder="New Password (optional)"
          className="w-full border p-2 rounded focus:ring-2 focus:ring-indigo-500"
        />

        <button
          onClick={handleUpdate}
          disabled={loading}
          className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700 transition disabled:opacity-50"
        >
          {loading ? 'Saving...' : 'Save Changes'}
        </button>

      </div>

      {/* ================= DANGER ZONE ================= */}
      <div className="bg-red-50 border border-red-200 p-6 rounded-xl space-y-3">

        <h2 className="text-lg font-medium text-red-600">
          Danger Zone
        </h2>

        <p className="text-sm text-red-500">
          Once you delete your account, there is no going back. All your data will be permanently removed.
        </p>

        <button
          onClick={handleDeleteAccount}
          className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition"
        >
          Delete Account
        </button>

      </div>

    </motion.div>
  );
}