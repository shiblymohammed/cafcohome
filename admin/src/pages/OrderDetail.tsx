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
    color?: string;
    material?: string;
    sku?: string;
    mrp?: string;
    offer_type?: string;
    offer_name?: string;
    offer_discount?: string;
  };
  quantity: number;
  unit_price: string;
  discount: string;
  total: string;
  variant_details?: {
    color?: string;
    material?: string;
    sku?: string;
    colors: string[];
    materials: string[];
  };
  pricing_details?: {
    mrp?: string;
    offer_price?: number;
    unit_price: number;
    discount: number;
    total: number;
    mrp_discount_percentage: number;
    offer_discount_percentage: number;
    offer_type?: string;
    offer_name?: string;
    subtotal_before_discount: number;
    total_discount: number;
    final_total: number;
    mrp_savings: number;
    offer_savings: number;
    has_active_offer: boolean;
    price_matches_offer: boolean;
  };
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

interface QuotationLog {
  id: number;
  sent_by: number | null;
  sent_by_name: string | null;
  phone_number: string;
  sent_at: string;
  method: 'manual' | 'api' | 'email' | 'sms';
  method_display: string;
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
  quotation_logs: QuotationLog[];
  order_summary: {
    total_items: number;
    unique_products: number;
    total_mrp: number | null;
    total_offer_price: number | null;
    total_discount: number;
    has_offers: boolean;
    active_offers_count: number;
    final_total: number;
    total_mrp_savings: number;
    total_offer_savings: number;
    pricing_breakdown: {
      mrp_total: number | null;
      offer_total: number | null;
      final_total: number;
      you_saved_from_mrp: number;
      additional_offer_savings: number;
    };
  };
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

