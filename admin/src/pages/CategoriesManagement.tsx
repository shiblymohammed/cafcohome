import { useState, useEffect, useRef, useCallback } from 'react';
import apiClient, { extractData } from '../utils/api';
import ImageCropperWithUpload from '../components/ImageCropperWithUpload';
import { IMAGE_CONFIGS } from '../config/imageConfig';
import './Categories.css';

interface Category {
  id: number; name: string; slug: string; subtitle: string;
  description: string; image_url: string; display_order: number;
  is_featured: boolean; is_active: boolean; product_count: number; created_at: string;
}
interface Subcategory {
  id: number; name: string; slug: string; description: string;
  image_url: string; featured_icon_url: string; category: number;
  category_name: string; display_order: number; is_featured: boolean;
  is_active: boolean; product_count: number; created_at: string;
}
interface CategoryFormData {
  name: string; subtitle: string; description: string; image_url: string;
  display_order: number; is_featured: boolean; is_active: boolean;
}
interface SubcategoryFormData {
  name: string; description: string; image_url: string; featured_icon_url: string;
  category: number | ''; display_order: number; is_featured: boolean; is_active: boolean;
}

// ── Drag-Drop Image Upload ──────────────────────────────────────────────────
interface DragDropProps {
  value: string; onChange: (url: string) => void;
  label?: string; error?: string; aspectRatio?: number; hint?: string;
}
const DragDropImageUpload = ({ value, onChange, label, error, aspectRatio = 4/3, hint }: DragDropProps) => {
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
  const handleClick = () => fileInputRef.current?.click();

  return (
    <div className="cat-form-group">
      {label && <label className="cat-form-label">{label}</label>}
      <div
        className={`cat-drop-zone ${dragging ? 'dragging' : ''} ${value ? 'has-image' : ''}`}
        onDragOver={handleDragOver} onDragLeave={handleDragLeave} onDrop={handleDrop}
        onClick={handleClick}
      >
        {value ? (
          <>
            <img src={value} alt="Preview" className="cat-drop-preview" />
            <div className="cat-drop-replace-overlay">
              <span>Click or Drag to Replace</span>
            </div>
            <button type="button" className="cat-drop-remove" onClick={e => { e.stopPropagation(); onChange(''); }} title="Remove Image">
              &times;
            </button>
          </>
        ) : (
          <div className="cat-drop-placeholder">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2">
              <rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/>
              <polyline points="21 15 16 10 5 21"/>
            </svg>
            <span className="cat-drop-placeholder-title">Drop image here or click to upload</span>
            <span className="cat-drop-placeholder-sub">PNG, JPG, WEBP up to 10MB</span>
            {hint && <span className="cat-drop-placeholder-sub" style={{ marginTop: '6px', color: '#ab8956', fontWeight: 600 }}>{hint}</span>}
          </div>
        )}
      </div>
      {/* Hidden ImageCropperWithUpload drives the actual upload */}
      <div ref={cropperContainerRef} style={{ display: 'none' }}>
        <ImageCropperWithUpload
          value={value} onChange={onChange} aspectRatio={aspectRatio}
        />
      </div>
      {/* Expose a real file input for drag-drop trigger */}
      <input ref={fileInputRef} type="file" accept="image/*" style={{ display: 'none' }}
        onChange={e => {
          const file = e.target.files?.[0];
          if (!file) return;
          // Find the hidden ImageCropperWithUpload file input securely within THIS container
          const hiddenInput = cropperContainerRef.current?.querySelector('input[type="file"]') as HTMLInputElement;
          if (hiddenInput) {
            const dt = new DataTransfer(); dt.items.add(file);
            hiddenInput.files = dt.files;
            hiddenInput.dispatchEvent(new Event('change', { bubbles: true }));
          }
        }}
      />
      {error && <span className="cat-form-error">{error}</span>}
    </div>
  );
};

// ── Toggle Switch ──────────────────────────────────────────────────
const Toggle = ({ checked, onChange, label, desc }: { checked: boolean; onChange: (v: boolean) => void; label: string; desc?: string }) => (
  <div className="cat-toggle-row">
    <div className="cat-toggle-info">
      <span className="cat-toggle-label">{label}</span>
      {desc && <span className="cat-toggle-desc">{desc}</span>}
    </div>
    <label className="cat-toggle">
      <input type="checkbox" className="cat-toggle-input" checked={checked} onChange={e => onChange(e.target.checked)} />
      <span className="cat-toggle-slider" />
    </label>
  </div>
);

