const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');
const Notification = require('../models/Notification');

// @desc    Send a notification
// @route   POST /api/notifications
// @access  Private
exports.sendNotification = asyncHandler(async (req, res, next) => {
  const io = req.app.get('io');  // Ensure io is available and properly initialized

  console.log(io);
    if (!io) {
        return next(new ErrorResponse('WebSocket connection not available', 500));
    }

    const { userId, message } = req.body

    const notification = await Notification.create({ userId, message }).catch(err => {
      return next(new ErrorResponse('Unable to create notification', 500));
  });

    // Emit the notification to the user via WebSocket
    io.to(userId).emit('notification', message); 

    return res.status(200).json({
      success: true,
      data: notification
  });
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
