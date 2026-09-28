const mongoose = require('mongoose');

const courseSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Please provide a course title'],
      trim: true,
      minlength: [3, 'Title must be at least 3 characters'],
      maxlength: [120, 'Title cannot exceed 120 characters']
    },
    slug: {
      type: String,
      lowercase: true
    },
    description: {
      type: String,
      required: [true, 'Please provide a course description'],
      minlength: [10, 'Description must be at least 10 characters']
    },
    shortDescription: {
      type: String,
      maxlength: [250, 'Short description cannot exceed 250 characters'],
      default: ''
    },
    instructor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Course must belong to an instructor']
    },
    category: {
      type: String,
      required: [true, 'Please specify a course category'],
      enum: [
        'Web Development',
        'Mobile Development',
        'Data Science & AI',
        'Cloud & DevOps',
        'UI/UX Design',
        'Cybersecurity',
        'Business & Marketing',
        'Other'
      ],
      default: 'Web Development'
    },
    level: {
      type: String,
      enum: ['Beginner', 'Intermediate', 'Advanced', 'All Levels'],
      default: 'All Levels'
    },
    language: {
      type: String,
      default: 'English'
    },
    price: {
      type: Number,
      required: [true, 'Please specify a course price'],
      min: [0, 'Price cannot be negative'],
      default: 0
    },
    thumbnail: {
      type: String,
      default: ''
    },
    thumbnailPublicId: {
      type: String,
      default: ''
    },
    published: {
      type: Boolean,
      default: false
    },
    averageRating: {
      type: Number,
      min: [0, 'Rating cannot be below 0'],
      max: [5, 'Rating cannot exceed 5'],
      default: 0
    },
    ratingsCount: {
      type: Number,
      default: 0
    },
    enrolledStudentsCount: {
      type: Number,
      default: 0
    }
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Virtual populate for lessons
courseSchema.virtual('lessons', {
  ref: 'Lesson',
  localField: '_id',
  foreignField: 'course',
  justOne: false,
  options: { sort: { order: 1 } }
});

// Virtual populate for reviews
courseSchema.virtual('reviews', {
  ref: 'Review',
  localField: '_id',
  foreignField: 'course',
  justOne: false
});

// Generate slug before save
courseSchema.pre('save', function (next) {
  if (this.isModified('title')) {
    this.slug = this.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '');
  }
  next();
});

const Course = mongoose.model('Course', courseSchema);
module.exports = Course;
