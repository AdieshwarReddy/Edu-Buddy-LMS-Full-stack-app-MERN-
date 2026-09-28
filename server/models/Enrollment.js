const mongoose = require('mongoose');

const enrollmentSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Enrollment must belong to a student']
    },
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Course',
      required: [true, 'Enrollment must belong to a course']
    },
    enrolledAt: {
      type: Date,
      default: Date.now
    },
    completedLessonIds: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Lesson'
      }
    ],
    progressPercentage: {
      type: Number,
      min: 0,
      max: 100,
      default: 0
    },
    completed: {
      type: Boolean,
      default: false
    },
    lastAccessedLesson: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Lesson'
    },
    quizScores: [
      {
        lesson: { type: mongoose.Schema.Types.ObjectId, ref: 'Lesson' },
        score: { type: Number },
        passed: { type: Boolean }
      }
    ]
  },
  {
    timestamps: true
  }
);

// Prevent duplicate enrollments for the same student and course
enrollmentSchema.index({ student: 1, course: 1 }, { unique: true });

const Enrollment = mongoose.model('Enrollment', enrollmentSchema);
module.exports = Enrollment;
