const express = require('express');
const { register, login, getMe, createAdmin } = require('../controller/auth');

const router = express.Router();

const {protect, authorize} = require('../middleware/auth');

router.post('/register', register);
router.post('/login', login);
router.post('/users/create-admin', protect, authorize('admin'), createAdmin);
router.get('/profile', protect, getMe);

module.exports = router;
