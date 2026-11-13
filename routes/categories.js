const express = require('express');
const router = express.Router();
const Category = require('../models/Category');
const Product = require('../models/Product'); // Need this to update products!
const adminAuth = require('../middleware/adminAuth');

// GET all categories (public)
router.get('/', async (req, res) => {
  try {
    const categories = await Category.find({ isActive: true }).sort({ name: 1 });
    res.json({ success: true, categories });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST (admin)
router.post('/', adminAuth, async (req, res) => {
  try {
    const category = new Category(req.body);
    const saved = await category.save();
    res.status(201).json({ success: true, category: saved });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});

// PUT (admin) - UPDATED WITH CASCADE
router.put('/:id', adminAuth, async (req, res) => {
  try {
    const oldCategory = await Category.findById(req.params.id);
    if (!oldCategory) return res.status(404).json({ success: false, error: 'Category not found' });

    const updated = await Category.findByIdAndUpdate(req.params.id, req.body, { new: true });
    
    // If you changed the name, update all products with the old name to the new name
    if (req.body.name && oldCategory.name !== req.body.name) {
      await Product.updateMany(
        { category: oldCategory.name },
        { $set: { category: req.body.name } }
      );
    }
    
    res.json({ success: true, category: updated });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});

// DELETE (admin)
router.delete('/:id', adminAuth, async (req, res) => {
  try {
    await Category.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;