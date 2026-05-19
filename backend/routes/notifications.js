const express = require('express');
const router = express.Router();

const notificationController = require('../controllers/notificationController');
const auth = require('../middleware/auth');

// ================= GET NOTIFICATIONS =================
router.get('/', auth, notificationController.getNotifications);

// ================= MARK AS READ =================
router.put('/:id/read', auth, notificationController.markAsRead);

// ================= MARK ALL AS READ =================
router.put('/read-all', auth, notificationController.markAllAsRead);

// ================= DELETE NOTIFICATION =================
router.delete('/:id', auth, notificationController.deleteNotification);

// ================= GET UNREAD COUNT =================
router.get('/unread-count', auth, notificationController.getUnreadCount);

module.exports = router;