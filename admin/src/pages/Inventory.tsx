import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  AreaChart, Area, BarChart, Bar, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from 'recharts';
import { format, parseISO } from 'date-fns';
import apiClient from '../utils/api';
import './Inventory.css';

/* ─── Types ─────────────────────────────────────────────── */
interface InventorySummary {
  total_variants: number; in_stock: number; low_stock: number;
  out_of_stock: number; active_alerts: number; critical_alerts: number;
  total_inventory_value: number; total_retail_value: number;
  potential_profit: number; recent_movements_24h: number;
}
interface LowStockItem {
  id: number; product_name: string; sku: string;
  color: string; material: string; stock_quantity: number;
  reorder_point: number; reorder_quantity: number;
}
interface DashboardData {
  summary: InventorySummary;
  low_stock_items: LowStockItem[];
  stock_health: { category: string; in_stock: number; low_stock: number; out_stock: number }[];
  movements_chart: { date: string; movements: number }[];
  movement_breakdown: { type: string; count: number }[];
  top_restocked: { name: string; qty: number; times: number }[];
  alert_breakdown: { priority: string; count: number }[];
  value_by_category: { category: string; value: number }[];
  heatmap_data: { day: string; hour: number; count: number }[];
  stock_trend: { date: string; net_change: number }[];
}

/* ─── Theme ─────────────────────────────────────────────── */
const C = {
  beta: '#a855f7', alpha: '#00f5ff', gamma: '#fbbf24',
  delta: '#10b981', epsilon: '#f43f5e', zeta: '#3b82f6',
  grid: 'rgba(255,255,255,0.05)', text: '#64748b',
};

/* ─── Custom Tooltip ─────────────────────────────────────── */
const DarkTooltip = ({ active, payload, label, prefix = '' }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="inv-tooltip">
      <div className="inv-tooltip-label">{label}</div>
      {payload.map((p: any, i: number) => (
        <div key={i} className="inv-tooltip-row">
          <span className="inv-tooltip-dot" style={{ background: p.color }} />
          <span className="inv-tooltip-name">{p.name}</span>
          <span className="inv-tooltip-val">{prefix}{typeof p.value === 'number' ? p.value.toLocaleString('en-IN') : p.value}</span>
        </div>
      ))}
    </div>
  );
};

/* ─── Stat Card ─────────────────────────────────────────── */
const StatCard = ({ label, value, sub, gradient, accent, onClick }: {
  label: string; value: string | number; sub?: string;
  gradient: string; accent: string; onClick?: () => void;
}) => (
  <div className="inv-stat" onClick={onClick} style={{ cursor: onClick ? 'pointer' : 'default', '--accent': accent } as any}>
    <div className="inv-stat-bar" style={{ background: gradient }} />
    <div className="inv-stat-body">
      <span className="inv-stat-label">{label}</span>
      <span className="inv-stat-value">{value}</span>
      {sub && <span className="inv-stat-sub">{sub}</span>}
    </div>
  </div>
);

/* ─── Section Head ─────────────────────────────────────── */
const SectionHead = ({ title, sub, action, onAction }: { title: string; sub?: string; action?: string; onAction?: () => void }) => (
  <div className="inv-section-head">
    <div>
      <h2 className="inv-section-title">{title}</h2>
      {sub && <p className="inv-section-sub">{sub}</p>}
    </div>
    {action && (
      <button className="inv-section-link" onClick={onAction}>
        {action}
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M5 12h14"/><path d="M12 5l7 7-7 7"/>
        </svg>
      </button>
    )}
  </div>
);

