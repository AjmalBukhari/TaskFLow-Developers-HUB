const Task = require('../models/Task');

// ================= GET ANALYTICS OVERVIEW =================
exports.getOverview = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay());
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

    const [
      totalTasks,
      completedTasks,
      pendingTasks,
      inProgressTasks,
      overdueTasks,
      dueTodayTasks,
      sharedTasks,
      highPriorityTasks,
      weeklyCreated,
      weeklyCompleted,
      monthlyCreated,
      monthlyCompleted
    ] = await Promise.all([
      Task.countDocuments({
        $or: [{ user: userId }, { sharedWith: userId }],
        isDeleted: false
      }),
      Task.countDocuments({
        $or: [{ user: userId }, { sharedWith: userId }],
        isDeleted: false,
        status: 'Completed'
      }),
      Task.countDocuments({
        $or: [{ user: userId }, { sharedWith: userId }],
        isDeleted: false,
        status: 'Pending'
      }),
      Task.countDocuments({
        $or: [{ user: userId }, { sharedWith: userId }],
        isDeleted: false,
        status: 'In Progress'
      }),
      Task.countDocuments({
        $or: [{ user: userId }, { sharedWith: userId }],
        isDeleted: false,
        status: { $ne: 'Completed' },
        dueDate: { $lt: now }
      }),
      Task.countDocuments({
        $or: [{ user: userId }, { sharedWith: userId }],
        isDeleted: false,
        dueDate: { $gte: today, $lt: new Date(today.getTime() + 86400000) }
      }),
      Task.countDocuments({
        $or: [{ user: userId }, { sharedWith: userId }],
        isDeleted: false,
        sharedWith: { $size: { $gt: 0 } }
      }),
      Task.countDocuments({
        $or: [{ user: userId }, { sharedWith: userId }],
        isDeleted: false,
        priority: 'High'
      }),
      Task.countDocuments({
        $or: [{ user: userId }, { sharedWith: userId }],
        isDeleted: false,
        createdAt: { $gte: startOfWeek }
      }),
      Task.countDocuments({
        $or: [{ user: userId }, { sharedWith: userId }],
        isDeleted: false,
        status: 'Completed',
        updatedAt: { $gte: startOfWeek }
      }),
      Task.countDocuments({
        $or: [{ user: userId }, { sharedWith: userId }],
        isDeleted: false,
        createdAt: { $gte: startOfMonth }
      }),
      Task.countDocuments({
        $or: [{ user: userId }, { sharedWith: userId }],
        isDeleted: false,
        status: 'Completed',
        updatedAt: { $gte: startOfMonth }
      })
    ]);

    const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

    res.json({
      status: 'success',
      data: {
        totalTasks,
        completedTasks,
        pendingTasks,
        inProgressTasks,
        overdueTasks,
        dueTodayTasks,
        sharedTasks,
        highPriorityTasks,
        weeklyCreated,
        weeklyCompleted,
        monthlyCreated,
        monthlyCompleted,
        completionRate
      }
    });
  } catch (err) {
    next(err);
  }
};

// ================= GET ANALYTICS TRENDS =================
exports.getTrends = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const now = new Date();

    // Weekly trends - last 7 days
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    const weeklyTrends = await Task.aggregate([
      {
        $match: {
          $or: [{ user: userId }, { sharedWith: userId }],
          isDeleted: false,
          createdAt: { $gte: sevenDaysAgo }
        }
      },
      {
        $group: {
          _id: {
            date: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
            status: '$status'
          },
          count: { $sum: 1 }
        }
      },
      {
        $group: {
          _id: '$_id.date',
          statuses: {
            $push: {
              status: '$_id.status',
              count: '$count'
            }
          },
          total: { $sum: '$count' }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // Monthly trends - last 6 months
    const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 5, 1);

    const monthlyTrends = await Task.aggregate([
      {
        $match: {
          $or: [{ user: userId }, { sharedWith: userId }],
          isDeleted: false,
          createdAt: { $gte: sixMonthsAgo }
        }
      },
      {
        $group: {
          _id: {
            month: { $dateToString: { format: '%Y-%m', date: '$createdAt' } },
            status: '$status'
          },
          count: { $sum: 1 }
        }
      },
      {
        $group: {
          _id: '$_id.month',
          statuses: {
            $push: {
              status: '$_id.status',
              count: '$count'
            }
          },
          total: { $sum: '$count' }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // Status distribution for pie chart
    const statusDistribution = await Task.aggregate([
      {
        $match: {
          $or: [{ user: userId }, { sharedWith: userId }],
          isDeleted: false
        }
      },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } }
    ]);

    // Priority distribution for pie chart
    const priorityDistribution = await Task.aggregate([
      {
        $match: {
          $or: [{ user: userId }, { sharedWith: userId }],
          isDeleted: false
        }
      },
      {
        $group: {
          _id: '$priority',
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } }
    ]);

    res.json({
      status: 'success',
      data: {
        weeklyTrends,
        monthlyTrends,
        statusDistribution,
        priorityDistribution
      }
    });
  } catch (err) {
    next(err);
  }
};
