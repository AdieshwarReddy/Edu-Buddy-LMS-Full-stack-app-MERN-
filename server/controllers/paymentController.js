const { stripe, isStripeConfigured } = require('../config/stripe');
const Course = require('../models/Course');
const Order = require('../models/Order');
const Enrollment = require('../models/Enrollment');

/**
 * @desc    Create Stripe Checkout Session for Course Purchase
 * @route   POST /api/payments/create-checkout-session
 * @access  Private (Student)
 */
const createCheckoutSession = async (req, res, next) => {
  try {
    const { courseId } = req.body;

    if (!courseId) {
      return res.status(400).json({
        success: false,
        message: 'Please provide courseId.'
      });
    }

    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found.'
      });
    }

    if (!course.published) {
      return res.status(400).json({
        success: false,
        message: 'This course is currently not published.'
      });
    }

    // Check if already enrolled
    const existingEnrollment = await Enrollment.findOne({
      student: req.user._id,
      course: course._id
    });

    if (existingEnrollment) {
      return res.status(400).json({
        success: false,
        message: 'You are already enrolled in this course.'
      });
    }

    const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';

    // If Stripe is configured with live test key
    if (isStripeConfigured && stripe) {
      const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        mode: 'payment',
        customer_email: req.user.email,
        client_reference_id: req.user._id.toString(),
        metadata: {
          studentId: req.user._id.toString(),
          courseId: course._id.toString()
        },
        line_items: [
          {
            price_data: {
              currency: 'usd',
              product_data: {
                name: course.title,
                description: course.shortDescription || course.description.slice(0, 100),
                images: course.thumbnail ? [course.thumbnail] : []
              },
              unit_amount: Math.round(course.price * 100) // Stripe amount is in cents
            },
            quantity: 1
          }
        ],
        success_url: `${clientUrl}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${clientUrl}/payment/cancel?course_id=${course._id}`
      });

      // Create pending order record in MongoDB
      await Order.create({
        student: req.user._id,
        course: course._id,
        stripeSessionId: session.id,
        amount: course.price,
        currency: 'usd',
        status: 'pending'
      });

      return res.status(200).json({
        success: true,
        sessionId: session.id,
        url: session.url
      });
    }

    // DEVELOPMENT FALLBACK (Simulated Checkout if no live Stripe key is set)
    const simulatedSessionId = `sim_session_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
    
    await Order.create({
      student: req.user._id,
      course: course._id,
      stripeSessionId: simulatedSessionId,
      amount: course.price,
      currency: 'usd',
      status: 'pending'
    });

    return res.status(200).json({
      success: true,
      sessionId: simulatedSessionId,
      url: `${clientUrl}/payment/success?session_id=${simulatedSessionId}&mock=true`,
      isMock: true
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Simulate/Confirm Mock Payment in Development mode
 * @route   POST /api/payments/mock-confirm
 * @access  Private (Student)
 */
const mockConfirmPayment = async (req, res, next) => {
  try {
    const { sessionId } = req.body;

    if (!sessionId) {
      return res.status(400).json({
        success: false,
        message: 'Session ID is required.'
      });
    }

    const order = await Order.findOne({ stripeSessionId: sessionId });
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found.'
      });
    }

    order.status = 'completed';
    await order.save();

    // Idempotent enrollment check
    let enrollment = await Enrollment.findOne({
      student: order.student,
      course: order.course
    });

    if (!enrollment) {
      enrollment = await Enrollment.create({
        student: order.student,
        course: order.course,
        completedLessonIds: [],
        progressPercentage: 0,
        completed: false
      });

      await Course.findByIdAndUpdate(order.course, {
        $inc: { enrolledStudentsCount: 1 }
      });
    }

    res.status(200).json({
      success: true,
      message: 'Payment confirmed and enrolled successfully.',
      order,
      enrollment
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Handle Stripe Webhook
 * @route   POST /api/payments/webhook
 * @access  Public (Signature verified via Stripe header)
 */
const handleStripeWebhook = async (req, res) => {
  const sig = req.headers['stripe-signature'];
  const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

  let event;

  try {
    if (!stripe || !endpointSecret) {
      return res.status(400).send('Stripe webhook is not configured');
    }
    event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
  } catch (err) {
    console.error(`[Webhook Signature Error] ${err.message}`);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle the event
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    const studentId = session.metadata ? session.metadata.studentId : null;
    const courseId = session.metadata ? session.metadata.courseId : null;

    if (studentId && courseId) {
      try {
        // Find or update order
        let order = await Order.findOne({ stripeSessionId: session.id });
        if (order) {
          order.status = 'completed';
          order.stripePaymentIntentId = session.payment_intent;
          await order.save();
        } else {
          await Order.create({
            student: studentId,
            course: courseId,
            stripeSessionId: session.id,
            stripePaymentIntentId: session.payment_intent,
            amount: (session.amount_total || 0) / 100,
            currency: session.currency || 'usd',
            status: 'completed'
          });
        }

        // Idempotent Enrollment creation
        const existingEnrollment = await Enrollment.findOne({
          student: studentId,
          course: courseId
        });

        if (!existingEnrollment) {
          await Enrollment.create({
            student: studentId,
            course: courseId,
            completedLessonIds: [],
            progressPercentage: 0,
            completed: false
          });

          // Increment course enrollment count
          await Course.findByIdAndUpdate(courseId, {
            $inc: { enrolledStudentsCount: 1 }
          });
        }
      } catch (err) {
        console.error(`[Webhook Processing Error] ${err.message}`);
        return res.status(500).json({ error: 'Failed to process enrollment' });
      }
    }
  }

  res.status(200).json({ received: true });
};

/**
 * @desc    Verify Payment Status for Success Page
 * @route   GET /api/payments/verify/:sessionId
 * @access  Private
 */
const verifyPaymentStatus = async (req, res, next) => {
  try {
    const { sessionId } = req.params;

    const order = await Order.findOne({ stripeSessionId: sessionId })
      .populate('course', 'title thumbnail category price');

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found for this checkout session.'
      });
    }

    // Verify ownership
    if (order.student.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to view this order.'
      });
    }

    const enrollment = await Enrollment.findOne({
      student: order.student,
      course: order.course._id
    });

    res.status(200).json({
      success: true,
      order,
      isEnrolled: Boolean(enrollment),
      enrollment
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get user's order history
 * @route   GET /api/payments/my-orders
 * @access  Private
 */
const getMyOrders = async (req, res, next) => {
  try {
    const orders = await Order.find({ student: req.user._id })
      .populate('course', 'title thumbnail category price')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: orders.length,
      orders
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createCheckoutSession,
  mockConfirmPayment,
  handleStripeWebhook,
  verifyPaymentStatus,
  getMyOrders
};
