const Notification = require('../Model/NotificationModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

// Get all notifications for current authenticated user
exports.getAllNotifications = catchAsync(async (req, res, next) => {
  console.log('\n🔔 ===== FETCHING NOTIFICATIONS FOR USER =====');
  console.log('User from token:', req.user);
  
  const userId = req.user.id || req.user._id; // Try both id and _id
  console.log('User ID:', userId);
  
  const notifications = await Notification.find({ user: userId })
    .sort({ createdAt: -1 })
    .limit(50) // Limit to last 50 notifications
    .populate('relatedTo.id');
  
  console.log(`✅ Found ${notifications.length} notifications for user ${userId}`);
  if (notifications.length > 0) {
    console.log('Sample notification:', JSON.stringify(notifications[0], null, 2));
  }
  console.log('===== NOTIFICATIONS FETCH COMPLETED =====\n');
  
  res.status(200).json({
    success: true,
    status: 'success',
    results: notifications.length,
    data: notifications
  });
});

// Get notifications for a user
exports.getUserNotifications = catchAsync(async (req, res, next) => {
  const { userId } = req.params;
  
  const notifications = await Notification.find({ user: userId })
    .sort({ createdAt: -1 })
    .populate('relatedTo.id');
  
  res.status(200).json({
    success: true,
    status: 'success',
    results: notifications.length,
    data: notifications
  });
});

// Mark notification as read
exports.markAsRead = catchAsync(async (req, res, next) => {
  const notification = await Notification.findByIdAndUpdate(
    req.params.id,
    { read: true },
    { new: true, runValidators: true }
  );
  
  if (!notification) {
    return next(new AppError('Notification not found', 404));
  }
  
  res.status(200).json({
    success: true,
    status: 'success',
    data: notification
  });
});

// Mark all notifications as read for current user
exports.markAllAsReadForCurrentUser = catchAsync(async (req, res, next) => {
  const userId = req.user.id; // From auth middleware
  
  await Notification.updateMany(
    { user: userId, read: false },
    { read: true }
  );
  
  res.status(200).json({
    success: true,
    status: 'success',
    message: 'All notifications marked as read'
  });
});

// Mark all notifications as read for a user
exports.markAllAsRead = catchAsync(async (req, res, next) => {
  const { userId } = req.params;
  
  await Notification.updateMany(
    { user: userId, read: false },
    { read: true }
  );
  
  res.status(200).json({
    success: true,
    status: 'success',
    message: 'All notifications marked as read'
  });
});

// Create a new notification
exports.createNotification = catchAsync(async (req, res, next) => {
  const notification = await Notification.create(req.body);
  
  res.status(201).json({
    success: true,
    status: 'success',
    data: notification
  });
});

// Delete notification
exports.deleteNotification = catchAsync(async (req, res, next) => {
  const notification = await Notification.findByIdAndDelete(req.params.id);
  
  if (!notification) {
    return next(new AppError('Notification not found', 404));
  }
  
  res.status(200).json({
    success: true,
    status: 'success',
    message: 'Notification deleted successfully'
  });
});

// Get unread notification count
exports.getUnreadCount = catchAsync(async (req, res, next) => {
  const { userId } = req.params;
  
  const count = await Notification.countDocuments({ 
    user: userId, 
    read: false 
  });
  
  res.status(200).json({
    success: true,
    status: 'success',
    data: { count }
  });
});