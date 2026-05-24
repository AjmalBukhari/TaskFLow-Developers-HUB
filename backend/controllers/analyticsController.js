const supabase = require('../config/supabase');
const AppError = require('../utils/appError');

exports.getOverview = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay());
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

    const { count: totalTasks } = await supabase.from('tasks').select('*', { count: 'exact' }).eq('user_id', userId).eq('isDeleted', false);
    const { count: completedTasks } = await supabase.from('tasks').select('*', { count: 'exact' }).eq('user_id', userId).eq('isDeleted', false).eq('status', 'Completed');
    const { count: pendingTasks } = await supabase.from('tasks').select('*', { count: 'exact' }).eq('user_id', userId).eq('isDeleted', false).eq('status', 'Pending');
    const { count: inProgressTasks } = await supabase.from('tasks').select('*', { count: 'exact' }).eq('user_id', userId).eq('isDeleted', false).eq('status', 'In Progress');
    const { count: highPriorityTasks } = await supabase.from('tasks').select('*', { count: 'exact' }).eq('user_id', userId).eq('isDeleted', false).eq('priority', 'High');

    res.json({
      status: 'success',
      data: {
        totalTasks: totalTasks || 0,
        completedTasks: completedTasks || 0,
        pendingTasks: pendingTasks || 0,
        inProgressTasks: inProgressTasks || 0,
        highPriorityTasks: highPriorityTasks || 0,
        dueTodayTasks: 0,
        weeklyCreated: 0,
        weeklyCompleted: 0,
        monthlyCreated: 0,
        monthlyCompleted: 0,
        completionRate: totalTasks ? Math.round((completedTasks / totalTasks) * 100) : 0
      }
    });
  } catch (err) {
    next(err);
  }
};

exports.getTrends = async (req, res, next) => {
  try {
    const userId = req.user.id;
    res.json({ status: 'success', data: { weeklyTrends: [], monthlyTrends: [], statusDistribution: [], priorityDistribution: [] } });
  } catch (err) {
    next(err);
  }
};