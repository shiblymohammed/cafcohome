import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import apiClient, { extractData } from '../utils/api';
import './Products.css';

interface Category {
  id: number;
  name: string;
}

interface Subcategory {
  id: number;
  name: string;
  category: number;
}

interface ProductVariant {
  id: number;
  color: string;
  material: string;
  sku: string;
  mrp: string;
  price: string;
  stock_quantity: number;
  images: Array<{ url: string; alt: string; order: number }>;
}

interface Product {
  id: number;
  name: string;
  slug: string;
  description: string;
  category: number;
  category_name: string;
  subcategory: number;
  subcategory_name: string;
  brand: number | null;
  brand_name: string | null;
  is_bestseller: boolean;
  is_hot_selling: boolean;
  is_active: boolean;
  variants?: ProductVariant[];
}

const getPriceRange = (variants?: ProductVariant[]) => {
  if (!variants || variants.length === 0) return 'N/A';
  const prices = variants.map(v => parseFloat(v.price));
  const min = Math.min(...prices);
  const max = Math.max(...prices);
  if (min === max) return `₹${min.toLocaleString()}`;
  return `₹${min.toLocaleString()} – ₹${max.toLocaleString()}`;
};

const getTotalStock = (variants?: ProductVariant[]) =>
  variants?.reduce((s, v) => s + v.stock_quantity, 0) ?? 0;

const getFirstImage = (variants?: ProductVariant[]) =>
  variants?.[0]?.images?.[0]?.url || '';

