const Review = require('../models/Review');
const Enrollment = require('../models/Enrollment');
const Course = require('../models/Course');

/**
 * @desc    Get reviews for a course
 * @route   GET /api/courses/:courseId/reviews
 * @access  Public
 */
const getCourseReviews = async (req, res, next) => {
  try {
    const { courseId } = req.params;

    const reviews = await Review.find({ course: courseId })
      .populate('student', 'name avatar')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: reviews.length,
      reviews
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Create a review for a course
 * @route   POST /api/courses/:courseId/reviews
 * @access  Private (Enrolled student only)
 */
const createReview = async (req, res, next) => {
  try {
    const { courseId } = req.params;
    const { rating, comment } = req.body;

    if (!rating || !comment) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both rating (1-5) and comment.'
      });
    }

    if (rating < 1 || rating > 5) {
      return res.status(400).json({
        success: false,
        message: 'Rating must be between 1 and 5.'
      });
    }

    // Verify course exists
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found.'
      });
    }

    // Verify student is enrolled
    const enrollment = await Enrollment.findOne({
      student: req.user._id,
      course: courseId
    });

    if (!enrollment && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Only enrolled students can review this course.'
      });
    }

    // Check if review already exists from this student
    const existingReview = await Review.findOne({
      student: req.user._id,
      course: courseId
    });

    if (existingReview) {
      return res.status(400).json({
        success: false,
        message: 'You have already reviewed this course. You can update your existing review.'
      });
    }

    const review = await Review.create({
      student: req.user._id,
      course: courseId,
      rating: Number(rating),
      comment: comment.trim()
    });

    await review.populate('student', 'name avatar');

    res.status(201).json({
      success: true,
      message: 'Review submitted successfully!',
      review
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update a review
 * @route   PATCH /api/reviews/:id
 * @access  Private (Owner only)
 */
const updateReview = async (req, res, next) => {
  try {
    const review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found.'
      });
    }

    // Verify ownership
    if (review.student.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to update this review.'
      });
    }

    const { rating, comment } = req.body;

    if (rating !== undefined) {
      if (rating < 1 || rating > 5) {
        return res.status(400).json({
          success: false,
          message: 'Rating must be between 1 and 5.'
        });
      }
      review.rating = Number(rating);
    }

    if (comment !== undefined) {
      review.comment = comment.trim();
    }

    await review.save();
    await review.populate('student', 'name avatar');

    res.status(200).json({
      success: true,
      message: 'Review updated successfully.',
      review
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete a review
 * @route   DELETE /api/reviews/:id
 * @access  Private (Owner, Admin)
 */
const deleteReview = async (req, res, next) => {
  try {
    const review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found.'
      });
    }

    if (review.student.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to delete this review.'
      });
    }

    await Review.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Review deleted successfully.'
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getCourseReviews,
  createReview,
  updateReview,
  deleteReview
};
