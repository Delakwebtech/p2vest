const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');
const Comment = require('../models/Comment');
const Task = require('../models/Task');


// @desc    Get all comments of a task
// @route   GET /api/tasks/:taskId/comments
// @access  Public
exports.getComments = asyncHandler(async (req, res, next) => {

    // Fetch comments based on taskId
    const comments = await Comment.findAll({where: { taskId: req.params.taskId} });

    // Use advancedResults middleware for response formatting
    res.status(200).json(res.advancedResults);
});


// @desc    Add comment
// @route   POST /api/tasks/:taskId/comment
// @access  Private
exports.addComment = asyncHandler(async (req, res, next) => {
    req.body.taskId = req.params.taskId;

    req.body.userId = req.user.id;

    const task = await Task.findByPk(req.params.taskId);

    if(!task) {
        return next(new ErrorResponse(`No task with id ${req.params.taskId}`), 404);
    }

    const comment = await Comment.create(req.body);

    res.status(200).json({
        success: true,
        data: comment
    });
});


// @desc    Update comment
// @route   PUT /api/tasks/comments/:id
// @access  Private
exports.updateComment = asyncHandler(async (req, res, next) => {

    let comment = await Comment.findByPk(req.params.id);

    if(!comment) {
        return next(new ErrorResponse(`No comment with id ${req.params.id}`), 404);
    }

    // Make sure user is the comment owner
    if(comment.userId !== req.user.id) {
        return next(
            new ErrorResponse(`User ${req.user.id} is not authorized to update this comment`, 401)
        );
    }

    // Update comment
    comment = await comment.update(req.body);

    // Return updated comment
    res.status(200).json({
        success: true,
        data: comment
    });
});
  

// @desc    Delete comment
// @route   DELETE /api/tasks/comments/:id
// @access  Public
exports.deleteComment = asyncHandler(async (req, res, next) => {
  
    const comment = await Comment.findByPk(req.params.id);

    if(!comment) {
        return next(new ErrorResponse(`Comment with id ${req.params.id} not found`, 404));
    }

    // Make sure user is the comment owner
    if(comment.userId !== req.user.id && req.user.role !== 'admin') {
        return next(
            new ErrorResponse(`User ${req.user.id} is not authorized to delete this comment`, 401)
        );
    }

    await comment.destroy();

    res.status(200).json({
        success: true, 
        data:{}
    });

});
