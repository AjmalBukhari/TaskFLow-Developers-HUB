import { useEffect, useState, useCallback } from 'react';
import { motion } from 'framer-motion';

import {
  getBinTasks,
  restoreTask,
  permanentDeleteTask
} from '../../services/api';
import ConfirmModal from '../ui/ConfirmModal';

export default function BinTask({ showToast }) {

  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    type: "default",
    title: "",
    message: "",
    onConfirm: () => {}
  });

  // ================= FETCH BIN TASKS =================
  const fetchTasks = useCallback(async () => {
    try {
      setLoading(true);
      const { data } = await getBinTasks();
      setTasks(data);
    } catch (err) {
      showToast('Failed to load bin tasks', 'error');
    } finally {
      setLoading(false);
    }
  }, [showToast]); // ✅ dependency added

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]); // ✅ clean

  // ================= RESTORE =================
  const handleRestore = async (id) => {
    setConfirmModal({
      isOpen: true,
      type: "default",
      title: "Restore Task",
      message: "Are you sure you want to restore this task? It will be moved back to your active tasks.",
      onConfirm: async () => {
        try {
          await restoreTask(id);
          showToast('Task restored');
          fetchTasks();
        } catch {
          showToast('Failed to restore', 'error');
        }
      }
    });
  };

  // ================= PERMANENT DELETE =================
  const handleDelete = async (id) => {
    setConfirmModal({
      isOpen: true,
      type: "danger",
      title: "Permanently Delete",
      message: "This action cannot be undone. The task will be permanently deleted.",
      onConfirm: async () => {
        try {
          await permanentDeleteTask(id);
          showToast('Task permanently deleted', 'error');
          fetchTasks();
        } catch {
          showToast('Delete failed', 'error');
        }
      }
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="max-w-5xl mx-auto space-y-5"
    >

      {/* HEADER */}
      <div>
        <h1 className="text-2xl font-semibold">Bin Tasks</h1>
        <p className="text-sm text-gray-500">
          Deleted tasks are stored here for 7 days
        </p>
      </div>

      {/* CONTENT */}
      <div className="bg-white p-5 rounded-xl shadow-sm border">

        {loading ? (
          <p className="text-sm text-gray-500">Loading...</p>
        ) : tasks.length === 0 ? (
          <p className="text-sm text-gray-400">
            No deleted tasks
          </p>
        ) : (
          <div className="space-y-3">

            {tasks.map(task => (
              <motion.div
                key={task._id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex justify-between items-center border p-3 rounded-lg"
              >

                {/* LEFT */}
                <div>
                  <h4 className="font-medium line-through text-gray-500">
                    {task.title}
                  </h4>
                  <p className="text-xs text-gray-400">
                    {task.description}
                  </p>
                </div>

                {/* ACTIONS */}
                <div className="flex gap-2">

                  <button
                    onClick={() => handleRestore(task._id)}
                    className="px-3 py-1 text-sm bg-green-100 text-green-700 rounded hover:bg-green-200"
                  >
                    Restore
                  </button>

                  <button
                    onClick={() => handleDelete(task._id)}
                    className="px-3 py-1 text-sm bg-red-100 text-red-700 rounded hover:bg-red-200"
                  >
                    Delete
                  </button>

                </div>

              </motion.div>
            ))}

          </div>
        )}

      </div>

      {/* CONFIRM MODAL */}
      <ConfirmModal
        isOpen={confirmModal.isOpen}
        onClose={() => setConfirmModal({ ...confirmModal, isOpen: false })}
        onConfirm={confirmModal.onConfirm}
        title={confirmModal.title}
        message={confirmModal.message}
        type={confirmModal.type}
      />

    </motion.div>
  );
}