import { useState } from 'react';
import './Phase2Demo.css';

const Coupons = () => {
  const coupons = [
    {
      id: 1,
      code: 'SUMMER25',
      type: 'Percentage',
      discount: '25%',
      minOrder: '₹10,000',
      maxDiscount: '₹5,000',
      used: 145,
      limit: 500,
      expires: '2026-06-30',
      status: 'active'
    },
    {
      id: 2,
      code: 'FIRST500',
      type: 'Fixed',
      discount: '₹500',
      minOrder: '₹5,000',
      maxDiscount: '-',
      used: 89,
      limit: 200,
      expires: '2026-12-31',
      status: 'active'
    },
    {
      id: 3,
      code: 'FREESHIP',
      type: 'Free Shipping',
      discount: 'Free',
      minOrder: '₹15,000',
      maxDiscount: '-',
      used: 234,
      limit: 1000,
      expires: '2026-05-31',
      status: 'active'
    },
    {
      id: 4,
      code: 'WINTER20',
      type: 'Percentage',
      discount: '20%',
      minOrder: '₹8,000',
      maxDiscount: '₹3,000',
      used: 500,
      limit: 500,
      expires: '2026-03-31',
      status: 'expired'
    }
  ];

  return (
    <div className="phase2-page">
      <div className="phase2-header">
        <div>
          <h1>🎟️ Coupons & Discounts</h1>
          <p className="phase2-subtitle">Manage discount codes and promotional offers</p>
        </div>
        <button className="btn-primary">
          <span>+</span> Create Coupon
        </button>
      </div>

      <div className="phase2-stats">
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'var(--color-alpha-light)' }}>🎫</div>
          <div>
            <div className="stat-value">4</div>
            <div className="stat-label">Total Coupons</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'var(--color-success-light)' }}>✅</div>
          <div>
            <div className="stat-value">3</div>
            <div className="stat-label">Active Coupons</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'var(--color-beta-light)' }}>📊</div>
          <div>
            <div className="stat-value">968</div>
            <div className="stat-label">Total Uses</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'var(--color-gamma-light)' }}>💰</div>
          <div>
            <div className="stat-value">₹8.5L</div>
            <div className="stat-label">Total Discount Given</div>
          </div>
        </div>
      </div>

      <div className="phase2-table-container">
        <table className="phase2-table">
          <thead>
            <tr>
              <th>Coupon Code</th>
              <th>Type</th>
              <th>Discount</th>
              <th>Min Order</th>
              <th>Usage</th>
              <th>Expires</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {coupons.map(coupon => (
              <tr key={coupon.id}>
                <td>
                  <strong className="coupon-code">{coupon.code}</strong>
                </td>
                <td>{coupon.type}</td>
                <td><strong>{coupon.discount}</strong></td>
                <td>{coupon.minOrder}</td>
                <td>
                  <div className="usage-bar">
                    <div className="usage-fill" style={{ width: `${(coupon.used / coupon.limit) * 100}%` }} />
                  </div>
                  <div className="text-muted">{coupon.used} / {coupon.limit}</div>
                </td>
                <td>{coupon.expires}</td>
                <td>
                  <span className={`badge badge-${coupon.status === 'active' ? 'success' : 'neutral'}`}>
                    {coupon.status}
                  </span>
                </td>
                <td>
                  <button className="btn-icon">✏️</button>
                  <button className="btn-icon">📋</button>
                  <button className="btn-icon">🗑️</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="phase2-demo-badge">
        🎨 Phase 2 Demo - UI Preview Only
      </div>
    </div>
  );
};

export default Coupons;
