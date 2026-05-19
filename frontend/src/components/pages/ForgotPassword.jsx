import { useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { changePassword } from '../../services/api';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !newPassword) return;
    if (newPassword.length < 6) return;

    try {
      setLoading(true);
      await changePassword({ email, newPassword });
      setSuccess(true);
    } catch {
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-gray-800 shadow-md dark:shadow-gray-900/50 rounded-xl p-6 w-80 text-center dark:text-gray-100"
        >
          <div className="text-5xl mb-4">🔒</div>
          <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100 mb-2">Password Changed!</h2>
          <p className="text-gray-600 dark:text-gray-300 text-sm mb-4">Your password has been successfully updated.</p>
          <Link to="/login" className="inline-block bg-indigo-600 dark:bg-indigo-500 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 dark:hover:bg-indigo-600 transition text-sm">
            Click here to login
          </Link>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white dark:bg-gray-800 shadow-md dark:shadow-gray-900/50 rounded-xl p-6 w-80"
      >
        <div className="text-center mb-6">
          <div className="text-5xl mb-2">🔐</div>
          <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100">Forgot Password</h2>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              className="w-full border dark:border-gray-600 p-2 rounded focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 outline-none"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">New Password</label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="At least 6 characters"
              className="w-full border dark:border-gray-600 p-2 rounded focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 outline-none"
              required
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-600 dark:bg-indigo-500 text-white py-2 rounded hover:bg-indigo-700 dark:hover:bg-indigo-600 transition disabled:opacity-50"
          >
            {loading ? 'Setting Password...' : 'Set New Password'}
          </button>
          <div className="text-center">
            <Link to="/login" className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 text-sm">
              ← Back to Login
            </Link>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
