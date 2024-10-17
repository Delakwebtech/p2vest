const asyncHandler = require('../middleware/async');
const Notification = require('../models/Notification');

// @desc    Send a notification
// @route   POST /api/notifications
// @access  Private
exports.sendNotification = asyncHandler(async (userId, message) => {
    const notification = await Notification.create({ userId, message });

    // Emit the notification to the user via WebSocket
    io.to(userId).emit('notification', { message });

    return notification;
});

// @desc    Get user notifications
// @route   GET /api/notifications
// @access  Private
exports.getUserNotifications = asyncHandler(async (req, res, next) => {
  const notifications = await Notification.findAll({
    where: { userId: req.user.id },
    order: [['createdAt', 'DESC']],
  });

  res.status(200).json({ success: true, data: notifications });
});
