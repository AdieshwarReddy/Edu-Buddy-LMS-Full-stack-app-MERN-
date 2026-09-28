const express = require('express');
const router = express.Router({ mergeParams: true });
const {
  getCourseLessons,
  createLesson,
  updateLesson,
  deleteLesson,
  reorderLessons
} = require('../controllers/lessonController');
const { protect, authorize } = require('../middleware/authMiddleware');

const quizRoutes = require('./quizRoutes');

// Route for /api/courses/:courseId/lessons
router.route('/')
  .get(getCourseLessons)
  .post(protect, authorize('instructor', 'admin'), createLesson);

router.patch('/reorder', protect, authorize('instructor', 'admin'), reorderLessons);

// Route for /api/lessons/:id
router.route('/:id')
  .put(protect, authorize('instructor', 'admin'), updateLesson)
  .delete(protect, authorize('instructor', 'admin'), deleteLesson);

// Mount quiz routes
router.use('/:lessonId/quiz', quizRoutes);

module.exports = router;
