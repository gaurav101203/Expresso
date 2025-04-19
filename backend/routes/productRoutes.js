const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const Category = require('../models/Category');

// Get all categories
router.get('/categories', async (req, res) => {
    try {
        const categories = await Category.find();
        res.json(categories);
    } catch (err) {
        res.status(500).send(err.message);
    }
});

// Add a new category
router.post('/categories', async (req, res) => {
    const { name, image } = req.body;
    try {
        const category = new Category({ name, image });
        await category.save();
        res.json(category);
    } catch (err) {
        res.status(500).send(err.message);
    }
});

// Get products by category
router.get('/products/:categoryId', async (req, res) => {
    try {
        const products = await Product.find({ category: req.params.categoryId }).populate('category');
        res.json(products);
    } catch (err) {
        res.status(500).send(err.message);
    }
});

// Add a new product
router.post('/products', async (req, res) => {
    const { name, price, category, image, quantity, deliveryAddress } = req.body;
    try {
        const product = new Product({ name, price, category, image, quantity, deliveryAddress });
        await product.save();
        res.json(product);
    } catch (err) {
        res.status(500).send(err.message);
    }
});

// ✅ Update only product quantity (for shipment)
router.put('/products/update-quantity/:id', async (req, res) => {
    const { deductedQuantity } = req.body;

    try {
        const product = await Product.findById(req.params.id);
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }

        if (product.quantity < deductedQuantity) {
            return res.status(400).json({ message: 'Insufficient stock' });
        }

        product.quantity -= deductedQuantity;
        await product.save();

        res.json({ message: 'Quantity updated successfully', product });
    } catch (err) {
        res.status(500).send(err.message);
    }
});

// Update full product
router.put('/products/:id', async (req, res) => {
    const { quantity } = req.body;
    try {
        const product = await Product.findByIdAndUpdate(req.params.id, { quantity }, { new: true });
        res.json(product);
    } catch (err) {
        res.status(500).send(err.message);
    }
});

// Delete a product
router.delete('/products/:id', async (req, res) => {
    try {
        await Product.findByIdAndDelete(req.params.id);
        res.json({ message: 'Product deleted' });
    } catch (err) {
        res.status(500).send(err.message);
    }
});

// Fix: This was deleting a product not a category
router.delete('/category/:id', async (req, res) => {
    try {
        await Category.findByIdAndDelete(req.params.id);
        res.json({ message: 'Category deleted' });
    } catch (err) {
        res.status(500).send(err.message);
    }
});

module.exports = router;
