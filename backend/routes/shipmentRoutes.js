const express = require('express');
const Shipment = require('../models/Shipments'); // Import your Shipment model
const router = express.Router();

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

module.exports = router;
