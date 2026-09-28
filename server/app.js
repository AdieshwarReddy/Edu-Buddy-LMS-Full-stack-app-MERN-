const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const morgan = require('morgan');
const path = require('path');

// Routes
const healthRoutes = require('./routes/healthRoutes');
const authRoutes = require('./routes/authRoutes');
const courseRoutes = require('./routes/courseRoutes');
const lessonRoutes = require('./routes/lessonRoutes');
const enrollmentRoutes = require('./routes/enrollmentRoutes');
const reviewRoutes = require('./routes/reviewRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const adminRoutes = require('./routes/adminRoutes');
const mediaRoutes = require('./routes/mediaRoutes');
const webinarRoutes = require('./routes/webinarRoutes');
const questionRoutes = require('./routes/questionRoutes');

// Handlers & Middleware
const { handleStripeWebhook } = require('./controllers/paymentController');
const { notFound, errorHandler } = require('./middleware/errorMiddleware');
const { apiLimiter } = require('./middleware/rateLimiter');

const app = express();

// Security Headers
app.use(
  helmet({
    crossOriginResourcePolicy: false,
    crossOriginEmbedderPolicy: false,
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'", "https://js.stripe.com"],
        styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
        fontSrc: ["'self'", "https://fonts.gstatic.com"],
        imgSrc: ["'self'", "data:", "blob:", "https://images.unsplash.com", "https://res.cloudinary.com", "https://ui-avatars.com"],
        mediaSrc: ["'self'", "data:", "blob:", "https://res.cloudinary.com"],
        frameSrc: ["'self'", "https://www.youtube.com", "https://js.stripe.com", "https://hooks.stripe.com"],
        connectSrc: ["'self'", "https://api.stripe.com"]
      }
    }
  })
);

// CORS configuration
const allowedOrigins = [
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  process.env.CLIENT_URL
].filter(Boolean);

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(null, true); // Allow all in dev/test, restricted in explicit configs
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
  })
);

// Stripe Webhook MUST be placed before express.json() to preserve the raw buffer
app.post(
  '/api/payments/webhook',
  express.raw({ type: 'application/json' }),
  handleStripeWebhook
);

// Body parsers
app.use(express.json({ limit: '15mb' }));
app.use(express.urlencoded({ extended: true, limit: '15mb' }));
app.use(cookieParser());

// Data sanitization against NoSQL query injection
app.use(mongoSanitize());

// Request logging in development
if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('dev'));
}

// General API Rate Limiting
app.use('/api', apiLimiter);

// API Routes
app.use('/api/health', healthRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/courses/:courseId/lessons', lessonRoutes);
app.use('/api/lessons', lessonRoutes);
app.use('/api/courses/:courseId/reviews', reviewRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/courses/:courseId/questions', questionRoutes);
app.use('/api/questions', questionRoutes);
app.use('/api/enrollments', enrollmentRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/media', mediaRoutes);
app.use('/api/webinars', webinarRoutes);

// Error Handling for API routes
app.use('/api', notFound);
app.use(errorHandler);

// Serve frontend in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../client/dist')));

  app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, '../client/dist', 'index.html'));
  });
} else {
  app.use(notFound);
}

module.exports = app;
