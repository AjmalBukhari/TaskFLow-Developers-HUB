import { motion } from "framer-motion";
import TaskForm from "../TaskForm";

export default function AddTask({ showToast, onTaskAdded }) {
  return (
    <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }} className="max-w-3xl mx-auto dark:text-gray-100">
      <div className="mb-5">
        <h1 className="text-2xl font-semibold dark:text-white">Add New Task</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">Create and organize your tasks efficiently</p>
      </div>
      <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm dark:shadow-gray-900/50 border dark:border-gray-700">
        <TaskForm onClose={() => {}} onSaved={() => { if (onTaskAdded) onTaskAdded(); }} showToast={showToast} />
      </div>
    </motion.div>
  );
}
