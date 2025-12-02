const express = require('express');
const router = express.Router();
const notificationController = require('../Controller/NotificationController');

// Debug middleware
router.use((req, res, next) => {
  console.log(`[Notification Route] ${req.method} ${req.originalUrl}`);
  next();
});

// Authentication middleware (optional - add if auth is available)
let verifyToken;
try {
  const auth = require('../middleware/authMiddleware');
  verifyToken = auth.verifyToken;
  console.log('✅ Auth middleware loaded for notifications');
} catch (middlewareError) {
  console.warn('⚠️ Auth middleware not found for notifications, using passthrough');
  verifyToken = (req, res, next) => next();
}

// Protected routes (require authentication)
router.get('/', verifyToken, notificationController.getAllNotifications);
router.put('/mark-all-read', verifyToken, notificationController.markAllAsReadForCurrentUser);

// Other routes
router.get('/user/:userId', notificationController.getUserNotifications);
router.get('/user/:userId/unread-count', notificationController.getUnreadCount);
router.post('/', notificationController.createNotification);
router.put('/:id/read', notificationController.markAsRead);
router.put('/user/:userId/mark-all-read', notificationController.markAllAsRead);
router.delete('/:id', notificationController.deleteNotification);

module.exports = router;