/* ─── Heatmap ─────────────────────────────────────────── */
const HOURS = Array.from({ length: 24 }, (_, i) => i);
const DAYS  = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const HeatmapChart = ({ data }: { data: { day: string; hour: number; count: number }[] }) => {
  const maxCount = Math.max(...data.map(d => d.count), 1);
  const getColor = (count: number) => {
    if (count === 0) return 'rgba(255,255,255,0.04)';
    const t = count / maxCount;
    if (t < 0.33) return `rgba(59,130,246,${0.2 + t * 0.6})`;
    if (t < 0.66) return `rgba(168,85,247,${0.3 + t * 0.5})`;
    return `rgba(0,245,255,${0.5 + t * 0.5})`;
  };
  return (
    <div className="inv-heatmap">
      <div className="inv-heatmap-hours">
        <div className="inv-heatmap-day-label" />
        {HOURS.map(h => <div key={h} className="inv-heatmap-hour-label">{h % 4 === 0 ? `${h}h` : ''}</div>)}
      </div>
      {DAYS.map(day => (
        <div key={day} className="inv-heatmap-row">
          <div className="inv-heatmap-day-label">{day}</div>
          {HOURS.map(hour => {
            const cell = data.find(d => d.day === day && d.hour === hour);
            return (
              <div key={hour} className="inv-heatmap-cell"
                style={{ background: getColor(cell?.count || 0) }}
                title={`${day} ${hour}:00 — ${cell?.count || 0} movements`} />
            );
          })}
        </div>
      ))}
      <div className="inv-heatmap-legend">
        <span className="inv-heatmap-legend-label">Less</span>
        {[0, 0.2, 0.4, 0.6, 0.8, 1].map(v => (
          <div key={v} className="inv-heatmap-legend-cell" style={{ background: getColor(v * maxCount) }} />
        ))}
        <span className="inv-heatmap-legend-label">More</span>
      </div>
    </div>
  );
};

/* ═══════════════════════════════════════════
   Inventory Component
   ═══════════════════════════════════════════ */