  const handleSendQuotation = async () => {
    if (!order) return;

    try {
      // Generate quotation message
      const quotationMessage = generateQuotationMessage(order);
      
      // Clean phone number (remove spaces, special characters)
      const phoneNumber = order.phone_number.replace(/[^\d+]/g, '');
      
      // Create WhatsApp URL
      const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(quotationMessage)}`;
      
      // Open WhatsApp
      window.open(whatsappUrl, '_blank');
      
      // Log quotation sent (optional - you can implement this later)
      try {
        await apiClient.post(`/orders/${order.order_number}/quotation-sent/`);
      } catch (error) {
        console.log('Failed to log quotation sent:', error);
      }
      
    } catch (error) {
      console.error('Failed to send quotation:', error);
      alert('Failed to generate quotation. Please try again.');
    }
  };

  const generateQuotationMessage = (order: Order): string => {
    const summary = order.order_summary;
    let message = `🏠 *CAFCO FURNITURE QUOTATION*\n\n`;
    
    message += `📋 *Order Details*\n`;
    message += `Order #: ${order.order_number}\n`;
    message += `Customer: ${order.user.name}\n`;
    message += `Date: ${new Date(order.created_at).toLocaleDateString()}\n\n`;
    
    message += `🛋️ *Items Ordered*\n`;
    order.items.forEach((item, index) => {
      const pricing = item.pricing_details;
      message += `${index + 1}. *${item.product_name}*\n`;
      
      if (item.variant_details?.color || item.variant_details?.material) {
        message += `   Color: ${item.variant_details.color || 'N/A'}\n`;
        message += `   Material: ${item.variant_details.material || 'N/A'}\n`;
      }
      
      message += `   Quantity: ${item.quantity}\n`;
      
      if (pricing && pricing.unit_price > 0) {
        if (pricing.mrp && parseFloat(pricing.mrp) > pricing.unit_price) {
          message += `   MRP: ₹${parseFloat(pricing.mrp).toLocaleString()}\n`;
        }
        if (pricing.offer_name) {
          message += `   🏷️ Offer: ${pricing.offer_name} (${pricing.offer_discount_percentage}% off)\n`;
        }
        message += `   *Price: ₹${pricing.unit_price.toLocaleString()} each*\n`;
        message += `   *Total: ₹${pricing.final_total.toLocaleString()}*\n`;
      } else {
        message += `   *Price: As per quotation*\n`;
      }
      message += `\n`;
    });
    
    message += `💰 *Pricing Summary*\n`;
    if (summary?.total_mrp && summary.total_mrp > 0) {
      message += `Total MRP: ₹${summary.total_mrp.toLocaleString()}\n`;
    }
    if (summary?.has_offers && summary.active_offers_count > 0) {
      message += `🏷️ Offers Applied: ${summary.active_offers_count}\n`;
    }
    if (parseFloat(order.total) > 0) {
      message += `*Final Total: ₹${parseFloat(order.total).toLocaleString()}*\n`;
      if (summary?.total_mrp_savings > 0) {
        message += `💚 You Save: ₹${summary.total_mrp_savings.toLocaleString()}\n`;
      }
    } else {
      message += `*Total: As per discussion*\n`;
    }
    
    message += `\n📍 *Delivery Address*\n`;
    message += `${order.delivery_address}\n\n`;
    
    message += `📞 *Next Steps*\n`;
    message += `• Please confirm if you'd like to proceed\n`;
    message += `• We'll arrange delivery once confirmed\n`;
    message += `• Any questions? Feel free to ask!\n\n`;
    
    message += `Thank you for choosing CAFCO! 🙏`;
    
    return message;
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
              {order.items.map((item) => {
                const itemImage = item.product_snapshot?.images?.[0]?.url || '/placeholder-product.jpg';
                const itemName = item.product_snapshot?.name || item.product?.name || 'Unknown Product';
                const itemColors = item.product_snapshot?.colors || [];
                const itemMaterials = item.product_snapshot?.materials || [];
                const pricing = item.pricing_details;
                const variant = item.variant_details;
                
                return (
                  <div key={item.id} className="order-item">
                    <img
                      src={itemImage}
                      alt={itemName}
                      className="item-image"
                    />
                    <div className="item-details">
                      <h3>{itemName}</h3>
                      <div className="item-meta">
                        {variant?.sku && (
                          <span className="item-sku">SKU: {variant.sku}</span>
                        )}
                        {(variant?.color || itemColors.length > 0) && (
                          <span>Color: {variant?.color || itemColors.join(', ')}</span>
                        )}
                        {(variant?.material || itemMaterials.length > 0) && (
                          <span>Material: {variant?.material || itemMaterials.join(', ')}</span>
                        )}
                      </div>
                      {item.product_snapshot?.offer_name && (
                        <div className="item-offer">
                          🏷️ {item.product_snapshot.offer_name} ({item.product_snapshot.offer_discount}% off)
                        </div>
                      )}
                      {pricing?.has_active_offer && pricing.offer_name && (
                        <div className="item-current-offer">
                          🔥 Active Offer: {pricing.offer_name} ({pricing.offer_discount_percentage}% off)
                          {pricing.price_matches_offer ? (
                            <span className="offer-applied">✓ Applied</span>
                          ) : (
                            <span className="offer-not-applied">⚠️ Not Applied</span>
                          )}
                        </div>
                      )}
                    </div>
                    <div className="item-pricing">
                      <div className="item-quantity">Qty: {item.quantity}</div>
                      {pricing && pricing.unit_price > 0 ? (
                        <div className="pricing-breakdown">
                          {pricing.mrp && parseFloat(pricing.mrp) > pricing.unit_price && (
                            <div className="item-mrp">
                              MRP: ₹{parseFloat(pricing.mrp).toLocaleString()} each
                            </div>
                          )}
                          {pricing.offer_price && pricing.offer_price !== parseFloat(pricing.mrp || '0') && (
                            <div className="item-offer-price">
                              Offer Price: ₹{pricing.offer_price.toLocaleString()} each
                              <span className="offer-discount-badge">
                                {pricing.offer_discount_percentage}% off
                              </span>
                            </div>
                          )}
                          <div className="item-unit-price">
                            Selling Price: ₹{pricing.unit_price.toLocaleString()} each
                            {pricing.mrp_discount_percentage > 0 && (
                              <span className="discount-badge">
                                {pricing.mrp_discount_percentage}% off MRP
                              </span>
                            )}
                          </div>
                          {pricing.total_discount > 0 && (
                            <div className="item-discount">
                              Additional Discount: -₹{pricing.total_discount.toLocaleString()}
                            </div>
                          )}
                          <div className="item-subtotal">
                            Subtotal: ₹{pricing.subtotal_before_discount.toLocaleString()}
                          </div>
                          <div className="item-total">
                            Item Total: ₹{pricing.final_total.toLocaleString()}
                          </div>
                          {pricing.mrp_savings > 0 && (
                            <div className="item-savings">
                              Discount Given: ₹{pricing.mrp_savings.toLocaleString()}
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="item-total text-muted">Price: Quotation Pending</div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="order-summary">
              {parseFloat(order.total) > 0 ? (
                <>
                  {order.order_summary?.total_mrp && (
                    <div className="summary-row mrp-row">
                      <span>Total MRP:</span>
                      <span>₹{order.order_summary.total_mrp.toLocaleString()}</span>
                    </div>
                  )}
                  {order.order_summary?.total_offer_price && (
                    <div className="summary-row offer-price-row">
                      <span>After Offers ({order.order_summary.active_offers_count} active):</span>
                      <span>₹{order.order_summary.total_offer_price.toLocaleString()}</span>
                    </div>
                  )}
                  <div className="summary-row">
                    <span>Subtotal ({order.order_summary?.total_items || 0} items):</span>
                    <span>₹{parseFloat(order.subtotal).toLocaleString()}</span>
                  </div>
                  {parseFloat(order.discount) > 0 && (
                    <div className="summary-row discount">
                      <span>Additional Discount:</span>
                      <span>-₹{parseFloat(order.discount).toLocaleString()}</span>
                    </div>
                  )}
                  {order.order_summary?.has_offers && (
                    <div className="summary-row offers-applied">
                      <span>🏷️ Offers Applied ({order.order_summary.active_offers_count})</span>
                      <span>✓</span>
                    </div>
                  )}
                  <div className="summary-divider"></div>
                  <div className="summary-row total">
                    <span>Final Total:</span>
                    <span>₹{parseFloat(order.total).toLocaleString()}</span>
                  </div>
                  
                  {/* Discount Analysis */}
                  {(order.order_summary?.total_mrp_savings > 0 || order.order_summary?.total_offer_savings > 0) && (
                    <>
                      <div className="summary-divider"></div>
                      <div className="savings-section">
                        <div className="savings-header">💰 Discount Analysis</div>
                        {order.order_summary.total_mrp_savings > 0 && (
                          <div className="summary-row savings">
                            <span>Discount from MRP:</span>
                            <span className="savings-amount">
                              ₹{order.order_summary.total_mrp_savings.toLocaleString()}
                            </span>
                          </div>
                        )}
                        {order.order_summary.total_offer_savings > 0 && (
                          <div className="summary-row savings">
                            <span>Additional Offer Discount:</span>
                            <span className="savings-amount">
                              ₹{order.order_summary.total_offer_savings.toLocaleString()}
                            </span>
                          </div>
                        )}
                        <div className="summary-row total-savings">
                          <span>Total Discount Given:</span>
                          <span className="total-savings-amount">
                            ₹{(order.order_summary.total_mrp_savings + order.order_summary.total_offer_savings).toLocaleString()}
                          </span>
                        </div>
                      </div>
                    </>
                  )}
                </>
              ) : (
                <div className="summary-row total">
                  <span>Total:</span>
                  <span className="text-muted">Quotation Pending</span>
                </div>
              )}
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

          {/* Quotation History */}
          <div className="card">
            <h2>Quotation History</h2>
            <div className="quotation-history">
              {order.quotation_logs.length === 0 ? (
                <p className="no-history">No quotations sent yet</p>
              ) : (
                <div className="history-timeline">
                  {order.quotation_logs.map((log) => (
                    <div key={log.id} className="history-item">
                      <div className="history-indicator quotation-indicator" />
                      <div className="history-content">
                        <div className="history-stage">📱 Quotation Sent</div>
                        <div className="history-meta">
                          <span>Sent by {log.sent_by_name || 'System'}</span>
                          <span>{new Date(log.sent_at).toLocaleString()}</span>
                        </div>
                        <div className="quotation-details">
                          <span className="quotation-method">{log.method_display}</span>
                          <span className="quotation-phone">to {log.phone_number}</span>
                        </div>
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

          {/* Send Quotation */}
          <div className="card">
            <h2>Send Quotation</h2>
            <div className="quotation-section">
              <p className="quotation-info">
                Send detailed quotation to customer via WhatsApp
              </p>
              <button
                className="btn-send-quotation"
                onClick={handleSendQuotation}
                disabled={updating}
              >
                📱 Send via WhatsApp
              </button>
              <div className="quotation-note">
                Opens WhatsApp with pre-filled quotation message
              </div>
            </div>
          </div>

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
