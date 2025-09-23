const Notification = require('../Model/NotificationModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

// Get notifications for a user
exports.getUserNotifications = catchAsync(async (req, res, next) => {
  const { userId } = req.params;
  
  const notifications = await Notification.find({ user: userId })
    .sort({ createdAt: -1 })
    .populate('relatedTo.id');
  
  res.status(200).json({
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
    status: 'success',
    data: notification
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
    status: 'success',
    message: 'All notifications marked as read'
  });
});

// Create a new notification
exports.createNotification = catchAsync(async (req, res, next) => {
  const notification = await Notification.create(req.body);
  
  res.status(201).json({
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
  
  res.status(204).send();
});

// Get unread notification count
exports.getUnreadCount = catchAsync(async (req, res, next) => {
  const { userId } = req.params;
  
  const count = await Notification.countDocuments({ 
    user: userId, 
    read: false 
  });
  
  res.status(200).json({
    status: 'success',
    data: { count }
  });
});