const Inventory = () => {
  const navigate = useNavigate();
  const [data, setData]       = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState('');

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await apiClient.get('/inventory/dashboard/');
      setData(res.data);
      setError('');
    } catch (e: any) {
      setError('Failed to load inventory dashboard');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return (
    <div className="inv-page">
      <div className="inv-loading"><div className="inv-spinner" /><span>Loading inventory…</span></div>
    </div>
  );

  if (error || !data) return (
    <div className="inv-page">
      <div className="inv-error">{error}<button onClick={fetchData} className="inv-retry">Retry</button></div>
    </div>
  );

  const { summary } = data;
  const stockAvailability = summary.total_variants > 0 ? ((summary.in_stock / summary.total_variants) * 100).toFixed(0) : 0;
  const profitMargin = summary.total_retail_value > 0 ? ((summary.potential_profit / summary.total_retail_value) * 100).toFixed(1) : 0;

  const ALERT_COLORS: Record<string, string> = { Critical: C.epsilon, High: C.gamma, Medium: C.zeta, Low: C.delta };

  return (
    <div className="inv-page animate-fadeIn">

      {/* ── Header ── */}
      <div className="inv-header">
        <div>
          <h1 className="inv-title">Inventory</h1>
          <p className="inv-sub">Stock levels, movements and alerts</p>
        </div>
        <div className="inv-header-actions">
          <button className="inv-btn-primary" onClick={() => navigate('/stock-management')}>Manage Stock</button>
          <button className="inv-btn-secondary" onClick={() => navigate('/stock-movements')}>Movements</button>
          <button className="inv-btn-alert" onClick={() => navigate('/stock-alerts')}>
            Alerts
            {summary.active_alerts > 0 && <span className="inv-alert-badge">{summary.active_alerts}</span>}
          </button>
        </div>
      </div>

      {/* ── Stat Cards ── */}
      <div className="inv-stats-grid">
        <StatCard label="Total Variants"   value={summary.total_variants.toLocaleString()} sub="Active"
          gradient={`linear-gradient(135deg, ${C.beta}, #7c3aed)`} accent={C.beta} />
        <StatCard label="In Stock"         value={summary.in_stock.toLocaleString()} sub={`${stockAvailability}% availability`}
          gradient={`linear-gradient(135deg, ${C.delta}, #059669)`} accent={C.delta} onClick={() => navigate('/stock-management?status=in_stock')} />
        <StatCard label="Low Stock"        value={summary.low_stock.toLocaleString()} sub="Needs attention"
          gradient={`linear-gradient(135deg, ${C.gamma}, #d97706)`} accent={C.gamma} onClick={() => navigate('/stock-management?status=low_stock')} />
        <StatCard label="Out of Stock"     value={summary.out_of_stock.toLocaleString()} sub="Urgent restock"
          gradient={`linear-gradient(135deg, ${C.epsilon}, #dc2626)`} accent={C.epsilon} onClick={() => navigate('/stock-management?status=out_of_stock')} />
        <StatCard label="Active Alerts"    value={summary.active_alerts.toLocaleString()} sub={summary.critical_alerts > 0 ? `${summary.critical_alerts} critical` : 'No critical'}
          gradient={`linear-gradient(135deg, #f97316, ${C.epsilon})`} accent="#f97316" onClick={() => navigate('/stock-alerts')} />
        <StatCard label="Retail Value"     value={`₹${(summary.total_retail_value / 1000).toFixed(1)}K`} sub="Total stock value"
          gradient={`linear-gradient(135deg, ${C.alpha}, #06b6d4)`} accent={C.alpha} />
        <StatCard label="Inventory Cost"   value={`₹${(summary.total_inventory_value / 1000).toFixed(1)}K`} sub="At cost price"
          gradient={`linear-gradient(135deg, ${C.zeta}, #1d4ed8)`} accent={C.zeta} />
        <StatCard label="Potential Profit" value={`₹${(summary.potential_profit / 1000).toFixed(1)}K`} sub={`${profitMargin}% margin`}
          gradient={`linear-gradient(135deg, ${C.delta}, ${C.alpha})`} accent={C.delta} />
      </div>

      {/* ── Row 1: Movements 30d + Stock Trend 7d ── */}
      <div className="inv-row inv-row-2">
        <div className="inv-card">
          <SectionHead title="Stock Movements" sub="Last 30 days" action="View All" onAction={() => navigate('/stock-movements')} />
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={data.movements_chart} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="gradMov" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={C.alpha} stopOpacity={0.3}/>
                  <stop offset="95%" stopColor={C.alpha} stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke={C.grid} />
              <XAxis dataKey="date" tickFormatter={d => format(parseISO(d), 'dd MMM')}
                tick={{ fill: C.text, fontSize: 11 }} tickLine={false} axisLine={false} interval={4} />
              <YAxis tick={{ fill: C.text, fontSize: 11 }} tickLine={false} axisLine={false} allowDecimals={false} />
              <Tooltip content={<DarkTooltip />} />
              <Area type="monotone" dataKey="movements" name="Movements"
                stroke={C.alpha} fill="url(#gradMov)" strokeWidth={2} dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="inv-card">
          <SectionHead title="Net Stock Change" sub="Last 7 days" />
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={data.stock_trend} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={C.grid} vertical={false} />
              <XAxis dataKey="date" tickFormatter={d => format(parseISO(d), 'EEE')}
                tick={{ fill: C.text, fontSize: 11 }} tickLine={false} axisLine={false} />
              <YAxis tick={{ fill: C.text, fontSize: 11 }} tickLine={false} axisLine={false} />
              <Tooltip content={<DarkTooltip />} />
              <Bar dataKey="net_change" name="Net Change" radius={[4, 4, 0, 0]}>
                {data.stock_trend.map((entry, i) => (
                  <Cell key={i} fill={entry.net_change >= 0 ? C.delta : C.epsilon} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* ── Row 2: Stock Health + Movement Types + Alert Breakdown ── */}
      <div className="inv-row inv-row-3">
        <div className="inv-card">
          <SectionHead title="Stock Health" sub="By category" />
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
          ) : <div className="inv-empty"><p>No stock data</p></div>}
        </div>

        <div className="inv-card">
          <SectionHead title="Movement Types" sub="Last 30 days" />
          {data.movement_breakdown.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={data.movement_breakdown} dataKey="count" nameKey="type"
                  cx="50%" cy="50%" innerRadius={50} outerRadius={75} paddingAngle={3} strokeWidth={0}>
                  {data.movement_breakdown.map((_, i) => (
                    <Cell key={i} fill={[C.alpha, C.beta, C.gamma, C.delta, C.epsilon, C.zeta][i % 6]} />
                  ))}
                </Pie>
                <Tooltip content={<DarkTooltip />} />
                <Legend formatter={v => <span style={{ color: C.text, fontSize: 11 }}>{v}</span>} iconType="circle" iconSize={8} />
              </PieChart>
            </ResponsiveContainer>
          ) : <div className="inv-empty"><p>No movements yet</p></div>}
        </div>

        <div className="inv-card">
          <SectionHead title="Alert Priority" sub="Active alerts" action="View" onAction={() => navigate('/stock-alerts')} />
          {data.alert_breakdown.length > 0 ? (
            <div className="inv-alert-list">
              {data.alert_breakdown.map((a, i) => (
                <div key={i} className="inv-alert-item">
                  <div className="inv-alert-bar-wrap">
                    <span className="inv-alert-priority" style={{ color: ALERT_COLORS[a.priority] || C.text }}>{a.priority}</span>
                    <div className="inv-alert-bar" style={{ background: `${ALERT_COLORS[a.priority] || C.text}22`, border: `1px solid ${ALERT_COLORS[a.priority] || C.text}44` }}>
                      <div className="inv-alert-fill" style={{ width: `${(a.count / Math.max(...data.alert_breakdown.map(x => x.count))) * 100}%`, background: ALERT_COLORS[a.priority] || C.text }} />
                    </div>
                    <span className="inv-alert-count" style={{ color: ALERT_COLORS[a.priority] || C.text }}>{a.count}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="inv-empty inv-empty-good">
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
              <p>No active alerts</p>
            </div>
          )}
        </div>
      </div>

      {/* ── Row 3: Top Restocked + Value by Category ── */}
      <div className="inv-row inv-row-2">
        <div className="inv-card">
          <SectionHead title="Top Restocked Products" sub="Last 30 days" />
          {data.top_restocked.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={data.top_restocked} layout="vertical" margin={{ top: 0, right: 60, left: 10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={C.grid} horizontal={false} />
                <XAxis type="number" tick={{ fill: C.text, fontSize: 11 }} tickLine={false} axisLine={false} />
                <YAxis type="category" dataKey="name" tick={{ fill: C.text, fontSize: 11 }} tickLine={false} axisLine={false} width={100}
                  tickFormatter={v => v.length > 14 ? v.slice(0, 14) + '…' : v} />
                <Tooltip content={<DarkTooltip />} />
                <Bar dataKey="qty" name="Units Added" radius={[0, 6, 6, 0]}>
                  {data.top_restocked.map((_, i) => (
                    <Cell key={i} fill={[C.delta, C.alpha, C.beta, C.gamma, C.zeta, C.epsilon][i % 6]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : <div className="inv-empty"><p>No restock data</p></div>}
        </div>

        <div className="inv-card">
          <SectionHead title="Stock Value by Category" sub="Retail value" />
          {data.value_by_category.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={data.value_by_category} layout="vertical" margin={{ top: 0, right: 80, left: 10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={C.grid} horizontal={false} />
                <XAxis type="number" tick={{ fill: C.text, fontSize: 11 }} tickLine={false} axisLine={false}
                  tickFormatter={v => `₹${(v / 1000).toFixed(0)}k`} />
                <YAxis type="category" dataKey="category" tick={{ fill: C.text, fontSize: 11 }} tickLine={false} axisLine={false} width={90}
                  tickFormatter={v => v.length > 12 ? v.slice(0, 12) + '…' : v} />
                <Tooltip content={<DarkTooltip prefix="₹" />} />
                <Bar dataKey="value" name="Value (₹)" radius={[0, 6, 6, 0]}>
                  {data.value_by_category.map((_, i) => (
                    <Cell key={i} fill={[C.alpha, C.beta, C.gamma, C.delta, C.zeta, C.epsilon][i % 6]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : <div className="inv-empty"><p>No value data</p></div>}
        </div>
      </div>

      {/* ── Movement Heatmap ── */}
      <div className="inv-card">
        <SectionHead title="Movement Activity Heatmap" sub="Stock movements by day × hour (last 90 days)" />
        <HeatmapChart data={data.heatmap_data} />
      </div>

      {/* ── Low Stock Table ── */}
      {data.low_stock_items.length > 0 && (
        <div className="inv-card inv-table-card">
          <SectionHead title="Items Needing Attention"
            sub={`${data.low_stock_items.length} items below reorder point`}
            action="Manage Stock" onAction={() => navigate('/stock-management')} />
          <div className="inv-table-wrap">
            <table className="inv-table">
              <thead>
                <tr>
                  <th>Product</th><th>SKU</th><th>Variant</th>
                  <th>Stock</th><th>Reorder At</th><th>Suggest</th><th></th>
                </tr>
              </thead>
              <tbody>
                {data.low_stock_items.map(item => (
                  <tr key={item.id}>
                    <td className="inv-product-name">{item.product_name}</td>
                    <td><span className="inv-sku">{item.sku}</span></td>
                    <td className="inv-variant">{item.color} / {item.material}</td>
                    <td>
                      <span className={`inv-stock-badge ${item.stock_quantity === 0 ? 'out' : 'low'}`}>
                        {item.stock_quantity}
                      </span>
                    </td>
                    <td className="inv-muted">{item.reorder_point}</td>
                    <td className="inv-reorder">{item.reorder_quantity} units</td>
                    <td>
                      <button className="inv-btn-restock"
                        onClick={() => navigate(`/stock-management?variant=${item.id}`)}>
                        Restock
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

    </div>
  );
};

export default Inventory;
