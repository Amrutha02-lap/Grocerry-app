const express = require('express');
const Razorpay = require('razorpay');
const router = express.Router();

router.post('/create-order', async (req, res) => {
  try {
    const keyId = process.env.RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;

    // 1. Check if real keys are in the .env file
    if (!keyId || !keySecret || keyId === 'your_test_key_id') {
      return res.status(400).json({ 
        success: false, 
        error: 'Razorpay is not configured yet. Please select Cash on Delivery.' 
      });
    }

    // 2. Initialize Razorpay ONLY if keys exist
    const razorpay = new Razorpay({
      key_id: keyId,
      key_secret: keySecret,
    });

    const { amount } = req.body; 
    const options = {
      amount: amount,
      currency: 'INR',
      receipt: 'receipt_' + Date.now(),
    };
    
    const order = await razorpay.orders.create(options);
    res.json({ success: true, order });
  } catch (err) {
    console.error("Razorpay Error:", err);
    res.status(500).json({ success: false, error: 'Payment gateway error. Please use Cash on Delivery.' });
  }
});

module.exports = router;