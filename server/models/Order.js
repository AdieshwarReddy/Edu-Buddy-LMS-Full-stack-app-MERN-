const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Order must belong to a student']
    },
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Course',
      required: [true, 'Order must specify a course']
    },
    stripeSessionId: {
      type: String,
      unique: true,
      sparse: true
    },
    stripePaymentIntentId: {
      type: String,
      sparse: true
    },
    amount: {
      type: Number,
      required: [true, 'Order must have an amount in USD or local currency']
    },
    currency: {
      type: String,
      default: 'usd',
      lowercase: true
    },
    status: {
      type: String,
      enum: ['pending', 'completed', 'failed', 'refunded'],
      default: 'pending'
    },
    paymentMethod: {
      type: String,
      default: 'stripe'
    }
  },
  {
    timestamps: true
  }
);

const Order = mongoose.model('Order', orderSchema);
module.exports = Order;
