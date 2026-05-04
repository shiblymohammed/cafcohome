import { useState, useEffect, useRef } from 'react';
import apiClient, { extractData } from '../utils/api';
import ImageCropperWithUpload from '../components/ImageCropperWithUpload';
import './Offers.css';

interface Offer {
  id: number;
  name: string;
  description: string;
  discount_percentage: string;
  apply_to: 'product' | 'collection' | 'category' | 'brand';
  image_url: string;
  start_date: string;
  end_date: string;
  is_active: boolean;
  is_featured: boolean;
  products: number[];
  collections: number[];
  categories: number[];
  brands: number[];
  applicable_items_display?: string;
  created_at: string;
}

interface OfferFormData {
  name: string;
  description: string;
  discount_percentage: string;
  apply_to: 'product' | 'collection' | 'category' | 'brand';
  image_url: string;
  start_date: string;
  end_date: string;
  is_active: boolean;
  is_featured: boolean;
  products: number[];
  collections: number[];
  categories: number[];
  brands: number[];
}

interface Category {
  id: number;
  name: string;
  slug: string;
}

interface Subcategory {
  id: number;
  name: string;
  slug: string;
  category: number;
}

interface Product {
  id: number;
  name: string;
  slug: string;
  category?: { id: number; name: string };
  subcategory?: { id: number; name: string };
  variants?: Array<{
    images?: Array<{ url: string; alt: string }>;
  }>;
}

interface Brand {
  id: number;
  name: string;
  slug: string;
}

// ── Drag-Drop Image Upload ──────────────────────────────────────────────────
interface DragDropProps {
  value: string; onChange: (url: string) => void;
  label?: string; error?: string; aspectRatio?: number; hint?: string;
}
const DragDropImageUpload = ({ value, onChange, label, error, aspectRatio = 16/9, hint }: DragDropProps) => {
  const [dragging, setDragging] = useState(false);
  const cropperContainerRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => { e.preventDefault(); setDragging(true); };
  const handleDragLeave = () => setDragging(false);
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault(); setDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith('image/') && fileInputRef.current) {
      const dt = new DataTransfer(); dt.items.add(file);
      fileInputRef.current.files = dt.files;
      fileInputRef.current.dispatchEvent(new Event('change', { bubbles: true }));
    }
  };

  return (
    <div className="of-form-group">
      {label && <label className="of-form-label">{label}</label>}
      <div
        className={`of-drop-zone ${dragging ? 'dragging' : ''} ${value ? 'has-image' : ''}`}
        onDragOver={handleDragOver} onDragLeave={handleDragLeave} onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
      >
        {value ? (
          <>
            <img src={value} alt="Preview" className="of-drop-preview" />
            <div className="of-drop-replace-overlay"><span>Click or Drag to Replace</span></div>
            <button type="button" className="of-drop-remove" onClick={e => { e.stopPropagation(); onChange(''); }}>×</button>
          </>
        ) : (
          <div className="of-drop-placeholder">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2">
              <rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/>
              <polyline points="21 15 16 10 5 21"/>
            </svg>
            <span className="of-drop-placeholder-title">Drop banner here or click to upload</span>
            <span className="of-drop-placeholder-sub">PNG, JPG, WEBP · 16:9 recommended</span>
            {hint && <span className="of-drop-placeholder-hint">{hint}</span>}
          </div>
        )}
      </div>
      <div ref={cropperContainerRef} style={{ display: 'none' }}>
        <ImageCropperWithUpload value={value} onChange={onChange} aspectRatio={aspectRatio} />
      </div>
      <input ref={fileInputRef} type="file" accept="image/*" style={{ display: 'none' }}
        onChange={e => {
          const file = e.target.files?.[0];
          if (!file) return;
          const hiddenInput = cropperContainerRef.current?.querySelector('input[type="file"]') as HTMLInputElement;
          if (hiddenInput) {
            const dt = new DataTransfer(); dt.items.add(file);
            hiddenInput.files = dt.files;
            hiddenInput.dispatchEvent(new Event('change', { bubbles: true }));
          }
        }}
      />
      {error && <span className="of-form-error">{error}</span>}
    </div>
  );
};

// ── Toggle Switch ──────────────────────────────────────────────────
const Toggle = ({ checked, onChange, label, desc }: { checked: boolean; onChange: (v: boolean) => void; label: string; desc?: string }) => (
  <div className="of-toggle-row">
    <div className="of-toggle-info">
      <span className="of-toggle-label">{label}</span>
      {desc && <span className="of-toggle-desc">{desc}</span>}
    </div>
    <label className="of-toggle">
      <input type="checkbox" className="of-toggle-input" checked={checked} onChange={e => onChange(e.target.checked)} />
      <span className="of-toggle-slider" />
    </label>
  </div>
);

const APPLY_TO_LABELS: Record<string, string> = {
  product: 'Specific Products',
  collection: 'Category',
  category: 'Subcategory',
  brand: 'Brand',
};

const isOfferValid = (offer: Offer) => {
  const now = new Date();
  return new Date(offer.start_date) <= now && new Date(offer.end_date) >= now;
};

const formatDate = (d: string) => new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });

