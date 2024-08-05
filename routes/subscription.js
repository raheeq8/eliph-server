// routes/subscription.js

const express = require('express');
const router = express.Router();
const Subscription = require('../models/Subscription');

// POST route for subscribing
router.post('/create', async (req, res) => {
  try {
    const { email } = req.body;
    
    // Validate the email
    if (!email || !email.includes('@')) {
      return res.status(400).json({ message: 'Invalid email address.' });
    }

    // Check if email already exists
    const existingSubscription = await Subscription.findOne({ email });
    if (existingSubscription) {
      return res.status(400).json({ message: 'Email address already subscribed.' });
    }

    // Save new subscription
    const newSubscription = new Subscription({ email });
    await newSubscription.save();
    
    return res.status(200).json({ message: 'Subscription successful!' });
  } catch (error) {
    return res.status(500).json({ message: 'Server error.' });
  }
});

module.exports = router;
