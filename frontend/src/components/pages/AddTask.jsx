import { useState } from "react";
import { motion } from "framer-motion";
import TaskForm from "../TaskForm";
import FileUpload from "../ui/FileUpload";

export default function AddTask({ showToast, onTaskAdded }) {
  const [createdTaskId, setCreatedTaskId] = useState(null);

  if (createdTaskId) {
    return (
      <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25 }} className="max-w-3xl mx-auto dark:text-gray-100">
        <div className="mb-5">
          <h1 className="text-2xl font-semibold dark:text-white">Task Created!</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">You can now attach files to this task</p>
        </div>
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm dark:shadow-gray-900/50 border dark:border-gray-700">
          <FileUpload taskId={createdTaskId} showToast={showToast} />
          <div className="flex gap-2 mt-4 pt-4 border-t dark:border-gray-700">
            <button onClick={() => { setCreatedTaskId(null); if (onTaskAdded) onTaskAdded(); }}
              className="bg-indigo-600 dark:bg-indigo-500 text-white px-4 py-2 rounded text-sm">
              Add Another Task
            </button>
            <button onClick={() => window.location.hash = "#/"}
              className="border dark:border-gray-600 dark:text-gray-300 px-4 py-2 rounded text-sm">
              Go to All Tasks
            </button>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }} className="max-w-3xl mx-auto dark:text-gray-100">
      <div className="mb-5">
        <h1 className="text-2xl font-semibold dark:text-white">Add New Task</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">Create and organize your tasks efficiently</p>
      </div>
      <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm dark:shadow-gray-900/50 border dark:border-gray-700">
        <TaskForm onClose={() => {}} onSaved={(id) => { if (id) setCreatedTaskId(id); if (onTaskAdded) onTaskAdded(); }} showToast={showToast} />
      </div>
    </motion.div>
  );
}
