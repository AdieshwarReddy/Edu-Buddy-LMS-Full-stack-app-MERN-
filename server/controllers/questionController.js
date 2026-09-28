const Question = require('../models/Question');
const Course = require('../models/Course');

// @desc    Get all questions for a course
// @route   GET /api/courses/:courseId/questions
// @access  Private
exports.getCourseQuestions = async (req, res, next) => {
  try {
    const questions = await Question.find({ course: req.params.courseId })
      .populate('student', 'name avatar role')
      .populate('replies.user', 'name avatar role')
      .populate('lesson', 'title')
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, questions });
  } catch (error) {
    next(error);
  }
};

// @desc    Ask a new question
// @route   POST /api/courses/:courseId/questions
// @access  Private (Student/Instructor)
exports.askQuestion = async (req, res, next) => {
  try {
    const { title, content, lessonId } = req.body;
    
    // Make sure course exists
    const course = await Course.findById(req.params.courseId);
    if (!course) {
      return res.status(404).json({ success: false, message: 'Course not found' });
    }

    const question = await Question.create({
      course: req.params.courseId,
      student: req.user._id,
      title,
      content,
      lesson: lessonId || undefined
    });

    // Populate for immediate return
    await question.populate('student', 'name avatar role');
    if (question.lesson) {
      await question.populate('lesson', 'title');
    }

    res.status(201).json({ success: true, question });
  } catch (error) {
    next(error);
  }
};

// @desc    Reply to a question
// @route   POST /api/questions/:id/reply
// @access  Private
exports.replyToQuestion = async (req, res, next) => {
  try {
    const { content } = req.body;

    const question = await Question.findById(req.params.id);
    if (!question) {
      return res.status(404).json({ success: false, message: 'Question not found' });
    }

    question.replies.push({
      user: req.user._id,
      content
    });

    await question.save();
    
    // Repopulate entirely so UI has everything
    await question.populate('student', 'name avatar role');
    await question.populate('replies.user', 'name avatar role');
    await question.populate('lesson', 'title');

    res.status(200).json({ success: true, question });
  } catch (error) {
    next(error);
  }
};

// @desc    Mark question as resolved
// @route   PATCH /api/questions/:id/resolve
// @access  Private (Author or Instructor)
exports.resolveQuestion = async (req, res, next) => {
  try {
    const question = await Question.findById(req.params.id).populate('course');
    if (!question) {
      return res.status(404).json({ success: false, message: 'Question not found' });
    }

    // Must be student who asked it OR instructor of the course
    const isAuthor = question.student.toString() === req.user._id.toString();
    const isInstructor = question.course.instructor.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';

    if (!isAuthor && !isInstructor && !isAdmin) {
       return res.status(403).json({ success: false, message: 'Not authorized to resolve this question' });
    }

    question.isResolved = !question.isResolved; // toggle
    await question.save();

    res.status(200).json({ success: true, isResolved: question.isResolved });
  } catch (error) {
    next(error);
  }
};
