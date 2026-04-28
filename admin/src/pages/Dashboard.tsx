import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  AreaChart, Area, BarChart, Bar, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend, FunnelChart, Funnel, LabelList,
} from 'recharts';
import Calendar from 'react-calendar';
import { format, parseISO } from 'date-fns';
import apiClient from '../utils/api';
import 'react-calendar/dist/Calendar.css';
import './Dashboard.css';

/* ─── Types ─────────────────────────────────────────────── */
interface DashboardData {
  total_orders: number;
  pending_orders: number;
  total_users: number;
  total_products: number;
  total_revenue: number;
  revenue_30: number;
  revenue_prev_30: number;
  low_stock_count: number;
  total_blogs: number;
  published_blogs: number;
  orders_chart: { date: string; orders: number; revenue: number }[];
  orders_7: { date: string; orders: number }[];
  monthly_chart: { month: string; revenue: number; orders: number }[];
  order_stages: { stage: string; label: string; count: number }[];
  users_chart: { date: string; users: number }[];
  top_categories: { name: string; product_count: number }[];
  // New
  heatmap_data: { day: string; hour: number; count: number }[];
  top_products: { name: string; orders: number; revenue: number }[];
  revenue_by_category: { category: string; revenue: number; orders: number }[];
  staff_performance: { name: string; total: number; delivered: number; pending: number }[];
  fulfillment_funnel: { stage: string; count: number; pct: number }[];
  customer_retention: { month: string; new: number; returning: number }[];
  stock_health: { category: string; in_stock: number; low_stock: number; out_stock: number }[];
  top_categories: { name: string; product_count: number }[];
  recent_orders: RecentOrder[];
  calendar_data: Record<string, number>;
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

/* ─── Theme tokens ──────────────────────────────────────── */
const C = {
  beta:    '#a855f7',
  alpha:   '#00f5ff',
  gamma:   '#fbbf24',
  delta:   '#10b981',
  epsilon: '#f43f5e',
  zeta:    '#3b82f6',
  grid:    'rgba(255,255,255,0.05)',
  text:    '#64748b',
};

const STAGE_COLORS: Record<string, string> = {
  order_received: C.zeta,
  processing:     C.gamma,
  shipped:        C.beta,
  delivered:      C.delta,
};

/* ─── Custom Tooltip ────────────────────────────────────── */
const DarkTooltip = ({ active, payload, label, prefix = '', suffix = '' }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="dash-tooltip">
      <div className="dash-tooltip-label">{label}</div>
      {payload.map((p: any, i: number) => (
        <div key={i} className="dash-tooltip-row">
          <span className="dash-tooltip-dot" style={{ background: p.color }} />
          <span className="dash-tooltip-name">{p.name}</span>
          <span className="dash-tooltip-val">{prefix}{typeof p.value === 'number' ? p.value.toLocaleString('en-IN') : p.value}{suffix}</span>
        </div>
      ))}
    </div>
  );
};

/* ─── Stat Card ─────────────────────────────────────────── */
interface StatCardProps {
  label: string; value: string | number; sub?: string;
  icon: React.ReactNode; gradient: string; trend?: number;
  onClick?: () => void;
}
const StatCard = ({ label, value, sub, icon, gradient, trend, onClick }: StatCardProps) => (
  <div className="dash-stat" onClick={onClick} style={{ cursor: onClick ? 'pointer' : 'default' }}>
    <div className="dash-stat-icon" style={{ background: gradient }}>{icon}</div>
    <div className="dash-stat-body">
      <span className="dash-stat-label">{label}</span>
      <span className="dash-stat-value">{value}</span>
      {sub && <span className="dash-stat-sub">{sub}</span>}
    </div>
    {trend !== undefined && (
      <div className={`dash-stat-trend ${trend >= 0 ? 'up' : 'down'}`}>
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          {trend >= 0
            ? <><polyline points="23,6 13.5,15.5 8.5,10.5 1,18"/><polyline points="17,6 23,6 23,12"/></>
            : <><polyline points="23,18 13.5,8.5 8.5,13.5 1,6"/><polyline points="17,18 23,18 23,12"/></>
          }
        </svg>
        {Math.abs(trend).toFixed(1)}%
      </div>
    )}
  </div>
);

