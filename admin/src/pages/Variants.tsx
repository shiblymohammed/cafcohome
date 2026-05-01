import { useState, useEffect } from 'react';
import apiClient, { extractData } from '../utils/api';
import CustomSelect from '../components/CustomSelect';
import './Variants.css';

interface Product {
  id: number;
  name: string;
}

interface Variant {
  id: number;
  product: number;
  product_name: string;
  color: string;
  material: string;
  sku: string;
  mrp: string;
  price: string;
  stock_quantity: number;
  low_stock_threshold: number;
  images: Array<{ url: string; alt: string; order: number }>;
  is_active: boolean;
  is_default: boolean;
  is_in_stock: boolean;
  is_low_stock: boolean;
  discount_percentage: string;
}

interface VariantFormData {
  product: number | '';
  color: string;
  material: string;
  mrp: string;
  price: string;
  stock_quantity: number;
  low_stock_threshold: number;
  is_active: boolean;
  is_default: boolean;
}

const Toggle = ({ checked, onChange, label, desc }: { checked: boolean; onChange: (v: boolean) => void; label: string; desc?: string }) => (
  <div className="vr-toggle-row">
    <div className="vr-toggle-info">
      <span className="vr-toggle-label">{label}</span>
      {desc && <span className="vr-toggle-desc">{desc}</span>}
    </div>
    <label className="vr-toggle">
      <input type="checkbox" className="vr-toggle-input" checked={checked} onChange={e => onChange(e.target.checked)} />
      <span className="vr-toggle-slider" />
    </label>
  </div>
);

const EMPTY_FORM: VariantFormData = {
  product: '', color: '', material: '', mrp: '', price: '',
  stock_quantity: 0, low_stock_threshold: 5, is_active: true, is_default: false,
};

