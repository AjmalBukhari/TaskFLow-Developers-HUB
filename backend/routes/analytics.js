const express = require('express');
const router = express.Router();

const analyticsController = require('../controllers/analyticsController');
const auth = require('../middleware/auth');

// ================= GET ANALYTICS OVERVIEW =================
router.get('/overview', auth, analyticsController.getAnalyticsOverview);
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

// ================= GET ANALYTICS TRENDS =================
router.get('/trends', auth, analyticsController.getAnalyticsTrends);

// ================= GET USER ANALYTICS =================
router.get('/user', auth, analyticsController.getUserAnalytics);

module.exports = router;
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