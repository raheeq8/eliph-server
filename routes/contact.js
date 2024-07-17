const express = require('express');
const router = express.Router();
const Contact = require('../models/Contact'); 

router.post('/create', async (req, res) => {
  const { firstName, lastName, email, message } = req.body;

  try {
    const newContact = new Contact({
      firstName,
      lastName,
      email,
      message,
    });

    await newContact.save();

    res.status(200).json({ message: 'Message received successfully!' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to save message. Please try again later.' });
  }
});

module.exports = router;