const Variants = () => {
  const [variants, setVariants] = useState<Variant[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [productFilter, setProductFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [editingVariant, setEditingVariant] = useState<Variant | null>(null);
  const [formData, setFormData] = useState<VariantFormData>(EMPTY_FORM);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => { fetchVariants(); fetchProducts(); }, []);

  const fetchVariants = async () => {
    try {
      setLoading(true);
      const res = await apiClient.get('/variants/');
      setVariants(extractData<Variant>(res.data));
    } catch { setVariants([]); }
    finally { setLoading(false); }
  };

  const fetchProducts = async () => {
    try {
      const res = await apiClient.get('/products/');
      setProducts(extractData<Product>(res.data));
    } catch { console.error('Failed to fetch products'); }
  };

  const handleAdd = () => {
    setEditingVariant(null); setFormData(EMPTY_FORM); setFormErrors({}); setIsPanelOpen(true);
  };

  const handleEdit = (v: Variant) => {
    setEditingVariant(v);
    setFormData({ product: v.product, color: v.color, material: v.material, mrp: v.mrp, price: v.price, stock_quantity: v.stock_quantity, low_stock_threshold: v.low_stock_threshold, is_active: v.is_active, is_default: v.is_default });
    setFormErrors({}); setIsPanelOpen(true);
  };

  const handleDelete = async (v: Variant) => {
    if (!window.confirm(`Delete variant "${v.sku}"?`)) return;
    try { await apiClient.delete(`/variants/${v.id}/`); fetchVariants(); }
    catch { alert('Failed to delete variant'); }
  };

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};
    if (!formData.product) errors.product = 'Product is required';
    if (!formData.color.trim()) errors.color = 'Color is required';
    if (!formData.material.trim()) errors.material = 'Material is required';
    if (!formData.mrp) errors.mrp = 'MRP is required';
    if (!formData.price) errors.price = 'Price is required';
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    setSubmitting(true);
    try {
      if (editingVariant) await apiClient.put(`/variants/${editingVariant.id}/`, formData);
      else await apiClient.post('/variants/', formData);
      setIsPanelOpen(false); fetchVariants();
    } catch (err: any) {
      if (err.response?.data) setFormErrors(err.response.data);
      else alert('Failed to save variant');
    } finally { setSubmitting(false); }
  };

  const total = variants.length;
  const activeCount = variants.filter(v => v.is_active).length;
  const lowStockCount = variants.filter(v => v.is_low_stock && v.is_in_stock).length;
  const outOfStockCount = variants.filter(v => !v.is_in_stock).length;

  const filtered = variants.filter(v => {
    const q = searchTerm.toLowerCase();
    const matchSearch = !q || v.product_name.toLowerCase().includes(q) || v.sku.toLowerCase().includes(q) || v.color.toLowerCase().includes(q) || v.material.toLowerCase().includes(q);
    const matchProduct = !productFilter || String(v.product) === productFilter;
    const matchStatus = !statusFilter || (statusFilter === 'active' && v.is_active) || (statusFilter === 'inactive' && !v.is_active) || (statusFilter === 'low_stock' && v.is_low_stock) || (statusFilter === 'out_of_stock' && !v.is_in_stock);
    return matchSearch && matchProduct && matchStatus;
  });

  const stockCell = (v: Variant) => {
    if (!v.is_in_stock) return <span className="vr-stock vr-stock-out">{v.stock_quantity}</span>;
    if (v.is_low_stock) return <span className="vr-stock vr-stock-low">{v.stock_quantity}</span>;
    return <span className="vr-stock vr-stock-ok">{v.stock_quantity}</span>;
  };

  return (
    <div className="vr-page">
      <div className="vr-header">
        <div className="vr-header-left">
          <h1 className="vr-title">Variants</h1>
          <span className="vr-count">{total}</span>
        </div>
        <button className="vr-btn-add" onClick={handleAdd}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
          Add Variant
        </button>
      </div>

      <div className="vr-stats">
        <div className="vr-stat"><span className="vr-stat-value">{total}</span><span className="vr-stat-label">Total</span></div>
        <div className="vr-stat"><span className="vr-stat-value vr-stat-active">{activeCount}</span><span className="vr-stat-label">Active</span></div>
        <div className="vr-stat"><span className="vr-stat-value vr-stat-low">{lowStockCount}</span><span className="vr-stat-label">Low Stock</span></div>
        <div className="vr-stat"><span className="vr-stat-value vr-stat-out">{outOfStockCount}</span><span className="vr-stat-label">Out of Stock</span></div>
      </div>

      <div className="vr-filters">
        <div className="vr-search-wrap">
          <svg className="vr-search-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          <input className="vr-search" type="text" placeholder="Search by product, SKU, color, material…" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
        </div>
        <select className="vr-filter-select" value={productFilter} onChange={e => setProductFilter(e.target.value)}>
          <option value="">All Products</option>
          {products.map(p => <option key={p.id} value={String(p.id)}>{p.name}</option>)}
        </select>
        <select className="vr-filter-select" value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
          <option value="">All Status</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
          <option value="low_stock">Low Stock</option>
          <option value="out_of_stock">Out of Stock</option>
        </select>
      </div>

      {loading ? (
        <div className="vr-loading"><div className="vr-spinner" /><span>Loading…</span></div>
      ) : filtered.length === 0 ? (
        <div className="vr-empty">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2">
            <path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z"/>
          </svg>
          <p>No variants found</p>
          <button className="vr-btn-add" onClick={handleAdd}>Create first variant</button>
        </div>
      ) : (
        <div className="vr-list">
          <div className="vr-list-header">
            <span>SKU</span><span>Product</span><span>Color</span><span>Material</span>
            <span>Price</span><span>Stock</span><span>Status</span><span>Actions</span>
          </div>
          {filtered.map(v => (
            <div key={v.id} className="vr-list-row">
              <div className="vr-sku">{v.sku}</div>
              <div className="vr-product-name">{v.product_name}</div>
              <div className="vr-cell">{v.color || '—'}</div>
              <div className="vr-cell">{v.material || '—'}</div>
              <div className="vr-cell">
                <span className="vr-price">₹{parseFloat(v.price).toLocaleString('en-IN')}</span>
                {parseFloat(v.discount_percentage) > 0 && <span className="vr-discount">{Math.round(parseFloat(v.discount_percentage))}% off</span>}
              </div>
              <div className="vr-cell">{stockCell(v)}</div>
              <div className="vr-cell">
                <span className={`vr-badge ${v.is_active ? 'vr-badge-active' : 'vr-badge-inactive'}`}>{v.is_active ? 'Active' : 'Inactive'}</span>
                {v.is_default && <span className="vr-badge vr-badge-default">Default</span>}
              </div>
              <div className="vr-list-actions">
                <button className="vr-btn-edit" onClick={() => handleEdit(v)}>Edit</button>
                <button className="vr-btn-delete" onClick={() => handleDelete(v)}>Delete</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {isPanelOpen && (
        <div className="vr-overlay" onClick={e => { if (e.target === e.currentTarget) setIsPanelOpen(false); }}>
          <div className="vr-panel">
            <div className="vr-panel-header">
              <h2 className="vr-panel-title">{editingVariant ? 'Edit Variant' : 'New Variant'}</h2>
              <button className="vr-panel-close" onClick={() => setIsPanelOpen(false)}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            </div>
            <form onSubmit={handleSubmit} style={{ display: 'contents' }}>
              <div className="vr-panel-body">
                {editingVariant && (
                  <div className="vr-form-section">
                    <div className="vr-form-section-title">Identifier</div>
                    <div className="vr-form-group">
                      <label className="vr-form-label">SKU</label>
                      <input className="vr-form-input vr-form-input-readonly" type="text" value={editingVariant.sku} readOnly />
                      <span className="vr-form-hint">Auto-generated, cannot be changed</span>
                    </div>
                  </div>
                )}
                <div className="vr-form-section">
                  <div className="vr-form-section-title">Product &amp; Attributes</div>
                  <div className="vr-form-group">
                    <label className="vr-form-label">Product <span>*</span></label>
                    <CustomSelect value={formData.product} onChange={val => setFormData({ ...formData, product: val as number })}
                      options={products.map(p => ({ value: p.id, label: p.name }))}
                      placeholder="Select product…" disabled={!!editingVariant} error={!!formErrors.product} />
                    {formErrors.product && <span className="vr-form-error">{formErrors.product}</span>}
                  </div>
                  <div className="vr-form-row">
                    <div className="vr-form-group">
                      <label className="vr-form-label">Color <span>*</span></label>
                      <input className={`vr-form-input ${formErrors.color ? 'error' : ''}`} type="text" placeholder="e.g. Navy Blue" value={formData.color} onChange={e => setFormData({ ...formData, color: e.target.value })} />
                      {formErrors.color && <span className="vr-form-error">{formErrors.color}</span>}
                    </div>
                    <div className="vr-form-group">
                      <label className="vr-form-label">Material <span>*</span></label>
                      <input className={`vr-form-input ${formErrors.material ? 'error' : ''}`} type="text" placeholder="e.g. Velvet" value={formData.material} onChange={e => setFormData({ ...formData, material: e.target.value })} />
                      {formErrors.material && <span className="vr-form-error">{formErrors.material}</span>}
                    </div>
                  </div>
                </div>
                <div className="vr-form-section">
                  <div className="vr-form-section-title">Pricing</div>
                  <div className="vr-form-row">
                    <div className="vr-form-group">
                      <label className="vr-form-label">MRP <span>*</span></label>
                      <div className="vr-input-prefix-wrap">
                        <span className="vr-input-prefix">₹</span>
                        <input className={`vr-form-input vr-form-input-prefixed ${formErrors.mrp ? 'error' : ''}`} type="number" step="0.01" min="0" placeholder="0.00" value={formData.mrp} onChange={e => setFormData({ ...formData, mrp: e.target.value })} />
                      </div>
                      {formErrors.mrp && <span className="vr-form-error">{formErrors.mrp}</span>}
                    </div>
                    <div className="vr-form-group">
                      <label className="vr-form-label">Selling Price <span>*</span></label>
                      <div className="vr-input-prefix-wrap">
                        <span className="vr-input-prefix">₹</span>
                        <input className={`vr-form-input vr-form-input-prefixed ${formErrors.price ? 'error' : ''}`} type="number" step="0.01" min="0" placeholder="0.00" value={formData.price} onChange={e => setFormData({ ...formData, price: e.target.value })} />
                      </div>
                      {formErrors.price && <span className="vr-form-error">{formErrors.price}</span>}
                    </div>
                  </div>
                </div>
                <div className="vr-form-section">
                  <div className="vr-form-section-title">Stock</div>
                  <div className="vr-form-row">
                    <div className="vr-form-group">
                      <label className="vr-form-label">Quantity</label>
                      <input className="vr-form-input" type="number" min="0" value={formData.stock_quantity} onChange={e => setFormData({ ...formData, stock_quantity: parseInt(e.target.value) || 0 })} />
                    </div>
                    <div className="vr-form-group">
                      <label className="vr-form-label">Low Stock Threshold</label>
                      <input className="vr-form-input" type="number" min="0" value={formData.low_stock_threshold} onChange={e => setFormData({ ...formData, low_stock_threshold: parseInt(e.target.value) || 0 })} />
                    </div>
                  </div>
                </div>
                <div className="vr-form-section">
                  <div className="vr-form-section-title">Settings</div>
                  <Toggle checked={formData.is_active} onChange={v => setFormData({ ...formData, is_active: v })} label="Active" desc="Visible to customers on the website" />
                  <Toggle checked={formData.is_default} onChange={v => setFormData({ ...formData, is_default: v })} label="Default Variant" desc="Shown first when viewing the product" />
                </div>
              </div>
              <div className="vr-panel-footer">
                <button type="button" className="vr-btn-cancel" onClick={() => setIsPanelOpen(false)} disabled={submitting}>Cancel</button>
                <button type="submit" className="vr-btn-save" disabled={submitting}>
                  {submitting ? 'Saving…' : editingVariant ? 'Update Variant' : 'Create Variant'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Variants;
