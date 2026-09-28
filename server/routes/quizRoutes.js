const express = require('express');
const { protect, authorize } = require('../middleware/authMiddleware');
const { createOrUpdateQuiz, getQuiz, submitQuiz } = require('../controllers/quizController');

const router = express.Router({ mergeParams: true });

// Route starts with /api/lessons/:lessonId/quiz

router.get('/', protect, getQuiz);
router.post('/', protect, authorize('instructor', 'admin'), createOrUpdateQuiz);
router.post('/submit', protect, authorize('student'), submitQuiz);

module.exports = router;
