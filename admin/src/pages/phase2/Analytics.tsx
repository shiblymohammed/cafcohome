import './Phase2Demo.css';

const Analytics = () => {
  const metrics = [
    { label: 'Revenue (This Month)', value: '₹18.5L', change: '+23.5%', trend: 'up' },
    { label: 'Orders', value: '342', change: '+18.2%', trend: 'up' },
    { label: 'Conversion Rate', value: '3.8%', change: '+0.5%', trend: 'up' },
    { label: 'Avg Order Value', value: '₹54,093', change: '+12.3%', trend: 'up' },
    { label: 'Cart Abandonment', value: '68.5%', change: '-5.2%', trend: 'down' },
    { label: 'Customer Lifetime Value', value: '₹1,24,500', change: '+8.7%', trend: 'up' }
  ];

  const topProducts = [
    { name: 'Modern L-Shape Sofa', sales: 45, revenue: '₹6,75,000' },
    { name: 'Wooden Dining Table Set', sales: 38, revenue: '₹5,70,000' },
    { name: 'King Size Bed Frame', sales: 32, revenue: '₹4,80,000' },
    { name: 'Office Chair Ergonomic', sales: 28, revenue: '₹2,80,000' },
    { name: 'Coffee Table Glass Top', sales: 24, revenue: '₹1,92,000' }
  ];

  const trafficSources = [
    { source: 'Organic Search', visitors: 4520, percentage: 42 },
    { source: 'Direct', visitors: 2890, percentage: 27 },
    { source: 'Social Media', visitors: 1980, percentage: 18 },
    { source: 'Paid Ads', visitors: 890, percentage: 8 },
    { source: 'Referral', visitors: 520, percentage: 5 }
  ];

  return (
    <div className="phase2-page">
      <div className="phase2-header">
        <div>
          <h1>📊 Advanced Analytics</h1>
          <p className="phase2-subtitle">Comprehensive business insights and reports</p>
        </div>
        <div className="phase2-header-actions">
          <button className="btn-secondary">📅 Date Range</button>
          <button className="btn-secondary">📥 Export Report</button>
        </div>
      </div>

      <div className="metrics-grid">
        {metrics.map((metric, idx) => (
          <div key={idx} className="metric-card">
            <div className="metric-label">{metric.label}</div>
            <div className="metric-value">{metric.value}</div>
            <div className={`metric-change ${metric.trend}`}>
              {metric.trend === 'up' ? '↑' : '↓'} {metric.change}
            </div>
          </div>
        ))}
      </div>

      <div className="phase2-grid">
        <div className="phase2-card">
          <h3>📈 Revenue Trend (Last 7 Days)</h3>
          <div className="chart-placeholder">
            <div className="chart-bars">
              <div className="chart-bar" style={{ height: '60%' }}><span>₹2.1L</span></div>
              <div className="chart-bar" style={{ height: '75%' }}><span>₹2.6L</span></div>
              <div className="chart-bar" style={{ height: '55%' }}><span>₹1.9L</span></div>
              <div className="chart-bar" style={{ height: '85%' }}><span>₹3.1L</span></div>
              <div className="chart-bar" style={{ height: '70%' }}><span>₹2.4L</span></div>
              <div className="chart-bar" style={{ height: '90%' }}><span>₹3.3L</span></div>
              <div className="chart-bar" style={{ height: '80%' }}><span>₹2.9L</span></div>
            </div>
            <div className="chart-labels">
              <span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span><span>Sun</span>
            </div>
          </div>
        </div>

        <div className="phase2-card">
          <h3>🏆 Top Products</h3>
          <div className="top-products-list">
            {topProducts.map((product, idx) => (
              <div key={idx} className="top-product-item">
                <div className="top-product-rank">#{idx + 1}</div>
                <div className="top-product-info">
                  <strong>{product.name}</strong>
                  <div className="text-muted">{product.sales} sales</div>
                </div>
                <div className="top-product-revenue">{product.revenue}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="phase2-card">
        <h3>🌐 Traffic Sources</h3>
        <div className="traffic-sources">
          {trafficSources.map((source, idx) => (
            <div key={idx} className="traffic-source-item">
              <div className="traffic-source-info">
                <strong>{source.source}</strong>
                <span className="text-muted">{source.visitors.toLocaleString()} visitors</span>
              </div>
              <div className="traffic-source-bar">
                <div 
                  className="traffic-source-fill" 
                  style={{ width: `${source.percentage}%` }}
                />
              </div>
              <div className="traffic-source-percentage">{source.percentage}%</div>
            </div>
          ))}
        </div>
      </div>

      <div className="phase2-demo-badge">
        🎨 Phase 2 Demo - UI Preview Only
      </div>
    </div>
  );
};

export default Analytics;
