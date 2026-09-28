const Lesson = require('../models/Lesson');
const Course = require('../models/Course');
const Enrollment = require('../models/Enrollment');
const { deleteAsset } = require('../config/cloudinary');

/**
 * @desc    Get lessons for a course
 * @route   GET /api/courses/:courseId/lessons
 * @access  Public / Private (checks enrollment for full video URLs)
 */
const getCourseLessons = async (req, res, next) => {
  try {
    const { courseId } = req.params;
    const course = await Course.findById(courseId);

    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found.'
      });
    }

    let hasFullAccess = false;

    if (req.user) {
      if (req.user.role === 'admin' || course.instructor.toString() === req.user._id.toString()) {
        hasFullAccess = true;
      } else {
        const enrollment = await Enrollment.findOne({ student: req.user._id, course: course._id });
        if (enrollment) {
          hasFullAccess = true;
        }
      }
    }

    const lessons = await Lesson.find({ course: courseId }).sort({ order: 1 });

    const sanitizedLessons = lessons.map((lesson) => {
      const l = lesson.toObject();
      if (!hasFullAccess && !l.previewAllowed) {
        delete l.videoUrl;
        delete l.videoPublicId;
      }
      return l;
    });

    res.status(200).json({
      success: true,
      hasFullAccess,
      lessons: sanitizedLessons
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Create a lesson for a course
 * @route   POST /api/courses/:courseId/lessons
 * @access  Private (Instructor - Owner, Admin)
 */
const createLesson = async (req, res, next) => {
  try {
    const { courseId } = req.params;
    const { title, description, videoUrl, videoPublicId, duration, previewAllowed, order } = req.body;

    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found.'
      });
    }

    // Verify ownership
    if (course.instructor.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to add lessons to this course.'
      });
    }

    if (!title) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a lesson title.'
      });
    }

    // Determine default order if not provided
    let lessonOrder = order;
    if (lessonOrder === undefined) {
      const highestOrderLesson = await Lesson.findOne({ course: courseId }).sort({ order: -1 });
      lessonOrder = highestOrderLesson ? highestOrderLesson.order + 1 : 1;
    }

    const lesson = await Lesson.create({
      course: courseId,
      title,
      description: description || '',
      videoUrl: videoUrl || '',
      videoPublicId: videoPublicId || '',
      duration: duration || 0,
      previewAllowed: Boolean(previewAllowed),
      order: lessonOrder
    });

    res.status(201).json({
      success: true,
      message: 'Lesson created successfully.',
      lesson
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update a lesson
 * @route   PUT /api/lessons/:id
 * @access  Private (Instructor - Owner, Admin)
 */
const updateLesson = async (req, res, next) => {
  try {
    const lesson = await Lesson.findById(req.params.id);
    if (!lesson) {
      return res.status(404).json({
        success: false,
        message: 'Lesson not found.'
      });
    }

    const course = await Course.findById(lesson.course);
    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Parent course not found.'
      });
    }

    // Verify ownership
    if (course.instructor.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to update this lesson.'
      });
    }

    const { title, description, videoUrl, videoPublicId, duration, previewAllowed, order } = req.body;

    if (title) lesson.title = title;
    if (description !== undefined) lesson.description = description;
    if (videoUrl !== undefined) lesson.videoUrl = videoUrl;
    if (videoPublicId !== undefined) {
      // If old video changed, clean up old asset
      if (lesson.videoPublicId && lesson.videoPublicId !== videoPublicId) {
        await deleteAsset(lesson.videoPublicId, 'video');
      }
      lesson.videoPublicId = videoPublicId;
    }
    if (duration !== undefined) lesson.duration = duration;
    if (previewAllowed !== undefined) lesson.previewAllowed = previewAllowed;
    if (order !== undefined) lesson.order = order;

    await lesson.save();

    res.status(200).json({
      success: true,
      message: 'Lesson updated successfully.',
      lesson
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete a lesson
 * @route   DELETE /api/lessons/:id
 * @access  Private (Instructor - Owner, Admin)
 */
const deleteLesson = async (req, res, next) => {
  try {
    const lesson = await Lesson.findById(req.params.id);
    if (!lesson) {
      return res.status(404).json({
        success: false,
        message: 'Lesson not found.'
      });
    }

    const course = await Course.findById(lesson.course);
    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Parent course not found.'
      });
    }

    // Verify ownership
    if (course.instructor.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to delete this lesson.'
      });
    }

    // Clean up video asset from Cloudinary if existing
    if (lesson.videoPublicId) {
      await deleteAsset(lesson.videoPublicId, 'video');
    }

    await Lesson.findByIdAndDelete(req.params.id);

    // Also remove lesson from enrollments' completedLessonIds
    await Enrollment.updateMany(
      { course: course._id },
      { $pull: { completedLessonIds: lesson._id } }
    );

    res.status(200).json({
      success: true,
      message: 'Lesson deleted successfully.'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Reorder lessons for a course
 * @route   PATCH /api/courses/:courseId/lessons/reorder
 * @access  Private (Instructor - Owner, Admin)
 */
const reorderLessons = async (req, res, next) => {
  try {
    const { courseId } = req.params;
    const { lessonIds } = req.body; // Array of lesson IDs in order

    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found.'
      });
    }

    if (course.instructor.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to reorder lessons.'
      });
    }

    if (!Array.isArray(lessonIds)) {
      return res.status(400).json({
        success: false,
        message: 'lessonIds must be an array of IDs.'
      });
    }

    const updatePromises = lessonIds.map((id, index) =>
      Lesson.findByIdAndUpdate(id, { order: index + 1 })
    );

    await Promise.all(updatePromises);

    const updatedLessons = await Lesson.find({ course: courseId }).sort({ order: 1 });

    res.status(200).json({
      success: true,
      message: 'Lessons reordered successfully.',
      lessons: updatedLessons
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getCourseLessons,
  createLesson,
  updateLesson,
  deleteLesson,
  reorderLessons
};
