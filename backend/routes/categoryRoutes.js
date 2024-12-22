const express = require('express');
const router = express.Router();
const Category = require('../models/Category');
const Product = require('../models/Product'); // Assuming you have a Product model

// Route to delete a category by ID
router.delete('/:id', async (req, res) => {
    const { id } = req.params; // Get the category ID from the URL parameter

    try {
        // Step 1: Delete all products associated with the category
        await Product.deleteMany({ category: id });

        // Step 2: Delete the category
        const category = await Category.findByIdAndDelete(id);

        if (!category) {
            return res.status(404).json({ message: 'Category not found' }); // If the category doesn't exist
        }

        res.status(200).json({ message: 'Category and its products deleted successfully' }); // Return success response
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error while deleting category and its products' }); // Return error if something goes wrong
    }
});

module.exports = router;
