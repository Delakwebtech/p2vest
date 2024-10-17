const express = require('express');
const { addTagToTask, getTasksByTag } = require('../controller/tag');
const { protect, authorize } = require('../middleware/auth');
const router = express.Router();

router
    .route('/add-to-task')
    .post(protect, authorize('user', 'admin'), addTagToTask);

router
    .route('/:tagName/tasks')
    .get(protect, authorize('user', 'admin'), getTasksByTag);

module.exports = router;
