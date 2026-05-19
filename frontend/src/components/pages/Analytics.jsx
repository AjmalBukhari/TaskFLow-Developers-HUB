import { useCallback, useEffect, useState } from "react";
import { motion } from "framer-motion";

import { getAnalyticsOverview, getAnalyticsTrends, getUserAnalytics } from "../../services/api";
import { useNotifications } from "../../context/NotificationContext";

// Simple chart component (can be replaced with Chart.js or Recharts)
const SimpleChart = ({ data, title, type = 'bar' }) => {
  const maxValue = Math.max(...data.map(d => d.count), 1);
  
  return (
    <div className="bg-white p-4 rounded-xl shadow-sm">
      <h3 className="text-lg font-semibold mb-3">{title}</h3>
      <div className="space-y-2">
        {data.map((item, index) => (
          <div key={index} className="flex items-center gap-2">
            <span className="text-sm w-20">{item._id}</span>
            <div className="flex-1 bg-gray-200 rounded-full h-4">
              <div 
                className="bg-indigo-600 h-4 rounded-full transition-all duration-300"
                style={{ width: `${(item.count / maxValue) * 100}%` }}
              />
            </div>
            <span className="text-sm w-8 text-right">{item.count}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

const Analytics = ({ showToast }) => {
  const [overview, setOverview] = useState(null);
  const [trends, setTrends] = useState(null);
  const [userStats, setUserStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState('week');

  const { fetchNotifications } = useNotifications();

  // Fetch analytics data
  const fetchAnalytics = useCallback(async () => {
    try {
      setLoading(true);
      
      const [overviewData, trendsData, userData] = await Promise.all([
        getAnalyticsOverview(),
        getAnalyticsTrends(selectedPeriod),
        getUserAnalytics()
      ]);

      setOverview(overviewData.data);
      setTrends(trendsData.data);
      setUserStats(userData.data);
    } catch (error) {
      showToast("Failed to load analytics", "error");
    } finally {
      setLoading(false);
    }
  }, [selectedPeriod, showToast]);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  // Stats cards
  const StatCard = ({ title, value, icon, color = "bg-indigo-100" }) => (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white p-4 rounded-xl shadow-sm"
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-500">{title}</p>
          <h3 className="text-2xl font-bold">{value}</h3>
        </div>
        <div className={`p-3 rounded-lg ${color}`}>
          {icon}
        </div>
      </div>
    </motion.div>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Analytics Dashboard</h1>
          <p className="text-gray-500">Track your productivity and task trends</p>
        </div>
        <div className="flex gap-2">
          {['week', 'month', 'year'].map((period) => (
            <button
              key={period}
              onClick={() => setSelectedPeriod(period)}
              className={`px-4 py-2 rounded-lg transition-colors ${
                selectedPeriod === period
                  ? 'bg-indigo-600 text-white'
                  : 'bg-gray-100 hover:bg-gray-200'
              }`}
            >
              {period.charAt(0).toUpperCase() + period.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Overview Stats */}
      {overview && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard
            title="Total Tasks"
            value={overview.totalTasks}
            icon="📋"
            color="bg-blue-100"
          />
          <StatCard
            title="Completed"
            value={overview.completedTasks}
            icon="✅"
            color="bg-green-100"
          />
          <StatCard
            title="Pending"
            value={overview.pendingTasks}
            icon="⏳"
            color="bg-yellow-100"
          />
          <StatCard
            title="Overdue"
            value={overview.overdueTasks}
            icon="🚨"
            color="bg-red-100"
          />
        </div>
      )}

      {/* Additional Stats */}
      {overview && (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <StatCard
            title="Due Today"
            value={overview.dueToday}
            icon="📅"
            color="bg-purple-100"
          />
          <StatCard
            title="Shared Tasks"
            value={overview.sharedTasks}
            icon="👥"
            color="bg-pink-100"
          />
          <StatCard
            title="Completion Rate"
            value={`${overview.completionRate}%`}
            icon="📊"
            color="bg-indigo-100"
          />
        </div>
      )}

      {/* Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Status Distribution */}
        {overview && (
          <SimpleChart
            data={[
              { _id: 'Pending', count: overview.pendingTasks },
              { _id: 'In Progress', count: overview.inProgressTasks },
              { _id: 'Completed', count: overview.completedTasks }
            ]}
            title="Task Status Distribution"
            type="bar"
          />
        )}

        {/* Creation Trends */}
        {trends?.creationTrends && (
          <SimpleChart
            data={trends.creationTrends}
            title="Task Creation Trends"
            type="line"
          />
        )}

        {/* Completion Trends */}
        {trends?.completionTrends && (
          <SimpleChart
            data={trends.completionTrends}
            title="Task Completion Trends"
            type="line"
          />
        )}

        {/* Priority Distribution */}
        {userStats?.priorityDistribution && (
          <SimpleChart
            data={userStats.priorityDistribution}
            title="Priority Distribution"
            type="pie"
          />
        )}
      </div>

      {/* Monthly Trends */}
      {userStats?.monthlyTrends && (
        <div className="bg-white p-6 rounded-xl shadow-sm">
          <h3 className="text-lg font-semibold mb-4">Monthly Trends</h3>
          <div className="space-y-3">
            {userStats.monthlyTrends.map((trend, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span>{trend._id.year}-{trend._id.month.toString().padStart(2, '0')}</span>
                <span className="font-semibold">{trend.count} tasks</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default Analytics;