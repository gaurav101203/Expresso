const express = require('express');
const bcrypt = require('bcrypt');
const User = require('../models/User'); // Ensure your User model is set up correctly
const router = express.Router();
const Shipment = require('../models/Shipments');

// Create a new shipment
router.post('/create', async (req, res) => {
    const { shipmentId, carrierAddress, deliveryAddress, shipmentDate, deliveryDate } = req.body;

    try {
        const newShipment = new Shipment({
            shipmentId,
            carrierAddress,
            deliveryAddress,
            shipmentDate,
            deliveryDate
        });

        await newShipment.save();
        res.status(201).json({ message: 'Shipment created successfully!', shipment: newShipment });
    } catch (error) {
        console.error('Error creating shipment:', error);
        res.status(500).json({ message: 'Failed to create shipment', error });
    }
});


// Register Route
router.post('/register', async (req, res) => {
    const { firstName, lastName, mobile, email, username, password, role, securityCode } = req.body;

    console.log('Received registration data:', req.body); // Log the request body

    // Check if the user already exists
    const existingUser = await User.findOne({ username });
    if (existingUser) {
        return res.status(400).json({ message: 'Username already exists' });
    }

    // Validate security code for admin and carrier roles
    if (role === 'admin' && securityCode !== '5555') {
        return res.status(403).json({ message: 'Invalid security code for admin' });
    }

    if (role === 'carrier' && securityCode !== '6666') {
        return res.status(403).json({ message: 'Invalid security code for carrier' });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create a new user
    const newUser = new User({
        firstName,
        lastName,
        mobile,
        email,
        username,
        password: hashedPassword, // Store hashed password
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


// Login Route
router.post('/login', async (req, res) => {
    const { username, password } = req.body;

    const user = await User.findOne({ username });
    if (!user) {
        return res.status(400).json({ message: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
        return res.status(400).json({ message: 'Invalid credentials' });
    }

    res.status(200).json({ message: 'Login successful!', user });
});



module.exports = router;
