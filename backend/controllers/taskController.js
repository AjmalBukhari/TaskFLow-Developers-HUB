const Task = require('../models/Task');
const User = require('../models/User');
const Notification = require('../models/Notification');
const AppError = require('../utils/appError');
const { getIO } = require('../services/socket');

// ================= CREATE TASK =================
exports.createTask = async (req, res, next) => {
  try {
    const task = await Task.create({
      ...req.body,
      user: req.user.id,
      owner: req.user.id // Set owner as current user
    });

    // Emit real-time notification for task creation (optional)
    getIO().to(req.user.id).emit('task_created', task);

    res.status(201).json({
      status: 'success',
      data: task
    });
  } catch (err) {
    next(err);
  }
};

// ================= GET ALL TASKS =================
exports.getAllTasks = async (req, res, next) => {
  try {
    const { search, status, priority } = req.query;

    const baseFilter = {
      $or: [
        { user: req.user.id, isDeleted: false },
        { sharedWith: req.user.id, isDeleted: false }
      ]
    };

    const additionalFilters = [];

    if (status) additionalFilters.push({ status });
    if (priority) additionalFilters.push({ priority });

    if (search) {
      additionalFilters.push({
        $or: [
          { title: { $regex: search, $options: 'i' } },
          { description: { $regex: search, $options: 'i' } }
        ]
      });
    }

    const filter = additionalFilters.length > 0
      ? { ...baseFilter, $and: additionalFilters }
      : baseFilter;

    const tasks = await Task.find(filter).sort({ createdAt: -1 });

    res.json({
      status: 'success',
      results: tasks.length,
      data: tasks
    });
  } catch (err) {
    next(err);
  }
};

// ================= GET SINGLE TASK =================
exports.getTask = async (req, res, next) => {
  try {
    const task = await Task.findOne({
      _id: req.params.id,
      $or: [
        { user: req.user.id },
        { sharedWith: req.user.id }
      ]
    }).populate('user', 'fullname email');

    if (!task) {
      return next(AppError('Task not found', 404));
    }

    res.json({
      status: 'success',
      data: task
    });
  } catch (err) {
    next(err);
  }
};

// ================= UPDATE TASK =================
exports.updateTask = async (req, res, next) => {
  try {
    const task = await Task.findOne({
      _id: req.params.id,
      $or: [
        { user: req.user.id },
        { sharedWith: req.user.id }
      ]
    });

    if (!task) {
      return next(AppError('Task not found or access denied', 404));
    }

    // Check if user is allowed to update (only owner or shared users)
    if (task.user.toString() !== req.user.id && !task.sharedWith.includes(req.user.id)) {
      return next(AppError('You do not have permission to update this task', 403));
    }

    // Update task
    const updatedTask = await Task.findByIdAndUpdate(
      req.params.id,
      req.body,
      { returnDocument: 'after', runValidators: true }
    );

    // Emit real-time notification for task update
    getIO().to(task.user.toString()).emit('task_updated', updatedTask);

    res.json({
      status: 'success',
      data: updatedTask
    });
  } catch (err) {
    next(err);
  }
};

// ================= DELETE TASK (SOFT) =================
exports.deleteTask = async (req, res, next) => {
  try {
    const task = await Task.findOne({
      _id: req.params.id,
      user: req.user.id,
      isDeleted: false
    });

    if (!task) {
      return next(AppError('Task not found', 404));
    }

    task.isDeleted = true;
    task.deletedAt = new Date();
    await task.save();

    // Emit real-time notification for task deletion
    getIO().to(task.user.toString()).emit('task_deleted', task._id);

    res.json({
      status: 'success',
      message: 'Task moved to bin'
    });
  } catch (err) {
    next(err);
  }
};

// ================= GET BIN TASKS =================
exports.getBinTasks = async (req, res, next) => {
  try {
    const tasks = await Task.find({
      user: req.user.id,
      isDeleted: true
    }).sort({ deletedAt: -1 });

    res.json({
      status: 'success',
      results: tasks.length,
      data: tasks
    });
  } catch (err) {
    next(err);
  }
};

// ================= RESTORE TASK =================
exports.restoreTask = async (req, res, next) => {
  try {
    const task = await Task.findOne({
      _id: req.params.id,
      user: req.user.id,
      isDeleted: true
    });

    if (!task) {
      return next(AppError('Task not found', 404));
    }

    task.isDeleted = false;
    task.deletedAt = null;
    await task.save();

    // Emit real-time notification for task restoration
    getIO().to(task.user.toString()).emit('task_restored', task._id);

    res.json({
      status: 'success',
      message: 'Task restored'
    });
  } catch (err) {
    next(err);
  }
};

// ================= PERMANENT DELETE =================
exports.permanentDelete = async (req, res, next) => {
  try {
    const task = await Task.findOne({
      _id: req.params.id,
      user: req.user.id,
      isDeleted: true
    });

    if (!task) {
      return next(AppError('Task not found', 404));
    }

    await task.deleteOne();

    // Emit real-time notification for task deletion
    getIO().to(task.user.toString()).emit('task_permanently_deleted', task._id);

    res.json({
      status: 'success',
      message: 'Task permanently deleted'
    });
  } catch (err) {
    next(err);
  }
};

// ================= SHARE TASK =================
exports.shareTask = async (req, res, next) => {
  try {
    const { userIds } = req.body;

    if (!userIds || !userIds.length) {
      return next(AppError('Please provide at least one user ID to share with', 400));
    }

    const task = await Task.findOne({
      _id: req.params.id,
      user: req.user.id,
      isDeleted: false
    });

    if (!task) {
      return next(AppError('Task not found', 404));
    }

    // Check if users exist
    const users = await User.find({ _id: { $in: userIds } });
    if (users.length !== userIds.length) {
      return next(AppError('One or more users not found', 404));
    }

    // Prevent self-sharing
    if (userIds.includes(req.user.id)) {
      return next(AppError('Cannot share task with yourself', 400));
    }

    // Prevent duplicate sharing
    const alreadyShared = task.sharedWith.filter(id =>
      userIds.includes(id.toString())
    );

    if (alreadyShared.length > 0) {
      return next(AppError(`Task(s) already shared with user(s): ${alreadyShared.map(id => id.toString())}`, 400));
    }

    // Add new users to sharedWith array
    task.sharedWith = [...task.sharedWith, ...userIds];
    await task.save();

    // Create notifications for each shared user
    const notifications = users.map(user => ({
      recipient: user._id,
      message: `${req.user.fullname} shared a task with you: "${task.title}"`,
      taskId: task._id,
      type: 'task_shared'
    }));

    await Notification.insertMany(notifications);

    // Emit real-time notifications to shared users
    users.forEach(user => {
      getIO().to(user._id.toString()).emit('new_notification', {
        recipient: user._id,
        message: notifications[0].message,
        taskId: task._id
      });
    });

    res.json({
      status: 'success',
      message: `Task shared with ${users.length} user(s)`,
      data: task
    });
  } catch (err) {
    next(err);
  }
};

// ================= GET SHARED TASKS =================
exports.getSharedTasks = async (req, res, next) => {
  try {
    const tasks = await Task.find({
      sharedWith: req.user.id,
      isDeleted: false
    }).populate('user', 'fullname email');

    res.json({
      status: 'success',
      results: tasks.length,
      data: tasks
    });
  } catch (err) {
    next(err);
  }
};

// ================= GET ANALYTICS OVERVIEW =================