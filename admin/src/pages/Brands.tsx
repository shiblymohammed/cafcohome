import { useState, useEffect, useRef } from 'react';
import apiClient, { extractData } from '../utils/api';
import ImageCropperWithUpload from '../components/ImageCropperWithUpload';
import { IMAGE_CONFIGS } from '../config/imageConfig';
import './Brands.css';

interface Brand {
  id: number;
  name: string;
  slug: string;
  description: string;
  logo_url: string;
  is_active: boolean;
  created_at: string;
}

interface BrandFormData {
  name: string;
  description: string;
  logo_url: string;
  is_active: boolean;
}

// ── Drag-Drop Image Upload ──────────────────────────────────────────────────
interface DragDropProps {
  value: string;
  onChange: (url: string) => void;
  label?: string;
  error?: string;
  aspectRatio?: number;
}
const DragDropImageUpload = ({ value, onChange, label, error, aspectRatio = 1 }: DragDropProps) => {
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
    <div className="br-form-group">
      {label && <label className="br-form-label">{label}</label>}
      <div
        className={`br-drop-zone ${dragging ? 'dragging' : ''} ${value ? 'has-image' : ''}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
      >
        {value ? (
          <>
            <img src={value} alt="Logo preview" className="br-drop-preview" />
            <div className="br-drop-replace-overlay"><span>Click or Drag to Replace</span></div>
            <button type="button" className="br-drop-remove" onClick={e => { e.stopPropagation(); onChange(''); }}>×</button>
          </>
        ) : (
          <div className="br-drop-placeholder">
            <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2">
              <rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/>
              <polyline points="21 15 16 10 5 21"/>
            </svg>
            <span className="br-drop-placeholder-title">Drop logo here or click to upload</span>
            <span className="br-drop-placeholder-sub">PNG, JPG, WEBP · Square 1:1</span>
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
      {error && <span className="br-form-error">{error}</span>}
    </div>
  );
};

// ── Toggle Switch ──────────────────────────────────────────────────
const Toggle = ({ checked, onChange, label, desc }: { checked: boolean; onChange: (v: boolean) => void; label: string; desc?: string }) => (
  <div className="br-toggle-row">
    <div className="br-toggle-info">
      <span className="br-toggle-label">{label}</span>
      {desc && <span className="br-toggle-desc">{desc}</span>}
    </div>
    <label className="br-toggle">
      <input type="checkbox" className="br-toggle-input" checked={checked} onChange={e => onChange(e.target.checked)} />
      <span className="br-toggle-slider" />
    </label>
  </div>
);

const Brands = () => {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchTerm, setSearchTerm] = useState('');
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [editingBrand, setEditingBrand] = useState<Brand | null>(null);
  const [formData, setFormData] = useState<BrandFormData>({ name: '', description: '', logo_url: '', is_active: true });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => { fetchBrands(); }, []);

  const fetchBrands = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get('/brands/');
      setBrands(extractData<Brand>(response.data));
    } catch (error) {
      console.error('Failed to fetch brands:', error);
      alert('Failed to load brands');
      setBrands([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = () => {
    setEditingBrand(null);
    setFormData({ name: '', description: '', logo_url: '', is_active: true });
    setFormErrors({});
    setIsPanelOpen(true);
  };

  const handleEdit = (brand: Brand) => {
    setEditingBrand(brand);
    setFormData({ name: brand.name, description: brand.description, logo_url: brand.logo_url, is_active: brand.is_active });
    setFormErrors({});
    setIsPanelOpen(true);
  };

  const handleDelete = async (brand: Brand) => {
    if (!window.confirm(`Delete "${brand.name}"?`)) return;
    try {
      await apiClient.delete(`/brands/${brand.slug}/`);
      fetchBrands();
    } catch (error) {
      console.error('Failed to delete brand:', error);
      alert('Failed to delete brand');
    }
  };

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};
    if (!formData.name.trim()) errors.name = 'Name is required';
    if (!formData.description.trim()) errors.description = 'Description is required';
    if (!formData.logo_url.trim()) errors.logo_url = 'Logo is required';
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    setSubmitting(true);
    try {
      if (editingBrand) {
        await apiClient.put(`/brands/${editingBrand.slug}/`, formData);
      } else {
        await apiClient.post('/brands/', formData);
      }
      setIsPanelOpen(false);
      fetchBrands();
    } catch (error: any) {
      console.error('Failed to save brand:', error);
      if (error.response?.data) setFormErrors(error.response.data);
      else alert('Failed to save brand');
    } finally {
      setSubmitting(false);
    }
  };

  const filtered = brands.filter(b =>
    !searchTerm || b.name.toLowerCase().includes(searchTerm.toLowerCase()) || b.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="br-page">
      {/* Header */}
      <div className="br-header">
        <div className="br-header-left">
          <h1 className="br-title">Brands</h1>
          <span className="br-count">{brands.length}</span>
        </div>
        <div className="br-header-actions">
          <div className="br-view-toggle">
            <button className={`br-view-btn ${viewMode === 'grid' ? 'active' : ''}`} onClick={() => setViewMode('grid')} title="Grid view">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
                <rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>
              </svg>
            </button>
            <button className={`br-view-btn ${viewMode === 'list' ? 'active' : ''}`} onClick={() => setViewMode('list')} title="List view">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/>
                <line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/>
                <line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/>
              </svg>
            </button>
          </div>
          <button className="br-btn-add" onClick={handleAdd}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
            Add Brand
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="br-filters">
        <div className="br-search-wrap">
          <svg className="br-search-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          <input className="br-search" type="text" placeholder="Search brands…" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div className="br-loading"><div className="br-spinner" /><span>Loading…</span></div>
      ) : filtered.length === 0 ? (
        <div className="br-empty">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2">
            <path d="M20.59 13.41l-7.17 7.17a2 2 0 01-2.83 0L2 12V2h10l8.59 8.59a2 2 0 010 2.82z"/>
            <line x1="7" y1="7" x2="7.01" y2="7"/>
          </svg>
          <p>No brands found</p>
          <button className="br-btn-add" onClick={handleAdd}>Create first brand</button>
        </div>
      ) : viewMode === 'grid' ? (
        <div className="br-grid">
          {filtered.map(brand => (
            <div key={brand.id} className="br-card">
              <div className="br-card-img-wrap">
                {brand.logo_url ? (
                  <img src={brand.logo_url} alt={brand.name} className="br-card-img" />
                ) : (
                  <div className="br-card-img-placeholder">
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2">
                      <path d="M20.59 13.41l-7.17 7.17a2 2 0 01-2.83 0L2 12V2h10l8.59 8.59a2 2 0 010 2.82z"/>
                    </svg>
                  </div>
                )}
                <div className="br-card-overlay">
                  <button className="br-btn-edit" onClick={() => handleEdit(brand)}>Edit</button>
                  <button className="br-btn-delete" onClick={() => handleDelete(brand)}>Delete</button>
                </div>
              </div>
              <div className="br-card-body">
                <div className="br-card-name">{brand.name}</div>
                <div className="br-card-desc">{brand.description}</div>
                <div className="br-card-meta">
                  <span className={`br-badge ${brand.is_active ? 'br-badge-active' : 'br-badge-inactive'}`}>
                    {brand.is_active ? 'Active' : 'Inactive'}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="br-list">
          <div className="br-list-header">
            <span>Logo</span><span>Name</span><span>Description</span><span>Status</span><span>Actions</span>
          </div>
          {filtered.map(brand => (
            <div key={brand.id} className="br-list-row">
              <div>
                {brand.logo_url
                  ? <img src={brand.logo_url} alt={brand.name} className="br-list-img" />
                  : <div className="br-list-img-placeholder">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                        <path d="M20.59 13.41l-7.17 7.17a2 2 0 01-2.83 0L2 12V2h10l8.59 8.59a2 2 0 010 2.82z"/>
                      </svg>
                    </div>
                }
              </div>
              <div className="br-list-name">{brand.name}</div>
              <div className="br-list-desc">{brand.description}</div>
              <div>
                <span className={`br-badge ${brand.is_active ? 'br-badge-active' : 'br-badge-inactive'}`}>
                  {brand.is_active ? 'Active' : 'Inactive'}
                </span>
              </div>
              <div className="br-list-actions">
                <button className="br-btn-edit" onClick={() => handleEdit(brand)}>Edit</button>
                <button className="br-btn-delete" onClick={() => handleDelete(brand)}>Delete</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Slide-in Panel */}
      {isPanelOpen && (
        <div className="br-overlay" onClick={e => { if (e.target === e.currentTarget) setIsPanelOpen(false); }}>
          <div className="br-panel">
            <div className="br-panel-header">
              <h2 className="br-panel-title">{editingBrand ? 'Edit Brand' : 'New Brand'}</h2>
              <button className="br-panel-close" onClick={() => setIsPanelOpen(false)}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            </div>
            <form onSubmit={handleSubmit} style={{ display: 'contents' }}>
              <div className="br-panel-body">
                {/* Basic Info */}
                <div className="br-form-section">
                  <div className="br-form-section-title">Basic Info</div>
                  <div className="br-form-group">
                    <label className="br-form-label">Name <span>*</span></label>
                    <input
                      className={`br-form-input ${formErrors.name ? 'error' : ''}`}
                      type="text" placeholder="e.g. Nilkamal"
                      value={formData.name}
                      onChange={e => setFormData({ ...formData, name: e.target.value })}
                    />
                    {formErrors.name && <span className="br-form-error">{formErrors.name}</span>}
                  </div>
                  <div className="br-form-group">
                    <label className="br-form-label">Description <span>*</span></label>
                    <textarea
                      className={`br-form-textarea ${formErrors.description ? 'error' : ''}`}
                      rows={4} placeholder="Describe this brand…"
                      value={formData.description}
                      onChange={e => setFormData({ ...formData, description: e.target.value })}
                    />
                    {formErrors.description && <span className="br-form-error">{formErrors.description}</span>}
                  </div>
                </div>

                {/* Logo */}
                <div className="br-form-section">
                  <div className="br-form-section-title">Logo</div>
                  <DragDropImageUpload
                    value={formData.logo_url}
                    onChange={url => setFormData({ ...formData, logo_url: url })}
                    aspectRatio={IMAGE_CONFIGS.brand.aspectRatio}
                    error={formErrors.logo_url}
                  />
                </div>

                {/* Settings */}
                <div className="br-form-section">
                  <div className="br-form-section-title">Settings</div>
                  <Toggle
                    checked={formData.is_active}
                    onChange={v => setFormData({ ...formData, is_active: v })}
                    label="Active"
                    desc="Visible to customers on the website"
                  />
                </div>
              </div>
              <div className="br-panel-footer">
                <button type="button" className="br-btn-cancel" onClick={() => setIsPanelOpen(false)} disabled={submitting}>Cancel</button>
                <button type="submit" className="br-btn-save" disabled={submitting}>
                  {submitting ? 'Saving…' : editingBrand ? 'Update Brand' : 'Create Brand'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Brands;
