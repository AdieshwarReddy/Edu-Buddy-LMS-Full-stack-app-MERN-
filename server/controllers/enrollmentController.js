const Enrollment = require('../models/Enrollment');
const Course = require('../models/Course');
const Lesson = require('../models/Lesson');

/**
 * @desc    Get all enrollments for the logged in student
 * @route   GET /api/enrollments/me
 * @access  Private (Student, Instructor, Admin)
 */
const getMyEnrollments = async (req, res, next) => {
  try {
    const enrollments = await Enrollment.find({ student: req.user._id })
      .populate({
        path: 'course',
        select: 'title slug thumbnail category level instructor averageRating ratingsCount price shortDescription',
        populate: {
          path: 'instructor',
          select: 'name avatar'
        }
      })
      .populate('lastAccessedLesson', 'title order')
      .sort({ updatedAt: -1 });

    res.status(200).json({
      success: true,
      count: enrollments.length,
      enrollments
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get single enrollment by course ID
 * @route   GET /api/enrollments/course/:courseId
 * @access  Private
 */
const getEnrollmentByCourseId = async (req, res, next) => {
  try {
    const { courseId } = req.params;

    const enrollment = await Enrollment.findOne({
      student: req.user._id,
      course: courseId
    })
      .populate('course')
      .populate('lastAccessedLesson');

    if (!enrollment) {
      return res.status(404).json({
        success: false,
        isEnrolled: false,
        message: 'No active enrollment found for this course.'
      });
    }

    res.status(200).json({
      success: true,
      isEnrolled: true,
      enrollment
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update student progress for a lesson (toggle complete or update last accessed)
 * @route   PATCH /api/enrollments/course/:courseId/progress
 * @access  Private (Student)
 */
const updateLessonProgress = async (req, res, next) => {
  try {
    const { courseId } = req.params;
    const { lessonId, completed } = req.body;

    if (!lessonId) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a lessonId.'
      });
    }

    // Verify lesson exists and belongs to this course
    const lesson = await Lesson.findOne({ _id: lessonId, course: courseId });
    if (!lesson) {
      return res.status(404).json({
        success: false,
        message: 'Lesson not found in this course.'
      });
    }

    // Find enrollment
    const enrollment = await Enrollment.findOne({
      student: req.user._id,
      course: courseId
    });

    if (!enrollment) {
      return res.status(403).json({
        success: false,
        message: 'You must be enrolled in this course to track progress.'
      });
    }

    // Update completed lessons set
    const lessonIdStr = lessonId.toString();
    const existingIndex = enrollment.completedLessonIds.findIndex(
      (id) => id.toString() === lessonIdStr
    );

    if (completed === true || completed === undefined) {
      // Mark as completed if not already in array
      if (existingIndex === -1) {
        enrollment.completedLessonIds.push(lessonId);
      }
    } else if (completed === false) {
      // Unmark completed
      if (existingIndex !== -1) {
        enrollment.completedLessonIds.splice(existingIndex, 1);
      }
    }

    // Update last accessed lesson
    enrollment.lastAccessedLesson = lessonId;

    // Calculate total lessons in course to compute accurate percentage
    const totalLessons = await Lesson.countDocuments({ course: courseId });
    const completedCount = enrollment.completedLessonIds.length;

    if (totalLessons > 0) {
      enrollment.progressPercentage = Math.min(
        100,
        Math.round((completedCount / totalLessons) * 100)
      );
      enrollment.completed = enrollment.progressPercentage === 100;
    } else {
      enrollment.progressPercentage = 0;
      enrollment.completed = false;
    }

    await enrollment.save();

    res.status(200).json({
      success: true,
      message: 'Progress updated successfully.',
      enrollment
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Enroll in a free course directly
 * @route   POST /api/enrollments/free/:courseId
 * @access  Private (Student)
 */
const freeEnroll = async (req, res, next) => {
  try {
    const { courseId } = req.params;

    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found.'
      });
    }

    if (course.price > 0) {
      return res.status(400).json({
        success: false,
        message: 'This is a paid course. Please use the checkout flow to enroll.'
      });
    }

    // Check if already enrolled
    const existing = await Enrollment.findOne({
      student: req.user._id,
      course: courseId
    });

    if (existing) {
      return res.status(400).json({
        success: false,
        message: 'You are already enrolled in this course.'
      });
    }

    // Create enrollment
    const enrollment = await Enrollment.create({
      student: req.user._id,
      course: courseId,
      completedLessonIds: [],
      progressPercentage: 0,
      completed: false
    });

    // Increment enrolled count on course
    await Course.findByIdAndUpdate(courseId, { $inc: { enrolledStudentsCount: 1 } });

    res.status(201).json({
      success: true,
      message: 'Enrolled in free course successfully!',
      enrollment
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getMyEnrollments,
  getEnrollmentByCourseId,
  updateLessonProgress,
  freeEnroll
};
