const Quiz = require('../models/Quiz');
const Course = require('../models/Course');
const Lesson = require('../models/Lesson');
const Enrollment = require('../models/Enrollment');

// @desc    Create or update a quiz for a lesson
// @route   POST /api/lessons/:lessonId/quiz
// @access  Private (Instructor)
exports.createOrUpdateQuiz = async (req, res, next) => {
  try {
    const { questions, passingScore } = req.body;
    const { lessonId } = req.params;

    const lesson = await Lesson.findById(lessonId);
    if (!lesson) {
      return res.status(404).json({ success: false, message: 'Lesson not found' });
    }

    const course = await Course.findById(lesson.course);
    if (course.instructor.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized to manage this course' });
    }

    let quiz = await Quiz.findOne({ lesson: lessonId });

    if (quiz) {
      quiz.questions = questions;
      if (passingScore) quiz.passingScore = passingScore;
      await quiz.save();
    } else {
      quiz = await Quiz.create({
        lesson: lessonId,
        course: course._id,
        questions,
        passingScore: passingScore || 80
      });
    }

    res.status(200).json({ success: true, quiz });
  } catch (error) {
    next(error);
  }
};

// @desc    Get quiz for a lesson
// @route   GET /api/lessons/:lessonId/quiz
// @access  Private (Student/Instructor)
exports.getQuiz = async (req, res, next) => {
  try {
    const { lessonId } = req.params;
    const quiz = await Quiz.findOne({ lesson: lessonId }).lean();

    if (!quiz) {
      return res.status(404).json({ success: false, message: 'Quiz not found for this lesson' });
    }

    // Check enrollment if student
    if (req.user.role === 'student') {
      const enrollment = await Enrollment.findOne({ student: req.user._id, course: quiz.course });
      if (!enrollment) {
         return res.status(403).json({ success: false, message: 'You must be enrolled to view this quiz' });
      }

      // Hide correctOptionIndex from students
      quiz.questions = quiz.questions.map(q => {
        const { correctOptionIndex, ...rest } = q;
        return rest;
      });
      
      // Attach previous score if exists
      const previousAttempt = enrollment.quizScores.find(qs => qs.lesson.toString() === lessonId);
      if (previousAttempt) {
        quiz.previousAttempt = previousAttempt;
      }
    }

    res.status(200).json({ success: true, quiz });
  } catch (error) {
    next(error);
  }
};

// @desc    Submit quiz answers
// @route   POST /api/lessons/:lessonId/quiz/submit
// @access  Private (Student)
exports.submitQuiz = async (req, res, next) => {
  try {
    const { lessonId } = req.params;
    const { answers } = req.body; // Array of numbers matching correctOptionIndex

    const quiz = await Quiz.findOne({ lesson: lessonId });
    if (!quiz) {
      return res.status(404).json({ success: false, message: 'Quiz not found' });
    }

    const enrollment = await Enrollment.findOne({ student: req.user._id, course: quiz.course });
    if (!enrollment) {
       return res.status(403).json({ success: false, message: 'You must be enrolled to submit this quiz' });
    }

    let correctCount = 0;
    quiz.questions.forEach((q, idx) => {
      if (answers[idx] === q.correctOptionIndex) {
        correctCount++;
      }
    });

    const score = Math.round((correctCount / quiz.questions.length) * 100);
    const passed = score >= quiz.passingScore;

    // Update enrollment
    const existingScoreIndex = enrollment.quizScores.findIndex(qs => qs.lesson.toString() === lessonId);
    
    // Only update if score is better
    let shouldUpdate = true;
    if (existingScoreIndex !== -1) {
       if (enrollment.quizScores[existingScoreIndex].score >= score) {
         shouldUpdate = false;
       } else {
         enrollment.quizScores[existingScoreIndex].score = score;
         enrollment.quizScores[existingScoreIndex].passed = passed;
       }
    } else {
      enrollment.quizScores.push({
        lesson: lessonId,
        score,
        passed
      });
    }

    if (shouldUpdate) {
      await enrollment.save();
    }

    res.status(200).json({
      success: true,
      score,
      passed,
      correctCount,
      totalQuestions: quiz.questions.length
    });
  } catch (error) {
    next(error);
  }
};
