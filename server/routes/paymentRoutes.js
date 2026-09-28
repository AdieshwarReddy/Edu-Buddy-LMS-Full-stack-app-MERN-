const express = require('express');
const router = express.Router();
const {
  createCheckoutSession,
  mockConfirmPayment,
  verifyPaymentStatus,
  getMyOrders
} = require('../controllers/paymentController');
const { protect } = require('../middleware/authMiddleware');

router.post('/create-checkout-session', protect, createCheckoutSession);
router.post('/mock-confirm', protect, mockConfirmPayment);
router.get('/verify/:sessionId', protect, verifyPaymentStatus);
router.get('/my-orders', protect, getMyOrders);

module.exports = router;
