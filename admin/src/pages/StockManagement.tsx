import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import apiClient from '../utils/api';
import './StockManagement.css';

interface ProductVariant {
  id: number;
  product_name: string;
  product_slug: string;
  category_name: string;
  subcategory_name: string;
  brand_name: string | null;
  color: string;
  material: string;
  sku: string;
  mrp: string;
  price: string;
  cost_price: string | null;
  stock_quantity: number;
  reserved_quantity: number;
  available_quantity: number;
  low_stock_threshold: number;
  reorder_point: number;
  reorder_quantity: number;
  last_restocked: string | null;
  is_in_stock: boolean;
  is_low_stock: boolean;
  is_out_of_stock: boolean;
  stock_status: string;
  stock_status_display: string;
  inventory_value: number | null;
  retail_value: number;
}

interface AdjustmentData {
  variant_id: number;
  adjustment_type: 'restock' | 'adjustment' | 'damage' | 'return';
  quantity: number;
  cost_price?: number;
  notes: string;
}

const ADJUSTMENT_TYPES = [
  { value: 'restock', label: 'Restock', desc: 'Add incoming stock', color: 'delta', sign: '+' },
  { value: 'return', label: 'Return', desc: 'Customer return', color: 'zeta', sign: '+' },
  { value: 'adjustment', label: 'Adjustment', desc: 'Manual correction', color: 'gamma', sign: '±' },
  { value: 'damage', label: 'Damage / Loss', desc: 'Remove damaged stock', color: 'epsilon', sign: '-' },
];

