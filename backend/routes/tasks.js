const express = require('express');
const router = express.Router();

const Task = require('../models/Task');
const User = require('../models/User');
const Notification = require('../models/Notification');
const { validateTask, handleValidation } = require('../middleware/validate');
const auth = require('../middleware/auth');

// ======================================================
// ================= CREATE TASK =================
// ======================================================
router.post('/', auth, validateTask, handleValidation, async (req, res) => {
  try {
    const task = await Task.create({
      ...req.body,
      user: req.user.id
    });

    res.status(201).json(task);

  } catch (err) {
    res.status(500).json({
      message: 'Server error',
      error: err.message
    });
  }
});

// ======================================================
// ================= GET ALL TASKS =================
// ======================================================
router.get('/', auth, async (req, res) => {
  try {
    const { search, status } = req.query;

    const filter = {
      user: req.user.id,
      isDeleted: false
    };

    if (status) filter.status = status;

    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    const tasks = await Task.find(filter).sort({ createdAt: -1 });
    res.json(tasks);

  } catch (err) {
    res.status(500).json({
      message: 'Server error',
      error: err.message
    });
  }
});

// ======================================================
// ⚠️ SPECIAL ROUTES MUST COME BEFORE "/:id"
// ======================================================

// ================= GET BIN TASKS =================
router.get('/bin', auth, async (req, res) => {
  try {
    const tasks = await Task.find({
      user: req.user.id,
      isDeleted: true
    }).sort({ deletedAt: -1 });

    res.json(tasks);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// ================= RESTORE TASK =================
router.put('/restore/:id', auth, async (req, res) => {
  try {
    const task = await Task.findOne({
      _id: req.params.id,
      user: req.user.id,
      isDeleted: true
    });

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    task.isDeleted = false;
    task.deletedAt = null;
    await task.save();

    res.json({ message: 'Task restored' });

  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// ================= PERMANENT DELETE =================
router.delete('/permanent/:id', auth, async (req, res) => {
  try {
    const task = await Task.findOneAndDelete({
      _id: req.params.id,
      user: req.user.id,
      isDeleted: true
    });

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    res.json({ message: 'Task permanently deleted' });

  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// ======================================================
// ================= PHASE-2: TASK SHARING =================
// ======================================================

// ================= SHARE TASK =================
router.put('/:id/share', auth, async (req, res) => {
  try {
    const { userIds } = req.body;

    if (!userIds || !Array.isArray(userIds) || userIds.length === 0) {
      return res.status(400).json({ message: 'User IDs array is required' });
    }

    const task = await Task.findOne({
      _id: req.params.id,
      user: req.user.id,
      isDeleted: false
    });

    if (!task) {
      return res.status(404).json({ message: 'Task not found or not authorized' });
    }

    // Validate users exist and filter out self-sharing
    const validUsers = await User.find({
      _id: { $in: userIds },
      _id: { $ne: req.user.id }
    }).select('_id');

    const validUserIds = validUsers.map(u => u._id.toString());

    // Add new users to sharedWith (avoid duplicates)
    const existingShared = task.sharedWith.map(id => id.toString());
    const newShared = [...new Set([...existingShared, ...validUserIds])];

    task.sharedWith = newShared;
    await task.save();

    // Create notifications for newly shared users
    const notifications = validUserIds
      .filter(id => !existingShared.includes(id))
      .map(userId => ({
        recipient: userId,
        message: `Task "${task.title}" was shared with you`,
        taskId: task._id,
        type: 'task_shared'
      }));

    if (notifications.length > 0) {
      const savedNotifications = await Notification.insertMany(notifications);
      
      // Emit Socket.IO events for real-time notifications
      const io = req.app.get('io');
      savedNotifications.forEach(notification => {
        io.to(notification.recipient.toString()).emit('notification', notification);
      });
    }

    res.json({ message: 'Task shared successfully', sharedWith: task.sharedWith });

  } catch (err) {
    res.status(500).json({
      message: 'Server error',
      error: err.message
    });
  }
});

// ================= GET SHARED TASKS =================
router.get('/shared', auth, async (req, res) => {
  try {
    const tasks = await Task.find({
      sharedWith: req.user.id,
      isDeleted: false
    }).sort({ createdAt: -1 });

    res.json(tasks);

  } catch (err) {
    res.status(500).json({
      message: 'Server error',
      error: err.message
    });
  }
});

// ======================================================
// ================= GET SINGLE TASK (with sharing) =================
// ======================================================
router.get('/:id', auth, async (req, res) => {
  try {
    const task = await Task.findOne({
      _id: req.params.id,
      isDeleted: false,
      $or: [
        { user: req.user.id },
        { sharedWith: req.user.id }
      ]
    });

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    res.json(task);

  } catch (err) {
    res.status(500).json({
      message: 'Server error',
      error: err.message
    });
  }
});

// ======================================================
// ================= UPDATE TASK (with sharing support) =================
// ======================================================
router.put('/:id', auth, validateTask, handleValidation, async (req, res) => {
  try {
    const task = await Task.findOne({
      _id: req.params.id,
      isDeleted: false,
      $or: [
        { user: req.user.id },
        { sharedWith: req.user.id }
      ]
    });

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    // Shared users can only update status
    if (task.sharedWith.map(id => id.toString()).includes(req.user.id.toString()) &&
        !task.user.equals(req.user.id)) {
      const allowedFields = ['status'];
      const updateData = {};
      allowedFields.forEach(field => {
        if (req.body[field] !== undefined) {
          updateData[field] = req.body[field];
        }
      });

      if (Object.keys(updateData).length === 0) {
        return res.status(400).json({ message: 'Shared users can only update status' });
      }

      Object.assign(task, updateData);
      await task.save();

      // Create notification for owner if status changed
      if (updateData.status) {
        const notification = await Notification.create({
          recipient: task.user,
          message: `Task "${task.title}" status was updated to ${updateData.status}`,
          taskId: task._id,
          type: 'task_updated'
        });
        
        // Emit Socket.IO event for real-time notification
        const io = req.app.get('io');
        io.to(task.user.toString()).emit('notification', notification);
      }

      return res.json(task);
    }

    // Owner can update all fields
    const updatedTask = await Task.findOneAndUpdate(
      {
        _id: req.params.id,
        user: req.user.id,
        isDeleted: false
      },
      req.body,
      { new: true, runValidators: true }
    );

    if (!updatedTask) {
      return res.status(404).json({ message: 'Task not found' });
    }

    res.json(updatedTask);

  } catch (err) {
    res.status(500).json({
      message: 'Server error',
      error: err.message
    });
  }
});

// ======================================================
// ================= DELETE TASK (owner only) =================
// ======================================================
router.delete('/:id', auth, async (req, res) => {
  try {
    const task = await Task.findOne({
      _id: req.params.id,
      user: req.user.id,
      isDeleted: false
    });

    if (!task) {
      return res.status(404).json({ message: 'Task not found or not authorized' });
    }

    task.isDeleted = true;
    task.deletedAt = new Date();
    await task.save();

    res.json({ message: 'Task moved to bin' });

  } catch (err) {
    res.status(500).json({
      message: 'Server error',
      error: err.message
    });
  }
});

module.exports = router;