const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  name: { type: String, required: true },
  price: { type: Number, required: true },
  quantity: { type: Number, required: true, min: 1 }
}, { _id: false });

const orderSchema = new mongoose.Schema({
  customer: {
    name: { type: String, required: true },
    phone: { type: String, required: true },
    address: { type: String, required: true }
  },
  items: [orderItemSchema],
  totalAmount: { type: Number, required: true },
  paymentMethod: { type: String, enum: ['COD', 'UPI'], default: 'COD' },
  status: {
    type: String,
    enum: ['Placed', 'Confirmed', 'Out for Delivery', 'Delivered', 'Cancelled'],
    default: 'Placed'
  },
  deliveryPartner: { type: String, default: '' },
  deliveryNote: { type: String, default: '' }
}, { timestamps: true });

module.exports = mongoose.model('Order', orderSchema);