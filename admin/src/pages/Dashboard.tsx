import { useEffect, useState } from 'react';
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

const Dashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get('/dashboard/stats/');
      setStats(response.data);
      setError(null);
    } catch (err: any) {
      setError(err.response?.data?.error?.message || 'Failed to load dashboard data');
      console.error('Error fetching dashboard stats:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStageColor = (stage: string) => {
    switch (stage) {
      case 'order_received':
        return '#3b82f6';
      case 'processing':
        return '#f59e0b';
      case 'shipped':
        return '#8b5cf6';
      case 'delivered':
        return '#10b981';
      default:
        return '#6b7280';
    }
  };

  if (loading) {
    return (
      <div className="dashboard">
        <h1>Dashboard</h1>
        <div className="loading">Loading dashboard data...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="dashboard">
        <h1>Dashboard</h1>
        <div className="error-message">{error}</div>
        <button onClick={fetchDashboardStats} className="retry-button">
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="dashboard">
      <h1>Dashboard</h1>
      
      <div className="dashboard-grid">
        <div className="dashboard-card">
          <div className="card-icon">📦</div>
          <div className="card-content">
            <h3>Total Orders</h3>
            <p className="card-value">{stats?.total_orders || 0}</p>
            <p className="card-subtitle">All time orders</p>
          </div>
        </div>
        
        <div className="dashboard-card">
          <div className="card-icon">⏳</div>
          <div className="card-content">
            <h3>Pending Orders</h3>
            <p className="card-value">{stats?.pending_orders || 0}</p>
            <p className="card-subtitle">Awaiting processing</p>
          </div>
        </div>
        
        <div className="dashboard-card">
          <div className="card-icon">👥</div>
          <div className="card-content">
            <h3>Total Users</h3>
            <p className="card-value">{stats?.total_users || 0}</p>
            <p className="card-subtitle">Registered customers</p>
          </div>
        </div>
        
        <div className="dashboard-card">
          <div className="card-icon">🛋️</div>
          <div className="card-content">
            <h3>Total Products</h3>
            <p className="card-value">{stats?.total_products || 0}</p>
            <p className="card-subtitle">Active products</p>
          </div>
        </div>
      </div>

      <div className="recent-orders-section">
        <div className="section-header">
          <h2>Recent Orders</h2>
          <button 
            className="view-all-button"
            onClick={() => navigate('/orders')}
          >
            View All Orders →
          </button>
        </div>
        
        {stats?.recent_orders && stats.recent_orders.length > 0 ? (
          <div className="recent-orders-table">
            <table>
              <thead>
                <tr>
                  <th>Order Number</th>
                  <th>Customer</th>
                  <th>Phone</th>
                  <th>Status</th>
                  <th>Total</th>
                  <th>Assigned To</th>
                  <th>Date</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {stats.recent_orders.map((order) => (
                  <tr key={order.order_number}>
                    <td className="order-number">{order.order_number}</td>
                    <td>{order.customer_name}</td>
                    <td>{order.customer_phone}</td>
                    <td>
                      <span 
                        className="status-badge"
                        style={{ backgroundColor: getStageColor(order.stage) }}
                      >
                        {order.stage_display}
                      </span>
                    </td>
                    <td className="order-total">₹{parseFloat(order.total).toLocaleString()}</td>
                    <td>{order.assigned_to || 'Unassigned'}</td>
                    <td className="order-date">{formatDate(order.created_at)}</td>
                    <td>
                      <button
                        className="view-button"
                        onClick={() => navigate(`/orders/${order.order_number}`)}
                      >
                        View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="no-orders">
            <p>No orders yet</p>
          </div>
        )}
      </div>

      <div className="quick-actions-section">
        <h2>Quick Actions</h2>
        <div className="quick-actions-grid">
          <button 
            className="quick-action-button"
            onClick={() => navigate('/products')}
          >
            <span className="action-icon">📦</span>
            <span className="action-text">Manage Products</span>
          </button>
          <button 
            className="quick-action-button"
            onClick={() => navigate('/orders')}
          >
            <span className="action-icon">📋</span>
            <span className="action-text">View Orders</span>
          </button>
          <button 
            className="quick-action-button"
            onClick={() => navigate('/users')}
          >
            <span className="action-icon">👥</span>
            <span className="action-text">Manage Users</span>
          </button>
          <button 
            className="quick-action-button"
            onClick={() => navigate('/blog')}
          >
            <span className="action-icon">✍️</span>
            <span className="action-text">Manage Blog</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
