import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import apiClient from '../utils/api';
import './StockAlerts.css';

interface StockAlert {
  id: number;
  variant_id: number;
  product_name: string;
  sku: string;
  color: string;
  material: string;
  alert_type: string;
  alert_type_display: string;
  severity: string;
  severity_display: string;
  message: string;
  current_stock: number;
  threshold: number;
  is_resolved: boolean;
  resolved_at: string | null;
  resolved_by_name: string | null;
  created_at: string;
}

const SEVERITY_CONFIG: Record<string, { color: string; label: string }> = {
  critical: { color: 'epsilon', label: 'Critical' },
  high:     { color: 'gamma',   label: 'High' },
  medium:   { color: 'beta',    label: 'Medium' },
  low:      { color: 'delta',   label: 'Low' },
};

const ALERT_TYPE_CONFIG: Record<string, { label: string; color: string }> = {
  out_of_stock:  { label: 'Out of Stock',  color: 'epsilon' },
  low_stock:     { label: 'Low Stock',     color: 'gamma' },
  reorder_point: { label: 'Reorder Point', color: 'beta' },
  overstock:     { label: 'Overstock',     color: 'zeta' },
};

const formatDate = (d: string) =>
  new Date(d).toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });

const StockAlerts = () => {
  const navigate = useNavigate();
  const [alerts, setAlerts] = useState<StockAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [showResolved, setShowResolved] = useState(false);
  const [severityFilter, setSeverityFilter] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [resolving, setResolving] = useState<number | null>(null);

  useEffect(() => { fetchAlerts(); }, [showResolved, severityFilter, searchTerm]);

  const fetchAlerts = async () => {
    try {
      setLoading(true);
      const params: Record<string, string> = {};
      if (!showResolved) params.is_resolved = 'false';
      if (severityFilter) params.severity = severityFilter;
      if (searchTerm) params.search = searchTerm;
      const response = await apiClient.get('/inventory/alerts/', { params });
      const data = response.data;
      setAlerts(Array.isArray(data) ? data : data.results || []);
    } catch (error) {
      console.error('Failed to fetch alerts:', error);
      setAlerts([]);
    } finally {
      setLoading(false);
    }
  };

  const handleResolve = async (alertId: number) => {
    if (!window.confirm('Mark this alert as resolved?')) return;
    setResolving(alertId);
    try {
      await apiClient.post(`/inventory/alerts/${alertId}/resolve/`);
      fetchAlerts();
    } catch (error: any) {
      alert(error.response?.data?.error?.message || 'Failed to resolve alert');
    } finally {
      setResolving(null);
    }
  };

  const criticalCount = alerts.filter(a => !a.is_resolved && a.severity === 'critical').length;
  const highCount = alerts.filter(a => !a.is_resolved && a.severity === 'high').length;
  const activeCount = alerts.filter(a => !a.is_resolved).length;
  const resolvedCount = alerts.filter(a => a.is_resolved).length;

  return (
    <div className="al-page">
      {/* Header */}
      <div className="al-header">
        <div className="al-header-left">
          <button className="al-btn-back" onClick={() => navigate('/inventory')}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="15 18 9 12 15 6"/>
            </svg>
          </button>
          <div>
            <h1 className="al-title">Stock Alerts</h1>
            <p className="al-subtitle">Monitor and resolve inventory warnings</p>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="al-stats">
        <div className="al-stat al-stat-critical">
          <div className="al-stat-icon">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
          </div>
          <div className="al-stat-val">{criticalCount}</div>
          <div className="al-stat-label">Critical</div>
        </div>
        <div className="al-stat al-stat-high">
          <div className="al-stat-icon">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/>
              <line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
            </svg>
          </div>
          <div className="al-stat-val">{highCount}</div>
          <div className="al-stat-label">High Priority</div>
        </div>
        <div className="al-stat al-stat-active">
          <div className="al-stat-icon">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"/>
              <path d="M13.73 21a2 2 0 01-3.46 0"/>
            </svg>
          </div>
          <div className="al-stat-val">{activeCount}</div>
          <div className="al-stat-label">Active</div>
        </div>
        <div className="al-stat al-stat-resolved">
          <div className="al-stat-icon">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="20 6 9 17 4 12"/>
            </svg>
          </div>
          <div className="al-stat-val">{resolvedCount}</div>
          <div className="al-stat-label">Resolved</div>
        </div>
      </div>

      {/* Filters */}
      <div className="al-filters">
        <div className="al-search-wrap">
          <svg className="al-search-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          <input className="al-search" type="text" placeholder="Search by product or SKU…"
            value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
        </div>
        <select className="al-filter-select" value={severityFilter} onChange={e => setSeverityFilter(e.target.value)}>
          <option value="">All Severities</option>
          <option value="critical">Critical</option>
          <option value="high">High</option>
          <option value="medium">Medium</option>
          <option value="low">Low</option>
        </select>
        <label className="al-toggle-resolved">
          <div className={`al-mini-toggle ${showResolved ? 'on' : ''}`} onClick={() => setShowResolved(!showResolved)}>
            <div className="al-mini-thumb" />
          </div>
          <span>Show Resolved</span>
        </label>
        {(searchTerm || severityFilter) && (
          <button className="al-btn-clear" onClick={() => { setSearchTerm(''); setSeverityFilter(''); }}>Clear</button>
        )}
      </div>

      {/* Content */}
      {loading ? (
        <div className="al-loading"><div className="al-spinner" /><span>Loading…</span></div>
      ) : alerts.length === 0 ? (
        <div className="al-empty">
          {activeCount === 0 && !showResolved ? (
            <>
              <svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2">
                <path d="M22 11.08V12a10 10 0 11-5.93-9.14"/>
                <polyline points="22 4 12 14.01 9 11.01"/>
              </svg>
              <p>All clear! No active alerts</p>
              <span className="al-empty-sub">Your inventory levels are healthy</span>
            </>
          ) : (
            <>
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2">
                <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"/>
              </svg>
              <p>No alerts found</p>
            </>
          )}
        </div>
      ) : (
        <div className="al-list">
          {alerts.map(alert => {
            const sevConf = SEVERITY_CONFIG[alert.severity] || { color: 'zeta', label: alert.severity };
            const typeConf = ALERT_TYPE_CONFIG[alert.alert_type] || { label: alert.alert_type_display, color: 'zeta' };
            return (
              <div key={alert.id} className={`al-card ${alert.is_resolved ? 'resolved' : ''} al-sev-${sevConf.color}`}>
                <div className="al-card-left">
                  <span className={`al-sev-badge al-sev-${sevConf.color}`}>{sevConf.label}</span>
                  <span className={`al-type-badge al-type-${typeConf.color}`}>{typeConf.label}</span>
                </div>
                <div className="al-card-main">
                  <div className="al-card-product">{alert.product_name}</div>
                  <div className="al-card-variant">{alert.color} · {alert.material} · <span className="al-sku">{alert.sku}</span></div>
                  <div className="al-card-message">{alert.message}</div>
                  {alert.is_resolved && alert.resolved_at && (
                    <div className="al-resolved-info">
                      Resolved {formatDate(alert.resolved_at)}
                      {alert.resolved_by_name && ` by ${alert.resolved_by_name}`}
                    </div>
                  )}
                </div>
                <div className="al-card-stock">
                  <div className="al-stock-current">
                    <span className="al-stock-val">{alert.current_stock}</span>
                    <span className="al-stock-label">Current</span>
                  </div>
                  <div className="al-stock-divider" />
                  <div className="al-stock-threshold">
                    <span className="al-stock-val al-threshold">{alert.threshold}</span>
                    <span className="al-stock-label">Threshold</span>
                  </div>
                </div>
                <div className="al-card-meta">
                  <div className="al-card-date">{formatDate(alert.created_at)}</div>
                  {alert.is_resolved ? (
                    <span className="al-resolved-badge">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <polyline points="20 6 9 17 4 12"/>
                      </svg>
                      Resolved
                    </span>
                  ) : (
                    <div className="al-card-actions">
                      <button className="al-btn-restock"
                        onClick={() => navigate(`/stock-management?variant=${alert.variant_id}`)}>
                        Restock
                      </button>
                      <button className="al-btn-resolve"
                        onClick={() => handleResolve(alert.id)}
                        disabled={resolving === alert.id}>
                        {resolving === alert.id ? '…' : 'Resolve'}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default StockAlerts;
