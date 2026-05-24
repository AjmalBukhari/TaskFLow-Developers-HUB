import { useEffect, useState, useCallback } from "react";
import { motion } from "framer-motion";
import { getProfile } from "../../services/api";

export default function Profile({ showToast }) {
  const [user, setUser] = useState(null);

  const fetchUser = useCallback(async () => {
    try {
      const { data } = await getProfile();
      setUser(data.data?.user || data.data);
    } catch {
      showToast("Failed to load profile", "error");
    }
  }, [showToast]);

  useEffect(() => { fetchUser(); }, [fetchUser]);

  if (!user) return <p className="text-gray-500 dark:text-gray-400">Loading...</p>;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-3xl mx-auto space-y-5">
      <div>
        <h1 className="text-2xl font-semibold dark:text-white">Profile</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">Your account information</p>
      </div>
      <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm dark:shadow-gray-900/50 border dark:border-gray-700 space-y-5">
        <div>
          <p className="text-sm text-gray-500 dark:text-gray-400">User ID</p>
          <p className="font-mono text-sm dark:text-gray-300">{user.id || user._id}</p>
        </div>
        <div>
          <p className="text-sm text-gray-500 dark:text-gray-400">Email</p>
          <p className="font-medium dark:text-gray-100">{user.email}</p>
        </div>
        <div>
          <p className="text-sm text-gray-500 dark:text-gray-400">Full Name</p>
          <p className="font-medium dark:text-gray-100">{user.fullname}</p>
        </div>
      </div>
    </motion.div>
  );
}