const Products = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [subcategories, setSubcategories] = useState<Subcategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [filterSubcategory, setFilterSubcategory] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  useEffect(() => {
    fetchCategories();
    fetchSubcategories();
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [searchTerm, filterCategory, filterSubcategory, filterStatus]);

  const fetchCategories = async () => {
    try {
      const res = await apiClient.get('/categories/');
      setCategories(extractData(res.data));
    } catch (e) { console.error(e); }
  };

  const fetchSubcategories = async () => {
    try {
      const res = await apiClient.get('/subcategories/');
      setSubcategories(extractData(res.data));
    } catch (e) { console.error(e); }
  };

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const params: Record<string, string> = {};
      if (searchTerm) params.search = searchTerm;
      if (filterCategory) params.category = filterCategory;
      if (filterSubcategory) params.subcategory = filterSubcategory;
      if (filterStatus) params.is_active = filterStatus;
      const res = await apiClient.get('/products/', { params });
      setProducts(extractData(res.data));
    } catch (e) {
      console.error('Failed to fetch products:', e);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (product: Product, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!window.confirm(`Delete "${product.name}"?`)) return;
    try {
      await apiClient.delete(`/products/${product.slug}/`);
      fetchProducts();
    } catch (err) {
      console.error(err);
      alert('Failed to delete product');
    }
  };

  const filteredSubs = subcategories.filter(
    s => !filterCategory || s.category === parseInt(filterCategory)
  );

  const activeCount = products.filter(p => p.is_active).length;
  const inactiveCount = products.filter(p => !p.is_active).length;

  return (
    <div className="pr-page">
      {/* Header */}
      <div className="pr-header">
        <div className="pr-header-left">
          <h1 className="pr-title">Products</h1>
          <span className="pr-count">{products.length}</span>
        </div>
        <div className="pr-header-actions">
          <div className="pr-view-toggle">
            <button className={`pr-view-btn ${viewMode === 'grid' ? 'active' : ''}`} onClick={() => setViewMode('grid')} title="Grid view">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
                <rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>
              </svg>
            </button>
            <button className={`pr-view-btn ${viewMode === 'list' ? 'active' : ''}`} onClick={() => setViewMode('list')} title="List view">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/>
                <line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/>
                <line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/>
              </svg>
            </button>
          </div>
          <button className="pr-btn-add" onClick={() => navigate('/products/add')}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
            Add Product
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="pr-stats">
        <div className="pr-stat">
          <div className="pr-stat-val">{products.length}</div>
          <div className="pr-stat-label">Total</div>
        </div>
        <div className="pr-stat pr-stat-active">
          <div className="pr-stat-val">{activeCount}</div>
          <div className="pr-stat-label">Active</div>
        </div>
        <div className="pr-stat pr-stat-inactive">
          <div className="pr-stat-val">{inactiveCount}</div>
          <div className="pr-stat-label">Inactive</div>
        </div>
        <div className="pr-stat pr-stat-variants">
          <div className="pr-stat-val">{products.reduce((s, p) => s + (p.variants?.length || 0), 0)}</div>
          <div className="pr-stat-label">Variants</div>
        </div>
      </div>

      {/* Filters */}
      <div className="pr-filters">
        <div className="pr-search-wrap">
          <svg className="pr-search-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          <input className="pr-search" type="text" placeholder="Search products…"
            value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
        </div>
        <select className="pr-filter-select" value={filterCategory}
          onChange={e => { setFilterCategory(e.target.value); setFilterSubcategory(''); }}>
          <option value="">All Categories</option>
          {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
        <select className="pr-filter-select" value={filterSubcategory}
          onChange={e => setFilterSubcategory(e.target.value)}>
          <option value="">All Subcategories</option>
          {filteredSubs.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
        </select>
        <select className="pr-filter-select" value={filterStatus}
          onChange={e => setFilterStatus(e.target.value)}>
          <option value="">All Status</option>
          <option value="true">Active</option>
          <option value="false">Inactive</option>
        </select>
        {(searchTerm || filterCategory || filterSubcategory || filterStatus) && (
          <button className="pr-btn-clear" onClick={() => {
            setSearchTerm(''); setFilterCategory(''); setFilterSubcategory(''); setFilterStatus('');
          }}>Clear</button>
        )}
      </div>

      {/* Content */}
      {loading ? (
        <div className="pr-loading"><div className="pr-spinner" /><span>Loading…</span></div>
      ) : products.length === 0 ? (
        <div className="pr-empty">
          <svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2">
            <path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z"/>
            <polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/>
          </svg>
          <p>No products found</p>
          <button className="pr-btn-add" onClick={() => navigate('/products/add')}>Add first product</button>
        </div>
      ) : viewMode === 'grid' ? (
        /* ── Grid View ── */
        <div className="pr-grid">
          {products.map(product => {
            const img = getFirstImage(product.variants);
            const stock = getTotalStock(product.variants);
            const price = getPriceRange(product.variants);
            return (
              <div key={product.id} className={`pr-card ${!product.is_active ? 'inactive' : ''}`}
                onClick={() => navigate(`/products/edit/${product.slug}`)}>
                <div className="pr-card-img-wrap">
                  {img ? (
                    <img src={img} alt={product.name} className="pr-card-img" />
                  ) : (
                    <div className="pr-card-img-placeholder">
                      <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2">
                        <rect x="3" y="3" width="18" height="18" rx="2"/>
                        <circle cx="8.5" cy="8.5" r="1.5"/>
                        <polyline points="21 15 16 10 5 21"/>
                      </svg>
                    </div>
                  )}
                  {/* Flags */}
                  <div className="pr-card-flags">
                    {product.is_bestseller && <span className="pr-flag pr-flag-bestseller">Bestseller</span>}
                    {product.is_hot_selling && <span className="pr-flag pr-flag-hot">Hot</span>}
                  </div>
                  {/* Status dot */}
                  <div className={`pr-card-status-dot ${product.is_active ? 'active' : 'inactive'}`} />
                  {/* Hover actions */}
                  <div className="pr-card-overlay">
                    <button className="pr-card-action-btn edit"
                      onClick={e => { e.stopPropagation(); navigate(`/products/edit/${product.slug}`); }}>
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/>
                        <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/>
                      </svg>
                      Edit
                    </button>
                    <button className="pr-card-action-btn delete"
                      onClick={e => handleDelete(product, e)}>
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <polyline points="3 6 5 6 21 6"/>
                        <path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/>
                        <path d="M10 11v6M14 11v6M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2"/>
                      </svg>
                      Delete
                    </button>
                  </div>
                </div>
                <div className="pr-card-body">
                  <div className="pr-card-name">{product.name}</div>
                  <div className="pr-card-cats">
                    <span className="pr-cat-tag">{product.category_name}</span>
                    <span className="pr-cat-sep">/</span>
                    <span className="pr-cat-tag">{product.subcategory_name}</span>
                  </div>
                  <div className="pr-card-meta">
                    <div className="pr-meta-item">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
                        <rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>
                      </svg>
                      {product.variants?.length || 0} variants
                    </div>
                    <div className={`pr-meta-item ${stock === 0 ? 'out' : stock < 10 ? 'low' : ''}`}>
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z"/>
                      </svg>
                      {stock} stock
                    </div>
                  </div>
                  <div className="pr-card-price">{price}</div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* ── List View ── */
        <div className="pr-list">
          <div className="pr-list-header">
            <span>Product</span>
            <span>Category</span>
            <span>Variants</span>
            <span>Price Range</span>
            <span>Stock</span>
            <span>Status</span>
            <span>Actions</span>
          </div>
          {products.map(product => {
            const img = getFirstImage(product.variants);
            const stock = getTotalStock(product.variants);
            const price = getPriceRange(product.variants);
            return (
              <div key={product.id} className={`pr-list-row ${!product.is_active ? 'inactive' : ''}`}>
                <div className="pr-list-product">
                  <div className="pr-list-img-wrap">
                    {img ? (
                      <img src={img} alt={product.name} className="pr-list-img" />
                    ) : (
                      <div className="pr-list-img-placeholder">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                          <rect x="3" y="3" width="18" height="18" rx="2"/>
                          <circle cx="8.5" cy="8.5" r="1.5"/>
                          <polyline points="21 15 16 10 5 21"/>
                        </svg>
                      </div>
                    )}
                  </div>
                  <div>
                    <div className="pr-list-name">{product.name}</div>
                    <div className="pr-list-flags">
                      {product.is_bestseller && <span className="pr-flag pr-flag-bestseller">Bestseller</span>}
                      {product.is_hot_selling && <span className="pr-flag pr-flag-hot">Hot</span>}
                    </div>
                  </div>
                </div>
                <div className="pr-list-cat">
                  <div>{product.category_name}</div>
                  <div className="pr-list-subcat">{product.subcategory_name}</div>
                </div>
                <div className="pr-list-variants">{product.variants?.length || 0}</div>
                <div className="pr-list-price">{price}</div>
                <div className={`pr-list-stock ${stock === 0 ? 'out' : stock < 10 ? 'low' : ''}`}>{stock}</div>
                <div>
                  <span className={`pr-status-badge ${product.is_active ? 'active' : 'inactive'}`}>
                    {product.is_active ? 'Active' : 'Inactive'}
                  </span>
                </div>
                <div className="pr-list-actions">
                  <button className="pr-btn-edit" onClick={() => navigate(`/products/edit/${product.slug}`)}>Edit</button>
                  <button className="pr-btn-delete" onClick={e => handleDelete(product, e)}>Delete</button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Products;
