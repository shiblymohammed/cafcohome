'use client';

import { Star } from 'lucide-react';

interface ReviewSummaryProps {
  averageRating: number;
  totalReviews: number;
  ratingDistribution: Record<string, number>;
  verifiedPurchaseCount: number;
}

export default function ReviewSummary({
  averageRating,
  totalReviews,
  ratingDistribution,
  verifiedPurchaseCount,
}: ReviewSummaryProps) {
  const getRatingPercentage = (rating: number) => {
    if (totalReviews === 0) return 0;
    return Math.round((ratingDistribution[rating] / totalReviews) * 100);
  };

  return (
    <div className="bg-gradient-to-br from-alpha/5 to-transparent rounded-xl p-4 md:p-6 border border-alpha/10">
      <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
        {/* Average Rating */}
        <div className="text-center md:border-r md:border-alpha/10 md:pr-6">
          <div className="text-4xl md:text-5xl font-secondary text-alpha mb-2">{averageRating.toFixed(1)}</div>
          <div className="flex justify-center mb-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star
                key={star}
                className={`w-4 h-4 ${
                  star <= Math.round(averageRating)
                    ? 'fill-amber-400 text-amber-400'
                    : 'text-alpha/20'
                }`}
              />
            ))}
          </div>
          <div className="text-xs text-alpha/70 font-primary">
            {totalReviews} {totalReviews === 1 ? 'review' : 'reviews'}
          </div>
          {verifiedPurchaseCount > 0 && (
            <div className="text-[10px] text-green-600 mt-1.5 inline-flex items-center gap-1 bg-green-50 px-2 py-0.5 rounded-full">
              <span className="w-1 h-1 bg-green-500 rounded-full"></span>
              {verifiedPurchaseCount} verified
            </div>
          )}
        </div>

        {/* Rating Distribution */}
        <div className="flex-1 w-full">
          {[5, 4, 3, 2, 1].map((rating) => (
            <div key={rating} className="flex items-center gap-2 mb-2 last:mb-0">
              <div className="flex items-center gap-1 w-12 text-xs text-alpha/70 font-primary">
                <span>{rating}</span>
                <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
              </div>
              <div className="flex-1 bg-alpha/10 rounded-full h-2 overflow-hidden">
                <div
                  className="bg-gradient-to-r from-amber-400 to-amber-500 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${getRatingPercentage(rating)}%` }}
                />
              </div>
              <div className="text-xs text-alpha/70 w-10 text-right font-primary font-medium">
                {getRatingPercentage(rating)}%
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
