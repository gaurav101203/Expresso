// routes/userRoutes.js
const express = require('express');
const router = express.Router();
const User = require('../models/User'); // Ensure this path is correct

// Get all users
router.get('/', async (req, res) => {
    try {
        const users = await User.find({});
        res.json(users);
    } catch (error) {
        console.error('Error fetching users:', error.message);
        res.status(500).json({ message: 'Failed to fetch users', error: error.message });
    }
});

// Register a new user
router.post('/register', async (req, res) => {
    const { firstName, lastName, mobile, email, username, password, role } = req.body;

    console.log('Received registration data:', req.body); // Log the request body

    // Check if the user already exists
    const existingUser = await User.findOne({ username });
    if (existingUser) {
        return res.status(400).json({ message: 'Username already exists' });
    }

    // Create a new user
    const newUser = new User({
        firstName,
        lastName,
        mobile,
        email,
        username,
        password, // In production, ensure to hash the password before saving
        role: role || 'user' // Assign the role
    });

    try {
        await newUser.save();
        res.status(201).json({ message: 'User registered successfully!' });
    } catch (error) {
        console.error('Error registering user:', error);
        res.status(500).json({ message: 'Error registering user' });
    }
});

// Delete a user
router.delete('/:id', async (req, res) => {
    try {
        const user = await User.findByIdAndDelete(req.params.id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.json({ message: 'User deleted successfully' });
    } catch (error) {
        console.error('Error deleting user:', error);
        res.status(500).json({ message: 'Failed to delete user', error });
    }
});

module.exports = router;