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

const StockAlerts = () => {
  const navigate = useNavigate();
  const [alerts, setAlerts] = useState<StockAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [showResolved, setShowResolved] = useState(false);
  const [severityFilter, setSeverityFilter] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchAlerts();
  }, [showResolved, severityFilter, searchTerm]);

  const fetchAlerts = async () => {
    try {
      setLoading(true);
      const params: any = {};
      
      if (!showResolved) params.is_resolved = 'false';
      if (severityFilter) params.severity = severityFilter;
      if (searchTerm) params.search = searchTerm;

      const response = await apiClient.get('/inventory/alerts/', { params });
      setAlerts(response.data);
    } catch (error) {
      console.error('Failed to fetch stock alerts:', error);
      alert('Failed to load stock alerts');
    } finally {
      setLoading(false);
    }
  };

  const handleResolveAlert = async (alertId: number) => {
    if (!confirm('Mark this alert as resolved?')) return;

    try {
      await apiClient.post(`/inventory/alerts/${alertId}/resolve/`);
      alert('Alert resolved successfully');
      fetchAlerts();
    } catch (error: any) {
      console.error('Failed to resolve alert:', error);
      alert(error.response?.data?.error?.message || 'Failed to resolve alert');
    }
  };

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case 'critical':
        return <span className="severity-badge critical">🔴 Critical</span>;
      case 'high':
        return <span className="severity-badge high">🟠 High</span>;
      case 'medium':
        return <span className="severity-badge medium">🟡 Medium</span>;
      case 'low':
        return <span className="severity-badge low">🟢 Low</span>;
      default:
        return <span className="severity-badge">{severity}</span>;
    }
  };

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'out_of_stock':
        return '🚫';
      case 'low_stock':
        return '⚠️';
      case 'reorder_point':
        return '📦';
      case 'overstock':
        return '📊';
      default:
        return '🔔';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleClearFilters = () => {
    setSeverityFilter('');
    setSearchTerm('');
  };

  const activeAlerts = alerts.filter(a => !a.is_resolved);
  const resolvedAlerts = alerts.filter(a => a.is_resolved);

  return (
    <div className="stock-alerts-page">
      <div className="page-header">
        <div>
          <h1>🔔 Stock Alerts</h1>
          <p className="page-subtitle">Monitor and manage inventory alerts</p>
        </div>
        <button className="btn-back" onClick={() => navigate('/inventory')}>
          ← Back to Dashboard
        </button>
      </div>

      {/* Summary Stats */}
      <div className="alert-stats">
        <div className="stat-card critical">
          <div className="stat-value">{alerts.filter(a => !a.is_resolved && a.severity === 'critical').length}</div>
          <div className="stat-label">Critical Alerts</div>
        </div>
        <div className="stat-card high">
          <div className="stat-value">{alerts.filter(a => !a.is_resolved && a.severity === 'high').length}</div>
          <div className="stat-label">High Priority</div>
        </div>
        <div className="stat-card active">
          <div className="stat-value">{activeAlerts.length}</div>
          <div className="stat-label">Active Alerts</div>
        </div>
        <div className="stat-card resolved">
          <div className="stat-value">{resolvedAlerts.length}</div>
          <div className="stat-label">Resolved</div>
        </div>
      </div>

      {/* Filters */}
      <div className="filters-section">
        <div className="filters-row">
          <input
            type="text"
            className="search-input"
            placeholder="Search by product name or SKU..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          
          <select
            className="filter-select"
            value={severityFilter}
            onChange={(e) => setSeverityFilter(e.target.value)}
          >
            <option value="">All Severities</option>
            <option value="critical">Critical</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>

          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={showResolved}
              onChange={(e) => setShowResolved(e.target.checked)}
            />
            Show Resolved
          </label>

          {(searchTerm || severityFilter) && (
            <button className="btn-clear-filters" onClick={handleClearFilters}>
              Clear Filters
            </button>
          )}
        </div>
      </div>

      {/* Alerts Table */}
      {loading ? (
        <div className="loading">Loading stock alerts...</div>
      ) : alerts.length === 0 ? (
        <div className="no-data">
          {showResolved ? 'No alerts found' : '🎉 No active alerts! All inventory levels are healthy.'}
        </div>
      ) : (
        <div className="alerts-table-container">
          <table className="alerts-table">
            <thead>
              <tr>
                <th>Created</th>
                <th>Product</th>
                <th>SKU</th>
                <th>Variant</th>
                <th>Alert Type</th>
                <th>Severity</th>
                <th>Message</th>
                <th>Stock</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {alerts.map((alert) => (
                <tr key={alert.id} className={alert.is_resolved ? 'resolved' : ''}>
                  <td className="date-time">{formatDate(alert.created_at)}</td>
                  <td className="product-name">{alert.product_name}</td>
                  <td className="sku">{alert.sku}</td>
                  <td className="variant">
                    {alert.color} / {alert.material}
                  </td>
                  <td>
                    <span className="alert-type">
                      {getAlertIcon(alert.alert_type)} {alert.alert_type_display}
                    </span>
                  </td>
                  <td>{getSeverityBadge(alert.severity)}</td>
                  <td className="message">{alert.message}</td>
                  <td className="stock-info">
                    <div className="current-stock">{alert.current_stock} units</div>
                    <div className="threshold">Threshold: {alert.threshold}</div>
                  </td>
                  <td>
                    {alert.is_resolved ? (
                      <div className="resolved-info">
                        <span className="resolved-badge">✓ Resolved</span>
                        <div className="resolved-details">
                          {alert.resolved_at && formatDate(alert.resolved_at)}
                          {alert.resolved_by_name && <div>by {alert.resolved_by_name}</div>}
                        </div>
                      </div>
                    ) : (
                      <span className="active-badge">⚠️ Active</span>
                    )}
                  </td>
                  <td>
                    {!alert.is_resolved && (
                      <div className="action-buttons">
                        <button
                          className="btn-restock"
                          onClick={() => navigate(`/stock-management?variant=${alert.variant_id}`)}
                        >
                          Restock
                        </button>
                        <button
                          className="btn-resolve"
                          onClick={() => handleResolveAlert(alert.id)}
                        >
                          Resolve
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default StockAlerts;
