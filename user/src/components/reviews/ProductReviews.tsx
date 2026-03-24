'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Star } from 'lucide-react';
import { ApiClient } from '@/src/lib/api/client';
import ReviewSummary from './ReviewSummary';
import ReviewList from './ReviewList';
import ReviewForm, { ReviewFormData } from './ReviewForm';

interface ProductReviewsProps {
  productId: number;
}

export default function ProductReviews({ productId }: ProductReviewsProps) {
  const { data: session } = useSession();
  const [reviews, setReviews] = useState<any[]>([]);
  const [summary, setSummary] = useState<any>(null);
  const [showForm, setShowForm] = useState(false);
  const [canReview, setCanReview] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [filterRating, setFilterRating] = useState<number | null>(null);
  const [verifiedOnly, setVerifiedOnly] = useState(false);

  const fetchReviews = async () => {
    try {
      const filters: any = { product: productId };
      if (filterRating) filters.rating = filterRating;
      if (verifiedOnly) filters.verified_only = 'true';

      const [reviewsData, summaryData] = await Promise.all([
        ApiClient.getReviews(filters),
        ApiClient.getReviewSummary(productId),
      ]);

      setReviews(reviewsData.results || reviewsData);
      setSummary(summaryData);
    } catch (error) {
      console.error('Failed to fetch reviews:', error);
    } finally {
      setLoading(false);
    }
  };

  const checkCanReview = async () => {
    if (!session?.accessToken) return;
    
    try {
      const result = await ApiClient.canReviewProduct(productId, session.accessToken);
      setCanReview(result);
    } catch (error) {
      console.error('Failed to check review eligibility:', error);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, [productId, filterRating, verifiedOnly]);

  useEffect(() => {
    if (session) {
      checkCanReview();
    }
  }, [session, productId]);

  const handleSubmitReview = async (data: ReviewFormData) => {
    if (!session?.accessToken) {
      throw new Error('Please sign in to submit a review');
    }

    await ApiClient.createReview(
      { ...data, product: productId },
      session.accessToken
    );

    setShowForm(false);
    fetchReviews();
    checkCanReview();
  };

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="inline-block w-10 h-10 border-4 border-alpha/20 border-t-alpha rounded-full animate-spin"></div>
        <p className="mt-3 text-alpha/60 font-primary text-sm">Loading reviews...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {summary && summary.total_reviews > 0 && (
        <ReviewSummary
          averageRating={summary.average_rating}
          totalReviews={summary.total_reviews}
          ratingDistribution={summary.rating_distribution}
          verifiedPurchaseCount={summary.verified_purchase_count}
        />
      )}

      {session && canReview?.can_review && !showForm && (
        <div className="bg-gradient-to-r from-alpha/5 to-transparent border border-alpha/10 rounded-lg p-4">
          <p className="mb-3 text-alpha font-primary text-sm">
            {canReview.has_purchased
              ? '✨ You purchased this product. Share your experience!'
              : 'Share your thoughts about this product'}
          </p>
          <button
            onClick={() => setShowForm(true)}
            className="bg-alpha text-creme px-6 py-2.5 rounded-lg hover:bg-alpha/90 transition-all uppercase tracking-wider text-xs font-medium shadow-md"
          >
            Write a Review
          </button>
        </div>
      )}

      {showForm && (
        <div className="bg-white border border-alpha/10 rounded-lg p-5 shadow-md">
          <h3 className="text-lg md:text-xl font-secondary text-alpha mb-4">Write Your Review</h3>
          <ReviewForm
            productId={productId}
            onSubmit={handleSubmitReview}
            onCancel={() => setShowForm(false)}
          />
        </div>
      )}

      {reviews.length > 0 && (
        <div>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-4">
            <h3 className="text-lg font-secondary text-alpha">Customer Reviews</h3>
            <div className="flex flex-col sm:flex-row gap-2">
              <select
                value={filterRating || ''}
                onChange={(e) => setFilterRating(e.target.value ? Number(e.target.value) : null)}
                className="px-3 py-2 border border-alpha/20 rounded-lg text-xs font-primary focus:ring-2 focus:ring-alpha/20 focus:border-alpha transition-all"
              >
                <option value="">All Ratings</option>
                <option value="5">5 Stars</option>
                <option value="4">4 Stars</option>
                <option value="3">3 Stars</option>
                <option value="2">2 Stars</option>
                <option value="1">1 Star</option>
              </select>
              <label className="flex items-center gap-2 text-xs font-primary text-alpha px-3 py-2 border border-alpha/20 rounded-lg cursor-pointer hover:bg-alpha/5 transition-all">
                <input
                  type="checkbox"
                  checked={verifiedOnly}
                  onChange={(e) => setVerifiedOnly(e.target.checked)}
                  className="rounded border-alpha/30 text-alpha focus:ring-alpha/20"
                />
                Verified only
              </label>
            </div>
          </div>
          <ReviewList reviews={reviews} onReviewUpdate={fetchReviews} />
        </div>
      )}

      {!session && (
        <div className="text-center py-10 bg-alpha/5 rounded-lg border border-alpha/10">
          <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-alpha/10 flex items-center justify-center">
            <Star className="w-6 h-6 text-alpha/30" />
          </div>
          <p className="text-alpha/70 mb-4 font-primary text-sm">Sign in to write a review</p>
          <a
            href="/auth/signin"
            className="inline-block bg-alpha text-creme px-6 py-2.5 rounded-lg hover:bg-alpha/90 transition-all uppercase tracking-wider text-xs font-medium shadow-md"
          >
            Sign In
          </a>
        </div>
      )}
    </div>
  );
}
