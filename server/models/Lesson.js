const mongoose = require('mongoose');

const lessonSchema = new mongoose.Schema(
  {
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Course',
      required: [true, 'Lesson must belong to a course']
    },
    title: {
      type: String,
      required: [true, 'Please provide a lesson title'],
      trim: true,
      minlength: [2, 'Lesson title must be at least 2 characters'],
      maxlength: [120, 'Lesson title cannot exceed 120 characters']
    },
    description: {
      type: String,
      default: ''
    },
    order: {
      type: Number,
      required: true,
      default: 1
    },
    videoUrl: {
      type: String,
      default: ''
    },
    videoPublicId: {
      type: String,
      default: ''
    },
    duration: {
      type: Number, // duration in seconds
      default: 0
    },
    previewAllowed: {
      type: Boolean,
      default: false
    }
  },
  {
    timestamps: true
  }
);

// Compound index for course and order
lessonSchema.index({ course: 1, order: 1 });

const Lesson = mongoose.model('Lesson', lessonSchema);
module.exports = Lesson;
