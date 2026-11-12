const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const Product = require('../models/Product');
const adminAuth = require('../middleware/adminAuth');

// 1. Place a new order  →  POST /api/orders
router.post('/', async (req, res) => {
  try {
    const { customer, items, paymentMethod, deliveryNote } = req.body;

    if (!customer || !items || items.length === 0) {
      return res.status(400).json({ success: false, error: 'Customer and items are required' });
    }

    let totalAmount = 0;
    const orderItems = [];

    for (const item of items) {
      if (!item.product || item.product === 'undefined' || item.product.length !== 24) {
        return res.status(400).json({ success: false, error: 'Invalid item in cart. Please clear your cart and try again.' });
      }
      
      const product = await Product.findById(item.product);
      if (!product) {
        return res.status(404).json({ success: false, error: `Product not found. Please refresh the page and try again.` });
      }
      if (!product.isAvailable || product.stock < item.quantity) {
        return res.status(400).json({ success: false, error: `Not enough stock for ${product.name}` });
      }
      
      orderItems.push({
        product: product._id,
        name: product.name,
        price: product.price,
        quantity: item.quantity
      });
      totalAmount += product.price * item.quantity;
    }

    const order = new Order({
      customer,
      items: orderItems,
      totalAmount,
      paymentMethod: paymentMethod || 'COD',
      deliveryNote: deliveryNote || ''
    });
    
    await order.save();

    for (const item of items) {
      await Product.findByIdAndUpdate(
        item.product, 
        { $inc: { stock: -item.quantity, orderCount: item.quantity } }
      );
    }

    res.status(201).json({ success: true, order });
  } catch (err) {
    console.error("Order Error:", err);
    res.status(500).json({ success: false, error: 'Server error while placing order.' });
  }
});

// 2. List all orders (admin)  →  GET /api/orders
router.get('/', adminAuth, async (req, res) => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 });
    res.json({ success: true, count: orders.length, orders });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 3. Get customer order history  →  GET /api/orders/customer/:phone
// IMPORTANT: This MUST be above /:id
router.get('/customer/:phone', async (req, res) => {
  try {
    const orders = await Order.find({ 'customer.phone': req.params.phone }).sort({ createdAt: -1 });
    res.json({ success: true, orders });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 4. Get one order (for tracking)  →  GET /api/orders/:id
router.get('/:id', async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate('items.product');
    if (!order) return res.status(404).json({ success: false, error: 'Order not found' });
    res.json({ success: true, order });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 5. Update order status / rider  →  PUT /api/orders/:id/status
router.put('/:id/status', adminAuth, async (req, res) => {
  try {
    const { status, deliveryPartner } = req.body;
    const update = {};
    if (status) update.status = status;
    if (deliveryPartner !== undefined) update.deliveryPartner = deliveryPartner;

    const order = await Order.findByIdAndUpdate(req.params.id, update, { new: true });
    
    if (!order) return res.status(404).json({ success: false, error: 'Order not found' });
    res.json({ success: true, order });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});

module.exports = router;