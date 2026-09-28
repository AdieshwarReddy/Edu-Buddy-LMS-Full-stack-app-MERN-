import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { StarRating } from '../common/StarRating';
import { useToast } from '../../context/ToastContext';
import api from '../../api/axios';

export const ReviewModal = ({
  isOpen,
  onClose,
  courseId,
  existingReview = null,
  onReviewSubmitted
}) => {
  const [rating, setRating] = useState(existingReview ? existingReview.rating : 5);
  const [comment, setComment] = useState(existingReview ? existingReview.comment : '');
  const [submitting, setSubmitting] = useState(false);
  const toast = useToast();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!comment.trim()) {
      toast.error('Please write a review comment.');
      return;
    }

    setSubmitting(true);
    try {
      if (existingReview) {
        // Update review
        const res = await api.patch(`/reviews/${existingReview._id}`, {
          rating,
          comment: comment.trim()
        });
        toast.success('Review updated successfully!');
        if (onReviewSubmitted) onReviewSubmitted(res.data.review);
      } else {
        // Create review
        const res = await api.post(`/courses/${courseId}/reviews`, {
          rating,
          comment: comment.trim()
        });
        toast.success('Review submitted successfully!');
        if (onReviewSubmitted) onReviewSubmitted(res.data.review);
      }
      onClose();
    } catch (err) {
      toast.error(err.message || 'Failed to save review');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={existingReview ? 'Update Your Review' : 'Write a Course Review'}
      maxWidth="max-w-lg"
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
            Your Rating
          </label>
          <div className="flex items-center space-x-3 bg-slate-50 p-3 rounded-xl border border-slate-200/80">
            <StarRating
              rating={rating}
              size="lg"
              interactive={true}
              onChange={(val) => setRating(val)}
            />
            <span className="text-sm font-bold text-slate-700">
              {rating} / 5 Stars
            </span>
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
            Feedback & Comments
          </label>
          <textarea
            rows={4}
            required
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="What did you learn? How was the instructor's delivery and course materials?"
            className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 placeholder:text-slate-400"
          />
        </div>

        <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="px-5 py-2 text-sm font-semibold text-white bg-brand-600 hover:bg-brand-700 rounded-xl transition-colors shadow-sm shadow-brand-500/20 disabled:opacity-50"
          >
            {submitting ? 'Saving...' : existingReview ? 'Update Review' : 'Submit Review'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
