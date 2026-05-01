import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import apiClient, { extractData } from '../utils/api';
import './Orders.css';

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
  };
  created_at: string;
  updated_at: string;
}

interface Staff {
  id: number;
  name: string;
  username: string;
}

const STAGE_META: Record<string, { label: string; cls: string; dot: string }> = {
  order_received: { label: 'Order Received', cls: 'stage-received',   dot: '#3b82f6' },
  processing:     { label: 'Processing',     cls: 'stage-processing', dot: '#fbbf24' },
  shipped:        { label: 'Shipped',        cls: 'stage-shipped',    dot: '#a855f7' },
  delivered:      { label: 'Delivered',      cls: 'stage-delivered',  dot: '#10b981' },
};

const Orders = () => {
  const navigate = useNavigate();
  const [orders, setOrders]           = useState<Order[]>([]);
  const [staff, setStaff]             = useState<Staff[]>([]);
  const [loading, setLoading]         = useState(true);
  const [searchTerm, setSearchTerm]   = useState('');
  const [filterStage, setFilterStage] = useState('');
  const [filterStaff, setFilterStaff] = useState('');
  const [filterStart, setFilterStart] = useState('');
  const [filterEnd, setFilterEnd]     = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages]   = useState(1);
  const [totalCount, setTotalCount]   = useState(0);
  const itemsPerPage = 20;

  const hasFilters = !!(searchTerm || filterStage || filterStaff || filterStart || filterEnd);

  useEffect(() => { fetchStaff(); }, []);
  useEffect(() => { fetchOrders(); }, [searchTerm, filterStage, filterStaff, filterStart, filterEnd, currentPage]);

  const fetchStaff = async () => {
    try {
      const res = await apiClient.get('/staff/');
      setStaff(extractData(res.data));
    } catch {}
  };

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const params: any = { page: currentPage, page_size: itemsPerPage };
      if (searchTerm)  params.search      = searchTerm;
      if (filterStage) params.stage       = filterStage;
      if (filterStaff) params.assigned_to = filterStaff;
      if (filterStart) params.start_date  = filterStart;
      if (filterEnd)   params.end_date    = filterEnd;

      const res = await apiClient.get('/orders/', { params });
      if (res.data.results) {
        setOrders(res.data.results);
        setTotalCount(res.data.count);
        setTotalPages(Math.ceil(res.data.count / itemsPerPage));
      } else {
        const data = extractData(res.data) as Order[];
        setOrders(data);
        setTotalCount(data.length);
        setTotalPages(1);
      }
    } catch {
      alert('Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  const clearFilters = () => {
    setSearchTerm(''); setFilterStage(''); setFilterStaff('');
    setFilterStart(''); setFilterEnd(''); setCurrentPage(1);
  };

  const sendQuotation = (order: Order) => {
    const s = order.order_summary;
    const total = parseFloat(order.total);
    let msg = `🏠 *DRAVOHOME FURNITURE*\n\nHi ${order.user.name}!\n\n`;
    msg += `📋 Order #${order.order_number}\n📅 ${new Date(order.created_at).toLocaleDateString()}\n\n`;
    msg += `🛋️ ${s?.total_items || 0} items (${s?.unique_products || 0} products)\n\n`;
    if (total > 0) {
      msg += `💰 Total: ₹${total.toLocaleString()}\n`;
      if (s?.total_mrp && s.total_mrp > total)
        msg += `💚 You Save: ₹${(s.total_mrp - total).toLocaleString()}\n`;
    } else {
      msg += `💰 Total: As per discussion\n`;
    }
    msg += `\n📞 Reply or call us for details.\nThank you for choosing DravoHome! 🙏`;
    window.open(`https://wa.me/${order.phone_number.replace(/[^\d+]/g, '')}?text=${encodeURIComponent(msg)}`, '_blank');
  };

  const fmt = (d: string) => {
    const dt = new Date(d);
    return {
      date: dt.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }),
      time: dt.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
    };
  };

  return (
    <div className="orders-page animate-fadeIn">

      {/* ── Header ── */}
      <div className="orders-header">
        <div className="orders-header-left">
          <h1 className="orders-title">Orders</h1>
          <span className="orders-count">{totalCount.toLocaleString()} total</span>
        </div>
      </div>

      {/* ── Filters ── */}
      <div className="orders-filters">
        {/* Search */}
        <div className="filter-search-wrap">
          <svg className="filter-search-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          <input
            type="text"
            className="filter-search"
            placeholder="Search order or customer…"
            value={searchTerm}
            onChange={e => { setSearchTerm(e.target.value); setCurrentPage(1); }}
          />
        </div>

        {/* Stage */}
        <div className="filter-select-wrap">
          <select className="filter-select" value={filterStage} onChange={e => { setFilterStage(e.target.value); setCurrentPage(1); }}>
            <option value="">All Stages</option>
            <option value="order_received">Order Received</option>
            <option value="processing">Processing</option>
            <option value="shipped">Shipped</option>
            <option value="delivered">Delivered</option>
          </select>
        </div>

        {/* Staff */}
        <div className="filter-select-wrap">
          <select className="filter-select" value={filterStaff} onChange={e => { setFilterStaff(e.target.value); setCurrentPage(1); }}>
            <option value="">All Staff</option>
            <option value="unassigned">Unassigned</option>
            {staff.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
        </div>

        {/* Dates */}
        <div className="filter-date-group">
          <span className="filter-date-label">From</span>
          <input type="date" className="filter-date" value={filterStart} onChange={e => { setFilterStart(e.target.value); setCurrentPage(1); }} />
          <span className="filter-date-label">To</span>
          <input type="date" className="filter-date" value={filterEnd} onChange={e => { setFilterEnd(e.target.value); setCurrentPage(1); }} />
        </div>

        {hasFilters && (
          <button className="filter-clear" onClick={clearFilters}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
            Clear
          </button>
        )}
      </div>

      {/* ── Table ── */}
      <div className="orders-table-wrap">
        {loading ? (
          <div className="orders-loading">
            <div className="orders-loading-spinner" />
            <span>Loading orders…</span>
          </div>
        ) : orders.length === 0 ? (
          <div className="orders-empty">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2">
              <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2"/>
              <rect x="9" y="3" width="6" height="4" rx="1"/>
            </svg>
            <p>No orders found</p>
            {hasFilters && <button className="filter-clear" onClick={clearFilters}>Clear filters</button>}
          </div>
        ) : (
          <table className="orders-table">
            <thead>
              <tr>
                <th>Order</th>
                <th>Customer</th>
                <th>Items</th>
                <th>Total</th>
                <th>Status</th>
                <th>Assigned</th>
                <th>Date</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {orders.map(order => {
                const meta  = STAGE_META[order.stage] || STAGE_META.order_received;
                const total = parseFloat(order.total);
                const s     = order.order_summary;
                const d     = fmt(order.created_at);

                return (
                  <tr key={order.id} className="orders-row" onClick={() => navigate(`/orders/${order.order_number}`)}>
                    {/* Order # */}
                    <td>
                      <span className="cell-order-num">{order.order_number}</span>
                    </td>

                    {/* Customer */}
                    <td>
                      <div className="cell-customer">
                        <div className="cell-customer-avatar">
                          {order.user.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className="cell-customer-name">{order.user.name}</div>
                          <div className="cell-customer-phone">{order.user.phone_number}</div>
                        </div>
                      </div>
                    </td>

                    {/* Items */}
                    <td>
                      <div className="cell-items">
                        <span className="cell-items-count">{s?.total_items || 0}</span>
                        <span className="cell-items-label">items</span>
                      </div>
                    </td>

                    {/* Total */}
                    <td>
                      <div className="cell-total">
                        <span className="cell-total-value">
                          {total > 0 ? `₹${total.toLocaleString('en-IN')}` : '—'}
                        </span>
                        {s?.has_offers && (
                          <span className="cell-total-offer">
                            {s.active_offers_count} offer{s.active_offers_count > 1 ? 's' : ''}
                          </span>
                        )}
                        {s?.total_mrp_savings > 0 && (
                          <span className="cell-total-saved">
                            −₹{s.total_mrp_savings.toLocaleString('en-IN')}
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Status */}
                    <td>
                      <span className={`cell-stage ${meta.cls}`}>
                        <span className="cell-stage-dot" style={{ background: meta.dot }} />
                        {meta.label}
                      </span>
                    </td>

                    {/* Assigned */}
                    <td>
                      <span className="cell-assigned">
                        {order.assigned_to ? order.assigned_to.name : <span className="cell-unassigned">Unassigned</span>}
                      </span>
                    </td>

                    {/* Date */}
                    <td>
                      <div className="cell-date">
                        <span className="cell-date-day">{d.date}</span>
                        <span className="cell-date-time">{d.time}</span>
                      </div>
                    </td>

                    {/* Actions */}
                    <td onClick={e => e.stopPropagation()}>
                      <div className="cell-actions">
                        <button className="cell-btn-view" onClick={() => navigate(`/orders/${order.order_number}`)}>
                          View
                        </button>
                        <button
                          className="cell-btn-wa"
                          title="Send WhatsApp quotation"
                          onClick={() => sendQuotation(order)}
                        >
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* ── Pagination ── */}
      {totalPages > 1 && (
        <div className="orders-pagination">
          <button
            className="pag-btn"
            onClick={() => setCurrentPage(p => p - 1)}
            disabled={currentPage === 1}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="15 18 9 12 15 6"/>
            </svg>
            Prev
          </button>
          <div className="pag-pages">
            {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
              const page = totalPages <= 7 ? i + 1
                : currentPage <= 4 ? i + 1
                : currentPage >= totalPages - 3 ? totalPages - 6 + i
                : currentPage - 3 + i;
              return (
                <button
                  key={page}
                  className={`pag-page ${page === currentPage ? 'active' : ''}`}
                  onClick={() => setCurrentPage(page)}
                >
                  {page}
                </button>
              );
            })}
          </div>
          <button
            className="pag-btn"
            onClick={() => setCurrentPage(p => p + 1)}
            disabled={currentPage === totalPages}
          >
            Next
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="9 18 15 12 9 6"/>
            </svg>
          </button>
        </div>
      )}
    </div>
  );
};

export default Orders;
