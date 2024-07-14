
const express = require('express');
const router = express.Router();
const Seller = require('../models/Seller.js');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

router.post('/signup', async (req, res) => {
    try {
        const { email, cnicNumber, fullName, phoneNumber, company, description, address, city, gender } = req.body;

        // Check if seller already exists
        const existingSeller = await Seller.findOne({ $or: [{ email }, { cnicNumber }] });
        if (existingSeller) {

            return res.status(400).json({ error: 'CNIC already exists' });
        }

        // Create new seller
        const newSeller = new Seller({
            fullName,
            email,
            cnicNumber,
            phoneNumber,
            company,
            description,
            address,
            city,
            gender
        });
        await newSeller.save();
        res.status(201).json({ message: 'Seller account created successfully' });
    } catch (error) {
        res.status(500).json({ error: 'An error occurred' });
    }
});

// Signin Route
router.post('/signin', async (req, res) => {
    try {
        const { email, password } = req.body;

        // Check if seller exists
        const seller = await Seller.findOne({ email });
        if (!seller) {
            return res.status(400).send({ message: 'Invalid email or password' });
        }

        // Check password
        const isMatch = await bcrypt.compare(password, seller.password);
        if (!isMatch) {
            return res.status(400).send({ message: 'Invalid email or password' });
        }

        // Create JWT token
        const token = jwt.sign({ id: seller._id }, process.env.JWT_SECRET, { expiresIn: '1h' });

        res.send({ message: 'Sign in successful', token });
    } catch (error) {
        res.status(400).send(error);
    }
});

module.exports = router;