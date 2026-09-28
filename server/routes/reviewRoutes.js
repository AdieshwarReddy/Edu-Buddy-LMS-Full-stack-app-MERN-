const express = require('express');
const router = express.Router({ mergeParams: true });
const {
  getCourseReviews,
  createReview,
  updateReview,
  deleteReview
} = require('../controllers/reviewController');
const { protect } = require('../middleware/authMiddleware');

// /api/courses/:courseId/reviews
router.route('/')
  .get(getCourseReviews)
  .post(protect, createReview);

// /api/reviews/:id
router.route('/:id')
  .patch(protect, updateReview)
  .delete(protect, deleteReview);

module.exports = router;
