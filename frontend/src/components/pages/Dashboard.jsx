import { useCallback, useEffect, useState } from "react";
import { motion } from "framer-motion";

import { getAllTasks, getAnalyticsOverview } from "../../services/api";
import ProgressBar from "../ProgressBar";

export default function Dashboard({ showToast, onChange }) {
  const [tasks, setTasks] = useState([]);
  const [analytics, setAnalytics] = useState(null);

  // ================= FETCH =================
  const fetchTasks = useCallback(async () => {
    try {
      const { data } = await getAllTasks({});
      setTasks(data);
    } catch {
      showToast("Failed to load tasks", "error");
    }
  }, [showToast]);

  const fetchAnalytics = useCallback(async () => {
    try {
      const { data } = await getAnalyticsOverview();
      setAnalytics(data);
    } catch {
      showToast("Failed to load analytics", "error");
    }
  }, [showToast]);

  useEffect(() => {
    fetchTasks();
    fetchAnalytics();
  }, [fetchTasks, fetchAnalytics]);

  // ================= STATS =================
  const total = tasks.length;
  const completed = tasks.filter((t) => t.status === "Completed").length;
  const pending = tasks.filter((t) => t.status === "Pending").length;

  const Card = ({ title, value }) => (
    <div className="bg-white p-4 rounded-xl shadow-sm">
      <p className="text-sm text-gray-500">{title}</p>
      <h3 className="text-xl font-semibold">{value}</h3>
    </div>
  );

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-5"
    >
      <ProgressBar tasks={tasks} />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card title="Total Tasks" value={analytics?.totalTasks ?? total} />
        <Card title="Completed" value={analytics?.completedTasks ?? completed} />
        <Card title="Pending" value={analytics?.pendingTasks ?? pending} />
        <Card title="Overdue" value={analytics?.overdueTasks ?? 0} />
        <Card title="Due Today" value={analytics?.dueToday ?? 0} />
        <Card title="Shared" value={analytics?.sharedTasks ?? 0} />
        <Card title="Completion" value={`${analytics?.completionRate ?? 0}%`} />
      </div>

      {/* TASK LIST */}
      <div className="bg-white rounded-xl shadow-sm p-4">
        <h2 className="text-lg font-semibold mb-3">Recent Tasks</h2>

        {tasks.slice(0, 5).map((task) => (
          <div
            key={task._id}
            className="border p-3 rounded-lg flex justify-between"
          >
            <div>
              <h4 className="font-medium">{task.title}</h4>
              <p className="text-xs text-gray-500">{task.description}</p>
            </div>

            <span className="text-xs text-gray-500">{task.status}</span>
          </div>
        ))}
        <button onClick={() => onChange('All Tasks')} className="border px-3 py-2 rounded m-3 hover:bg-gray-100 transition">See All Tasks</button>
      </div>
    </motion.div>
  );
}