const Offers = () => {
  const [offers, setOffers] = useState<Offer[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [editingOffer, setEditingOffer] = useState<Offer | null>(null);
  const [formData, setFormData] = useState<OfferFormData>({
    name: '', description: '', discount_percentage: '',
    apply_to: 'product', image_url: '', start_date: '', end_date: '',
    is_active: true, is_featured: false,
    products: [], collections: [], categories: [], brands: [],
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  
  // Data for dropdowns
  const [allCategories, setAllCategories] = useState<Category[]>([]);
  const [allSubcategories, setAllSubcategories] = useState<Subcategory[]>([]);
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [allBrands, setAllBrands] = useState<Brand[]>([]);
  
  // Product selection modal
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [productSearchTerm, setProductSearchTerm] = useState('');
  const [selectedProducts, setSelectedProducts] = useState<number[]>([]);
  
  // Category selection modal
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [categorySearchTerm, setCategorySearchTerm] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<number[]>([]);
  
  // Subcategory selection modal
  const [isSubcategoryModalOpen, setIsSubcategoryModalOpen] = useState(false);
  const [subcategorySearchTerm, setSubcategorySearchTerm] = useState('');
  const [selectedSubcategories, setSelectedSubcategories] = useState<number[]>([]);
  
  // Brand selection modal
  const [isBrandModalOpen, setIsBrandModalOpen] = useState(false);
  const [brandSearchTerm, setBrandSearchTerm] = useState('');
  const [selectedBrands, setSelectedBrands] = useState<number[]>([]);

  useEffect(() => { 
    fetchOffers();
    fetchDropdownData();
  }, []);

  const fetchOffers = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get('/offers/');
      setOffers(extractData<Offer>(response.data));
    } catch (error) {
      console.error('Failed to fetch offers:', error);
      setOffers([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchDropdownData = async () => {
    try {
      const [categoriesRes, subcategoriesRes, productsRes, brandsRes] = await Promise.all([
        apiClient.get('/categories/'),
        apiClient.get('/subcategories/'),
        apiClient.get('/products/'),
        apiClient.get('/brands/'),
      ]);
      setAllCategories(extractData<Category>(categoriesRes.data));
      setAllSubcategories(extractData<Subcategory>(subcategoriesRes.data));
      setAllProducts(extractData<Product>(productsRes.data));
      setAllBrands(extractData<Brand>(brandsRes.data));
    } catch (error) {
      console.error('Failed to fetch dropdown data:', error);
    }
  };

  const handleAdd = () => {
    setEditingOffer(null);
    const today = new Date().toISOString().split('T')[0];
    const nextMonth = new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0];
    setFormData({
      name: '', description: '', discount_percentage: '',
      apply_to: 'product', image_url: '', start_date: today, end_date: nextMonth,
      is_active: true, is_featured: false,
      products: [], collections: [], categories: [], brands: [],
    });
    setSelectedProducts([]);
    setSelectedCategories([]);
    setSelectedSubcategories([]);
    setSelectedBrands([]);
    setFormErrors({});
    setIsPanelOpen(true);
  };

  const handleEdit = (offer: Offer) => {
    setEditingOffer(offer);
    setFormData({
      name: offer.name, description: offer.description,
      discount_percentage: offer.discount_percentage,
      apply_to: offer.apply_to, image_url: offer.image_url,
      start_date: offer.start_date?.split('T')[0] || '',
      end_date: offer.end_date?.split('T')[0] || '',
      is_active: offer.is_active, is_featured: offer.is_featured,
      products: offer.products || [],
      collections: offer.collections || [],
      categories: offer.categories || [],
      brands: offer.brands || [],
    });
    setSelectedProducts(offer.products || []);
    setSelectedCategories(offer.collections || []);
    setSelectedSubcategories(offer.categories || []);
    setSelectedBrands(offer.brands || []);
    setFormErrors({});
    setIsPanelOpen(true);
  };

  const handleOpenProductModal = () => {
    setSelectedProducts(formData.products);
    setProductSearchTerm('');
    setIsProductModalOpen(true);
  };

  const handleSaveProductSelection = () => {
    setFormData({ ...formData, products: selectedProducts });
    setIsProductModalOpen(false);
  };

  const toggleProductSelection = (productId: number) => {
    setSelectedProducts(prev => 
      prev.includes(productId) 
        ? prev.filter(id => id !== productId)
        : [...prev, productId]
    );
  };

  const filteredProducts = allProducts.filter(product =>
    product.name.toLowerCase().includes(productSearchTerm.toLowerCase())
  );

  // Category modal handlers
  const handleOpenCategoryModal = () => {
    setSelectedCategories(formData.collections);
    setCategorySearchTerm('');
    setIsCategoryModalOpen(true);
  };

  const handleSaveCategorySelection = () => {
    setFormData({ ...formData, collections: selectedCategories });
    setIsCategoryModalOpen(false);
  };

  const toggleCategorySelection = (categoryId: number) => {
    setSelectedCategories(prev => 
      prev.includes(categoryId) 
        ? prev.filter(id => id !== categoryId)
        : [...prev, categoryId]
    );
  };

  const filteredCategories = allCategories.filter(category =>
    category.name.toLowerCase().includes(categorySearchTerm.toLowerCase())
  );

  // Subcategory modal handlers
  const handleOpenSubcategoryModal = () => {
    setSelectedSubcategories(formData.categories);
    setSubcategorySearchTerm('');
    setIsSubcategoryModalOpen(true);
  };

  const handleSaveSubcategorySelection = () => {
    setFormData({ ...formData, categories: selectedSubcategories });
    setIsSubcategoryModalOpen(false);
  };

  const toggleSubcategorySelection = (subcategoryId: number) => {
    setSelectedSubcategories(prev => 
      prev.includes(subcategoryId) 
        ? prev.filter(id => id !== subcategoryId)
        : [...prev, subcategoryId]
    );
  };

  const filteredSubcategories = allSubcategories.filter(subcategory =>
    subcategory.name.toLowerCase().includes(subcategorySearchTerm.toLowerCase())
  );

  // Brand modal handlers
  const handleOpenBrandModal = () => {
    setSelectedBrands(formData.brands);
    setBrandSearchTerm('');
    setIsBrandModalOpen(true);
  };

  const handleSaveBrandSelection = () => {
    setFormData({ ...formData, brands: selectedBrands });
    setIsBrandModalOpen(false);
  };

  const toggleBrandSelection = (brandId: number) => {
    setSelectedBrands(prev => 
      prev.includes(brandId) 
        ? prev.filter(id => id !== brandId)
        : [...prev, brandId]
    );
  };

  const filteredBrands = allBrands.filter(brand =>
    brand.name.toLowerCase().includes(brandSearchTerm.toLowerCase())
  );

  const handleDelete = async (offer: Offer) => {
    if (!window.confirm(`Delete "${offer.name}"?`)) return;
    try {
      await apiClient.delete(`/offers/${offer.id}/`);
      fetchOffers();
    } catch (error) {
      console.error('Failed to delete offer:', error);
      alert('Failed to delete offer');
    }
  };

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};
    if (!formData.name.trim()) errors.name = 'Name is required';
    if (!formData.discount_percentage || parseFloat(formData.discount_percentage) <= 0) 
      errors.discount_percentage = 'Enter a valid discount percentage';
    if (parseFloat(formData.discount_percentage) > 100) 
      errors.discount_percentage = 'Percentage cannot exceed 100';
    if (!formData.start_date) errors.start_date = 'Start date is required';
    if (!formData.end_date) errors.end_date = 'End date is required';
    if (formData.start_date && formData.end_date && formData.start_date > formData.end_date) 
      errors.end_date = 'End date must be after start date';
    
    // Validate that items are selected based on apply_to
    if (formData.apply_to === 'product' && formData.products.length === 0) {
      errors.products = 'Please select at least one product';
    } else if (formData.apply_to === 'collection' && formData.collections.length === 0) {
      errors.collections = 'Please select at least one category';
    } else if (formData.apply_to === 'category' && formData.categories.length === 0) {
      errors.categories = 'Please select at least one subcategory';
    } else if (formData.apply_to === 'brand' && formData.brands.length === 0) {
      errors.brands = 'Please select at least one brand';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    setSubmitting(true);
    try {
      if (editingOffer) {
        await apiClient.put(`/offers/${editingOffer.id}/`, formData);
      } else {
        await apiClient.post('/offers/', formData);
      }
      setIsPanelOpen(false);
      fetchOffers();
    } catch (error: any) {
      console.error('Failed to save offer:', error);
      if (error.response?.data) {
        const errors: Record<string, string> = {};
        Object.keys(error.response.data).forEach(key => {
          const value = error.response.data[key];
          if (Array.isArray(value)) {
            errors[key] = value.join(', ');
          } else if (typeof value === 'string') {
            errors[key] = value;
          } else {
            errors[key] = JSON.stringify(value);
          }
        });
        setFormErrors(errors);
      } else {
        alert('Failed to save offer. Please check your input and try again.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  const filtered = offers.filter(o => {
    const matchSearch = !searchTerm || o.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchStatus = !filterStatus ||
      (filterStatus === 'active' && o.is_active) ||
      (filterStatus === 'inactive' && !o.is_active) ||
      (filterStatus === 'valid' && isOfferValid(o)) ||
      (filterStatus === 'expired' && !isOfferValid(o));
    return matchSearch && matchStatus;
  });

  return (
    <div className="of-page">
      {/* Header */}
      <div className="of-header">
        <div className="of-header-left">
          <h1 className="of-title">Offers</h1>
          <span className="of-count">{offers.length}</span>
        </div>
        <div className="of-header-actions">
          <div className="of-view-toggle">
            <button className={`of-view-btn ${viewMode === 'grid' ? 'active' : ''}`} onClick={() => setViewMode('grid')} title="Grid view">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
                <rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>
              </svg>
            </button>
            <button className={`of-view-btn ${viewMode === 'list' ? 'active' : ''}`} onClick={() => setViewMode('list')} title="List view">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/>
                <line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/>
                <line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/>
              </svg>
            </button>
          </div>
          <button className="of-btn-add" onClick={handleAdd}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
            Add Offer
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="of-filters">
        <div className="of-search-wrap">
          <svg className="of-search-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          <input className="of-search" type="text" placeholder="Search offers…" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
        </div>
        <select className="of-filter-select" value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
          <option value="">All Status</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
          <option value="valid">Currently Valid</option>
          <option value="expired">Expired</option>
        </select>
      </div>

      {/* Content */}
      {loading ? (
        <div className="of-loading"><div className="of-spinner" /><span>Loading…</span></div>
      ) : filtered.length === 0 ? (
        <div className="of-empty">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2">
            <path d="M20.59 13.41l-7.17 7.17a2 2 0 01-2.83 0L2 12V2h10l8.59 8.59a2 2 0 010 2.82z"/>
            <line x1="7" y1="7" x2="7.01" y2="7"/>
          </svg>
          <p>No offers found</p>
          <button className="of-btn-add" onClick={handleAdd}>Create first offer</button>
        </div>
      ) : viewMode === 'grid' ? (
        <div className="of-grid">
          {filtered.map(offer => {
            const valid = isOfferValid(offer);
            return (
              <div key={offer.id} className={`of-card ${!offer.is_active ? 'inactive' : ''}`}>
                <div className="of-card-banner">
                  {offer.image_url ? (
                    <img src={offer.image_url} alt={offer.name} className="of-card-img" />
                  ) : (
                    <div className="of-card-img-placeholder">
                      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2">
                        <rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/>
                        <polyline points="21 15 16 10 5 21"/>
                      </svg>
                    </div>
                  )}
                  <div className="of-card-discount-badge">
                    {offer.discount_percentage}%
                    <span>OFF</span>
                  </div>
                  {offer.is_featured && <div className="of-card-featured">★ Featured</div>}
                  <div className="of-card-overlay">
                    <button className="of-btn-edit" onClick={() => handleEdit(offer)}>Edit</button>
                    <button className="of-btn-delete" onClick={() => handleDelete(offer)}>Delete</button>
                  </div>
                </div>
                <div className="of-card-body">
                  <div className="of-card-title">{offer.name}</div>
                  {offer.description && <div className="of-card-desc">{offer.description}</div>}
                  {offer.applicable_items_display && (
                    <div className="of-card-items">{offer.applicable_items_display}</div>
                  )}
                  <div className="of-card-meta">
                    <span className="of-apply-badge">{APPLY_TO_LABELS[offer.apply_to]}</span>
                    <span className={`of-status-badge ${offer.is_active ? 'active' : 'inactive'}`}>
                      {offer.is_active ? 'Active' : 'Inactive'}
                    </span>
                    <span className={`of-valid-badge ${valid ? 'valid' : 'expired'}`}>
                      {valid ? 'Live' : 'Expired'}
                    </span>
                  </div>
                  <div className="of-card-dates">
                    <span>{formatDate(offer.start_date)}</span>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
                    <span>{formatDate(offer.end_date)}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="of-list">
          <div className="of-list-header">
            <span>Offer</span><span>Discount</span><span>Apply To</span><span>Validity</span><span>Status</span><span>Actions</span>
          </div>
          {filtered.map(offer => {
            const valid = isOfferValid(offer);
            return (
              <div key={offer.id} className="of-list-row">
                <div className="of-list-info">
                  {offer.image_url && <img src={offer.image_url} alt={offer.name} className="of-list-img" />}
                  <div>
                    <div className="of-list-title">{offer.name}</div>
                    {offer.is_featured && <span className="of-featured-dot">★ Featured</span>}
                  </div>
                </div>
                <div className="of-list-discount">
                  <span className="of-discount-val">{offer.discount_percentage}%</span>
                  <span className="of-discount-type">percentage</span>
                </div>
                <div><span className="of-apply-badge">{APPLY_TO_LABELS[offer.apply_to]}</span></div>
                <div className="of-list-dates">
                  <span>{formatDate(offer.start_date)}</span>
                  <span className="of-dates-sep">→</span>
                  <span>{formatDate(offer.end_date)}</span>
                </div>
                <div className="of-list-status">
                  <span className={`of-status-badge ${offer.is_active ? 'active' : 'inactive'}`}>{offer.is_active ? 'Active' : 'Inactive'}</span>
                  <span className={`of-valid-badge ${valid ? 'valid' : 'expired'}`}>{valid ? 'Live' : 'Expired'}</span>
                </div>
                <div className="of-list-actions">
                  <button className="of-btn-edit" onClick={() => handleEdit(offer)}>Edit</button>
                  <button className="of-btn-delete" onClick={() => handleDelete(offer)}>Delete</button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Slide-in Panel */}
      {isPanelOpen && (
        <div className="of-overlay" onClick={e => { if (e.target === e.currentTarget) setIsPanelOpen(false); }}>
          <div className="of-panel">
            <div className="of-panel-header">
              <h2 className="of-panel-title">{editingOffer ? 'Edit Offer' : 'New Offer'}</h2>
              <button className="of-panel-close" onClick={() => setIsPanelOpen(false)}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            </div>
            <form onSubmit={handleSubmit} style={{ display: 'contents' }}>
              <div className="of-panel-body">

                {/* Basic Info */}
                <div className="of-form-section">
                  <div className="of-form-section-title">Basic Info</div>
                  <div className="of-form-group">
                    <label className="of-form-label">Offer Name <span>*</span></label>
                    <input className={`of-form-input ${formErrors.name ? 'error' : ''}`}
                      type="text" placeholder="e.g. Summer Sale 20% Off"
                      value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} />
                    {formErrors.name && <span className="of-form-error">{formErrors.name}</span>}
                  </div>
                  <div className="of-form-group">
                    <label className="of-form-label">Description</label>
                    <textarea className="of-form-textarea" rows={3} placeholder="Describe this offer…"
                      value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} />
                  </div>
                </div>

                {/* Discount */}
                <div className="of-form-section">
                  <div className="of-form-section-title">Discount</div>
                  <div className="of-form-group">
                    <label className="of-form-label">Discount Percentage <span>*</span></label>
                    <input className={`of-form-input ${formErrors.discount_percentage ? 'error' : ''}`}
                      type="number" min="0" max="100" step="0.01"
                      placeholder="0–100"
                      value={formData.discount_percentage} 
                      onChange={e => setFormData({ ...formData, discount_percentage: e.target.value })} />
                    {formErrors.discount_percentage && <span className="of-form-error">{formErrors.discount_percentage}</span>}
                  </div>
                  <div className="of-form-group">
                    <label className="of-form-label">Apply To <span>*</span></label>
                    <select className="of-form-select" value={formData.apply_to}
                      onChange={e => setFormData({ 
                        ...formData, 
                        apply_to: e.target.value as any,
                        products: [],
                        collections: [],
                        categories: [],
                        brands: [],
                      })}>
                      <option value="product">Specific Products</option>
                      <option value="collection">Category</option>
                      <option value="category">Subcategory</option>
                      <option value="brand">Brand</option>
                    </select>
                  </div>
                </div>

                {/* Selection based on apply_to */}
                {formData.apply_to === 'product' && (
                  <div className="of-form-section">
                    <div className="of-form-section-title">Select Products <span>*</span></div>
                    <div className="of-form-group">
                      <button 
                        type="button"
                        className="of-btn-select-products"
                        onClick={handleOpenProductModal}
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <rect x="3" y="3" width="18" height="18" rx="2"/><path d="M9 11l3 3L22 4"/>
                        </svg>
                        {formData.products.length === 0 
                          ? 'Select Products' 
                          : `${formData.products.length} Product${formData.products.length > 1 ? 's' : ''} Selected`
                        }
                      </button>
                      {formData.products.length > 0 && (
                        <div className="of-selected-items">
                          {allProducts
                            .filter(p => formData.products.includes(p.id))
                            .map(product => (
                              <span key={product.id} className="of-selected-tag">
                                {product.name}
                                <button 
                                  type="button"
                                  onClick={() => setFormData({ 
                                    ...formData, 
                                    products: formData.products.filter(id => id !== product.id) 
                                  })}
                                >×</button>
                              </span>
                            ))
                          }
                        </div>
                      )}
                      {formErrors.products && <span className="of-form-error">{formErrors.products}</span>}
                    </div>
                  </div>
                )}

                {formData.apply_to === 'collection' && (
                  <div className="of-form-section">
                    <div className="of-form-section-title">Select Categories <span>*</span></div>
                    <div className="of-form-group">
                      <button 
                        type="button"
                        className="of-btn-select-products"
                        onClick={handleOpenCategoryModal}
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <rect x="3" y="3" width="18" height="18" rx="2"/><path d="M9 11l3 3L22 4"/>
                        </svg>
                        {formData.collections.length === 0 
                          ? 'Select Categories' 
                          : `${formData.collections.length} ${formData.collections.length > 1 ? 'Categories' : 'Category'} Selected`
                        }
                      </button>
                      {formData.collections.length > 0 && (
                        <div className="of-selected-items">
                          {allCategories
                            .filter(c => formData.collections.includes(c.id))
                            .map(category => (
                              <span key={category.id} className="of-selected-tag">
                                {category.name}
                                <button 
                                  type="button"
                                  onClick={() => setFormData({ 
                                    ...formData, 
                                    collections: formData.collections.filter(id => id !== category.id) 
                                  })}
                                >×</button>
                              </span>
                            ))
                          }
                        </div>
                      )}
                      {formErrors.collections && <span className="of-form-error">{formErrors.collections}</span>}
                    </div>
                  </div>
                )}

                {formData.apply_to === 'category' && (
                  <div className="of-form-section">
                    <div className="of-form-section-title">Select Subcategories <span>*</span></div>
                    <div className="of-form-group">
                      <button 
                        type="button"
                        className="of-btn-select-products"
                        onClick={handleOpenSubcategoryModal}
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <rect x="3" y="3" width="18" height="18" rx="2"/><path d="M9 11l3 3L22 4"/>
                        </svg>
                        {formData.categories.length === 0 
                          ? 'Select Subcategories' 
                          : `${formData.categories.length} ${formData.categories.length > 1 ? 'Subcategories' : 'Subcategory'} Selected`
                        }
                      </button>
                      {formData.categories.length > 0 && (
                        <div className="of-selected-items">
                          {allSubcategories
                            .filter(s => formData.categories.includes(s.id))
                            .map(subcategory => (
                              <span key={subcategory.id} className="of-selected-tag">
                                {subcategory.name}
                                <button 
                                  type="button"
                                  onClick={() => setFormData({ 
                                    ...formData, 
                                    categories: formData.categories.filter(id => id !== subcategory.id) 
                                  })}
                                >×</button>
                              </span>
                            ))
                          }
                        </div>
                      )}
                      {formErrors.categories && <span className="of-form-error">{formErrors.categories}</span>}
                    </div>
                  </div>
                )}

                {formData.apply_to === 'brand' && (
                  <div className="of-form-section">
                    <div className="of-form-section-title">Select Brands <span>*</span></div>
                    <div className="of-form-group">
                      <button 
                        type="button"
                        className="of-btn-select-products"
                        onClick={handleOpenBrandModal}
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <rect x="3" y="3" width="18" height="18" rx="2"/><path d="M9 11l3 3L22 4"/>
                        </svg>
                        {formData.brands.length === 0 
                          ? 'Select Brands' 
                          : `${formData.brands.length} ${formData.brands.length > 1 ? 'Brands' : 'Brand'} Selected`
                        }
                      </button>
                      {formData.brands.length > 0 && (
                        <div className="of-selected-items">
                          {allBrands
                            .filter(b => formData.brands.includes(b.id))
                            .map(brand => (
                              <span key={brand.id} className="of-selected-tag">
                                {brand.name}
                                <button 
                                  type="button"
                                  onClick={() => setFormData({ 
                                    ...formData, 
                                    brands: formData.brands.filter(id => id !== brand.id) 
                                  })}
                                >×</button>
                              </span>
                            ))
                          }
                        </div>
                      )}
                      {formErrors.brands && <span className="of-form-error">{formErrors.brands}</span>}
                    </div>
                  </div>
                )}

                {/* Validity */}
                <div className="of-form-section">
                  <div className="of-form-section-title">Validity Period</div>
                  <div className="of-form-row">
                    <div className="of-form-group">
                      <label className="of-form-label">Start Date <span>*</span></label>
                      <input className={`of-form-input ${formErrors.start_date ? 'error' : ''}`}
                        type="date" value={formData.start_date}
                        onChange={e => setFormData({ ...formData, start_date: e.target.value })} />
                      {formErrors.start_date && <span className="of-form-error">{formErrors.start_date}</span>}
                    </div>
                    <div className="of-form-group">
                      <label className="of-form-label">End Date <span>*</span></label>
                      <input className={`of-form-input ${formErrors.end_date ? 'error' : ''}`}
                        type="date" value={formData.end_date}
                        onChange={e => setFormData({ ...formData, end_date: e.target.value })} />
                      {formErrors.end_date && <span className="of-form-error">{formErrors.end_date}</span>}
                    </div>
                  </div>
                </div>

                {/* Banner */}
                <div className="of-form-section">
                  <div className="of-form-section-title">Banner Image</div>
                  <DragDropImageUpload
                    value={formData.image_url}
                    onChange={url => setFormData({ ...formData, image_url: url })}
                    aspectRatio={16/9}
                    error={formErrors.image_url}
                  />
                </div>

                {/* Settings */}
                <div className="of-form-section">
                  <div className="of-form-section-title">Settings</div>
                  <Toggle checked={formData.is_active} onChange={v => setFormData({ ...formData, is_active: v })}
                    label="Active" desc="Offer is enabled and can be applied" />
                  <Toggle checked={formData.is_featured} onChange={v => setFormData({ ...formData, is_featured: v })}
                    label="Featured" desc="Highlight this offer on the homepage" />
                </div>

              </div>
              <div className="of-panel-footer">
                <button type="button" className="of-btn-cancel" onClick={() => setIsPanelOpen(false)} disabled={submitting}>Cancel</button>
                <button type="submit" className="of-btn-save" disabled={submitting}>
                  {submitting ? 'Saving…' : editingOffer ? 'Update Offer' : 'Create Offer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Product Selection Modal */}
      {isProductModalOpen && (
        <div className="of-product-modal-overlay" onClick={e => { if (e.target === e.currentTarget) setIsProductModalOpen(false); }}>
          <div className="of-product-modal">
            {/* Header */}
            <div className="of-product-modal-header">
              <div>
                <h3 className="of-product-modal-title">Select Products</h3>
                <p className="of-product-modal-subtitle">
                  {selectedProducts.length} of {allProducts.length} selected
                </p>
              </div>
              <button className="of-modal-close-btn" onClick={() => setIsProductModalOpen(false)}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            </div>
            
            {/* Search & Actions */}
            <div className="of-product-modal-toolbar">
              <div className="of-product-search-wrapper">
                <svg className="of-search-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
                </svg>
                <input 
                  type="text" 
                  className="of-product-search-input"
                  placeholder="Search products by name..."
                  value={productSearchTerm}
                  onChange={e => setProductSearchTerm(e.target.value)}
                  autoFocus
                />
                {productSearchTerm && (
                  <button 
                    className="of-search-clear-btn"
                    onClick={() => setProductSearchTerm('')}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                    </svg>
                  </button>
                )}
              </div>
              {selectedProducts.length > 0 && (
                <button 
                  className="of-clear-all-btn"
                  onClick={() => setSelectedProducts([])}
                >
                  Clear All
                </button>
              )}
            </div>

            {/* Products Grid */}
            <div className="of-product-modal-body">
              {filteredProducts.length === 0 ? (
                <div className="of-product-empty-state">
                  <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
                    <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
                  </svg>
                  <h4>No products found</h4>
                  <p>Try adjusting your search terms</p>
                </div>
              ) : (
                <div className="of-product-grid">
                  {filteredProducts.map(product => {
                    const isSelected = selectedProducts.includes(product.id);
                    const firstImage = product.variants?.[0]?.images?.[0]?.url;
                    
                    return (
                      <div 
                        key={product.id} 
                        className={`of-product-item ${isSelected ? 'selected' : ''}`}
                        onClick={() => toggleProductSelection(product.id)}
                      >
                        {/* Checkbox */}
                        <div className="of-product-checkbox-wrapper">
                          <input 
                            type="checkbox" 
                            className="of-product-checkbox-input"
                            checked={isSelected}
                            onChange={() => {}}
                          />
                          <div className="of-product-checkbox-box">
                            {isSelected && (
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                                <polyline points="20 6 9 17 4 12"/>
                              </svg>
                            )}
                          </div>
                        </div>

                        {/* Product Image */}
                        <div className="of-product-image">
                          {firstImage ? (
                            <img src={firstImage} alt={product.name} />
                          ) : (
                            <div className="of-product-image-placeholder">
                              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                                <rect x="3" y="3" width="18" height="18" rx="2"/>
                                <circle cx="8.5" cy="8.5" r="1.5"/>
                                <polyline points="21 15 16 10 5 21"/>
                              </svg>
                            </div>
                          )}
                        </div>

                        {/* Product Info */}
                        <div className="of-product-details">
                          <h4 className="of-product-name">{product.name}</h4>
                          {product.category && (
                            <p className="of-product-category">{product.category.name}</p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="of-product-modal-footer">
              <button 
                type="button" 
                className="of-modal-btn of-modal-btn-secondary" 
                onClick={() => setIsProductModalOpen(false)}
              >
                Cancel
              </button>
              <button 
                type="button" 
                className="of-modal-btn of-modal-btn-primary" 
                onClick={handleSaveProductSelection}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="20 6 9 17 4 12"/>
                </svg>
                Confirm Selection ({selectedProducts.length})
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Category Selection Modal */}
      {isCategoryModalOpen && (
        <div className="of-product-modal-overlay" onClick={e => { if (e.target === e.currentTarget) setIsCategoryModalOpen(false); }}>
          <div className="of-product-modal">
            <div className="of-product-modal-header">
              <div>
                <h3 className="of-product-modal-title">Select Categories</h3>
                <p className="of-product-modal-subtitle">
                  {selectedCategories.length} of {allCategories.length} selected
                </p>
              </div>
              <button className="of-modal-close-btn" onClick={() => setIsCategoryModalOpen(false)}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            </div>
            
            <div className="of-product-modal-toolbar">
              <div className="of-product-search-wrapper">
                <svg className="of-search-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
                </svg>
                <input 
                  type="text" 
                  className="of-product-search-input"
                  placeholder="Search categories..."
                  value={categorySearchTerm}
                  onChange={e => setCategorySearchTerm(e.target.value)}
                  autoFocus
                />
                {categorySearchTerm && (
                  <button className="of-search-clear-btn" onClick={() => setCategorySearchTerm('')}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                    </svg>
                  </button>
                )}
              </div>
              {selectedCategories.length > 0 && (
                <button className="of-clear-all-btn" onClick={() => setSelectedCategories([])}>
                  Clear All
                </button>
              )}
            </div>

            <div className="of-product-modal-body">
              {filteredCategories.length === 0 ? (
                <div className="of-product-empty-state">
                  <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
                    <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
                  </svg>
                  <h4>No categories found</h4>
                  <p>Try adjusting your search terms</p>
                </div>
              ) : (
                <div className="of-product-grid">
                  {filteredCategories.map(category => {
                    const isSelected = selectedCategories.includes(category.id);
                    return (
                      <div 
                        key={category.id} 
                        className={`of-product-item of-category-item ${isSelected ? 'selected' : ''}`}
                        onClick={() => toggleCategorySelection(category.id)}
                      >
                        <div className="of-product-checkbox-wrapper">
                          <input 
                            type="checkbox" 
                            className="of-product-checkbox-input"
                            checked={isSelected}
                            onChange={() => {}}
                          />
                          <div className="of-product-checkbox-box">
                            {isSelected && (
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                                <polyline points="20 6 9 17 4 12"/>
                              </svg>
                            )}
                          </div>
                        </div>
                        <div className="of-category-icon">
                          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                            <path d="M3 3h7v7H3zM14 3h7v7h-7zM14 14h7v7h-7zM3 14h7v7H3z"/>
                          </svg>
                        </div>
                        <div className="of-product-details">
                          <h4 className="of-product-name">{category.name}</h4>
                          <p className="of-product-category">{category.slug}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="of-product-modal-footer">
              <button 
                type="button" 
                className="of-modal-btn of-modal-btn-secondary" 
                onClick={() => setIsCategoryModalOpen(false)}
              >
                Cancel
              </button>
              <button 
                type="button" 
                className="of-modal-btn of-modal-btn-primary" 
                onClick={handleSaveCategorySelection}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="20 6 9 17 4 12"/>
                </svg>
                Confirm Selection ({selectedCategories.length})
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Subcategory Selection Modal */}
      {isSubcategoryModalOpen && (
        <div className="of-product-modal-overlay" onClick={e => { if (e.target === e.currentTarget) setIsSubcategoryModalOpen(false); }}>
          <div className="of-product-modal">
            <div className="of-product-modal-header">
              <div>
                <h3 className="of-product-modal-title">Select Subcategories</h3>
                <p className="of-product-modal-subtitle">
                  {selectedSubcategories.length} of {allSubcategories.length} selected
                </p>
              </div>
              <button className="of-modal-close-btn" onClick={() => setIsSubcategoryModalOpen(false)}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            </div>
            
            <div className="of-product-modal-toolbar">
              <div className="of-product-search-wrapper">
                <svg className="of-search-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
                </svg>
                <input 
                  type="text" 
                  className="of-product-search-input"
                  placeholder="Search subcategories..."
                  value={subcategorySearchTerm}
                  onChange={e => setSubcategorySearchTerm(e.target.value)}
                  autoFocus
                />
                {subcategorySearchTerm && (
                  <button className="of-search-clear-btn" onClick={() => setSubcategorySearchTerm('')}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                    </svg>
                  </button>
                )}
              </div>
              {selectedSubcategories.length > 0 && (
                <button className="of-clear-all-btn" onClick={() => setSelectedSubcategories([])}>
                  Clear All
                </button>
              )}
            </div>

            <div className="of-product-modal-body">
              {filteredSubcategories.length === 0 ? (
                <div className="of-product-empty-state">
                  <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
                    <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
                  </svg>
                  <h4>No subcategories found</h4>
                  <p>Try adjusting your search terms</p>
                </div>
              ) : (
                <div className="of-product-grid">
                  {filteredSubcategories.map(subcategory => {
                    const isSelected = selectedSubcategories.includes(subcategory.id);
                    return (
                      <div 
                        key={subcategory.id} 
                        className={`of-product-item of-category-item ${isSelected ? 'selected' : ''}`}
                        onClick={() => toggleSubcategorySelection(subcategory.id)}
                      >
                        <div className="of-product-checkbox-wrapper">
                          <input 
                            type="checkbox" 
                            className="of-product-checkbox-input"
                            checked={isSelected}
                            onChange={() => {}}
                          />
                          <div className="of-product-checkbox-box">
                            {isSelected && (
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                                <polyline points="20 6 9 17 4 12"/>
                              </svg>
                            )}
                          </div>
                        </div>
                        <div className="of-category-icon">
                          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                            <path d="M4 4h6v6H4zM14 4h6v6h-6zM4 14h6v6H4zM17 14l3 3m0 0l3 3m-3-3l3-3m-3 3l-3 3"/>
                          </svg>
                        </div>
                        <div className="of-product-details">
                          <h4 className="of-product-name">{subcategory.name}</h4>
                          <p className="of-product-category">{subcategory.slug}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="of-product-modal-footer">
              <button 
                type="button" 
                className="of-modal-btn of-modal-btn-secondary" 
                onClick={() => setIsSubcategoryModalOpen(false)}
              >
                Cancel
              </button>
              <button 
                type="button" 
                className="of-modal-btn of-modal-btn-primary" 
                onClick={handleSaveSubcategorySelection}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="20 6 9 17 4 12"/>
                </svg>
                Confirm Selection ({selectedSubcategories.length})
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Brand Selection Modal */}
      {isBrandModalOpen && (
        <div className="of-product-modal-overlay" onClick={e => { if (e.target === e.currentTarget) setIsBrandModalOpen(false); }}>
          <div className="of-product-modal">
            <div className="of-product-modal-header">
              <div>
                <h3 className="of-product-modal-title">Select Brands</h3>
                <p className="of-product-modal-subtitle">
                  {selectedBrands.length} of {allBrands.length} selected
                </p>
              </div>
              <button className="of-modal-close-btn" onClick={() => setIsBrandModalOpen(false)}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            </div>
            
            <div className="of-product-modal-toolbar">
              <div className="of-product-search-wrapper">
                <svg className="of-search-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
                </svg>
                <input 
                  type="text" 
                  className="of-product-search-input"
                  placeholder="Search brands..."
                  value={brandSearchTerm}
                  onChange={e => setBrandSearchTerm(e.target.value)}
                  autoFocus
                />
                {brandSearchTerm && (
                  <button className="of-search-clear-btn" onClick={() => setBrandSearchTerm('')}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                    </svg>
                  </button>
                )}
              </div>
              {selectedBrands.length > 0 && (
                <button className="of-clear-all-btn" onClick={() => setSelectedBrands([])}>
                  Clear All
                </button>
              )}
            </div>

            <div className="of-product-modal-body">
              {filteredBrands.length === 0 ? (
                <div className="of-product-empty-state">
                  <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
                    <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
                  </svg>
                  <h4>No brands found</h4>
                  <p>Try adjusting your search terms</p>
                </div>
              ) : (
                <div className="of-product-grid">
                  {filteredBrands.map(brand => {
                    const isSelected = selectedBrands.includes(brand.id);
                    return (
                      <div 
                        key={brand.id} 
                        className={`of-product-item of-category-item ${isSelected ? 'selected' : ''}`}
                        onClick={() => toggleBrandSelection(brand.id)}
                      >
                        <div className="of-product-checkbox-wrapper">
                          <input 
                            type="checkbox" 
                            className="of-product-checkbox-input"
                            checked={isSelected}
                            onChange={() => {}}
                          />
                          <div className="of-product-checkbox-box">
                            {isSelected && (
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                                <polyline points="20 6 9 17 4 12"/>
                              </svg>
                            )}
                          </div>
                        </div>
                        <div className="of-category-icon">
                          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                            <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
                          </svg>
                        </div>
                        <div className="of-product-details">
                          <h4 className="of-product-name">{brand.name}</h4>
                          <p className="of-product-category">{brand.slug}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="of-product-modal-footer">
              <button 
                type="button" 
                className="of-modal-btn of-modal-btn-secondary" 
                onClick={() => setIsBrandModalOpen(false)}
              >
                Cancel
              </button>
              <button 
                type="button" 
                className="of-modal-btn of-modal-btn-primary" 
                onClick={handleSaveBrandSelection}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="20 6 9 17 4 12"/>
                </svg>
                Confirm Selection ({selectedBrands.length})
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Offers;
