const express = require('express');

const {
    getComments,
    addComment,
    updateComment,
    deleteComment
} = require('../controller/comment');

const Comment = require('../models/Comment');
const advancedResults = require('../middleware/advancedResults');

const router = express.Router({mergeParams: true});

const {protect, authorize} = require('../middleware/auth');

router
    .route('/:taskId/comments')
    .get(advancedResults(Comment, {
        path: 'task',
        select: 'title description'
    }), getComments)
    .post(protect, addComment);

router
    .route('/comments/:id')
    .put(protect, authorize('user', 'admin'), updateComment)
    .delete(protect, authorize('user', 'admin'), deleteComment);

module.exports = router;