// ── Status Badges ──────────────────────────────────────────────────
const StatusBadge = ({ active }: { active: boolean }) => (
  <span className={`cat-badge ${active ? 'cat-badge-active' : 'cat-badge-inactive'}`}>
    {active ? 'Active' : 'Inactive'}
  </span>
);
const FeaturedBadge = () => <span className="cat-badge cat-badge-featured">Featured</span>;
const CountBadge = ({ count }: { count: number }) => (
  <span className="cat-badge cat-badge-count">{count} products</span>
);

// ── Main Component ──────────────────────────────────────────────────
const CategoriesManagement = () => {
  const [activeTab, setActiveTab] = useState<'categories' | 'subcategories'>('categories');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [categories, setCategories] = useState<Category[]>([]);
  const [subcategories, setSubcategories] = useState<Subcategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterFeatured, setFilterFeatured] = useState('');

  // Category modal
  const [isCatModalOpen, setIsCatModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [catForm, setCatForm] = useState<CategoryFormData>({
    name: '', subtitle: '', description: '', image_url: '',
    display_order: 0, is_featured: false, is_active: true,
  });

  // Subcategory modal
  const [isSubModalOpen, setIsSubModalOpen] = useState(false);
  const [editingSubcategory, setEditingSubcategory] = useState<Subcategory | null>(null);
  const [subForm, setSubForm] = useState<SubcategoryFormData>({
    name: '', description: '', image_url: '', featured_icon_url: '',
    category: '', display_order: 0, is_featured: false, is_active: true,
  });

  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => { fetchCategories(); fetchSubcategories(); }, []);
  useEffect(() => { if (activeTab === 'subcategories') fetchSubcategories(); }, [selectedCategory, activeTab]);

  const fetchCategories = async () => {
    try { setLoading(true); const r = await apiClient.get('/categories/'); setCategories(extractData<Category>(r.data)); }
    catch { alert('Failed to load categories'); } finally { setLoading(false); }
  };
  const fetchSubcategories = async () => {
    try {
      setLoading(true);
      const params = selectedCategory ? { category: selectedCategory } : {};
      const r = await apiClient.get('/subcategories/', { params });
      setSubcategories(extractData<Subcategory>(r.data));
    } catch { alert('Failed to load subcategories'); setSubcategories([]); } finally { setLoading(false); }
  };

  // Filtered data
  const filteredCategories = categories.filter(c => {
    if (searchTerm && !c.name.toLowerCase().includes(searchTerm.toLowerCase())) return false;
    if (filterStatus === 'active' && !c.is_active) return false;
    if (filterStatus === 'inactive' && c.is_active) return false;
    if (filterFeatured === 'featured' && !c.is_featured) return false;
    if (filterFeatured === 'regular' && c.is_featured) return false;
    return true;
  });
  const filteredSubcategories = subcategories.filter(s => {
    if (searchTerm && !s.name.toLowerCase().includes(searchTerm.toLowerCase())) return false;
    if (filterStatus === 'active' && !s.is_active) return false;
    if (filterStatus === 'inactive' && s.is_active) return false;
    if (filterFeatured === 'featured' && !s.is_featured) return false;
    if (filterFeatured === 'regular' && s.is_featured) return false;
    return true;
  });

  // Category CRUD
  const openAddCategory = () => {
    setEditingCategory(null);
    setCatForm({ name: '', subtitle: '', description: '', image_url: '', display_order: 0, is_featured: false, is_active: true });
    setFormErrors({}); setIsCatModalOpen(true);
  };
  const openEditCategory = (c: Category) => {
    setEditingCategory(c);
    setCatForm({ name: c.name, subtitle: c.subtitle, description: c.description, image_url: c.image_url, display_order: c.display_order, is_featured: c.is_featured, is_active: c.is_active });
    setFormErrors({}); setIsCatModalOpen(true);
  };
  const deleteCategory = async (c: Category) => {
    if (!window.confirm(`Delete "${c.name}"? This affects all subcategories.`)) return;
    try { await apiClient.delete(`/categories/${c.slug}/`); fetchCategories(); fetchSubcategories(); }
    catch { alert('Failed to delete category'); }
  };
  const submitCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    const errors: Record<string, string> = {};
    if (!catForm.name.trim()) errors.name = 'Name is required';
    if (!catForm.description.trim()) errors.description = 'Description is required';
    if (!catForm.image_url.trim()) errors.image_url = 'Image is required';
    setFormErrors(errors);
    if (Object.keys(errors).length > 0) return;
    setSubmitting(true);
    try {
      if (editingCategory) await apiClient.put(`/categories/${editingCategory.slug}/`, catForm);
      else await apiClient.post('/categories/', catForm);
      setIsCatModalOpen(false); fetchCategories();
    } catch (err: any) {
      if (err.response?.data) setFormErrors(err.response.data);
      else alert('Failed to save category');
    } finally { setSubmitting(false); }
  };

  // Subcategory CRUD
  const openAddSubcategory = () => {
    setEditingSubcategory(null);
    setSubForm({ name: '', description: '', image_url: '', featured_icon_url: '', category: selectedCategory ? parseInt(selectedCategory) : '', display_order: 0, is_featured: false, is_active: true });
    setFormErrors({}); setIsSubModalOpen(true);
  };
  const openEditSubcategory = (s: Subcategory) => {
    setEditingSubcategory(s);
    setSubForm({ name: s.name, description: s.description, image_url: s.image_url || '', featured_icon_url: s.featured_icon_url || '', category: s.category, display_order: s.display_order, is_featured: s.is_featured, is_active: s.is_active });
    setFormErrors({}); setIsSubModalOpen(true);
  };
  const deleteSubcategory = async (s: Subcategory) => {
    if (!window.confirm(`Delete "${s.name}"?`)) return;
    try { await apiClient.delete(`/subcategories/${s.slug}/`); fetchSubcategories(); }
    catch { alert('Failed to delete subcategory'); }
  };
  const submitSubcategory = async (e: React.FormEvent) => {
    e.preventDefault();
    const errors: Record<string, string> = {};
    if (!subForm.name.trim()) errors.name = 'Name is required';
    if (!subForm.description.trim()) errors.description = 'Description is required';
    if (!subForm.category) errors.category = 'Category is required';
    setFormErrors(errors);
    if (Object.keys(errors).length > 0) return;
    setSubmitting(true);
    try {
      if (editingSubcategory) await apiClient.put(`/subcategories/${editingSubcategory.slug}/`, subForm);
      else await apiClient.post('/subcategories/', subForm);
      setIsSubModalOpen(false); fetchSubcategories();
    } catch (err: any) {
      if (err.response?.data) setFormErrors(err.response.data);
      else alert('Failed to save subcategory');
    } finally { setSubmitting(false); }
  };

  const isCat = activeTab === 'categories';
  const items = isCat ? filteredCategories : filteredSubcategories;
  const totalCount = isCat ? categories.length : subcategories.length;

  return (
    <div className="cat-page animate-fadeIn">

      {/* Header */}
      <div className="cat-header">
        <div className="cat-header-left">
          <h1 className="cat-title">{isCat ? 'Categories' : 'Subcategories'}</h1>
          <span className="cat-count">{totalCount}</span>
        </div>
        <div className="cat-header-actions">
          <button className="btn-add-cat" onClick={isCat ? openAddCategory : openAddSubcategory}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
            {isCat ? 'Add Category' : 'Add Subcategory'}
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="cat-tabs">
        <button className={`cat-tab ${activeTab === 'categories' ? 'active' : ''}`} onClick={() => setActiveTab('categories')}>
          Categories ({categories.length})
        </button>
        <button className={`cat-tab ${activeTab === 'subcategories' ? 'active' : ''}`} onClick={() => setActiveTab('subcategories')}>
          Subcategories ({subcategories.length})
        </button>
      </div>

      {/* Filters */}
      <div className="cat-filters">
        <div className="cat-search-wrap">
          <svg className="cat-search-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          <input className="cat-search" type="text" placeholder={`Search ${isCat ? 'categories' : 'subcategories'}…`}
            value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
        </div>
        <select className="cat-filter-select" value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
          <option value="">All Status</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
        <select className="cat-filter-select" value={filterFeatured} onChange={e => setFilterFeatured(e.target.value)}>
          <option value="">All Types</option>
          <option value="featured">Featured</option>
          <option value="regular">Regular</option>
        </select>
        {!isCat && (
          <select className="cat-filter-select" value={selectedCategory} onChange={e => setSelectedCategory(e.target.value)}>
            <option value="">All Categories</option>
            {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        )}
        <div className="cat-view-toggle">
          <button className={`cat-view-btn ${viewMode === 'grid' ? 'active' : ''}`} onClick={() => setViewMode('grid')} title="Grid view">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
              <rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>
            </svg>
          </button>
          <button className={`cat-view-btn ${viewMode === 'list' ? 'active' : ''}`} onClick={() => setViewMode('list')} title="List view">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/>
              <line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/>
              <line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/>
            </svg>
          </button>
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div className="cat-loading"><div className="cat-spinner" /><span>Loading…</span></div>
      ) : items.length === 0 ? (
        <div className="cat-empty">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2">
            <path d="M22 19a2 2 0 01-2 2H4a2 2 0 01-2-2V5a2 2 0 012-2h5l2 3h9a2 2 0 012 2z"/>
          </svg>
          <p>No {isCat ? 'categories' : 'subcategories'} found</p>
          <button className="btn-add-cat" onClick={isCat ? openAddCategory : openAddSubcategory}>
            Create first {isCat ? 'category' : 'subcategory'}
          </button>
        </div>
      ) : viewMode === 'grid' ? (
        <div className="cat-grid">
          {isCat ? filteredCategories.map(cat => (
            <div key={cat.id} className="cat-card">
              <div className="cat-card-img-wrap">
                {cat.image_url ? <img src={cat.image_url} alt={cat.name} className="cat-card-img" /> : (
                  <div className="cat-card-img-placeholder">
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2">
                      <rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/>
                      <polyline points="21 15 16 10 5 21"/>
                    </svg>
                    <span>No image</span>
                  </div>
                )}
                <div className="cat-card-overlay">
                  <button className="cat-btn-edit" onClick={() => openEditCategory(cat)}>Edit</button>
                  <button className="cat-btn-delete" onClick={() => deleteCategory(cat)}>Delete</button>
                </div>
                <div className="cat-card-order">#{cat.display_order}</div>
              </div>
              <div className="cat-card-body">
                <div className="cat-card-name">{cat.name}</div>
                {cat.subtitle && <div className="cat-card-subtitle">{cat.subtitle}</div>}
                <div className="cat-card-meta">
                  <StatusBadge active={cat.is_active} />
                  {cat.is_featured && <FeaturedBadge />}
                  <CountBadge count={cat.product_count} />
                </div>
              </div>
            </div>
          )) : filteredSubcategories.map(sub => (
            <div key={sub.id} className="cat-card">
              <div className="cat-card-img-wrap">
                {sub.image_url ? <img src={sub.image_url} alt={sub.name} className="cat-card-img" /> : (
                  <div className="cat-card-img-placeholder">
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2">
                      <rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/>
                      <polyline points="21 15 16 10 5 21"/>
                    </svg>
                    <span>No image</span>
                  </div>
                )}
                <div className="cat-card-overlay">
                  <button className="cat-btn-edit" onClick={() => openEditSubcategory(sub)}>Edit</button>
                  <button className="cat-btn-delete" onClick={() => deleteSubcategory(sub)}>Delete</button>
                </div>
                <div className="cat-card-order">#{sub.display_order}</div>
              </div>
              <div className="cat-card-body">
                <div className="cat-card-name">{sub.name}</div>
                <div className="cat-card-subtitle">{sub.category_name}</div>
                <div className="cat-card-meta">
                  <StatusBadge active={sub.is_active} />
                  {sub.is_featured && <FeaturedBadge />}
                  <CountBadge count={sub.product_count} />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* List View */
        <div className="cat-list">
          <div className="cat-list-header">
            <span>Image</span><span>Name</span>
            <span>{isCat ? 'Subtitle' : 'Category'}</span>
            <span>Order</span><span>Featured</span><span>Status</span><span>Actions</span>
          </div>
          {(isCat ? filteredCategories : filteredSubcategories).map((item: any) => (
            <div key={item.id} className="cat-list-row">
              <div>
                {item.image_url
                  ? <img src={item.image_url} alt={item.name} className="cat-list-img" />
                  : <div className="cat-list-img-placeholder">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                        <rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/>
                        <polyline points="21 15 16 10 5 21"/>
                      </svg>
                    </div>
                }
              </div>
              <div>
                <div className="cat-list-name">{item.name}</div>
                <div className="cat-list-sub">{item.product_count} products</div>
              </div>
              <div className="cat-list-sub">{isCat ? item.subtitle : item.category_name}</div>
              <div className="cat-list-sub">#{item.display_order}</div>
              <div>{item.is_featured ? <FeaturedBadge /> : <span className="cat-list-sub">—</span>}</div>
              <div><StatusBadge active={item.is_active} /></div>
              <div className="cat-list-actions">
                <button className="cat-btn-edit" onClick={() => isCat ? openEditCategory(item) : openEditSubcategory(item)}>Edit</button>
                <button className="cat-btn-delete" onClick={() => isCat ? deleteCategory(item) : deleteSubcategory(item)}>Del</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Category Modal */}
      {isCatModalOpen && (
        <div className="cat-modal-overlay" onClick={e => { if (e.target === e.currentTarget) setIsCatModalOpen(false); }}>
          <div className="cat-modal">
            <div className="cat-modal-header">
              <h2 className="cat-modal-title">{editingCategory ? 'Edit Category' : 'New Category'}</h2>
              <button className="cat-modal-close" onClick={() => setIsCatModalOpen(false)}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            </div>
            <form onSubmit={submitCategory} style={{ display: 'contents' }}>
              <div className="cat-modal-body">
                {/* Basic Info */}
                <div className="cat-form-section">
                  <div className="cat-form-section-title">Basic Information</div>
                  <div className="cat-form-group">
                    <label className="cat-form-label">Name <span>*</span></label>
                    <input className={`cat-form-input ${formErrors.name ? 'error' : ''}`} type="text"
                      placeholder="e.g. Living Room" value={catForm.name}
                      onChange={e => setCatForm({ ...catForm, name: e.target.value })} />
                    {formErrors.name && <span className="cat-form-error">{formErrors.name}</span>}
                  </div>
                  <div className="cat-form-group">
                    <label className="cat-form-label">Subtitle</label>
                    <input className="cat-form-input" type="text"
                      placeholder="Short tagline for the category" value={catForm.subtitle}
                      onChange={e => setCatForm({ ...catForm, subtitle: e.target.value })} />
                  </div>
                  <div className="cat-form-group">
                    <label className="cat-form-label">Description <span>*</span></label>
                    <textarea className={`cat-form-textarea ${formErrors.description ? 'error' : ''}`}
                      rows={3} placeholder="Describe this category…" value={catForm.description}
                      onChange={e => setCatForm({ ...catForm, description: e.target.value })} />
                    {formErrors.description && <span className="cat-form-error">{formErrors.description}</span>}
                  </div>
                </div>

                {/* Image */}
                <div className="cat-form-section">
                  <div className="cat-form-section-title">Category Image</div>
                  <DragDropImageUpload
                    value={catForm.image_url}
                    onChange={url => setCatForm({ ...catForm, image_url: url })}
                    aspectRatio={IMAGE_CONFIGS.category.aspectRatio}
                    hint={IMAGE_CONFIGS.category.description}
                    error={formErrors.image_url}
                  />
                </div>

                {/* Settings */}
                <div className="cat-form-section">
                  <div className="cat-form-section-title">Settings</div>
                  <div className="cat-form-group">
                    <label className="cat-form-label">Display Order</label>
                    <input className="cat-form-input" type="number" value={catForm.display_order}
                      onChange={e => setCatForm({ ...catForm, display_order: parseInt(e.target.value) || 0 })} />
                    <span className="cat-form-hint">Lower numbers appear first</span>
                  </div>
                  <Toggle checked={catForm.is_featured} onChange={v => setCatForm({ ...catForm, is_featured: v })}
                    label="Featured Category" desc="Show in homepage featured section" />
                  <Toggle checked={catForm.is_active} onChange={v => setCatForm({ ...catForm, is_active: v })}
                    label="Active" desc="Visible to customers on the website" />
                </div>
              </div>
              <div className="cat-modal-footer">
                <button type="button" className="btn-cancel" onClick={() => setIsCatModalOpen(false)} disabled={submitting}>Cancel</button>
                <button type="submit" className="btn-save" disabled={submitting}>
                  {submitting ? 'Saving…' : editingCategory ? 'Update Category' : 'Create Category'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Subcategory Modal */}
      {isSubModalOpen && (
        <div className="cat-modal-overlay" onClick={e => { if (e.target === e.currentTarget) setIsSubModalOpen(false); }}>
          <div className="cat-modal">
            <div className="cat-modal-header">
              <h2 className="cat-modal-title">{editingSubcategory ? 'Edit Subcategory' : 'New Subcategory'}</h2>
              <button className="cat-modal-close" onClick={() => setIsSubModalOpen(false)}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            </div>
            <form onSubmit={submitSubcategory} style={{ display: 'contents' }}>
              <div className="cat-modal-body">
                {/* Basic Info */}
                <div className="cat-form-section">
                  <div className="cat-form-section-title">Basic Information</div>
                  <div className="cat-form-group">
                    <label className="cat-form-label">Name <span>*</span></label>
                    <input className={`cat-form-input ${formErrors.name ? 'error' : ''}`} type="text"
                      placeholder="e.g. Sofas" value={subForm.name}
                      onChange={e => setSubForm({ ...subForm, name: e.target.value })} />
                    {formErrors.name && <span className="cat-form-error">{formErrors.name}</span>}
                  </div>
                  <div className="cat-form-group">
                    <label className="cat-form-label">Parent Category <span>*</span></label>
                    <select className={`cat-form-select ${formErrors.category ? 'error' : ''}`}
                      value={subForm.category}
                      onChange={e => setSubForm({ ...subForm, category: parseInt(e.target.value) || '' })}>
                      <option value="">Select a category…</option>
                      {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                    {formErrors.category && <span className="cat-form-error">{formErrors.category}</span>}
                  </div>
                  <div className="cat-form-group">
                    <label className="cat-form-label">Description <span>*</span></label>
                    <textarea className={`cat-form-textarea ${formErrors.description ? 'error' : ''}`}
                      rows={3} placeholder="Describe this subcategory…" value={subForm.description}
                      onChange={e => setSubForm({ ...subForm, description: e.target.value })} />
                    {formErrors.description && <span className="cat-form-error">{formErrors.description}</span>}
                  </div>
                </div>

                {/* Images */}
                <div className="cat-form-section">
                  <div className="cat-form-section-title">Images</div>
                  <DragDropImageUpload
                    label="Subcategory Image"
                    value={subForm.image_url}
                    onChange={url => setSubForm({ ...subForm, image_url: url })}
                    aspectRatio={IMAGE_CONFIGS.subcategory.aspectRatio}
                    hint={IMAGE_CONFIGS.subcategory.description}
                  />
                  <DragDropImageUpload
                    label="Featured Icon (SVG/PNG)"
                    value={subForm.featured_icon_url}
                    onChange={url => setSubForm({ ...subForm, featured_icon_url: url })}
                    aspectRatio={1}
                  />
                  <span className="cat-form-hint">Icon shown in homepage featured subcategories section</span>
                </div>

                {/* Settings */}
                <div className="cat-form-section">
                  <div className="cat-form-section-title">Settings</div>
                  <div className="cat-form-group">
                    <label className="cat-form-label">Display Order</label>
                    <input className="cat-form-input" type="number" value={subForm.display_order}
                      onChange={e => setSubForm({ ...subForm, display_order: parseInt(e.target.value) || 0 })} />
                  </div>
                  <Toggle checked={subForm.is_featured} onChange={v => setSubForm({ ...subForm, is_featured: v })}
                    label="Featured" desc="Show on homepage featured subcategories" />
                  <Toggle checked={subForm.is_active} onChange={v => setSubForm({ ...subForm, is_active: v })}
                    label="Active" desc="Visible to customers on the website" />
                </div>
              </div>
              <div className="cat-modal-footer">
                <button type="button" className="btn-cancel" onClick={() => setIsSubModalOpen(false)} disabled={submitting}>Cancel</button>
                <button type="submit" className="btn-save" disabled={submitting}>
                  {submitting ? 'Saving…' : editingSubcategory ? 'Update Subcategory' : 'Create Subcategory'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CategoriesManagement;
