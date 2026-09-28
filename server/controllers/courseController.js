const Course = require('../models/Course');
const Lesson = require('../models/Lesson');
const Enrollment = require('../models/Enrollment');
const Review = require('../models/Review');
const Order = require('../models/Order');

/**
 * @desc    Get all published courses with search, filtering, and sorting
 * @route   GET /api/courses
 * @access  Public
 */
const getAllCourses = async (req, res, next) => {
  try {
    const { search, category, level, minPrice, maxPrice, sort, page = 1, limit = 12 } = req.query;

    const query = { published: true };

    // Search by title or description
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { shortDescription: { $regex: search, $options: 'i' } }
      ];
    }

    // Category filter
    if (category && category !== 'All') {
      query.category = category;
    }

    // Level filter
    if (level && level !== 'All') {
      query.level = level;
    }

    // Price range filter
    if (minPrice !== undefined || maxPrice !== undefined) {
      query.price = {};
      if (minPrice !== undefined) query.price.$gte = Number(minPrice);
      if (maxPrice !== undefined) query.price.$lte = Number(maxPrice);
    }

    // Sorting options
    let sortOptions = { createdAt: -1 }; // default newest
    if (sort === 'price_asc') sortOptions = { price: 1 };
    else if (sort === 'price_desc') sortOptions = { price: -1 };
    else if (sort === 'rating') sortOptions = { averageRating: -1, ratingsCount: -1 };
    else if (sort === 'popular') sortOptions = { enrolledStudentsCount: -1 };

    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 12;
    const skip = (pageNum - 1) * limitNum;

    const total = await Course.countDocuments(query);
    const courses = await Course.find(query)
      .populate('instructor', 'name avatar bio')
      .sort(sortOptions)
      .skip(skip)
      .limit(limitNum);

    res.status(200).json({
      success: true,
      total,
      page: pageNum,
      totalPages: Math.ceil(total / limitNum),
      courses
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get single course details
 * @route   GET /api/courses/:id
 * @access  Public
 */
const getCourseById = async (req, res, next) => {
  try {
    const course = await Course.findById(req.params.id)
      .populate('instructor', 'name avatar bio email')
      .populate({
        path: 'reviews',
        populate: { path: 'student', select: 'name avatar' },
        options: { sort: { createdAt: -1 } }
      });

    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found.'
      });
    }

    // Check enrollment status if user is logged in
    let isEnrolled = false;
    let isOwner = false;
    let enrollment = null;

    if (req.user) {
      if (req.user.role === 'admin' || course.instructor._id.toString() === req.user._id.toString()) {
        isOwner = true;
      }
      enrollment = await Enrollment.findOne({ student: req.user._id, course: course._id });
      if (enrollment) {
        isEnrolled = true;
      }
    }

    // Fetch lessons for the course
    const allLessons = await Lesson.find({ course: course._id }).sort({ order: 1 });

    // Sanitize video URLs for non-enrolled users (only allow preview videos)
    const sanitizedLessons = allLessons.map((lesson) => {
      const lessonObj = lesson.toObject();
      if (!isEnrolled && !isOwner && !lesson.previewAllowed) {
        delete lessonObj.videoUrl;
        delete lessonObj.videoPublicId;
      }
      return lessonObj;
    });

    res.status(200).json({
      success: true,
      course,
      lessons: sanitizedLessons,
      isEnrolled,
      isOwner,
      enrollment
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Create a new course
 * @route   POST /api/courses
 * @access  Private (Instructor, Admin)
 */
const createCourse = async (req, res, next) => {
  try {
    const { title, description, shortDescription, category, level, language, price, thumbnail, thumbnailPublicId } = req.body;

    if (!title || !description) {
      return res.status(400).json({
        success: false,
        message: 'Please provide course title and description.'
      });
    }

    const course = await Course.create({
      title,
      description,
      shortDescription: shortDescription || '',
      category: category || 'Web Development',
      level: level || 'All Levels',
      language: language || 'English',
      price: price !== undefined ? Number(price) : 0,
      thumbnail: thumbnail || '',
      thumbnailPublicId: thumbnailPublicId || '',
      instructor: req.user._id,
      published: false
    });

    res.status(201).json({
      success: true,
      message: 'Course created successfully.',
      course
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update course details
 * @route   PUT /api/courses/:id
 * @access  Private (Instructor - Owner only, Admin)
 */
const updateCourse = async (req, res, next) => {
  try {
    let course = await Course.findById(req.params.id);

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
        message: 'You are not authorized to update this course.'
      });
    }

    const {
      title,
      description,
      shortDescription,
      category,
      level,
      language,
      price,
      thumbnail,
      thumbnailPublicId,
      published
    } = req.body;

    if (title) course.title = title;
    if (description) course.description = description;
    if (shortDescription !== undefined) course.shortDescription = shortDescription;
    if (category) course.category = category;
    if (level) course.level = level;
    if (language) course.language = language;
    if (price !== undefined) course.price = Number(price);
    if (thumbnail !== undefined) course.thumbnail = thumbnail;
    if (thumbnailPublicId !== undefined) course.thumbnailPublicId = thumbnailPublicId;
    if (published !== undefined) course.published = published;

    await course.save();

    res.status(200).json({
      success: true,
      message: 'Course updated successfully.',
      course
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete course
 * @route   DELETE /api/courses/:id
 * @access  Private (Instructor - Owner only, Admin)
 */
const deleteCourse = async (req, res, next) => {
  try {
    const course = await Course.findById(req.params.id);

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
        message: 'You are not authorized to delete this course.'
      });
    }

    // Delete related lessons and reviews
    await Lesson.deleteMany({ course: course._id });
    await Review.deleteMany({ course: course._id });
    await Course.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Course and related lessons removed successfully.'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Toggle course publication status
 * @route   PATCH /api/courses/:id/publish
 * @access  Private (Instructor - Owner only, Admin)
 */
const togglePublishCourse = async (req, res, next) => {
  try {
    const course = await Course.findById(req.params.id);

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
        message: 'You are not authorized to publish/unpublish this course.'
      });
    }

    // Ensure course has at least one lesson before publishing
    if (!course.published) {
      const lessonCount = await Lesson.countDocuments({ course: course._id });
      if (lessonCount === 0) {
        return res.status(400).json({
          success: false,
          message: 'Please add at least one lesson before publishing this course.'
        });
      }
    }

    course.published = !course.published;
    await course.save();

    res.status(200).json({
      success: true,
      message: `Course ${course.published ? 'published' : 'unpublished'} successfully.`,
      course
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get courses created by the logged-in instructor
 * @route   GET /api/courses/instructor/my-courses
 * @access  Private (Instructor, Admin)
 */
const getInstructorCourses = async (req, res, next) => {
  try {
    const courses = await Course.find({ instructor: req.user._id })
      .sort({ createdAt: -1 });

    // Populate lesson counts and enrollments
    const coursesWithStats = await Promise.all(
      courses.map(async (course) => {
        const lessonCount = await Lesson.countDocuments({ course: course._id });
        const enrollmentCount = await Enrollment.countDocuments({ course: course._id });
        const revenueResult = await Order.aggregate([
          { $match: { course: course._id, status: 'completed' } },
          { $group: { _id: null, totalRevenue: { $sum: '$amount' } } }
        ]);
        const revenue = revenueResult.length > 0 ? revenueResult[0].totalRevenue : 0;

        return {
          ...course.toObject(),
          lessonCount,
          enrollmentCount,
          revenue
        };
      })
    );

    res.status(200).json({
      success: true,
      courses: coursesWithStats
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get instructor analytics overview
 * @route   GET /api/courses/instructor/analytics
 * @access  Private (Instructor, Admin)
 */
const getInstructorAnalytics = async (req, res, next) => {
  try {
    const instructorId = req.user._id;

    // Get all courses owned by instructor
    const courses = await Course.find({ instructor: instructorId });
    const courseIds = courses.map((c) => c._id);

    // Total students across instructor courses
    const totalEnrollments = await Enrollment.countDocuments({ course: { $in: courseIds } });

    // Unique students
    const uniqueStudents = await Enrollment.distinct('student', { course: { $in: courseIds } });

    // Total revenue from completed orders
    const revenueAgg = await Order.aggregate([
      { $match: { course: { $in: courseIds }, status: 'completed' } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);
    const totalRevenue = revenueAgg.length > 0 ? revenueAgg[0].total : 0;

    // Breakdown per course
    const courseBreakdown = await Promise.all(
      courses.map(async (course) => {
        const enrollments = await Enrollment.countDocuments({ course: course._id });
        const orderAgg = await Order.aggregate([
          { $match: { course: course._id, status: 'completed' } },
          { $group: { _id: null, revenue: { $sum: '$amount' } } }
        ]);
        const revenue = orderAgg.length > 0 ? orderAgg[0].revenue : 0;

        return {
          _id: course._id,
          title: course.title,
          category: course.category,
          price: course.price,
          published: course.published,
          averageRating: course.averageRating,
          ratingsCount: course.ratingsCount,
          enrollments,
          revenue
        };
      })
    );

    res.status(200).json({
      success: true,
      analytics: {
        totalCourses: courses.length,
        totalEnrollments,
        totalStudents: uniqueStudents.length,
        totalRevenue,
        courseBreakdown
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllCourses,
  getCourseById,
  createCourse,
  updateCourse,
  deleteCourse,
  togglePublishCourse,
  getInstructorCourses,
  getInstructorAnalytics
};