/* ─── Section Header ────────────────────────────────────── */
const SectionHead = ({ title, sub, action, onAction }: { title: string; sub?: string; action?: string; onAction?: () => void }) => (
  <div className="dash-section-head">
    <div>
      <h2 className="dash-section-title">{title}</h2>
      {sub && <p className="dash-section-sub">{sub}</p>}
    </div>
    {action && (
      <button className="dash-section-link" onClick={onAction}>
        {action}
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M5 12h14"/><path d="M12 5l7 7-7 7"/>
        </svg>
      </button>
    )}
  </div>
);

/* ─── Heatmap Chart ─────────────────────────────────────── */
const HOURS = Array.from({ length: 24 }, (_, i) => i);
const DAYS  = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const HeatmapChart = ({ data }: { data: { day: string; hour: number; count: number }[] }) => {
  const maxCount = Math.max(...data.map(d => d.count), 1);

  const getColor = (count: number) => {
    if (count === 0) return 'rgba(255,255,255,0.04)';
    const intensity = count / maxCount;
    if (intensity < 0.25) return `rgba(168,85,247,${0.15 + intensity * 0.4})`;
    if (intensity < 0.5)  return `rgba(168,85,247,${0.35 + intensity * 0.4})`;
    if (intensity < 0.75) return `rgba(0,245,255,${0.4 + intensity * 0.3})`;
    return `rgba(0,245,255,${0.7 + intensity * 0.3})`;
  };

  return (
    <div className="dash-heatmap">
      {/* Hour labels */}
      <div className="dash-heatmap-hours">
        <div className="dash-heatmap-day-label" />
        {HOURS.map(h => (
          <div key={h} className="dash-heatmap-hour-label">
            {h % 3 === 0 ? `${h}h` : ''}
          </div>
        ))}
      </div>
      {/* Grid */}
      {DAYS.map(day => (
        <div key={day} className="dash-heatmap-row">
          <div className="dash-heatmap-day-label">{day}</div>
          {HOURS.map(hour => {
            const cell = data.find(d => d.day === day && d.hour === hour);
            const count = cell?.count || 0;
            return (
              <div
                key={hour}
                className="dash-heatmap-cell"
                style={{ background: getColor(count) }}
                title={`${day} ${hour}:00 — ${count} order${count !== 1 ? 's' : ''}`}
              />
            );
          })}
        </div>
      ))}
      {/* Legend */}
      <div className="dash-heatmap-legend">
        <span className="dash-heatmap-legend-label">Less</span>
        {[0, 0.2, 0.4, 0.6, 0.8, 1].map(v => (
          <div key={v} className="dash-heatmap-legend-cell"
            style={{ background: getColor(v * maxCount) }} />
        ))}
        <span className="dash-heatmap-legend-label">More</span>
      </div>
    </div>
  );
};

/* ─── Icons ─────────────────────────────────────────────── */
const Icon = {
  orders:   <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="2" y="3" width="20" height="18" rx="2"/><path d="M8 7h8"/><path d="M8 11h6"/><path d="M8 15h4"/></svg>,
  pending:  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><circle cx="12" cy="12" r="10"/><polyline points="12,6 12,12 16,14"/></svg>,
  users:    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/></svg>,
  products: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z"/><polyline points="3.27,6.96 12,12.01 20.73,6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>,
  revenue:  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/></svg>,
  stock:    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M21 8l-2-4H5L3 8"/><rect x="3" y="8" width="18" height="13" rx="1"/><path d="M10 12h4"/></svg>,
  blog:     <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>,
  refresh:  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="23,4 23,10 17,10"/><polyline points="1,20 1,14 7,14"/><path d="M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15"/></svg>,
};

/* ═══════════════════════════════════════════
   Dashboard Component
   ═══════════════════════════════════════════ */
