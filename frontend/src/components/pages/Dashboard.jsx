import { useCallback, useEffect, useState } from "react";
import { motion } from "framer-motion";
import { getAllTasks } from "../../services/api";
import ProgressBar from "../ProgressBar";

export default function Dashboard({ showToast, onChange }) {
  const [tasks, setTasks] = useState([]);

  const fetchTasks = useCallback(async () => {
    try {
      const { data } = await getAllTasks({});
      setTasks(data.data);
    } catch {
      showToast("Failed to load tasks", "error");
    }
  }, [showToast]);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  const total = tasks.length;
  const completed = tasks.filter((t) => t.status === "Completed").length;
  const pending = total - completed;
  const overdue = tasks.filter((t) => t.dueDate && new Date(t.dueDate) < new Date() && t.status !== "Completed").length;
  const dueToday = tasks.filter((t) => {
    if (!t.dueDate) return false;
    const d = new Date(t.dueDate);
    const now = new Date();
    return d.toDateString() === now.toDateString();
  }).length;
  const shared = tasks.filter((t) => t.sharedWith?.length > 0).length;
  const rate = total ? Math.round((completed / total) * 100) : 0;

  const Card = ({ title, value }) => (
    <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm dark:shadow-gray-900/50">
      <p className="text-sm text-gray-500 dark:text-gray-400">{title}</p>
      <h3 className="text-xl font-semibold dark:text-gray-100">{value}</h3>
    </div>
  );

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-5">
      <ProgressBar tasks={tasks} />
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card title="Total Tasks" value={total} />
        <Card title="Completed" value={completed} />
        <Card title="Pending" value={pending} />
        <Card title="Overdue" value={overdue} />
        <Card title="Due Today" value={dueToday} />
        <Card title="Shared" value={shared} />
        <Card title="Completion" value={`${rate}%`} />
      </div>
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm dark:shadow-gray-900/50 p-4">
        <h2 className="text-lg font-semibold dark:text-gray-100 mb-3">Recent Tasks</h2>
        {tasks.slice(0, 5).map((task) => (
          <div key={task._id} className="border dark:border-gray-700 p-3 rounded-lg flex justify-between">
            <div>
              <h4 className="font-medium">{task.title}</h4>
              <p className="text-xs text-gray-500 dark:text-gray-400">{task.description}</p>
            </div>
            <span className="text-xs text-gray-500 dark:text-gray-400">{task.status}</span>
          </div>
        ))}
        <button onClick={() => onChange('All Tasks')} className="border px-3 py-2 rounded m-3 hover:bg-gray-100 dark:hover:bg-gray-700 transition dark:text-gray-200">See All Tasks</button>
      </div>
    </motion.div>
  );
}
