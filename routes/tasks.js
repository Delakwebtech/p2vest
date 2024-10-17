const express = require('express');

const {
    getTasks,
    getTask,
    createTask,
    updateTask,
    deleteTask,
} = require('../controller/task');

const Task = require('../models/Task');
const Comment = require('../models/Comment');
const advancedResults = require('../middleware/advancedResults');

// Include other resource routers
const commentRouter = require('./comments');

const router = express.Router();

const { protect, authorize } = require('../middleware/auth');

// Re-route into other resourse routers
router.use('/:postId/comments', commentRouter);

router
  .route('/')
  .get(protect, advancedResults(Task, [{ model: Comment, as: 'comments' }]), getTasks)
  .post(protect, createTask);

  router
  .route('/:id')
  .get(getTask)
  .put(protect, authorize('user', 'admin'), updateTask)
  .delete(protect, authorize('user', 'admin'), deleteTask);

module.exports = router;