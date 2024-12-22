// routes/ship.js
const express = require('express');
const Shipment = require('../models/Shipments'); // Adjust import according to your project structure
const router = express.Router();

// Create a new shipment
router.post('/create', async (req, res) => {
    const { shipmentId, carrierAddress, deliveryAddress, shipmentDate, deliveryDate, location } = req.body;

    try {
        const newShipment = new Shipment({
            shipmentId,
            carrierAddress,
            deliveryAddress,
            shipmentDate,
            deliveryDate,
            location, // Ensure this field is included
        });

        await newShipment.save();
        res.status(201).json({ message: 'Shipment created successfully!', shipment: newShipment });
    } catch (error) {
        console.error('Error creating shipment:', error);
        res.status(500).json({ message: 'Failed to create shipment', error });
    }
});

// Fetch all shipments
router.get('/', async (req, res) => {
    try {
        const shipments = await Shipment.find();
        res.json(shipments);
    } catch (error) {
        console.error('Error fetching shipments:', error);
        res.status(500).json({ message: 'Failed to fetch shipments', error });
    }
});

// Delete a shipment
router.delete('/:id', async (req, res) => {
    const { id } = req.params;

    try {
        const deletedShipment = await Shipment.findByIdAndDelete(id);
        if (!deletedShipment) {
            return res.status(404).json({ message: 'Shipment not found' });
        }
        res.status(200).json({ message: 'Shipment deleted successfully!' });
    } catch (error) {
        console.error('Error deleting shipment:', error);
        res.status(500).json({ message: 'Failed to delete shipment', error });
    }
});

module.exports = router;
