const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
  questionText: { 
    type: String, 
    required: [true, 'Please provide the question text'] 
  },
  options: { 
    type: [String], 
    required: true,
    validate: {
      validator: function(v) {
        return v && v.length >= 2;
      },
      message: 'A question must have at least 2 options'
    }
  },
  correctOptionIndex: { 
    type: Number, 
    required: true,
    min: 0
  }
});

const quizSchema = new mongoose.Schema({
  lesson: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Lesson', 
    required: true,
    unique: true // One quiz per lesson
  },
  course: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Course', 
    required: true 
  },
  questions: { 
    type: [questionSchema], 
    required: true,
    validate: {
      validator: function(v) {
        return v && v.length > 0;
      },
      message: 'A quiz must have at least one question'
    }
  },
  passingScore: { 
    type: Number, 
    default: 80, // 80% to pass
    min: 1,
    max: 100
  }
}, { timestamps: true });

module.exports = mongoose.model('Quiz', quizSchema);
