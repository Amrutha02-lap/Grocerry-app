const express = require('express');
const router = express.Router();

router.post('/login', (req, res) => {
  const { password } = req.body;
  const expected = process.env.ADMIN_PASSWORD || 'Amru#2026';
  if (password === expected) {
    return res.json({ success: true, token: password });
  }
  res.status(401).json({ success: false, error: 'Wrong password' });
});

module.exports = router;
