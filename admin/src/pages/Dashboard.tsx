import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import apiClient from '../utils/api';
import './Dashboard.css';

interface DashboardStats {
  total_orders: number;
  pending_orders: number;
  total_users: number;
  total_products: number;
  recent_orders: RecentOrder[];
}

interface RecentOrder {
  order_number: string;
  customer_name: string;
  customer_phone: string;
  stage: string;
  stage_display: string;
  total: string;
  created_at: string;
  assigned_to: string | null;
}

/* ─── Icons ───────────────────────────── */
const OrdersIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="3" width="20" height="18" rx="2" /><path d="M8 7h8" /><path d="M8 11h6" /><path d="M8 15h4" />
  </svg>
);
const PendingIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" /><polyline points="12,6 12,12 16,14" />
  </svg>
);
const UsersIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" /><circle cx="9" cy="7" r="4" />
    <path d="M23 21v-2a4 4 0 00-3-3.87" /><path d="M16 3.13a4 4 0 010 7.75" />
  </svg>
);
const ProductsIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z" />
    <polyline points="3.27,6.96 12,12.01 20.73,6.96" /><line x1="12" y1="22.08" x2="12" y2="12" />
  </svg>
);
const ArrowRightIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M5 12h14" /><path d="M12 5l7 7-7 7" />
  </svg>
);
const EyeIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" />
  </svg>
);
const TrendUpIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="23,6 13.5,15.5 8.5,10.5 1,18" /><polyline points="17,6 23,6 23,12" />
  </svg>
);

