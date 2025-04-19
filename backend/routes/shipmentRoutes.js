const express = require('express');
const Shipment = require('../models/Shipments'); // Import your Shipment model
const router = express.Router();

// Create a new shipment
router.post('/create', async (req, res) => {
    const { shipmentId, carrierAddress, deliveryAddress, shipmentDate, deliveryDate, recipientEmail, productname, quantity } = req.body;

    try {
        const newShipment = new Shipment({
            shipmentId,
            carrierAddress,
            deliveryAddress,
            shipmentDate,
            deliveryDate,
<<<<<<< HEAD
            recipientEmail,
            productname,
            quantity
=======
            recipientEmail
>>>>>>> dc12128f05b08c8ba8748db46f72fb47c53d087a
        });

        await newShipment.save();
        res.status(201).json({ message: 'Shipment created successfully!', shipment: newShipment });
    } catch (error) {
        console.error('Error creating shipment:', error);
        res.status(500).json({ message: 'Failed to create shipment', error });
    }
});

module.exports = router;
