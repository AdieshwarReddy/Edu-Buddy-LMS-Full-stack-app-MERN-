const Webinar = require('../models/Webinar');
const Course = require('../models/Course');
const crypto = require('crypto');

// @desc    Create a new webinar
// @route   POST /api/webinars
// @access  Private (Instructor)
exports.createWebinar = async (req, res, next) => {
  try {
    const { courseId, title, description, scheduledAt, duration } = req.body;

    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ success: false, message: 'Course not found' });
    }

    if (course.instructor.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    // Generate unique Jitsi room name
    const roomName = `EduBuddy_${crypto.randomBytes(8).toString('hex')}`;

    const webinar = await Webinar.create({
      course: courseId,
      instructor: req.user._id,
      title,
      description,
      scheduledAt,
      duration,
      roomName
    });

    res.status(201).json({ success: true, webinar });
  } catch (error) {
    next(error);
  }
};

// @desc    Get webinars for student's enrolled courses
// @route   GET /api/webinars/student
// @access  Private (Student)
exports.getStudentWebinars = async (req, res, next) => {
  try {
    const Enrollment = require('../models/Enrollment');
    const enrollments = await Enrollment.find({ student: req.user._id });
    const courseIds = enrollments.map(e => e.course);

    const webinars = await Webinar.find({ 
      course: { $in: courseIds },
      scheduledAt: { $gte: new Date(Date.now() - 3600000) } // include ones that started an hour ago
    })
      .populate('course', 'title thumbnail')
      .populate('instructor', 'name')
      .sort({ scheduledAt: 1 });
      
    res.status(200).json({ success: true, webinars });
  } catch (error) {
    next(error);
  }
};

// @desc    Get instructor's webinars
// @route   GET /api/webinars/instructor
// @access  Private (Instructor)
exports.getInstructorWebinars = async (req, res, next) => {
  try {
    const webinars = await Webinar.find({ instructor: req.user._id })
      .populate('course', 'title thumbnail')
      .sort({ scheduledAt: 1 });
    res.status(200).json({ success: true, webinars });
  } catch (error) {
    next(error);
  }
};

// @desc    Get webinars by course
// @route   GET /api/webinars/course/:courseId
// @access  Private
exports.getCourseWebinars = async (req, res, next) => {
  try {
    const webinars = await Webinar.find({ course: req.params.courseId })
      .sort({ scheduledAt: 1 });
    res.status(200).json({ success: true, webinars });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete webinar
// @route   DELETE /api/webinars/:id
// @access  Private (Instructor)
exports.deleteWebinar = async (req, res, next) => {
  try {
    const webinar = await Webinar.findById(req.params.id);
    if (!webinar) {
      return res.status(404).json({ success: false, message: 'Webinar not found' });
    }

    if (webinar.instructor.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
       return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    await webinar.deleteOne();
    res.status(200).json({ success: true, data: {} });
  } catch (error) {
    next(error);
  }
};

// @desc    Mark attendance for a webinar
// @route   POST /api/webinars/room/:roomName/attend
// @access  Private (Student)
exports.markAttendance = async (req, res, next) => {
  try {
    const { roomName } = req.params;
    const webinar = await Webinar.findOneAndUpdate(
      { roomName },
      { $addToSet: { attendees: req.user._id } },
      { new: true }
    );

    if (!webinar) {
      return res.status(404).json({ success: false, message: 'Webinar not found' });
    }

    res.status(200).json({ success: true, message: 'Attendance marked' });
  } catch (error) {
    next(error);
  }
};
