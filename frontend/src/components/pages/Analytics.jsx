import { useCallback, useEffect, useState } from "react";
import { motion } from "framer-motion";
import { getAnalyticsOverview, getAnalyticsTrends } from "../../services/api";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend, BarChart, Bar, XAxis, YAxis, CartesianGrid } from "recharts";

const COLORS = {
  status: { Pending: '#F59E0B', 'In Progress': '#3B82F6', Completed: '#10B981' },
  priority: { Low: '#10B981', Medium: '#F59E0B', High: '#EF4444' }
};

export default function Analytics({ showToast }) {
  const [overview, setOverview] = useState(null);
  const [trends, setTrends] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [overviewRes, trendsRes] = await Promise.all([
        getAnalyticsOverview(),
        getAnalyticsTrends()
      ]);
      setOverview(overviewRes.data.data);
      setTrends(trendsRes.data.data);
    } catch {
      showToast("Failed to load analytics", "error");
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => { fetchData(); }, [fetchData]);

  if (loading) return <p className="text-gray-500 dark:text-gray-400">Loading analytics...</p>;
  if (!overview) return <p className="text-gray-500 dark:text-gray-400">No data available</p>;

  const statusData = trends?.statusDistribution?.map(s => ({
    name: s._id,
    value: s.count,
    fill: COLORS.status[s._id] || '#6B7280'
  })) || [];

  const priorityData = trends?.priorityDistribution?.map(p => ({
    name: p._id,
    value: p.count,
    fill: COLORS.priority[p._id] || '#6B7280'
  })) || [];

  const weeklyData = trends?.weeklyTrends?.map(w => {
    const item = { date: w._id };
    w.statuses?.forEach(s => { item[s.status] = s.count; });
    return item;
  }) || [];

  const monthlyData = trends?.monthlyTrends?.map(m => {
    const item = { month: m._id };
    m.statuses?.forEach(s => { item[s.status] = s.count; });
    return item;
  }) || [];

  const StatCard = ({ title, value, icon, color }) => (
    <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm dark:shadow-gray-900/50 border-l-4" style={{ borderColor: color }}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-500 dark:text-gray-400">{title}</p>
          <h3 className="text-2xl font-semibold dark:text-gray-100">{value}</h3>
        </div>
        <span className="text-2xl">{icon}</span>
      </div>
    </div>
  );

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold dark:text-white">Analytics Dashboard</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">Track your productivity and task trends</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard title="Total Tasks" value={overview.totalTasks} icon="📋" color="#6366F1" />
        <StatCard title="Completed" value={overview.completedTasks} icon="✅" color="#10B981" />
        <StatCard title="Pending" value={overview.pendingTasks} icon="⏳" color="#F59E0B" />
        <StatCard title="Overdue" value={overview.overdueTasks} icon="⚠️" color="#EF4444" />
        <StatCard title="In Progress" value={overview.inProgressTasks} icon="🔄" color="#3B82F6" />
        <StatCard title="Due Today" value={overview.dueTodayTasks} icon="📅" color="#8B5CF6" />
        <StatCard title="Shared" value={overview.sharedTasks} icon="🤝" color="#06B6D4" />
        <StatCard title="Completion" value={`${overview.completionRate}%`} icon="📈" color="#10B981" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-800 p-5 rounded-xl shadow-sm dark:shadow-gray-900/50">
          <h3 className="text-lg font-semibold mb-4 dark:text-gray-100">Status Distribution</h3>
          {statusData.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie data={statusData} cx="50%" cy="50%" outerRadius={80} dataKey="value" label={({ name, value }) => `${name}: ${value}`}>
                  {statusData.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          ) : <p className="text-gray-400 text-sm">No data</p>}
        </div>

        <div className="bg-white dark:bg-gray-800 p-5 rounded-xl shadow-sm dark:shadow-gray-900/50">
          <h3 className="text-lg font-semibold mb-4 dark:text-gray-100">Priority Distribution</h3>
          {priorityData.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie data={priorityData} cx="50%" cy="50%" outerRadius={80} dataKey="value" label={({ name, value }) => `${name}: ${value}`}>
                  {priorityData.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          ) : <p className="text-gray-400 text-sm">No data</p>}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-800 p-5 rounded-xl shadow-sm dark:shadow-gray-900/50">
          <h3 className="text-lg font-semibold mb-4 dark:text-gray-100">Weekly Trends</h3>
          {weeklyData.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={weeklyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="date" stroke="#9CA3AF" />
                <YAxis stroke="#9CA3AF" />
                <Tooltip contentStyle={{ backgroundColor: '#1F2937', border: 'none', borderRadius: '8px' }} />
                <Legend />
                <Bar dataKey="Pending" fill="#F59E0B" />
                <Bar dataKey="In Progress" fill="#3B82F6" />
                <Bar dataKey="Completed" fill="#10B981" />
              </BarChart>
            </ResponsiveContainer>
          ) : <p className="text-gray-400 text-sm">No data</p>}
        </div>

        <div className="bg-white dark:bg-gray-800 p-5 rounded-xl shadow-sm dark:shadow-gray-900/50">
          <h3 className="text-lg font-semibold mb-4 dark:text-gray-100">Monthly Trends</h3>
          {monthlyData.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="month" stroke="#9CA3AF" />
                <YAxis stroke="#9CA3AF" />
                <Tooltip contentStyle={{ backgroundColor: '#1F2937', border: 'none', borderRadius: '8px' }} />
                <Legend />
                <Bar dataKey="Pending" fill="#F59E0B" />
                <Bar dataKey="In Progress" fill="#3B82F6" />
                <Bar dataKey="Completed" fill="#10B981" />
              </BarChart>
            </ResponsiveContainer>
          ) : <p className="text-gray-400 text-sm">No data</p>}
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 p-5 rounded-xl shadow-sm dark:shadow-gray-900/50">
        <h3 className="text-lg font-semibold mb-4 dark:text-gray-100">Weekly Summary</h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="p-3 bg-indigo-50 dark:bg-indigo-900/30 rounded-lg">
            <p className="text-sm text-gray-500 dark:text-gray-400">Created This Week</p>
            <p className="text-xl font-semibold dark:text-gray-100">{overview.weeklyCreated}</p>
          </div>
          <div className="p-3 bg-green-50 dark:bg-green-900/30 rounded-lg">
            <p className="text-sm text-gray-500 dark:text-gray-400">Completed This Week</p>
            <p className="text-xl font-semibold dark:text-gray-100">{overview.weeklyCompleted}</p>
          </div>
          <div className="p-3 bg-purple-50 dark:bg-purple-900/30 rounded-lg">
            <p className="text-sm text-gray-500 dark:text-gray-400">Created This Month</p>
            <p className="text-xl font-semibold dark:text-gray-100">{overview.monthlyCreated}</p>
          </div>
          <div className="p-3 bg-emerald-50 dark:bg-emerald-900/30 rounded-lg">
            <p className="text-sm text-gray-500 dark:text-gray-400">Completed This Month</p>
            <p className="text-xl font-semibold dark:text-gray-100">{overview.monthlyCompleted}</p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
