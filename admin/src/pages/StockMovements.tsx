import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import apiClient from '../utils/api';
import './StockMovements.css';

interface StockMovement {
  id: number;
  variant_id: number;
  product_name: string;
  sku: string;
  color: string;
  material: string;
  movement_type: string;
  movement_type_display: string;
  quantity: number;
  quantity_before: number;
  quantity_after: number;
  cost_price: string | null;
  reference_type: string | null;
  reference_id: number | null;
  notes: string;
  created_by_name: string | null;
  created_at: string;
}

const MOVEMENT_CONFIG: Record<string, { label: string; color: string; sign: string; positive: boolean }> = {
  restock:     { label: 'Restock',     color: 'delta',   sign: '+', positive: true },
  return:      { label: 'Return',      color: 'zeta',    sign: '+', positive: true },
  release:     { label: 'Release',     color: 'alpha',   sign: '+', positive: true },
  sale:        { label: 'Sale',        color: 'gamma',   sign: '−', positive: false },
  reservation: { label: 'Reservation', color: 'beta',    sign: '−', positive: false },
  damage:      { label: 'Damage',      color: 'epsilon', sign: '−', positive: false },
  adjustment:  { label: 'Adjustment',  color: 'eta',     sign: '±', positive: true },
};

const formatDate = (d: string) =>
  new Date(d).toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });

const StockMovements = () => {
  const navigate = useNavigate();
  const [movements, setMovements] = useState<StockMovement[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [dateFilter, setDateFilter] = useState('');

  useEffect(() => { fetchMovements(); }, [searchTerm, typeFilter, dateFilter]);

  const fetchMovements = async () => {
    try {
      setLoading(true);
      const params: Record<string, string> = {};
      if (searchTerm) params.search = searchTerm;
      if (typeFilter) params.movement_type = typeFilter;
      if (dateFilter) params.date = dateFilter;
      const response = await apiClient.get('/inventory/movements/', { params });
      const data = response.data;
      setMovements(Array.isArray(data) ? data : data.results || []);
    } catch (error) {
      console.error('Failed to fetch movements:', error);
      setMovements([]);
    } finally {
      setLoading(false);
    }
  };

  const positiveCount = movements.filter(m => MOVEMENT_CONFIG[m.movement_type]?.positive).length;
  const negativeCount = movements.filter(m => !MOVEMENT_CONFIG[m.movement_type]?.positive).length;

  return (
    <div className="mv-page">
      {/* Header */}
      <div className="mv-header">
        <div className="mv-header-left">
          <button className="mv-btn-back" onClick={() => navigate('/inventory')}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="15 18 9 12 15 6"/>
            </svg>
          </button>
          <div>
            <h1 className="mv-title">Stock Movements</h1>
            <p className="mv-subtitle">Track all inventory changes and transactions</p>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="mv-stats">
        <div className="mv-stat">
          <div className="mv-stat-val">{movements.length}</div>
          <div className="mv-stat-label">Total Records</div>
        </div>
        <div className="mv-stat mv-stat-positive">
          <div className="mv-stat-val">{positiveCount}</div>
          <div className="mv-stat-label">Inbound</div>
        </div>
        <div className="mv-stat mv-stat-negative">
          <div className="mv-stat-val">{negativeCount}</div>
          <div className="mv-stat-label">Outbound</div>
        </div>
      </div>

      {/* Filters */}
      <div className="mv-filters">
        <div className="mv-search-wrap">
          <svg className="mv-search-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          <input className="mv-search" type="text" placeholder="Search by product, SKU, notes…"
            value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
        </div>
        <select className="mv-filter-select" value={typeFilter} onChange={e => setTypeFilter(e.target.value)}>
          <option value="">All Types</option>
          <option value="restock">Restock</option>
          <option value="sale">Sale</option>
          <option value="reservation">Reservation</option>
          <option value="release">Release</option>
          <option value="adjustment">Adjustment</option>
          <option value="damage">Damage</option>
          <option value="return">Return</option>
        </select>
        <input className="mv-filter-date" type="date" value={dateFilter}
          onChange={e => setDateFilter(e.target.value)} />
        {(searchTerm || typeFilter || dateFilter) && (
          <button className="mv-btn-clear" onClick={() => { setSearchTerm(''); setTypeFilter(''); setDateFilter(''); }}>Clear</button>
        )}
      </div>

      {/* Content */}
      {loading ? (
        <div className="mv-loading"><div className="mv-spinner" /><span>Loading…</span></div>
      ) : movements.length === 0 ? (
        <div className="mv-empty">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2">
            <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
          </svg>
          <p>No movements found</p>
        </div>
      ) : (
        <div className="mv-table-wrap">
          <div className="mv-table-header">
            <span>Date & Time</span>
            <span>Product</span>
            <span>SKU</span>
            <span>Variant</span>
            <span>Type</span>
            <span>Qty</span>
            <span>Before → After</span>
            <span>Cost</span>
            <span>By</span>
            <span>Notes</span>
          </div>
          {movements.map(m => {
            const conf = MOVEMENT_CONFIG[m.movement_type] || { label: m.movement_type_display, color: 'zeta', sign: '', positive: true };
            return (
              <div key={m.id} className="mv-table-row">
                <div className="mv-date">{formatDate(m.created_at)}</div>
                <div className="mv-product">{m.product_name}</div>
                <div className="mv-sku">{m.sku}</div>
                <div className="mv-variant">{m.color} / {m.material}</div>
                <div>
                  <span className={`mv-type-badge mv-type-${conf.color}`}>{conf.label}</span>
                </div>
                <div className={`mv-qty ${conf.positive ? 'positive' : 'negative'}`}>
                  {conf.sign}{Math.abs(m.quantity)}
                </div>
                <div className="mv-change">
                  <span className="mv-before">{m.quantity_before}</span>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
                  </svg>
                  <span className="mv-after">{m.quantity_after}</span>
                </div>
                <div className="mv-cost">
                  {m.cost_price ? `₹${parseFloat(m.cost_price).toLocaleString()}` : '—'}
                </div>
                <div className="mv-by">{m.created_by_name || 'System'}</div>
                <div className="mv-notes">{m.notes || '—'}</div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default StockMovements;