/* ─── Animated Bar Chart ─────────────── */
const BarChart = ({ data, labels, color, title }: { data: number[]; labels: string[]; color: string; title: string }) => {
  const [animated, setAnimated] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const max = Math.max(...data, 1);

  useEffect(() => {
    const timer = setTimeout(() => setAnimated(true), 200);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="chart-card glass-card" ref={ref}>
      <div className="chart-card__header">
        <h3 className="chart-card__title">{title}</h3>
        <span className="chart-card__badge">Last 7 days</span>
      </div>
      <div className="bar-chart">
        {data.map((val, i) => (
          <div key={i} className="bar-chart__col">
            <div className="bar-chart__bar-wrap">
              <div
                className="bar-chart__bar"
                style={{
                  height: animated ? `${(val / max) * 100}%` : '0%',
                  background: `linear-gradient(180deg, ${color}, ${color}66)`,
                  transitionDelay: `${i * 60}ms`,
                }}
              >
                <span className="bar-chart__tooltip">{val}</span>
              </div>
            </div>
            <span className="bar-chart__label">{labels[i]}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

/* ─── Animated Area Chart (SVG) ────────── */
const AreaChart = ({ data, color, title, subtitle }: { data: number[]; color: string; title: string; subtitle: string }) => {
  const [animated, setAnimated] = useState(false);
  const max = Math.max(...data, 1) * 1.15;
  const w = 320;
  const h = 120;
  const padX = 0;
  const padY = 8;

  useEffect(() => {
    const timer = setTimeout(() => setAnimated(true), 300);
    return () => clearTimeout(timer);
  }, []);

  const points = data.map((v, i) => ({
    x: padX + (i / (data.length - 1)) * (w - padX * 2),
    y: h - padY - ((v / max) * (h - padY * 2)),
  }));

  // Smooth curve
  const linePath = points.reduce((acc, p, i) => {
    if (i === 0) return `M${p.x},${p.y}`;
    const prev = points[i - 1];
    const cpx1 = prev.x + (p.x - prev.x) / 3;
    const cpx2 = p.x - (p.x - prev.x) / 3;
    return `${acc} C${cpx1},${prev.y} ${cpx2},${p.y} ${p.x},${p.y}`;
  }, '');

  const areaPath = `${linePath} L${points[points.length - 1].x},${h} L${points[0].x},${h} Z`;

  return (
    <div className="chart-card glass-card">
      <div className="chart-card__header">
        <div>
          <h3 className="chart-card__title">{title}</h3>
          <p className="chart-card__sub">{subtitle}</p>
        </div>
      </div>
      <svg
        viewBox={`0 0 ${w} ${h}`}
        className={`area-chart ${animated ? 'area-chart--animated' : ''}`}
        preserveAspectRatio="none"
      >
        <defs>
          <linearGradient id={`areaGrad-${color.replace('#','')}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.3" />
            <stop offset="100%" stopColor={color} stopOpacity="0" />
          </linearGradient>
        </defs>
        {/* Grid lines */}
        {[0.25, 0.5, 0.75].map((pct) => (
          <line key={pct} x1={0} x2={w} y1={h - padY - pct * (h - padY * 2)} y2={h - padY - pct * (h - padY * 2)}
            stroke="rgba(255,255,255,0.04)" strokeWidth="1" />
        ))}
        <path d={areaPath} fill={`url(#areaGrad-${color.replace('#','')})`} />
        <path d={linePath} fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
          className="area-chart__line" />
        {/* Data dots */}
        {points.map((p, i) => (
          <circle key={i} cx={p.x} cy={p.y} r="3.5" fill="#161822" stroke={color} strokeWidth="2"
            className="area-chart__dot" style={{ animationDelay: `${i * 80 + 400}ms` }} />
        ))}
      </svg>
    </div>
  );
};

/* ─── Donut Chart ─────────────────────── */
const DonutChart = ({ segments, title }: { segments: { label: string; value: number; color: string }[]; title: string }) => {
  const [animated, setAnimated] = useState(false);
  const total = segments.reduce((s, seg) => s + seg.value, 0) || 1;
  const radius = 60;
  const circumference = 2 * Math.PI * radius;
  let cumulativeOffset = 0;

  useEffect(() => {
    const timer = setTimeout(() => setAnimated(true), 400);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="chart-card glass-card">
      <div className="chart-card__header">
        <h3 className="chart-card__title">{title}</h3>
      </div>
      <div className="donut-chart">
        <svg viewBox="0 0 160 160" className="donut-chart__svg">
          {segments.map((seg, i) => {
            const pct = seg.value / total;
            const dashLen = pct * circumference;
            const dashGap = circumference - dashLen;
            const offset = cumulativeOffset;
            cumulativeOffset += dashLen;
            return (
              <circle
                key={i}
                cx="80" cy="80" r={radius}
                fill="none" stroke={seg.color} strokeWidth="14"
                strokeDasharray={animated ? `${dashLen} ${dashGap}` : `0 ${circumference}`}
                strokeDashoffset={-offset}
                strokeLinecap="round"
                className="donut-chart__segment"
                style={{ transitionDelay: `${i * 150 + 300}ms` }}
              />
            );
          })}
          <text x="80" y="76" textAnchor="middle" fill="#fff" fontSize="22" fontWeight="800">{total}</text>
          <text x="80" y="94" textAnchor="middle" fill="rgba(255,255,255,0.4)" fontSize="10" fontWeight="500">TOTAL</text>
        </svg>
        <div className="donut-chart__legend">
          {segments.map((seg, i) => (
            <div key={i} className="donut-chart__legend-item">
              <span className="donut-chart__legend-dot" style={{ background: seg.color }} />
              <span className="donut-chart__legend-label">{seg.label}</span>
              <span className="donut-chart__legend-val">{seg.value}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

/* ─── Mini sparkline for stat cards ────── */
const Sparkline = ({ data, color }: { data: number[]; color: string }) => {
  const max = Math.max(...data, 1) * 1.1;
  const w = 80;
  const h = 32;
  const pts = data.map((v, i) => `${(i / (data.length - 1)) * w},${h - (v / max) * h}`).join(' ');
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="sparkline" preserveAspectRatio="none">
      <polyline points={pts} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
};

/* ─── Stage badge config ─────────────── */
const stageBadgeConfig: Record<string, { bg: string; color: string; dot: string }> = {
  order_received: { bg: 'rgba(168,85,247,0.1)',  color: '#d8b4fe', dot: '#a855f7' },
  processing:     { bg: 'rgba(245,158,11,0.1)',  color: '#fcd34d', dot: '#f59e0b' },
  shipped:        { bg: 'rgba(34,211,238,0.1)',  color: '#67e8f9', dot: '#22d3ee' },
  delivered:      { bg: 'rgba(74,222,128,0.1)',  color: '#4ade80', dot: '#22c55e' },
  cancelled:      { bg: 'rgba(239,68,68,0.08)',  color: '#f87171', dot: '#ef4444' },
};

/* ─── Quick actions ───────────────────── */
const quickActions = [
  { label: 'Products', desc: 'Manage catalog', icon: <ProductsIcon />, path: '/products', gradient: 'linear-gradient(135deg, #a855f7, #7c3aed)' },
  { label: 'Orders', desc: 'Track orders', icon: <OrdersIcon />, path: '/orders', gradient: 'linear-gradient(135deg, #22d3ee, #06b6d4)' },
  { label: 'Customers', desc: 'User base', icon: <UsersIcon />, path: '/users', gradient: 'linear-gradient(135deg, #f59e0b, #ef4444)' },
  { label: 'Inventory', desc: 'Stock levels', icon: <PendingIcon />, path: '/inventory', gradient: 'linear-gradient(135deg, #a855f7, #22d3ee)' },
];

/* ═══════════════════════════════════════════
   Dashboard Component
   ═══════════════════════════════════════════ */
const Dashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => { fetchDashboardStats(); }, []);

  const fetchDashboardStats = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get('/dashboard/stats/');
      setStats(response.data);
      setError(null);
    } catch (err: any) {
      setError(err.response?.data?.error?.message || 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  /* ── Loading ── */
  if (loading) {
    return (
      <div className="dash dark-dash">
        <div className="dash__header"><h1 className="dash__title">Dashboard</h1><p className="dash__subtitle">Loading your analytics…</p></div>
        <div className="dash__stats">
          {[1,2,3,4].map(i => (
            <div key={i} className="dash__stat-card glass-card skeleton-card">
              <div className="skel skel--circle" /><div className="skel-lines"><div className="skel skel--sm" /><div className="skel skel--lg" /><div className="skel skel--xs" /></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="dash dark-dash">
        <div className="dash__header"><h1 className="dash__title">Dashboard</h1></div>
        <div className="dash__error glass-card">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M12 8v4"/><path d="M12 16h.01"/></svg>
          <span>{error}</span>
          <button onClick={fetchDashboardStats} className="dash__error-retry">Retry</button>
        </div>
      </div>
    );
  }

  /* ── Stat cards data ── */
  const statCards = [
    { label: 'Total Orders', value: stats?.total_orders || 0, sub: 'All time', icon: <OrdersIcon />, gradient: 'linear-gradient(135deg, #a855f7, #7c3aed)', glow: 'rgba(168,85,247,0.35)', sparkData: [3,5,4,7,6,8,9], sparkColor: '#c084fc', glassClass: 'glass-card--neon-v' },
    { label: 'Pending', value: stats?.pending_orders || 0, sub: 'Needs action', icon: <PendingIcon />, gradient: 'linear-gradient(135deg, #f59e0b, #ef4444)', glow: 'rgba(245,158,11,0.3)', sparkData: [2,3,1,4,2,3,2], sparkColor: '#fcd34d', glassClass: 'glass-card--neon-a' },
    { label: 'Customers', value: stats?.total_users || 0, sub: 'Registered', icon: <UsersIcon />, gradient: 'linear-gradient(135deg, #22d3ee, #06b6d4)', glow: 'rgba(34,211,238,0.3)', sparkData: [5,4,6,5,7,8,10], sparkColor: '#67e8f9', glassClass: 'glass-card--neon-c' },
    { label: 'Products', value: stats?.total_products || 0, sub: 'Active', icon: <ProductsIcon />, gradient: 'linear-gradient(135deg, #a855f7, #22d3ee)', glow: 'rgba(168,85,247,0.25)', sparkData: [6,6,7,7,8,8,9], sparkColor: '#a5f3fc', glassClass: 'glass-card--neon-v' },
  ];

  /* ── Chart data (sample since API doesn't provide time-series) ── */
  const barData = [12, 19, 8, 15, 22, 17, 25];
  const barLabels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const areaData = [40, 55, 38, 65, 48, 72, 85, 60, 90, 78, 95, 110];
  const barData2 = [8, 14, 11, 18, 14, 20, 16];

  const orderStageSegments = [
    { label: 'Received',   value: stats?.pending_orders || 3,                           color: '#a855f7' },
    { label: 'Processing', value: Math.floor((stats?.pending_orders || 2) * 0.6),       color: '#f59e0b' },
    { label: 'Shipped',    value: Math.floor((stats?.total_orders || 5) * 0.25),        color: '#22d3ee' },
    { label: 'Delivered',  value: Math.floor((stats?.total_orders || 10) * 0.5),        color: '#4ade80' },
  ];

  return (
    <div className="dash dark-dash">
      {/* ── Header ── */}
      <div className="dash__header">
        <div>
          <h1 className="dash__title">Dashboard</h1>
          <p className="dash__subtitle">Welcome back — here's your store overview.</p>
        </div>
        <button className="dash__refresh-btn glass-btn" onClick={fetchDashboardStats} title="Refresh data">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="23,4 23,10 17,10" /><polyline points="1,20 1,14 7,14" /><path d="M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15" /></svg>
        </button>
      </div>

      {/* ── Neon divider ── */}
      <hr className="dash__neon-divider" />

      {/* ── Stat Cards ── */}
      <div className="dash__stats">
        {statCards.map((c, idx) => (
          <div key={c.label} className={`dash__stat-card glass-card ${c.glassClass}`} style={{ '--glow': c.glow, animationDelay: `${idx * 80}ms` } as React.CSSProperties}>
            <div className="dash__stat-top">
              <div className="dash__stat-icon" style={{ background: c.gradient }}>{c.icon}</div>
              <Sparkline data={c.sparkData} color={c.sparkColor} />
            </div>
            <div className="dash__stat-body">
              <span className="dash__stat-label">{c.label}</span>
              <div className="dash__stat-row">
                <span className="dash__stat-value">{c.value.toLocaleString()}</span>
                <span className="dash__stat-trend"><TrendUpIcon /></span>
              </div>
              <span className="dash__stat-sub">{c.sub}</span>
            </div>
          </div>
        ))}
      </div>

      {/* ── Analytics Charts Row ── */}
      <div className="dash__charts-row">
        <BarChart data={barData} labels={barLabels} color="#a855f7" title="Orders This Week" />
        <AreaChart data={areaData} color="#22d3ee" title="Revenue Trend" subtitle="Monthly revenue overview" />
        <DonutChart segments={orderStageSegments} title="Order Status" />
      </div>

      {/* ── Recent Orders ── */}
      <div className="dash__section">
        <div className="dash__section-head">
          <div>
            <h2 className="dash__section-title">Recent Orders</h2>
            <p className="dash__section-sub">Latest customer activity</p>
          </div>
          <button className="dash__section-link glass-btn" onClick={() => navigate('/orders')}>
            View All <ArrowRightIcon />
          </button>
        </div>

        {stats?.recent_orders && stats.recent_orders.length > 0 ? (
          <div className="dash__table-wrap glass-card">
            <table className="dash__table">
              <thead>
                <tr>
                  <th>Order</th><th>Customer</th><th>Status</th><th>Total</th><th>Assigned</th><th>Date</th><th></th>
                </tr>
              </thead>
              <tbody>
                {stats.recent_orders.map((order) => {
                  const badge = stageBadgeConfig[order.stage] || stageBadgeConfig.order_received;
                  return (
                    <tr key={order.order_number} onClick={() => navigate(`/orders/${order.order_number}`)}>
                      <td><span className="dash__order-num">{order.order_number}</span></td>
                      <td>
                        <div className="dash__customer">
                          <span className="dash__customer-avatar">{order.customer_name.charAt(0).toUpperCase()}</span>
                          <div>
                            <span className="dash__customer-name">{order.customer_name}</span>
                            <span className="dash__customer-phone">{order.customer_phone}</span>
                          </div>
                        </div>
                      </td>
                      <td>
                        <span className="dash__badge" style={{ background: badge.bg, color: badge.color }}>
                          <span className="dash__badge-dot" style={{ background: badge.dot }} />
                          {order.stage_display}
                        </span>
                      </td>
                      <td className="dash__cell-money">₹{parseFloat(order.total).toLocaleString()}</td>
                      <td><span className="dash__cell-assigned">{order.assigned_to || <span className="dash__cell-muted">Unassigned</span>}</span></td>
                      <td className="dash__cell-date">{formatDate(order.created_at)}</td>
                      <td>
                        <button className="dash__view-btn glass-btn" onClick={(e) => { e.stopPropagation(); navigate(`/orders/${order.order_number}`); }}>
                          <EyeIcon /> View
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="dash__empty glass-card">
            <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" opacity="0.25"><rect x="2" y="3" width="20" height="18" rx="2" /><path d="M8 7h8" /><path d="M8 11h6" /></svg>
            <p>No orders yet</p>
          </div>
        )}
      </div>

      {/* ── Quick Actions ── */}
      <div className="dash__section">
        <div className="dash__section-head">
          <h2 className="dash__section-title">Quick Actions</h2>
        </div>
        <div className="dash__actions">
          {quickActions.map((a) => (
            <button key={a.label} className="dash__action-card glass-card" onClick={() => navigate(a.path)}>
              <span className="dash__action-icon" style={{ background: a.gradient }}>{a.icon}</span>
              <div className="dash__action-text">
                <span className="dash__action-label">{a.label}</span>
                <span className="dash__action-desc">{a.desc}</span>
              </div>
              <span className="dash__action-arrow"><ArrowRightIcon /></span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
