const express = require('express');
const router = express.Router();

const Task = require('../models/Task');
const auth = require('../middleware/auth');

// ======================================================
// ================= GET ANALYTICS OVERVIEW =================
// ======================================================
router.get('/overview', auth, async (req, res) => {
  try {
    const userId = req.user.id;

    // Get task counts by status
    const statusCounts = await Task.aggregate([
      { $match: { user: userId, isDeleted: false } },
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);

    // Get total tasks
    const totalTasks = await Task.countDocuments({ user: userId, isDeleted: false });

    // Get completed tasks
    const completedTasks = await Task.countDocuments({ 
      user: userId, 
      isDeleted: false, 
      status: 'Completed' 
    });

    // Get overdue tasks
    const overdueTasks = await Task.countDocuments({
      user: userId,
      isDeleted: false,
      status: { $ne: 'Completed' },
      dueDate: { $lt: new Date() }
    });

    // Get tasks due today
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const dueToday = await Task.countDocuments({
      user: userId,
      isDeleted: false,
      dueDate: { $gte: today, $lt: tomorrow }
    });

    // Get shared tasks count
    const sharedTasks = await Task.countDocuments({
      sharedWith: userId,
      isDeleted: false
    });

    // Format status counts
    const statusMap = { Pending: 0, 'In Progress': 0, Completed: 0 };
    statusCounts.forEach(item => {
      statusMap[item._id] = item.count;
    });

    res.json({
      totalTasks,
      completedTasks,
      pendingTasks: statusMap.Pending,
      inProgressTasks: statusMap['In Progress'],
      overdueTasks,
      dueToday,
      sharedTasks,
      completionRate: totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0
    });

  } catch (err) {
    res.status(500).json({
      message: 'Server error',
      error: err.message
    });
  }
});

// ======================================================
// ================= GET ANALYTICS TRENDS =================
// ======================================================
router.get('/trends', auth, async (req, res) => {
  try {
    const userId = req.user.id;
    const { period = 'week' } = req.query;

    let dateFilter = {};
    const now = new Date();

    switch (period) {
      case 'week':
        dateFilter = { $gte: new Date(now.setDate(now.getDate() - 7)) };
        break;
      case 'month':
        dateFilter = { $gte: new Date(now.setMonth(now.getMonth() - 1)) };
        break;
      case 'year':
        dateFilter = { $gte: new Date(now.setFullYear(now.getFullYear() - 1)) };
        break;
      default:
        dateFilter = { $gte: new Date(now.setDate(now.getDate() - 7)) };
    }

    // Get daily task creation trend
    const creationTrend = await Task.aggregate([
      { $match: { user: userId, isDeleted: false, createdAt: dateFilter } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // Get daily completion trend
    const completionTrend = await Task.aggregate([
      { 
        $match: { 
          user: userId, 
          isDeleted: false, 
          status: 'Completed',
          updatedAt: dateFilter 
        } 
      },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$updatedAt' } },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    res.json({
      creationTrend,
      completionTrend
    });

  } catch (err) {
    res.status(500).json({
      message: 'Server error',
      error: err.message
    });
  }
});

// ======================================================
// ================= GET PRIORITY DISTRIBUTION =================
// ======================================================
router.get('/priority', auth, async (req, res) => {
  try {
    const userId = req.user.id;

    const priorityCounts = await Task.aggregate([
      { $match: { user: userId, isDeleted: false } },
      { $group: { _id: '$priority', count: { $sum: 1 } } }
    ]);

    const priorityMap = { Low: 0, Medium: 0, High: 0 };
    priorityCounts.forEach(item => {
      priorityMap[item._id] = item.count;
    });

    res.json(priorityMap);

  } catch (err) {
    res.status(500).json({
      message: 'Server error',
      error: err.message
    });
  }
});

module.exports = router;