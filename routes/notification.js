const express = require('express');
const router = express.Router();
const Notification = require('../models/Notification'); 

router.patch('/markAsRead', async (req, res) => {
  try {
    const { userId } = req.body;
    const result = await Notification.updateMany(
      { userId: userId, isRead: false },
      { $set: { isRead: true } }
    );

    res.status(200).json({ message: 'Notifications marked as read', result });
  } catch (error) {
    console.error('Error marking notifications as read:', error);
    res.status(500).json({ message: 'Error marking notifications as read', error });
  }
});

module.exports = router;