const StockManagement = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [variants, setVariants] = useState<ProductVariant[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [stockFilter, setStockFilter] = useState('');
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null);
  const [adjustData, setAdjustData] = useState<AdjustmentData>({
    variant_id: 0, adjustment_type: 'restock', quantity: 0, notes: '',
  });
  const [adjusting, setAdjusting] = useState(false);

  useEffect(() => { fetchInventory(); }, [searchTerm, stockFilter]);

  useEffect(() => {
    const variantId = searchParams.get('variant');
    if (variantId && variants.length > 0) {
      const v = variants.find(x => x.id === parseInt(variantId));
      if (v) openAdjustPanel(v);
    }
  }, [variants, searchParams]);

  const fetchInventory = async () => {
    try {
      setLoading(true);
      const params: Record<string, string> = {};
      if (searchTerm) params.search = searchTerm;
      if (stockFilter) params.stock_status = stockFilter;
      const response = await apiClient.get('/inventory/', { params });
      const data = response.data;
      setVariants(Array.isArray(data) ? data : data.results || []);
    } catch (error) {
      console.error('Failed to fetch inventory:', error);
      setVariants([]);
    } finally {
      setLoading(false);
    }
  };

  const openAdjustPanel = (variant: ProductVariant) => {
    setSelectedVariant(variant);
    setAdjustData({
      variant_id: variant.id,
      adjustment_type: 'restock',
      quantity: variant.reorder_quantity || 1,
      cost_price: variant.cost_price ? parseFloat(variant.cost_price) : undefined,
      notes: '',
    });
    setIsPanelOpen(true);
  };

  const handleAdjust = async () => {
    if (!selectedVariant || adjustData.quantity <= 0) return;
    setAdjusting(true);
    try {
      await apiClient.post('/inventory/adjust/', adjustData);
      setIsPanelOpen(false);
      fetchInventory();
    } catch (error: any) {
      alert(error.response?.data?.error?.message || 'Failed to adjust stock');
    } finally {
      setAdjusting(false);
    }
  };

  const getNewStock = () => {
    if (!selectedVariant) return 0;
    const qty = adjustData.quantity;
    if (adjustData.adjustment_type === 'damage') return selectedVariant.stock_quantity - qty;
    return selectedVariant.stock_quantity + qty;
  };

  const inStock = variants.filter(v => v.is_in_stock && !v.is_low_stock).length;
  const lowStock = variants.filter(v => v.is_low_stock).length;
  const outOfStock = variants.filter(v => v.is_out_of_stock).length;

  return (
    <div className="sm-page">
      {/* Header */}
      <div className="sm-header">
        <div className="sm-header-left">
          <button className="sm-btn-back" onClick={() => navigate('/inventory')}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="15 18 9 12 15 6"/>
            </svg>
          </button>
          <div>
            <h1 className="sm-title">Stock Management</h1>
            <p className="sm-subtitle">Adjust inventory levels and track stock</p>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="sm-stats">
        <div className="sm-stat">
          <div className="sm-stat-val">{variants.length}</div>
          <div className="sm-stat-label">Total Variants</div>
        </div>
        <div className="sm-stat sm-stat-good">
          <div className="sm-stat-val">{inStock}</div>
          <div className="sm-stat-label">In Stock</div>
        </div>
        <div className="sm-stat sm-stat-warn">
          <div className="sm-stat-val">{lowStock}</div>
          <div className="sm-stat-label">Low Stock</div>
        </div>
        <div className="sm-stat sm-stat-danger">
          <div className="sm-stat-val">{outOfStock}</div>
          <div className="sm-stat-label">Out of Stock</div>
        </div>
      </div>

      {/* Filters */}
      <div className="sm-filters">
        <div className="sm-search-wrap">
          <svg className="sm-search-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          <input className="sm-search" type="text" placeholder="Search by product, SKU, color, material…"
            value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
        </div>
        <select className="sm-filter-select" value={stockFilter} onChange={e => setStockFilter(e.target.value)}>
          <option value="">All Status</option>
          <option value="in_stock">In Stock</option>
          <option value="low_stock">Low Stock</option>
          <option value="out_of_stock">Out of Stock</option>
        </select>
        {(searchTerm || stockFilter) && (
          <button className="sm-btn-clear" onClick={() => { setSearchTerm(''); setStockFilter(''); }}>Clear</button>
        )}
      </div>

      {/* Table */}
      {loading ? (
        <div className="sm-loading"><div className="sm-spinner" /><span>Loading…</span></div>
      ) : variants.length === 0 ? (
        <div className="sm-empty">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2">
            <path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z"/>
          </svg>
          <p>No inventory items found</p>
        </div>
      ) : (
        <div className="sm-table-wrap">
          <div className="sm-table-header">
            <span>Product</span>
            <span>SKU</span>
            <span>Variant</span>
            <span>Stock</span>
            <span>Reserved</span>
            <span>Available</span>
            <span>Status</span>
            <span>Value</span>
            <span>Action</span>
          </div>
          {variants.map(v => (
            <div key={v.id} className={`sm-table-row ${v.is_out_of_stock ? 'out' : v.is_low_stock ? 'low' : ''}`}>
              <div className="sm-product-cell">
                <div className="sm-product-name">{v.product_name}</div>
                <div className="sm-product-cat">{v.category_name}</div>
              </div>
              <div className="sm-sku">{v.sku}</div>
              <div className="sm-variant-cell">
                <div className="sm-variant-color">{v.color}</div>
                <div className="sm-variant-mat">{v.material}</div>
              </div>
              <div className="sm-qty">{v.stock_quantity}</div>
              <div className="sm-qty sm-qty-reserved">{v.reserved_quantity}</div>
              <div className="sm-qty sm-qty-available"><strong>{v.available_quantity}</strong></div>
              <div>
                {v.is_out_of_stock ? (
                  <span className="sm-stock-badge out">Out of Stock</span>
                ) : v.is_low_stock ? (
                  <span className="sm-stock-badge low">Low Stock</span>
                ) : (
                  <span className="sm-stock-badge in">In Stock</span>
                )}
              </div>
              <div className="sm-value-cell">
                {v.inventory_value != null && (
                  <div className="sm-cost-val">₹{v.inventory_value.toLocaleString()}</div>
                )}
                <div className="sm-retail-val">₹{v.retail_value.toLocaleString()}</div>
              </div>
              <div>
                <button className="sm-btn-adjust" onClick={() => openAdjustPanel(v)}>Adjust</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Adjust Panel */}
      {isPanelOpen && selectedVariant && (
        <div className="sm-overlay" onClick={e => { if (e.target === e.currentTarget) setIsPanelOpen(false); }}>
          <div className="sm-panel">
            <div className="sm-panel-header">
              <h2 className="sm-panel-title">Adjust Stock</h2>
              <button className="sm-panel-close" onClick={() => setIsPanelOpen(false)}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            </div>
            <div className="sm-panel-body">

              {/* Variant Summary */}
              <div className="sm-variant-summary">
                <div className="sm-vs-name">{selectedVariant.product_name}</div>
                <div className="sm-vs-meta">{selectedVariant.color} · {selectedVariant.material}</div>
                <div className="sm-vs-sku">SKU: {selectedVariant.sku}</div>
                <div className="sm-vs-stock">
                  <div className="sm-vs-stock-item">
                    <span className="sm-vs-stock-val">{selectedVariant.stock_quantity}</span>
                    <span className="sm-vs-stock-label">Total</span>
                  </div>
                  <div className="sm-vs-stock-divider" />
                  <div className="sm-vs-stock-item">
                    <span className="sm-vs-stock-val sm-reserved">{selectedVariant.reserved_quantity}</span>
                    <span className="sm-vs-stock-label">Reserved</span>
                  </div>
                  <div className="sm-vs-stock-divider" />
                  <div className="sm-vs-stock-item">
                    <span className="sm-vs-stock-val sm-available">{selectedVariant.available_quantity}</span>
                    <span className="sm-vs-stock-label">Available</span>
                  </div>
                </div>
              </div>

              {/* Adjustment Type */}
              <div className="sm-form-section">
                <div className="sm-form-section-title">Adjustment Type</div>
                <div className="sm-adj-types">
                  {ADJUSTMENT_TYPES.map(t => (
                    <div key={t.value}
                      className={`sm-adj-type ${adjustData.adjustment_type === t.value ? 'selected' : ''} sm-adj-${t.color}`}
                      onClick={() => setAdjustData({ ...adjustData, adjustment_type: t.value as any })}>
                      <div className="sm-adj-sign">{t.sign}</div>
                      <div className="sm-adj-label">{t.label}</div>
                      <div className="sm-adj-desc">{t.desc}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Quantity */}
              <div className="sm-form-section">
                <div className="sm-form-section-title">Quantity</div>
                <div className="sm-qty-input-wrap">
                  <button type="button" className="sm-qty-btn"
                    onClick={() => setAdjustData({ ...adjustData, quantity: Math.max(1, adjustData.quantity - 1) })}>−</button>
                  <input className="sm-qty-input" type="number" min="1"
                    value={adjustData.quantity}
                    onChange={e => setAdjustData({ ...adjustData, quantity: parseInt(e.target.value) || 0 })} />
                  <button type="button" className="sm-qty-btn"
                    onClick={() => setAdjustData({ ...adjustData, quantity: adjustData.quantity + 1 })}>+</button>
                </div>
                <div className="sm-preview">
                  <span>New stock after adjustment:</span>
                  <strong className={getNewStock() < 0 ? 'negative' : ''}>{Math.max(0, getNewStock())} units</strong>
                </div>
              </div>

              {/* Cost Price (restock only) */}
              {adjustData.adjustment_type === 'restock' && (
                <div className="sm-form-section">
                  <div className="sm-form-section-title">Cost Price (Optional)</div>
                  <input className="sm-form-input" type="number" step="0.01" placeholder="₹ per unit"
                    value={adjustData.cost_price || ''}
                    onChange={e => setAdjustData({ ...adjustData, cost_price: parseFloat(e.target.value) || undefined })} />
                </div>
              )}

              {/* Notes */}
              <div className="sm-form-section">
                <div className="sm-form-section-title">Notes</div>
                <textarea className="sm-form-textarea" rows={3} placeholder="Reason for adjustment…"
                  value={adjustData.notes}
                  onChange={e => setAdjustData({ ...adjustData, notes: e.target.value })} />
              </div>

            </div>
            <div className="sm-panel-footer">
              <button className="sm-btn-cancel" onClick={() => setIsPanelOpen(false)} disabled={adjusting}>Cancel</button>
              <button className="sm-btn-confirm" onClick={handleAdjust} disabled={adjusting || adjustData.quantity <= 0}>
                {adjusting ? 'Adjusting…' : 'Confirm Adjustment'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StockManagement;