const Dashboard = () => {
  const navigate = useNavigate();
  const [data, setData]       = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState('');
  const [calDate, setCalDate] = useState(new Date());

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await apiClient.get('/dashboard/stats/');
      setData(res.data);
      setError('');
    } catch (e: any) {
      setError(e.response?.data?.error?.message || 'Failed to load dashboard');
    } finally {
      setLoading(false);
    }
  };

  const fmt = (n: number) => `₹${n.toLocaleString('en-IN')}`;
  const revTrend = data && data.revenue_prev_30 > 0
    ? ((data.revenue_30 - data.revenue_prev_30) / data.revenue_prev_30) * 100
    : 0;

  /* ── Loading skeleton ── */
  if (loading) return (
    <div className="dash">
      <div className="dash-header">
        <div><h1 className="dash-title">Dashboard</h1><p className="dash-sub">Loading…</p></div>
      </div>
      <div className="dash-stats-grid">
        {[1,2,3,4,5,6].map(i => (
          <div key={i} className="dash-stat dash-skel">
            <div className="skel skel-icon" />
            <div className="dash-stat-body">
              <div className="skel skel-sm" /><div className="skel skel-lg" /><div className="skel skel-xs" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  if (error) return (
    <div className="dash">
      <div className="dash-error">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="10"/><path d="M12 8v4"/><path d="M12 16h.01"/>
        </svg>
        {error}
        <button onClick={fetchData} className="dash-error-retry">Retry</button>
      </div>
    </div>
  );

  if (!data) return null;

  /* ── Stat cards ── */
  const stats = [
    { label: 'Total Orders',   value: data.total_orders.toLocaleString(),   sub: 'All time',        icon: Icon.orders,   gradient: `linear-gradient(135deg, ${C.beta}, #7c3aed)`,   trend: undefined,  onClick: () => navigate('/orders') },
    { label: 'Pending',        value: data.pending_orders.toLocaleString(),  sub: 'Needs action',    icon: Icon.pending,  gradient: `linear-gradient(135deg, ${C.gamma}, #ef4444)`,  trend: undefined,  onClick: () => navigate('/orders') },
    { label: 'Revenue (30d)',  value: fmt(data.revenue_30),                  sub: 'Last 30 days',    icon: Icon.revenue,  gradient: `linear-gradient(135deg, ${C.delta}, #059669)`,  trend: revTrend,   onClick: undefined },
    { label: 'Customers',      value: data.total_users.toLocaleString(),     sub: 'Registered',      icon: Icon.users,    gradient: `linear-gradient(135deg, ${C.alpha}, #06b6d4)`,  trend: undefined,  onClick: () => navigate('/users') },
    { label: 'Products',       value: data.total_products.toLocaleString(),  sub: 'Active',          icon: Icon.products, gradient: `linear-gradient(135deg, ${C.beta}, ${C.alpha})`, trend: undefined, onClick: () => navigate('/products') },
    { label: 'Low Stock',      value: data.low_stock_count.toLocaleString(), sub: 'Alerts',          icon: Icon.stock,    gradient: `linear-gradient(135deg, ${C.epsilon}, #dc2626)`, trend: undefined, onClick: () => navigate('/stock-alerts') },
  ];

  /* ── Calendar tile content ── */
  const tileContent = ({ date: d, view }: { date: Date; view: string }) => {
    if (view !== 'month') return null;
    const key = format(d, 'yyyy-MM-dd');
    const count = data.calendar_data[key];
    if (!count) return null;
    return <div className="cal-dot" title={`${count} order${count > 1 ? 's' : ''}`}>{count}</div>;
  };

  return (
    <div className="dash animate-fadeIn">

      {/* ── Header ── */}
      <div className="dash-header">
        <div>
          <h1 className="dash-title">Dashboard</h1>
          <p className="dash-sub">Welcome back — here's your store overview</p>
        </div>
        <button className="dash-refresh" onClick={fetchData} title="Refresh">
          {Icon.refresh}
        </button>
      </div>

      {/* ── Stat Cards ── */}
      <div className="dash-stats-grid">
        {stats.map((s, i) => (
          <StatCard key={s.label} {...s} />
        ))}
      </div>

      {/* ── Row 1: Orders 30d area + Weekly bar ── */}
      <div className="dash-row dash-row-2">
        {/* Orders & Revenue area chart */}
        <div className="dash-card">
          <SectionHead title="Orders & Revenue" sub="Last 30 days" />
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={data.orders_chart} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="gradOrders" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={C.beta} stopOpacity={0.3}/>
                  <stop offset="95%" stopColor={C.beta} stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="gradRevenue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={C.delta} stopOpacity={0.3}/>
                  <stop offset="95%" stopColor={C.delta} stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke={C.grid} />
              <XAxis dataKey="date" tickFormatter={d => format(parseISO(d), 'dd MMM')}
                tick={{ fill: C.text, fontSize: 11 }} tickLine={false} axisLine={false}
                interval={4} />
              <YAxis yAxisId="left" tick={{ fill: C.text, fontSize: 11 }} tickLine={false} axisLine={false} />
              <YAxis yAxisId="right" orientation="right" tick={{ fill: C.text, fontSize: 11 }} tickLine={false} axisLine={false}
                tickFormatter={v => `₹${(v/1000).toFixed(0)}k`} />
              <Tooltip content={<DarkTooltip />} />
              <Area yAxisId="left" type="monotone" dataKey="orders" name="Orders"
                stroke={C.beta} fill="url(#gradOrders)" strokeWidth={2} dot={false} />
              <Area yAxisId="right" type="monotone" dataKey="revenue" name="Revenue (₹)"
                stroke={C.delta} fill="url(#gradRevenue)" strokeWidth={2} dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Weekly orders bar */}
        <div className="dash-card">
          <SectionHead title="This Week" sub="Orders per day" />
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={data.orders_7} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={C.grid} vertical={false} />
              <XAxis dataKey="date" tickFormatter={d => format(parseISO(d), 'EEE')}
                tick={{ fill: C.text, fontSize: 11 }} tickLine={false} axisLine={false} />
              <YAxis tick={{ fill: C.text, fontSize: 11 }} tickLine={false} axisLine={false} allowDecimals={false} />
              <Tooltip content={<DarkTooltip />} />
              <Bar dataKey="orders" name="Orders" radius={[6, 6, 2, 2]}
                fill={`url(#barGrad)`}>
                {data.orders_7.map((_, i) => (
                  <Cell key={i} fill={`url(#barGrad${i})`} />
                ))}
              </Bar>
              <defs>
                {data.orders_7.map((_, i) => (
                  <linearGradient key={i} id={`barGrad${i}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={C.beta} stopOpacity={0.9}/>
                    <stop offset="100%" stopColor={C.alpha} stopOpacity={0.6}/>
                  </linearGradient>
                ))}
              </defs>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* ── Row 2: Monthly revenue line + Order stages pie + Calendar ── */}
      <div className="dash-row dash-row-3">
        {/* Monthly revenue */}
        <div className="dash-card">
          <SectionHead title="Monthly Revenue" sub="Last 12 months" />
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={data.monthly_chart} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={C.grid} />
              <XAxis dataKey="month" tick={{ fill: C.text, fontSize: 10 }} tickLine={false} axisLine={false} />
              <YAxis tick={{ fill: C.text, fontSize: 10 }} tickLine={false} axisLine={false}
                tickFormatter={v => `₹${(v/1000).toFixed(0)}k`} />
              <Tooltip content={<DarkTooltip prefix="₹" />} />
              <Line type="monotone" dataKey="revenue" name="Revenue" stroke={C.alpha}
                strokeWidth={2.5} dot={{ fill: C.alpha, r: 3 }} activeDot={{ r: 5 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Order stages donut */}
        <div className="dash-card">
          <SectionHead title="Order Stages" />
          <div className="dash-donut-wrap">
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={data.order_stages} dataKey="count" nameKey="label"
                  cx="50%" cy="50%" innerRadius={55} outerRadius={80}
                  paddingAngle={3} strokeWidth={0}>
                  {data.order_stages.map((s, i) => (
                    <Cell key={i} fill={STAGE_COLORS[s.stage] || C.beta} />
                  ))}
                </Pie>
                <Tooltip content={<DarkTooltip />} />
                <Legend
                  formatter={(value) => <span style={{ color: C.text, fontSize: 12 }}>{value}</span>}
                  iconType="circle" iconSize={8}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Calendar */}
        <div className="dash-card dash-calendar-card">
          <SectionHead title="Order Calendar" sub="Current month" />
          <Calendar
            value={calDate}
            onChange={(v) => setCalDate(v as Date)}
            tileContent={tileContent}
            className="dash-calendar"
          />
        </div>
      </div>

      {/* ── Row 3: New users + Top categories ── */}
      <div className="dash-row dash-row-2">
        {/* New users area */}
        <div className="dash-card">
          <SectionHead title="New Customers" sub="Last 30 days" action="View All" onAction={() => navigate('/users')} />
          <ResponsiveContainer width="100%" height={180}>
            <AreaChart data={data.users_chart} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="gradUsers" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={C.alpha} stopOpacity={0.3}/>
                  <stop offset="95%" stopColor={C.alpha} stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke={C.grid} />
              <XAxis dataKey="date" tickFormatter={d => format(parseISO(d), 'dd MMM')}
                tick={{ fill: C.text, fontSize: 11 }} tickLine={false} axisLine={false} interval={4} />
              <YAxis tick={{ fill: C.text, fontSize: 11 }} tickLine={false} axisLine={false} allowDecimals={false} />
              <Tooltip content={<DarkTooltip />} />
              <Area type="monotone" dataKey="users" name="New Users"
                stroke={C.alpha} fill="url(#gradUsers)" strokeWidth={2} dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Top categories bar */}
        <div className="dash-card">
          <SectionHead title="Top Categories" sub="By product count" action="Manage" onAction={() => navigate('/categories')} />
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={data.top_categories} layout="vertical" margin={{ top: 0, right: 20, left: 10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={C.grid} horizontal={false} />
              <XAxis type="number" tick={{ fill: C.text, fontSize: 11 }} tickLine={false} axisLine={false} />
              <YAxis type="category" dataKey="name" tick={{ fill: C.text, fontSize: 11 }} tickLine={false} axisLine={false} width={80} />
              <Tooltip content={<DarkTooltip />} />
              <Bar dataKey="product_count" name="Products" radius={[0, 6, 6, 0]}>
                {data.top_categories.map((_, i) => (
                  <Cell key={i} fill={[C.beta, C.alpha, C.gamma, C.delta, C.epsilon, C.zeta][i % 6]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* ── Recent Orders Table ── */}
      <div className="dash-card dash-table-card">
        <SectionHead title="Recent Orders" sub="Latest customer activity" action="View All" onAction={() => navigate('/orders')} />
        {data.recent_orders.length > 0 ? (
          <div className="dash-table-wrap">
            <table className="dash-table">
              <thead>
                <tr>
                  <th>Order</th><th>Customer</th><th>Status</th>
                  <th>Total</th><th>Assigned</th><th>Date</th><th></th>
                </tr>
              </thead>
              <tbody>
                {data.recent_orders.map(order => {
                  const stageColor = STAGE_COLORS[order.stage] || C.beta;
                  return (
                    <tr key={order.order_number} onClick={() => navigate(`/orders/${order.order_number}`)}>
                      <td><span className="dash-order-num">{order.order_number}</span></td>
                      <td>
                        <div className="dash-customer">
                          <div className="dash-avatar">{order.customer_name.charAt(0).toUpperCase()}</div>
                          <div>
                            <div className="dash-customer-name">{order.customer_name}</div>
                            <div className="dash-customer-phone">{order.customer_phone}</div>
                          </div>
                        </div>
                      </td>
                      <td>
                        <span className="dash-stage-badge" style={{
                          background: `${stageColor}18`,
                          color: stageColor,
                          border: `1px solid ${stageColor}40`,
                        }}>
                          <span className="dash-stage-dot" style={{ background: stageColor }} />
                          {order.stage_display}
                        </span>
                      </td>
                      <td className="dash-money">
                        {parseFloat(order.total) > 0 ? `₹${parseFloat(order.total).toLocaleString('en-IN')}` : '—'}
                      </td>
                      <td className="dash-assigned">{order.assigned_to || <span className="dash-muted">Unassigned</span>}</td>
                      <td className="dash-date">{format(new Date(order.created_at), 'dd MMM, HH:mm')}</td>
                      <td>
                        <button className="dash-view-btn" onClick={e => { e.stopPropagation(); navigate(`/orders/${order.order_number}`); }}>
                          View
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="dash-empty">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" opacity="0.3">
              <rect x="2" y="3" width="20" height="18" rx="2"/><path d="M8 7h8"/><path d="M8 11h6"/>
            </svg>
            <p>No orders yet</p>
          </div>
        )}
      </div>

      {/* ── Row 4: Top Products + Revenue by Category ── */}
      <div className="dash-row dash-row-2">
        <div className="dash-card">
          <SectionHead title="Top Products" sub="By order count" action="View All" onAction={() => navigate('/products')} />
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={data.top_products} layout="vertical" margin={{ top: 0, right: 60, left: 10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={C.grid} horizontal={false} />
              <XAxis type="number" tick={{ fill: C.text, fontSize: 11 }} tickLine={false} axisLine={false} />
              <YAxis type="category" dataKey="name" tick={{ fill: C.text, fontSize: 11 }} tickLine={false} axisLine={false} width={100}
                tickFormatter={v => v.length > 14 ? v.slice(0, 14) + '…' : v} />
              <Tooltip content={<DarkTooltip />} />
              <Bar dataKey="orders" name="Orders" radius={[0, 6, 6, 0]}>
                <LabelList dataKey="orders" position="right" style={{ fill: C.text, fontSize: 11 }} />
                {data.top_products.map((_, i) => (
                  <Cell key={i} fill={[C.beta, C.alpha, C.gamma, C.delta, C.epsilon, C.zeta, '#ec4899', '#8b5cf6'][i % 8]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="dash-card">
          <SectionHead title="Revenue by Category" sub="Delivered orders only" />
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={data.revenue_by_category} layout="vertical" margin={{ top: 0, right: 80, left: 10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={C.grid} horizontal={false} />
              <XAxis type="number" tick={{ fill: C.text, fontSize: 11 }} tickLine={false} axisLine={false}
                tickFormatter={v => `₹${(v / 1000).toFixed(0)}k`} />
              <YAxis type="category" dataKey="category" tick={{ fill: C.text, fontSize: 11 }} tickLine={false} axisLine={false} width={90}
                tickFormatter={v => v.length > 12 ? v.slice(0, 12) + '…' : v} />
              <Tooltip content={<DarkTooltip prefix="₹" />} />
              <Bar dataKey="revenue" name="Revenue (₹)" radius={[0, 6, 6, 0]}>
                <LabelList dataKey="revenue" position="right" style={{ fill: C.text, fontSize: 10 }}
                  formatter={(v: number) => `₹${(v / 1000).toFixed(0)}k`} />
                {data.revenue_by_category.map((_, i) => (
                  <Cell key={i} fill={[C.delta, C.alpha, C.beta, C.gamma, C.zeta, C.epsilon, '#ec4899', '#8b5cf6'][i % 8]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* ── Row 5: Fulfillment Funnel + Staff Performance ── */}
      <div className="dash-row dash-row-2">
        {/* Funnel */}
        <div className="dash-card">
          <SectionHead title="Fulfillment Funnel" sub="Order progression rates" />
          <div className="dash-funnel">
            {data.fulfillment_funnel.map((item, i) => {
              const colors = [C.zeta, C.gamma, C.beta, C.delta];
              const widths = [100, 80, 60, 40];
              return (
                <div key={item.stage} className="dash-funnel-step">
                  <div className="dash-funnel-bar-wrap">
                    <div className="dash-funnel-bar"
                      style={{ width: `${widths[i]}%`, background: `linear-gradient(90deg, ${colors[i]}33, ${colors[i]}99)`, borderLeft: `3px solid ${colors[i]}` }}>
                      <span className="dash-funnel-label">{item.stage}</span>
                      <span className="dash-funnel-count" style={{ color: colors[i] }}>{item.count}</span>
                    </div>
                    <span className="dash-funnel-pct">{item.pct}%</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Staff Performance */}
        <div className="dash-card">
          <SectionHead title="Staff Performance" sub="Orders handled per staff" />
          {data.staff_performance.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={data.staff_performance} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={C.grid} vertical={false} />
                <XAxis dataKey="name" tick={{ fill: C.text, fontSize: 11 }} tickLine={false} axisLine={false}
                  tickFormatter={v => v.split(' ')[0]} />
                <YAxis tick={{ fill: C.text, fontSize: 11 }} tickLine={false} axisLine={false} allowDecimals={false} />
                <Tooltip content={<DarkTooltip />} />
                <Legend formatter={v => <span style={{ color: C.text, fontSize: 11 }}>{v}</span>} />
                <Bar dataKey="delivered" name="Delivered" stackId="a" fill={C.delta} radius={[0, 0, 0, 0]} />
                <Bar dataKey="pending"   name="Pending"   stackId="a" fill={C.gamma} radius={[0, 0, 0, 0]} />
                <Bar dataKey="total"     name="Total"     fill={C.beta} radius={[4, 4, 0, 0]} fillOpacity={0.3} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="dash-empty"><p>No staff assignments yet</p></div>
          )}
        </div>
      </div>

      {/* ── Row 6: Customer Retention + Stock Health ── */}
      <div className="dash-row dash-row-2">
        <div className="dash-card">
          <SectionHead title="Customer Retention" sub="New vs returning customers (6 months)" />
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={data.customer_retention} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={C.grid} vertical={false} />
              <XAxis dataKey="month" tick={{ fill: C.text, fontSize: 11 }} tickLine={false} axisLine={false}
                tickFormatter={v => v.split(' ')[0]} />
              <YAxis tick={{ fill: C.text, fontSize: 11 }} tickLine={false} axisLine={false} allowDecimals={false} />
              <Tooltip content={<DarkTooltip />} />
              <Legend formatter={v => <span style={{ color: C.text, fontSize: 11 }}>{v}</span>} />
              <Bar dataKey="new"       name="New"       stackId="a" fill={C.alpha}   radius={[0, 0, 0, 0]} />
              <Bar dataKey="returning" name="Returning" stackId="a" fill={C.beta}    radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="dash-card">
          <SectionHead title="Stock Health" sub="Variants per category" action="Alerts" onAction={() => navigate('/stock-alerts')} />
          {data.stock_health.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={data.stock_health} layout="vertical" margin={{ top: 0, right: 10, left: 10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={C.grid} horizontal={false} />
                <XAxis type="number" tick={{ fill: C.text, fontSize: 11 }} tickLine={false} axisLine={false} />
                <YAxis type="category" dataKey="category" tick={{ fill: C.text, fontSize: 11 }} tickLine={false} axisLine={false} width={80}
                  tickFormatter={v => v.length > 10 ? v.slice(0, 10) + '…' : v} />
                <Tooltip content={<DarkTooltip />} />
                <Legend formatter={v => <span style={{ color: C.text, fontSize: 11 }}>{v}</span>} />
                <Bar dataKey="in_stock"  name="In Stock"  stackId="a" fill={C.delta}   />
                <Bar dataKey="low_stock" name="Low Stock" stackId="a" fill={C.gamma}   />
                <Bar dataKey="out_stock" name="Out Stock" stackId="a" fill={C.epsilon} radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="dash-empty"><p>No stock data available</p></div>
          )}
        </div>
      </div>

      {/* ── Order Heatmap ── */}
      <div className="dash-card">
        <SectionHead title="Order Activity Heatmap" sub="Orders by day of week × hour (last 90 days)" />
        <HeatmapChart data={data.heatmap_data} />
      </div>

      {/* ── Quick Actions ── */}
      <div className="dash-card">
        <SectionHead title="Quick Actions" />
        <div className="dash-actions">
          {[
            { label: 'Add Product',    desc: 'Create new listing',  icon: Icon.products, path: '/products/add',    g: `linear-gradient(135deg, ${C.beta}, #7c3aed)` },
            { label: 'View Orders',    desc: 'Manage all orders',   icon: Icon.orders,   path: '/orders',          g: `linear-gradient(135deg, ${C.alpha}, #06b6d4)` },
            { label: 'Stock Alerts',   desc: 'Check low stock',     icon: Icon.stock,    path: '/stock-alerts',    g: `linear-gradient(135deg, ${C.epsilon}, #dc2626)` },
            { label: 'Blog Posts',     desc: 'Manage content',      icon: Icon.blog,     path: '/blog',            g: `linear-gradient(135deg, ${C.gamma}, #ef4444)` },
            { label: 'Customers',      desc: 'User management',     icon: Icon.users,    path: '/users',           g: `linear-gradient(135deg, ${C.delta}, #059669)` },
            { label: 'Inventory',      desc: 'Stock management',    icon: Icon.pending,  path: '/inventory',       g: `linear-gradient(135deg, ${C.zeta}, #1d4ed8)` },
          ].map(a => (
            <button key={a.label} className="dash-action" onClick={() => navigate(a.path)}>
              <span className="dash-action-icon" style={{ background: a.g }}>{a.icon}</span>
              <div className="dash-action-text">
                <span className="dash-action-label">{a.label}</span>
                <span className="dash-action-desc">{a.desc}</span>
              </div>
              <svg className="dash-action-arrow" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M5 12h14"/><path d="M12 5l7 7-7 7"/>
              </svg>
            </button>
          ))}
        </div>
      </div>

    </div>
  );
};

export default Dashboard;
