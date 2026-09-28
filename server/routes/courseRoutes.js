const express = require('express');
const router = express.Router();
const {
  getAllCourses,
  getCourseById,
  createCourse,
  updateCourse,
  deleteCourse,
  togglePublishCourse,
  getInstructorCourses,
  getInstructorAnalytics
} = require('../controllers/courseController');
const { protect, authorize } = require('../middleware/authMiddleware');

// Optional auth extraction middleware for public course viewing (to detect enrollment)
const optionalAuth = async (req, res, next) => {
  if (req.cookies && req.cookies.token) {
    try {
      const jwt = require('jsonwebtoken');
      const User = require('../models/User');
      const decoded = jwt.verify(req.cookies.token, process.env.JWT_SECRET || 'fallback_secret_for_tests');
      req.user = await User.findById(decoded.id);
    } catch (e) {
      // Ignore token verification errors for optional auth
    }
  } else if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      const jwt = require('jsonwebtoken');
      const User = require('../models/User');
      const token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret_for_tests');
      req.user = await User.findById(decoded.id);
    } catch (e) {
      // Ignore token errors
    }
  }
  next();
};

// Instructor routes
router.get('/instructor/my-courses', protect, authorize('instructor', 'admin'), getInstructorCourses);
router.get('/instructor/analytics', protect, authorize('instructor', 'admin'), getInstructorAnalytics);

// Public / General Course routes
router.route('/')
  .get(getAllCourses)
  .post(protect, authorize('instructor', 'admin'), createCourse);

router.route('/:id')
  .get(optionalAuth, getCourseById)
  .put(protect, authorize('instructor', 'admin'), updateCourse)
  .delete(protect, authorize('instructor', 'admin'), deleteCourse);

router.patch('/:id/publish', protect, authorize('instructor', 'admin'), togglePublishCourse);

module.exports = router;
