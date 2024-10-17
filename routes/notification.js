const express = require('express');
const { sendNotification, getUserNotifications } = require('../controller/notification');

const router = express.Router();

const {protect} = require('../middleware/auth');

router
    .route('/')
    .post(protect, sendNotification)
    .get(protect, getUserNotifications);

module.exports = router;
