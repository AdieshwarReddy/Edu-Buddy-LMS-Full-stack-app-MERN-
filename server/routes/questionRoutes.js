const express = require('express');
const {
  getCourseQuestions,
  askQuestion,
  replyToQuestion,
  resolveQuestion
} = require('../controllers/questionController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router({ mergeParams: true });

// Mounted at /api/courses/:courseId/questions
router.route('/')
  .get(protect, getCourseQuestions)
  .post(protect, askQuestion);

// For operations directly on the question itself (not strictly needing courseId in url)
// We'll also mount this root router to /api/questions
router.route('/:id/reply')
  .post(protect, replyToQuestion);

router.route('/:id/resolve')
  .patch(protect, resolveQuestion);

module.exports = router;
