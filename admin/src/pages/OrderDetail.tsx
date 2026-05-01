import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import apiClient from '../utils/api';
import type { RootState } from '../store';
import './OrderDetail.css';

interface OrderItem {
  id: number;
  product: { id: number; name: string; slug: string };
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
  variant_details?: { color?: string; material?: string; sku?: string; colors: string[]; materials: string[] };
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
  updated_by: { id: number; name: string };
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
  user: { id: number; name: string; phone_number: string };
  delivery_address: string;
  phone_number: string;
  stage: 'order_received' | 'processing' | 'shipped' | 'delivered';
  assigned_to: { id: number; name: string } | null;
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

interface Staff { id: number; name: string; username: string; }

const STAGES = [
  { key: 'order_received', label: 'Received',   icon: '📋' },
  { key: 'processing',     label: 'Processing', icon: '⚙️' },
  { key: 'shipped',        label: 'Shipped',    icon: '🚚' },
  { key: 'delivered',      label: 'Delivered',  icon: '✅' },
];

const STAGE_LABELS: Record<string, string> = {
  order_received: 'Order Received',
  processing: 'Processing',
  shipped: 'Shipped',
  delivered: 'Delivered',
};

const OrderDetail = () => {
  const { orderNumber } = useParams<{ orderNumber: string }>();
  const navigate = useNavigate();
  const user = useSelector((state: RootState) => state.auth.user);

  const [order, setOrder]               = useState<Order | null>(null);
  const [staff, setStaff]               = useState<Staff[]>([]);
  const [loading, setLoading]           = useState(true);
  const [updating, setUpdating]         = useState(false);
  const [stageNotes, setStageNotes]     = useState('');
  const [selectedStaff, setSelectedStaff] = useState<number | ''>('');

  useEffect(() => {
    if (orderNumber) {
      fetchOrder();
      if (user?.role === 'admin') fetchStaff();
    }
  }, [orderNumber]);

  useEffect(() => {
    if (order?.assigned_to) setSelectedStaff(order.assigned_to.id);
  }, [order]);

  const fetchOrder = async () => {
    try {
      setLoading(true);
      const res = await apiClient.get(`/orders/${orderNumber}/`);
      setOrder(res.data);
    } catch {
      alert('Failed to load order details');
      navigate('/orders');
    } finally {
      setLoading(false);
    }
  };

  const fetchStaff = async () => {
    try {
      const res = await apiClient.get('/staff/');
      setStaff(Array.isArray(res.data) ? res.data : (res.data?.results || []));
    } catch {}
  };

  const handleStageUpdate = async (newStage: string) => {
    if (!order) return;
    if (!window.confirm(`Move order to "${STAGE_LABELS[newStage]}"? A WhatsApp notification will be sent.`)) return;
    setUpdating(true);
    try {
      await apiClient.patch(`/orders/${order.order_number}/stage/`, { stage: newStage, notes: stageNotes });
      setStageNotes('');
      fetchOrder();
    } catch (e: any) {
      alert(e.response?.data?.error?.message || 'Failed to update stage');
    } finally {
      setUpdating(false);
    }
  };

  const handleAssignStaff = async () => {
    if (!order || !selectedStaff || user?.role !== 'admin') return;
    setUpdating(true);
    try {
      await apiClient.patch(`/orders/${order.order_number}/assign/`, { staff_id: selectedStaff });
      fetchOrder();
    } catch (e: any) {
      alert(e.response?.data?.error?.message || 'Failed to assign');
    } finally {
      setUpdating(false);
    }
  };

  const handleSendQuotation = async () => {
    if (!order) return;
    const s = order.order_summary;
    let msg = `🏠 *DRAVOHOME FURNITURE QUOTATION*\n\n📋 *Order #${order.order_number}*\nCustomer: ${order.user.name}\nDate: ${new Date(order.created_at).toLocaleDateString()}\n\n🛋️ *Items*\n`;
    order.items.forEach((item, i) => {
      const name = item.product_snapshot?.name || item.product?.name || 'Product';
      const p = item.pricing_details;
      msg += `${i + 1}. ${name}\n`;
      if (item.variant_details?.color) msg += `   Color: ${item.variant_details.color}\n`;
      if (item.variant_details?.material) msg += `   Material: ${item.variant_details.material}\n`;
      msg += `   Qty: ${item.quantity}\n`;
      if (p && p.unit_price > 0) msg += `   *₹${p.unit_price.toLocaleString()} × ${item.quantity} = ₹${p.final_total.toLocaleString()}*\n`;
      msg += '\n';
    });
    const total = parseFloat(order.total);
    msg += `💰 *Total: ₹${total > 0 ? total.toLocaleString() : 'As per discussion'}*\n`;
    if (s?.total_mrp_savings > 0) msg += `💚 You Save: ₹${s.total_mrp_savings.toLocaleString()}\n`;
    msg += `\n📍 ${order.delivery_address}\n\nThank you for choosing DravoHome! 🙏`;

    window.open(`https://wa.me/${order.phone_number.replace(/[^\d+]/g, '')}?text=${encodeURIComponent(msg)}`, '_blank');
    try { await apiClient.post(`/orders/${order.order_number}/quotation-sent/`); } catch {}
  };

  const stageIndex = (s: string) => STAGES.findIndex(st => st.key === s);
  const canAdvance = (target: string) => order ? stageIndex(target) === stageIndex(order.stage) + 1 : false;

  if (loading) return (
    <div className="od-page">
      <div className="od-loading">
        <div className="od-spinner" />
        <span>Loading order…</span>
      </div>
    </div>
  );

  if (!order) return (
    <div className="od-page">
      <div className="od-error">Order not found</div>
    </div>
  );

  const currentIdx = stageIndex(order.stage);
  const total = parseFloat(order.total);

  return (
    <div className="od-page animate-fadeIn">

      {/* ── Header ── */}
      <div className="od-header">
        <button className="od-back" onClick={() => navigate('/orders')}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/>
          </svg>
          Orders
        </button>
        <div className="od-header-center">
          <h1 className="od-title">{order.order_number}</h1>
          <span className={`od-stage-pill stage-${order.stage.replace('_', '-')}`}>
            {STAGE_LABELS[order.stage]}
          </span>
        </div>
        <button className="od-btn-wa" onClick={handleSendQuotation}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
          </svg>
          Send Quotation
        </button>
      </div>

      <div className="od-layout">
        {/* ── Main ── */}
        <div className="od-main">

          {/* Stage Tracker */}
          <div className="od-card">
            <div className="od-card-title">Order Progress</div>
            <div className="od-tracker">
              {STAGES.map((stage, idx) => {
                const done    = idx < currentIdx;
                const current = idx === currentIdx;
                const future  = idx > currentIdx;
                return (
                  <div key={stage.key} className={`od-track-step ${done ? 'done' : ''} ${current ? 'current' : ''} ${future ? 'future' : ''}`}>
                    <div className="od-track-node">
                      <div className="od-track-circle">
                        {done ? (
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                            <polyline points="20 6 9 17 4 12"/>
                          </svg>
                        ) : (
                          <span>{stage.icon}</span>
                        )}
                      </div>
                      {idx < STAGES.length - 1 && <div className="od-track-line" />}
                    </div>
                    <div className="od-track-info">
                      <span className="od-track-label">{stage.label}</span>
                      {current && <span className="od-track-badge">Current</span>}
                      {canAdvance(stage.key) && (
                        <button
                          className="od-track-advance"
                          onClick={() => handleStageUpdate(stage.key)}
                          disabled={updating}
                        >
                          {updating ? 'Moving…' : `Move to ${stage.label}`}
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
            {order.stage !== 'delivered' && (
              <div className="od-notes-wrap">
                <label className="od-notes-label">Stage notes (optional)</label>
                <textarea
                  className="od-notes-input"
                  value={stageNotes}
                  onChange={e => setStageNotes(e.target.value)}
                  placeholder="Add a note for this stage update…"
                  rows={2}
                />
              </div>
            )}
          </div>

          {/* Order Items */}
          <div className="od-card">
            <div className="od-card-title">
              Order Items
              <span className="od-card-count">{order.items.length}</span>
            </div>
            <div className="od-items">
              {order.items.map(item => {
                const name    = item.product_snapshot?.name || item.product?.name || 'Unknown Product';
                const img     = item.product_snapshot?.images?.[0]?.url;
                const variant = item.variant_details;
                const pricing = item.pricing_details;

                return (
                  <div key={item.id} className="od-item">
                    <div className="od-item-img-wrap">
                      {img ? (
                        <img src={img} alt={name} className="od-item-img" />
                      ) : (
                        <div className="od-item-img-placeholder">
                          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                            <rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/>
                            <polyline points="21 15 16 10 5 21"/>
                          </svg>
                        </div>
                      )}
                    </div>
                    <div className="od-item-info">
                      <div className="od-item-name">{name}</div>
                      <div className="od-item-meta">
                        {variant?.sku && <span className="od-item-sku">{variant.sku}</span>}
                        {variant?.color && <span>Color: {variant.color}</span>}
                        {variant?.material && <span>Material: {variant.material}</span>}
                      </div>
                      {item.product_snapshot?.offer_name && (
                        <div className="od-item-offer">
                          🏷️ {item.product_snapshot.offer_name} ({item.product_snapshot.offer_discount}% off)
                        </div>
                      )}
                    </div>
                    <div className="od-item-pricing">
                      <div className="od-item-qty">× {item.quantity}</div>
                      {pricing && pricing.unit_price > 0 ? (
                        <>
                          {pricing.mrp && parseFloat(pricing.mrp) > pricing.unit_price && (
                            <div className="od-item-mrp">₹{parseFloat(pricing.mrp).toLocaleString()}</div>
                          )}
                          <div className="od-item-price">₹{pricing.unit_price.toLocaleString()}</div>
                          <div className="od-item-total">₹{pricing.final_total.toLocaleString()}</div>
                          {pricing.mrp_savings > 0 && (
                            <div className="od-item-saved">−₹{pricing.mrp_savings.toLocaleString()}</div>
                          )}
                        </>
                      ) : (
                        <div className="od-item-pending">Pending</div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Summary */}
            <div className="od-summary">
              {total > 0 ? (
                <>
                  {order.order_summary?.total_mrp && (
                    <div className="od-sum-row od-sum-mrp">
                      <span>Total MRP</span>
                      <span>₹{order.order_summary.total_mrp.toLocaleString()}</span>
                    </div>
                  )}
                  {order.order_summary?.total_offer_price && (
                    <div className="od-sum-row od-sum-offer">
                      <span>After Offers ({order.order_summary.active_offers_count})</span>
                      <span>₹{order.order_summary.total_offer_price.toLocaleString()}</span>
                    </div>
                  )}
                  <div className="od-sum-row">
                    <span>Subtotal ({order.order_summary?.total_items || 0} items)</span>
                    <span>₹{parseFloat(order.subtotal).toLocaleString()}</span>
                  </div>
                  {parseFloat(order.discount) > 0 && (
                    <div className="od-sum-row od-sum-discount">
                      <span>Additional Discount</span>
                      <span>−₹{parseFloat(order.discount).toLocaleString()}</span>
                    </div>
                  )}
                  <div className="od-sum-divider" />
                  <div className="od-sum-row od-sum-total">
                    <span>Final Total</span>
                    <span>₹{total.toLocaleString()}</span>
                  </div>
                  {(order.order_summary?.total_mrp_savings > 0 || order.order_summary?.total_offer_savings > 0) && (
                    <div className="od-sum-savings">
                      <div className="od-sum-savings-label">Total Savings</div>
                      <div className="od-sum-savings-value">
                        ₹{(order.order_summary.total_mrp_savings + order.order_summary.total_offer_savings).toLocaleString()}
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <div className="od-sum-row od-sum-total">
                  <span>Total</span>
                  <span className="od-sum-pending">Quotation Pending</span>
                </div>
              )}
            </div>
          </div>

          {/* History */}
          <div className="od-card">
            <div className="od-card-title">Order History</div>
            {order.tracking_history.length === 0 ? (
              <p className="od-empty-text">No tracking history yet</p>
            ) : (
              <div className="od-timeline">
                {order.tracking_history.map((t, i) => (
                  <div key={t.id} className={`od-tl-item ${i === 0 ? 'latest' : ''}`}>
                    <div className="od-tl-dot" />
                    <div className="od-tl-body">
                      <div className="od-tl-stage">{STAGE_LABELS[t.stage] || t.stage}</div>
                      <div className="od-tl-meta">
                        <span>{t.updated_by?.name || 'System'}</span>
                        <span>{new Date(t.timestamp).toLocaleString()}</span>
                      </div>
                      {t.notes && <div className="od-tl-notes">{t.notes}</div>}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Quotation History */}
          {order.quotation_logs.length > 0 && (
            <div className="od-card">
              <div className="od-card-title">Quotation History</div>
              <div className="od-timeline">
                {order.quotation_logs.map(log => (
                  <div key={log.id} className="od-tl-item od-tl-quotation">
                    <div className="od-tl-dot od-tl-dot-wa" />
                    <div className="od-tl-body">
                      <div className="od-tl-stage">Quotation Sent</div>
                      <div className="od-tl-meta">
                        <span>{log.sent_by_name || 'System'}</span>
                        <span>{new Date(log.sent_at).toLocaleString()}</span>
                      </div>
                      <div className="od-tl-tags">
                        <span className="od-tl-tag">{log.method_display}</span>
                        <span className="od-tl-tag-phone">{log.phone_number}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* ── Sidebar ── */}
        <div className="od-sidebar">

          {/* Customer */}
          <div className="od-card">
            <div className="od-card-title">Customer</div>
            <div className="od-customer-hero">
              <div className="od-customer-avatar">
                {order.user.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <div className="od-customer-name">{order.user.name}</div>
                <div className="od-customer-phone">{order.user.phone_number}</div>
              </div>
            </div>
            <div className="od-info-list">
              <div className="od-info-item">
                <span className="od-info-label">Contact</span>
                <span className="od-info-value od-info-mono">{order.phone_number}</span>
              </div>
              <div className="od-info-item">
                <span className="od-info-label">Delivery Address</span>
                <span className="od-info-value">{order.delivery_address}</span>
              </div>
            </div>
          </div>

          {/* Staff Assignment */}
          {user?.role === 'admin' && (
            <div className="od-card">
              <div className="od-card-title">Assign Staff</div>
              <div className="od-assign-row">
                <select
                  className="od-assign-select"
                  value={selectedStaff}
                  onChange={e => setSelectedStaff(parseInt(e.target.value) || '')}
                >
                  <option value="">Unassigned</option>
                  {staff.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
                <button
                  className="od-assign-btn"
                  onClick={handleAssignStaff}
                  disabled={updating || selectedStaff === (order.assigned_to?.id || '')}
                >
                  {updating ? '…' : 'Assign'}
                </button>
              </div>
              {order.assigned_to && (
                <div className="od-assigned-current">
                  Currently: <strong>{order.assigned_to.name}</strong>
                </div>
              )}
            </div>
          )}

          {/* Order Meta */}
          <div className="od-card">
            <div className="od-card-title">Order Details</div>
            <div className="od-info-list">
              <div className="od-info-item">
                <span className="od-info-label">Order ID</span>
                <span className="od-info-value od-info-mono">{order.order_number}</span>
              </div>
              <div className="od-info-item">
                <span className="od-info-label">Created</span>
                <span className="od-info-value">{new Date(order.created_at).toLocaleString()}</span>
              </div>
              <div className="od-info-item">
                <span className="od-info-label">Last Updated</span>
                <span className="od-info-value">{new Date(order.updated_at).toLocaleString()}</span>
              </div>
              <div className="od-info-item">
                <span className="od-info-label">Items</span>
                <span className="od-info-value">{order.order_summary?.total_items || 0} items · {order.order_summary?.unique_products || 0} products</span>
              </div>
            </div>
          </div>

          {/* Quick Quotation */}
          <div className="od-card od-card-wa">
            <div className="od-wa-icon">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
              </svg>
            </div>
            <div className="od-wa-text">Send detailed quotation to customer via WhatsApp</div>
            <button className="od-wa-btn" onClick={handleSendQuotation} disabled={updating}>
              Send via WhatsApp
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetail;
