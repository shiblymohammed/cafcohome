'use client';

import { useState } from 'react';
import { Star } from 'lucide-react';

interface ReviewFormProps {
  productId: number;
  onSubmit: (data: ReviewFormData) => Promise<void>;
  onCancel?: () => void;
  initialData?: Partial<ReviewFormData>;
}

export interface ReviewFormData {
  rating: number;
  title: string;
  comment: string;
  order?: number;
}

export default function ReviewForm({ productId, onSubmit, onCancel, initialData }: ReviewFormProps) {
  const [rating, setRating] = useState(initialData?.rating || 0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [title, setTitle] = useState(initialData?.title || '');
  const [comment, setComment] = useState(initialData?.comment || '');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (rating === 0) {
      setError('Please select a rating');
      return;
    }
    
    if (!title.trim()) {
      setError('Please enter a title');
      return;
    }
    
    if (!comment.trim()) {
      setError('Please enter your review');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      await onSubmit({ rating, title, comment });
    } catch (err: any) {
      setError(err.message || 'Failed to submit review');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm font-primary">
          {error}
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-alpha mb-3 uppercase tracking-wider">Rating *</label>
        <div className="flex gap-2">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => setRating(star)}
              onMouseEnter={() => setHoveredRating(star)}
              onMouseLeave={() => setHoveredRating(0)}
              className="transition-transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-alpha/20 rounded"
            >
              <Star
                className={`w-10 h-10 ${
                  star <= (hoveredRating || rating)
                    ? 'fill-amber-400 text-amber-400'
                    : 'text-alpha/20'
                }`}
              />
            </button>
          ))}
        </div>
      </div>

      <div>
        <label htmlFor="title" className="block text-sm font-medium text-alpha mb-3 uppercase tracking-wider">
          Review Title *
        </label>
        <input
          type="text"
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Sum up your experience"
          className="w-full px-4 py-3 border-2 border-alpha/20 rounded-lg focus:ring-2 focus:ring-alpha/20 focus:border-alpha transition-all font-primary"
          maxLength={200}
          required
        />
      </div>

      <div>
        <label htmlFor="comment" className="block text-sm font-medium text-alpha mb-3 uppercase tracking-wider">
          Your Review *
        </label>
        <textarea
          id="comment"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Share your thoughts about this product"
          rows={6}
          className="w-full px-4 py-3 border-2 border-alpha/20 rounded-lg focus:ring-2 focus:ring-alpha/20 focus:border-alpha transition-all resize-none font-primary"
          required
        />
      </div>

      <div className="flex gap-4">
        <button
          type="submit"
          disabled={isSubmitting}
          className="flex-1 bg-alpha text-creme py-4 rounded-lg hover:bg-alpha/90 disabled:bg-alpha/50 disabled:cursor-not-allowed transition-all font-medium uppercase tracking-wider text-sm shadow-lg"
        >
          {isSubmitting ? 'Submitting...' : 'Submit Review'}
        </button>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="px-8 py-4 border-2 border-alpha/20 rounded-lg hover:bg-alpha/5 transition-all font-medium uppercase tracking-wider text-sm text-alpha"
          >
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}
