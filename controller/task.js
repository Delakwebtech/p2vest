const path = require('path');
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');
const Task = require('../models/Task');
const Notification = require('../models/Notification');

// @desc    Get all tasks
// @route   GET /api/tasks
// @access  Public
exports.getTasks = asyncHandler(async (req, res, next) => {
    let tasks;

    // Admin can view all tasks
    if (req.user.role === 'admin') {
        tasks = await Task.findAll();
    } else {
        // Regular users can only view their own tasks
        tasks = await Task.findAll({
            where: { userId: req.user.id }
        });
    }

    // If no tasks found, return error
    if (!tasks || tasks.length === 0) {
        return next(
            new ErrorResponse('No tasks found', 404)
        );
    }

    res.status(200).json(res.advancedResults);
});

// @desc    Get single task
// @route   GET /api/tasks/:id
// @access  Public
exports.getTask = asyncHandler(async (req, res, next) => {
    const task = await Task.findByPk(req.params.id);

    // If task not found, return error
    if (!task) {
        return next(
            new ErrorResponse(`Task not found with id ${req.params.id}`, 404)
        );
    }

    // Check if user is the task owner or an admin
    if (task.userId !== req.user.id && req.user.role !== 'admin') {
        return next(
            new ErrorResponse(`User ${req.user.id} is not authorized to view this task`, 401)
        );
    }

    res.status(200).json({ success: true, data: task });
});

// @desc    Create new task
// @route   POST /api/tasks
// @access  Public
exports.createTask = asyncHandler(async (req, res, next) => {
    // Retrieve userId from the decoded token
    const userId = req.user.id;

    // Check if an assignee is provided in the request body
    const assignToId = req.body.assignToId || userId;

    // Add userId to req.body
    req.body.userId = userId;
    req.body.assignToId = assignToId;

    const task = await Task.create(req.body);

    // Create notification for the assigned user
    await Notification.create({
        userId: assignToId,
        message: `You have been assigned a new task: ${task.title}`,
    });

    // Send notification via WebSocket
    const socketNotification = req.app.get('sendNotification');
    socketNotification(task.assignToId, `You have been assigned a new task: ${task.title}`);

    res.status(201).json({
        success: true,
        data: task
    });
});

// @desc    Update task
// @route   PUT /api/tasks/:id
// @access  Public
exports.updateTask = asyncHandler(async (req, res, next) => {
    const taskId = req.params.id;

    // Find the task by primary key
    const task = await Task.findByPk(taskId);

    // If the task is not found, return an error
    if (!task) {
        return next(new ErrorResponse(`Task not found with id ${taskId}`, 404));
    }

    // Ensure the user is the task owner or an admin
    if (task.userId !== req.user.id && req.user.role !== 'admin') {
        return next(new ErrorResponse(`User ${req.user.id} is not authorized to update this task`, 401));
    }

    // Update the task
    const updatedTask = await task.update(req.body);

    // Create notification for the assigned user
    if (updatedTask.assignToId !== task.assignToId) {
        await Notification.create({
            userId: updatedTask.assignToId,
            message: `The status of your task "${updatedTask.title}" has been updated to "${updatedTask.status}".`,
        });
    }

    // Send notification via WebSocket if the task is reassigned
    const socketNotification = req.app.get('sendNotification'); 
    socketNotification(updatedTask.assignToId, `The status of your task "${updatedTask.title}" has been updated.`);

    // Return the updated task
    res.status(200).json({ success: true, data: updatedTask });
});

// @desc    Delete task
// @route   DELETE /api/tasks/:id
// @access  Public
exports.deleteTask = asyncHandler(async (req, res, next) => {
    const task = await Task.findByPk(req.params.id);

    if (!task) {
        return next(
            new ErrorResponse(`Task not found with id ${req.params.id}`, 404)
        );
    }

    // Make sure user is the task owner
    if (task.userId !== req.user.id && req.user.role !== 'admin') {
        return next(
            new ErrorResponse(`User ${req.params.id} is not authorized to delete this task`, 401)
        );
    }

    await task.destroy();

    res.status(200).json({ success: true, data: {} });
});
