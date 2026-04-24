import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import apiClient from '../utils/api';
import './Inventory.css';

interface InventorySummary {
  total_variants: number;
  in_stock: number;
  low_stock: number;
  out_of_stock: number;
  active_alerts: number;
  critical_alerts: number;
  total_inventory_value: number;
  total_retail_value: number;
  potential_profit: number;
  recent_movements_24h: number;
}

interface LowStockItem {
  id: number;
  product_name: string;
  sku: string;
  color: string;
  material: string;
  stock_quantity: number;
  reorder_point: number;
  reorder_quantity: number;
}

interface DashboardData {
  summary: InventorySummary;
  low_stock_items: LowStockItem[];
}

const Inventory = () => {
  const navigate = useNavigate();
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get('/inventory/dashboard/');
      setDashboardData(response.data);
    } catch (error) {
      console.error('Failed to fetch inventory dashboard:', error);
      alert('Failed to load inventory dashboard');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="inventory-page">
        <div className="loading">Loading inventory dashboard...</div>
      </div>
    );
  }

  if (!dashboardData) {
    return (
      <div className="inventory-page">
        <div className="error">Failed to load dashboard data</div>
      </div>
    );
  }

  const { summary, low_stock_items } = dashboardData;

  return (
    <div className="inventory-page">
      <div className="page-header">
        <h1>📦 Inventory Management</h1>
        <div className="header-actions">
          <button className="btn-primary" onClick={() => navigate('/stock-management')}>
            Manage Stock
          </button>
          <button className="btn-secondary" onClick={() => navigate('/stock-movements')}>
            View Movements
          </button>
          <button className="btn-secondary" onClick={() => navigate('/stock-alerts')}>
            View Alerts ({summary.active_alerts})
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="summary-cards">
        <div className="summary-card">
          <div className="card-icon">📊</div>
          <div className="card-content">
            <div className="card-value">{summary.total_variants}</div>
            <div className="card-label">Total Products</div>
          </div>
        </div>

        <div className="summary-card success">
          <div className="card-icon">🟢</div>
          <div className="card-content">
            <div className="card-value">{summary.in_stock}</div>
            <div className="card-label">In Stock</div>
          </div>
        </div>

        <div className="summary-card warning">
          <div className="card-icon">🟡</div>
          <div className="card-content">
            <div className="card-value">{summary.low_stock}</div>
            <div className="card-label">Low Stock</div>
          </div>
        </div>

        <div className="summary-card danger">
          <div className="card-icon">🔴</div>
          <div className="card-content">
            <div className="card-value">{summary.out_of_stock}</div>
            <div className="card-label">Out of Stock</div>
          </div>
        </div>

        <div className="summary-card alert">
          <div className="card-icon">⚠️</div>
          <div className="card-content">
            <div className="card-value">{summary.active_alerts}</div>
            <div className="card-label">Active Alerts</div>
            {summary.critical_alerts > 0 && (
              <div className="card-sublabel">
                {summary.critical_alerts} critical
              </div>
            )}
          </div>
        </div>

        <div className="summary-card info">
          <div className="card-icon">💰</div>
          <div className="card-content">
            <div className="card-value">₹{(summary.total_inventory_value / 1000).toFixed(1)}K</div>
            <div className="card-label">Inventory Value</div>
          </div>
        </div>

        <div className="summary-card info">
          <div className="card-icon">💵</div>
          <div className="card-content">
            <div className="card-value">₹{(summary.total_retail_value / 1000).toFixed(1)}K</div>
            <div className="card-label">Retail Value</div>
          </div>
        </div>

        <div className="summary-card success">
          <div className="card-icon">📈</div>
          <div className="card-content">
            <div className="card-value">₹{(summary.potential_profit / 1000).toFixed(1)}K</div>
            <div className="card-label">Potential Profit</div>
          </div>
        </div>
      </div>

      {/* Low Stock Items */}
      {low_stock_items.length > 0 && (
        <div className="card">
          <div className="card-header">
            <h2>⚠️ Items Needing Attention</h2>
            <span className="badge badge-warning">{low_stock_items.length} items</span>
          </div>
          <div className="low-stock-table">
            <table>
              <thead>
                <tr>
                  <th>Product</th>
                  <th>SKU</th>
                  <th>Variant</th>
                  <th>Current Stock</th>
                  <th>Reorder Point</th>
                  <th>Suggested Reorder</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {low_stock_items.map((item) => (
                  <tr key={item.id}>
                    <td className="product-name">{item.product_name}</td>
                    <td className="sku">{item.sku}</td>
                    <td className="variant">
                      {item.color} / {item.material}
                    </td>
                    <td className="stock-quantity">
                      <span className={`stock-badge ${item.stock_quantity === 0 ? 'out' : 'low'}`}>
                        {item.stock_quantity}
                      </span>
                    </td>
                    <td>{item.reorder_point}</td>
                    <td className="reorder-qty">{item.reorder_quantity} units</td>
                    <td>
                      <button
                        className="btn-restock"
                        onClick={() => navigate(`/stock-management?variant=${item.id}`)}
                      >
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

      {/* Quick Stats */}
      <div className="quick-stats">
        <div className="stat-card">
          <div className="stat-icon">📦</div>
          <div className="stat-content">
            <div className="stat-value">{summary.recent_movements_24h}</div>
            <div className="stat-label">Stock Movements (24h)</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">💹</div>
          <div className="stat-content">
            <div className="stat-value">
              {summary.total_retail_value > 0
                ? ((summary.potential_profit / summary.total_retail_value) * 100).toFixed(1)
                : 0}%
            </div>
            <div className="stat-label">Profit Margin</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">📊</div>
          <div className="stat-content">
            <div className="stat-value">
              {summary.total_variants > 0
                ? ((summary.in_stock / summary.total_variants) * 100).toFixed(0)
                : 0}%
            </div>
            <div className="stat-label">Stock Availability</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Inventory;