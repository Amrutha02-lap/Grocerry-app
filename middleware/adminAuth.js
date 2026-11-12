module.exports = (req, res, next) => {
  const key = req.headers['x-admin-key'];
  const expected = process.env.ADMIN_PASSWORD || 'admin123';
  if (!key || key !== expected) {
    return res.status(401).json({ success: false, error: 'Unauthorized. Please log in.' });
  }
  next();
};
