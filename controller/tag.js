const path = require('path');
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');
const TaskTags = require('../models/Tag');
const Task = require('../models/Task');

// @desc    Add Tag to Task
// @route   POST /api/tags/add-to-task
// @access  Private
exports.addTagToTask = asyncHandler(async (req, res, next) => {
    const { taskId, tagName } = req.body;

    // Validate taskId and tagName
    if (!taskId || !tagName) {
        return next(new ErrorResponse('Task ID and tag name are required', 400));
    }

    // Find task by taskId
    const task = await Task.findByPk(taskId);
    if (!task) {
        return next(new ErrorResponse(`Task with ID ${taskId} not found`, 404));
    }

    // Validate tagName based on the ENUM definition
    const validTags = ['Urgent', 'Bug', 'Feature'];
    if (!validTags.includes(tagName)) {
        return next(new ErrorResponse('Invalid tag name', 400));
    }

    // Check if the tag already exists for the task
    const existingTag = await TaskTags.findOne({
        where: { taskId, tagName }
    });
    if (existingTag) {
        return next(new ErrorResponse(`Tag ${tagName} is already associated with this task`, 400));
    }

    // Create and associate the tag with the task
    const tag = await TaskTags.create({ tagName, taskId });

    res.status(200).json({
        success: true,
        message: 'Tag added to task successfully',
        data: tag
    });
});

// @desc    Get Tasks by Tag Name
// @route   GET /api/tags/:tagName/tasks
// @access  Public
exports.getTasksByTag = asyncHandler(async (req, res, next) => {
    const { tagName } = req.params;

    // Find the tag by its name
    const tag = await TaskTags.findOne({
        where: { tagName }
    });

    if (!tag) {
        return next(new ErrorResponse('Tag not found', 404));
    }

    // Find tasks associated with the found tag using the taskId
    const tasks = await Task.findAll({
        where: { id: tag.taskId } // Using taskId from the tag
    });

    if (!tasks.length) {
        return res.status(200).json({ success: true, message: 'No tasks found for this tag', data: [] });
    }

    // Return the tasks associated with the tag
    res.status(200).json({ success: true, data: tasks });
});

