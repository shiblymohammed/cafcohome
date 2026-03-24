import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import apiClient from '../utils/api';
import type { RootState } from '../store';
import './OrderDetail.css';

interface OrderItem {
  id: number;
  product: {
    id: number;
    name: string;
    slug: string;
  };
  product_snapshot: {
    name: string;
    images: { url: string; alt: string }[];
    dimensions: any;
    colors: string[];
    materials: string[];
  };
  quantity: number;
  unit_price: string;
  discount: string;
  total: string;
}

interface OrderTracking {
  id: number;
  stage: string;
  updated_by: {
    id: number;
    name: string;
  };
  notes: string;
  timestamp: string;
}

interface Order {
  id: number;
  order_number: string;
  user: {
    id: number;
    name: string;
    phone_number: string;
  };
  delivery_address: string;
  phone_number: string;
  stage: 'order_received' | 'processing' | 'shipped' | 'delivered';
  assigned_to: {
    id: number;
    name: string;
  } | null;
  subtotal: string;
  discount: string;
  total: string;
  items: OrderItem[];
  tracking_history: OrderTracking[];
  created_at: string;
  updated_at: string;
}

interface Staff {
  id: number;
  name: string;
  username: string;
}

const OrderDetail = () => {
  const { orderNumber } = useParams<{ orderNumber: string }>();
  const navigate = useNavigate();
  const user = useSelector((state: RootState) => state.auth.user);
  const [order, setOrder] = useState<Order | null>(null);
  const [staff, setStaff] = useState<Staff[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [stageNotes, setStageNotes] = useState('');
  const [selectedStaff, setSelectedStaff] = useState<number | ''>('');

  useEffect(() => {
    if (orderNumber) {
      fetchOrder();
      if (user?.role === 'admin') {
        fetchStaff();
      }
    }
  }, [orderNumber]);

  useEffect(() => {
    if (order && order.assigned_to) {
      setSelectedStaff(order.assigned_to.id);
    }
  }, [order]);

  const fetchOrder = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get(`/orders/${orderNumber}/`);
      setOrder(response.data);
    } catch (error) {
      console.error('Failed to fetch order:', error);
      alert('Failed to load order details');
      navigate('/orders');
    } finally {
      setLoading(false);
    }
  };

  const fetchStaff = async () => {
    try {
      const response = await apiClient.get('/staff/');
      // Handle both array and paginated response formats
      const staffArray = Array.isArray(response.data) ? response.data : (response.data?.results || []);
      setStaff(staffArray);
    } catch (error) {
      console.error('Failed to fetch staff:', error);
    }
  };

  const handleStageUpdate = async (newStage: string) => {
    if (!order) return;

    if (!window.confirm(`Update order stage to "${getStageLabel(newStage)}"? This will send a WhatsApp notification to the customer.`)) {
      return;
    }

    setUpdating(true);
    try {
      await apiClient.patch(`/orders/${order.order_number}/stage/`, {
        stage: newStage,
        notes: stageNotes,
      });
      alert('Order stage updated successfully. WhatsApp notification sent to customer.');
      setStageNotes('');
      fetchOrder();
    } catch (error: any) {
      console.error('Failed to update order stage:', error);
      alert(error.response?.data?.error?.message || 'Failed to update order stage');
    } finally {
      setUpdating(false);
    }
  };

  const handleAssignStaff = async () => {
    if (!order || !selectedStaff) return;

    if (user?.role !== 'admin') {
      alert('Only admins can assign orders to staff');
      return;
    }

    setUpdating(true);
    try {
      await apiClient.patch(`/orders/${order.order_number}/assign/`, {
        staff_id: selectedStaff,
      });
      alert('Order assigned successfully');
      fetchOrder();
    } catch (error: any) {
      console.error('Failed to assign order:', error);
      alert(error.response?.data?.error?.message || 'Failed to assign order');
    } finally {
      setUpdating(false);
    }
  };

  const getStageLabel = (stage: string): string => {
    const labels: Record<string, string> = {
      order_received: 'Order Received',
      processing: 'Processing',
      shipped: 'Shipped',
      delivered: 'Delivered',
    };
    return labels[stage] || stage;
  };

  const getStageIndex = (stage: string): number => {
    const stages = ['order_received', 'processing', 'shipped', 'delivered'];
    return stages.indexOf(stage);
  };

  const canUpdateToStage = (targetStage: string): boolean => {
    if (!order) return false;
    const currentIndex = getStageIndex(order.stage);
    const targetIndex = getStageIndex(targetStage);
    return targetIndex === currentIndex + 1;
  };

  if (loading) {
    return (
      <div className="order-detail-page">
        <div className="loading">Loading order details...</div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="order-detail-page">
        <div className="error">Order not found</div>
      </div>
    );
  }

  const stages = [
    { key: 'order_received', label: 'Order Received' },
    { key: 'processing', label: 'Processing' },
    { key: 'shipped', label: 'Shipped' },
    { key: 'delivered', label: 'Delivered' },
  ];

  const currentStageIndex = getStageIndex(order.stage);

  return (
    <div className="order-detail-page">
      <div className="page-header">
        <button className="btn-back" onClick={() => navigate('/orders')}>
          ← Back to Orders
        </button>
        <h1>Order #{order.order_number}</h1>
      </div>

      <div className="order-content">
        <div className="order-main">
          {/* Order Stage Tracker */}
          <div className="card">
            <h2>Order Status</h2>
            <div className="stage-tracker">
              {stages.map((stage, index) => (
                <div
                  key={stage.key}
                  className={`stage-item ${index <= currentStageIndex ? 'completed' : ''} ${
                    stage.key === order.stage ? 'current' : ''
                  }`}
                >
                  <div className="stage-indicator">
                    <div className="stage-circle">
                      {index < currentStageIndex ? '✓' : index + 1}
                    </div>
                    {index < stages.length - 1 && <div className="stage-line" />}
                  </div>
                  <div className="stage-content">
                    <div className="stage-label">{stage.label}</div>
                    {stage.key === order.stage && (
                      <div className="stage-current-badge">Current</div>
                    )}
                  </div>
                  {canUpdateToStage(stage.key) && (
                    <button
                      className="btn-update-stage"
                      onClick={() => handleStageUpdate(stage.key)}
                      disabled={updating}
                    >
                      {updating ? 'Updating...' : 'Move to this stage'}
                    </button>
                  )}
                </div>
              ))}
            </div>

            {order.stage !== 'delivered' && (
              <div className="stage-notes">
                <label htmlFor="notes">Notes (optional):</label>
                <textarea
                  id="notes"
                  value={stageNotes}
                  onChange={(e) => setStageNotes(e.target.value)}
                  placeholder="Add notes about this stage update..."
                  rows={3}
                />
              </div>
            )}
          </div>

          {/* Order Items */}
          <div className="card">
            <h2>Order Items</h2>
            <div className="order-items">
              {order.items.map((item) => (
                <div key={item.id} className="order-item">
                  <img
                    src={item.product_snapshot.images[0]?.url || ''}
                    alt={item.product_snapshot.name}
                    className="item-image"
                  />
                  <div className="item-details">
                    <h3>{item.product_snapshot.name}</h3>
                    <div className="item-meta">
                      {item.product_snapshot.colors.length > 0 && (
                        <span>Colors: {item.product_snapshot.colors.join(', ')}</span>
                      )}
                      {item.product_snapshot.materials.length > 0 && (
                        <span>Materials: {item.product_snapshot.materials.join(', ')}</span>
                      )}
                    </div>
                  </div>
                  <div className="item-pricing">
                    <div className="item-quantity">Qty: {item.quantity}</div>
                    <div className="item-unit-price">₹{parseFloat(item.unit_price).toLocaleString()} each</div>
                    {parseFloat(item.discount) > 0 && (
                      <div className="item-discount">Discount: -₹{parseFloat(item.discount).toLocaleString()}</div>
                    )}
                    <div className="item-total">₹{parseFloat(item.total).toLocaleString()}</div>
                  </div>
                </div>
              ))}
            </div>

            <div className="order-summary">
              <div className="summary-row">
                <span>Subtotal:</span>
                <span>₹{parseFloat(order.subtotal).toLocaleString()}</span>
              </div>
              {parseFloat(order.discount) > 0 && (
                <div className="summary-row discount">
                  <span>Discount:</span>
                  <span>-₹{parseFloat(order.discount).toLocaleString()}</span>
                </div>
              )}
              <div className="summary-row total">
                <span>Total:</span>
                <span>₹{parseFloat(order.total).toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* Order History */}
          <div className="card">
            <h2>Order History</h2>
            <div className="order-history">
              {order.tracking_history.length === 0 ? (
                <p className="no-history">No tracking history yet</p>
              ) : (
                <div className="history-timeline">
                  {order.tracking_history.map((tracking) => (
                    <div key={tracking.id} className="history-item">
                      <div className="history-indicator" />
                      <div className="history-content">
                        <div className="history-stage">{getStageLabel(tracking.stage)}</div>
                        <div className="history-meta">
                          <span>Updated by {tracking.updated_by?.name || 'System'}</span>
                          <span>{new Date(tracking.timestamp).toLocaleString()}</span>
                        </div>
                        {tracking.notes && (
                          <div className="history-notes">{tracking.notes}</div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="order-sidebar">
          {/* Customer Information */}
          <div className="card">
            <h2>Customer Information</h2>
            <div className="info-group">
              <label>Name:</label>
              <div>{order.user.name}</div>
            </div>
            <div className="info-group">
              <label>Phone:</label>
              <div>{order.user.phone_number}</div>
            </div>
            <div className="info-group">
              <label>Contact Phone:</label>
              <div>{order.phone_number}</div>
            </div>
            <div className="info-group">
              <label>Delivery Address:</label>
              <div className="address">{order.delivery_address}</div>
            </div>
          </div>

          {/* Staff Assignment */}
          {user?.role === 'admin' && (
            <div className="card">
              <h2>Staff Assignment</h2>
              <div className="staff-assignment">
                <select
                  value={selectedStaff}
                  onChange={(e) => setSelectedStaff(parseInt(e.target.value) || '')}
                  className="staff-select"
                >
                  <option value="">Unassigned</option>
                  {staff.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </select>
                <button
                  className="btn-assign"
                  onClick={handleAssignStaff}
                  disabled={updating || selectedStaff === (order.assigned_to?.id || '')}
                >
                  {updating ? 'Assigning...' : 'Assign'}
                </button>
              </div>
              {order.assigned_to && (
                <div className="current-assignment">
                  Currently assigned to: <strong>{order.assigned_to.name}</strong>
                </div>
              )}
            </div>
          )}

          {/* Order Metadata */}
          <div className="card">
            <h2>Order Details</h2>
            <div className="info-group">
              <label>Created:</label>
              <div>{new Date(order.created_at).toLocaleString()}</div>
            </div>
            <div className="info-group">
              <label>Last Updated:</label>
              <div>{new Date(order.updated_at).toLocaleString()}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetail;
