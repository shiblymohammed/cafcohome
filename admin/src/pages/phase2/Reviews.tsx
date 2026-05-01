import './Phase2Demo.css';

const Reviews = () => {
  const reviews = [
    {
      id: 1,
      product: 'Modern L-Shape Sofa',
      customer: 'Rajesh Kumar',
      rating: 5,
      comment: 'Excellent quality! The fabric is premium and very comfortable. Delivery was on time.',
      date: '2026-04-28',
      status: 'approved',
      helpful: 24
    },
    {
      id: 2,
      product: 'Wooden Dining Table Set',
      customer: 'Priya Sharma',
      rating: 4,
      comment: 'Good product but assembly instructions could be better. Overall satisfied with the purchase.',
      date: '2026-04-27',
      status: 'pending',
      helpful: 0
    },
    {
      id: 3,
      product: 'King Size Bed Frame',
      customer: 'Amit Patel',
      rating: 5,
      comment: 'Sturdy and elegant design. Perfect for our bedroom. Highly recommended!',
      date: '2026-04-26',
      status: 'approved',
      helpful: 18
    },
    {
      id: 4,
      product: 'Office Chair Ergonomic',
      customer: 'Sneha Reddy',
      rating: 3,
      comment: 'Average quality. Expected better lumbar support for the price.',
      date: '2026-04-25',
      status: 'approved',
      helpful: 7
    },
    {
      id: 5,
      product: 'Coffee Table Glass Top',
      customer: 'Vikram Singh',
      rating: 2,
      comment: 'Glass arrived with minor scratches. Customer service was helpful though.',
      date: '2026-04-24',
      status: 'pending',
      helpful: 0
    }
  ];

  const getStars = (rating: number) => {
    return '⭐'.repeat(rating) + '☆'.repeat(5 - rating);
  };

  const getStatusBadge = (status: string) => {
    return (
      <span className={`badge badge-${status === 'approved' ? 'success' : 'warning'}`}>
        {status}
      </span>
    );
  };

  return (
    <div className="phase2-page">
      <div className="phase2-header">
        <div>
          <h1>⭐ Product Reviews</h1>
          <p className="phase2-subtitle">Moderate and manage customer reviews</p>
        </div>
        <div className="phase2-header-actions">
          <button className="btn-secondary">📊 Analytics</button>
          <button className="btn-secondary">⚙️ Settings</button>
        </div>
      </div>

      <div className="phase2-stats">
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'var(--color-alpha-light)' }}>📝</div>
          <div>
            <div className="stat-value">248</div>
            <div className="stat-label">Total Reviews</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'var(--color-warning-light)' }}>⏳</div>
          <div>
            <div className="stat-value">12</div>
            <div className="stat-label">Pending Approval</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'var(--color-beta-light)' }}>⭐</div>
          <div>
            <div className="stat-value">4.3</div>
            <div className="stat-label">Average Rating</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'var(--color-gamma-light)' }}>📸</div>
          <div>
            <div className="stat-value">89</div>
            <div className="stat-label">With Photos</div>
          </div>
        </div>
      </div>

      <div className="phase2-filters">
        <button className="filter-btn active">All (248)</button>
        <button className="filter-btn">Pending (12)</button>
        <button className="filter-btn">Approved (230)</button>
        <button className="filter-btn">Rejected (6)</button>
        <button className="filter-btn">⭐⭐⭐⭐⭐ (145)</button>
        <button className="filter-btn">⭐⭐⭐⭐ (68)</button>
        <button className="filter-btn">⭐⭐⭐ (25)</button>
      </div>

      <div className="reviews-list">
        {reviews.map(review => (
          <div key={review.id} className="review-card">
            <div className="review-header">
              <div>
                <strong>{review.product}</strong>
                <div className="review-meta">
                  <span>{review.customer}</span>
                  <span>•</span>
                  <span>{review.date}</span>
                </div>
              </div>
              {getStatusBadge(review.status)}
            </div>
            
            <div className="review-rating">
              {getStars(review.rating)}
            </div>
            
            <p className="review-comment">{review.comment}</p>
            
            <div className="review-footer">
              <div className="review-helpful">
                👍 {review.helpful} found helpful
              </div>
              <div className="review-actions">
                {review.status === 'pending' && (
                  <>
                    <button className="btn-success-sm">✓ Approve</button>
                    <button className="btn-danger-sm">✗ Reject</button>
                  </>
                )}
                <button className="btn-secondary-sm">💬 Reply</button>
                <button className="btn-secondary-sm">⚠️ Flag</button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="phase2-demo-badge">
        🎨 Phase 2 Demo - UI Preview Only
      </div>
    </div>
  );
};

export default Reviews;
