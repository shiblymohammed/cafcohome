'use client';

import { useState } from 'react';
import { Star, ThumbsUp, CheckCircle } from 'lucide-react';
import { useSession } from 'next-auth/react';
import { ApiClient } from '@/src/lib/api/client';

interface Review {
  id: number;
  user_name: string;
  rating: number;
  title: string;
  comment: string;
  is_verified_purchase: boolean;
  helpful_count: number;
  user_found_helpful: boolean;
  created_at: string;
  can_edit: boolean;
}

interface ReviewListProps {
  reviews: Review[];
  onReviewUpdate?: () => void;
}

export default function ReviewList({ reviews, onReviewUpdate }: ReviewListProps) {
  const { data: session } = useSession();
  const [loadingHelpful, setLoadingHelpful] = useState<number | null>(null);

  const handleHelpful = async (reviewId: number, isCurrentlyHelpful: boolean) => {
    if (!session?.accessToken) {
      alert('Please sign in to mark reviews as helpful');
      return;
    }

    setLoadingHelpful(reviewId);
    try {
      if (isCurrentlyHelpful) {
        await ApiClient.unmarkReviewHelpful(reviewId, session.accessToken);
      } else {
        await ApiClient.markReviewHelpful(reviewId, session.accessToken);
      }
      onReviewUpdate?.();
    } catch (error) {
      console.error('Failed to update helpful status:', error);
    } finally {
      setLoadingHelpful(null);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  if (reviews.length === 0) {
    return (
      <div className="text-center py-12 bg-alpha/5 rounded-xl border border-alpha/10">
        <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-alpha/10 flex items-center justify-center">
          <Star className="w-6 h-6 text-alpha/30" />
        </div>
        <p className="text-alpha/60 font-primary text-sm">No reviews yet. Be the first to review this product!</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {reviews.map((review) => (
        <div key={review.id} className="bg-white rounded-lg border border-alpha/10 p-4 hover:shadow-sm transition-shadow">
          <div className="flex items-start justify-between mb-3">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1.5">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-alpha/20 to-alpha/10 flex items-center justify-center">
                  <span className="text-alpha font-medium text-xs">
                    {review.user_name.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-alpha text-sm">{review.user_name}</span>
                    {review.is_verified_purchase && (
                      <span className="flex items-center gap-1 text-[9px] text-green-700 bg-green-50 px-1.5 py-0.5 rounded-full border border-green-200">
                        <CheckCircle className="w-2.5 h-2.5" />
                        Verified
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 mt-0.5">
                    <div className="flex">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={`w-3 h-3 ${
                            star <= review.rating
                              ? 'fill-amber-400 text-amber-400'
                              : 'text-alpha/20'
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-[10px] text-alpha/50 font-primary">
                      {formatDate(review.created_at)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <h4 className="font-medium text-alpha mb-1.5 text-sm">{review.title}</h4>
          <p className="text-alpha/70 text-xs leading-relaxed mb-3 whitespace-pre-wrap font-primary">{review.comment}</p>

          <div className="flex items-center gap-3 pt-2 border-t border-alpha/5">
            <button
              onClick={() => handleHelpful(review.id, review.user_found_helpful)}
              disabled={loadingHelpful === review.id}
              className={`flex items-center gap-1.5 text-xs transition-all font-primary ${
                review.user_found_helpful
                  ? 'text-alpha'
                  : 'text-alpha/50 hover:text-alpha'
              } disabled:opacity-50`}
            >
              <ThumbsUp className={`w-3.5 h-3.5 ${review.user_found_helpful ? 'fill-current' : ''}`} />
              <span>Helpful {review.helpful_count > 0 && `(${review.helpful_count})`}</span>
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
