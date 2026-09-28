const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Review must belong to a student']
    },
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Course',
      required: [true, 'Review must belong to a course']
    },
    rating: {
      type: Number,
      required: [true, 'Please provide a rating between 1 and 5'],
      min: [1, 'Rating must be at least 1'],
      max: [5, 'Rating cannot exceed 5']
    },
    comment: {
      type: String,
      required: [true, 'Please provide a review comment'],
      trim: true,
      minlength: [3, 'Review comment must be at least 3 characters'],
      maxlength: [1000, 'Review comment cannot exceed 1000 characters']
    }
  },
  {
    timestamps: true
  }
);

// Prevent duplicate reviews per student per course
reviewSchema.index({ student: 1, course: 1 }, { unique: true });

// Static method to recalculate course average rating
reviewSchema.statics.calcAverageRating = async function (courseId) {
  const stats = await this.aggregate([
    {
      $match: { course: new mongoose.Types.ObjectId(courseId) }
    },
    {
      $group: {
        _id: '$course',
        ratingsCount: { $sum: 1 },
        averageRating: { $avg: '$rating' }
      }
    }
  ]);

  const Course = mongoose.model('Course');
  if (stats.length > 0) {
    await Course.findByIdAndUpdate(courseId, {
      ratingsCount: stats[0].ratingsCount,
      averageRating: Math.round(stats[0].averageRating * 10) / 10
    });
  } else {
    await Course.findByIdAndUpdate(courseId, {
      ratingsCount: 0,
      averageRating: 0
    });
  }
};

// Post-save hook to recalculate rating
reviewSchema.post('save', async function () {
  await this.constructor.calcAverageRating(this.course);
});

// Post-remove / delete hook to recalculate rating
reviewSchema.post('findOneAndDelete', async function (doc) {
  if (doc) {
    await doc.constructor.calcAverageRating(doc.course);
  }
});

const Review = mongoose.model('Review', reviewSchema);
module.exports = Review;
