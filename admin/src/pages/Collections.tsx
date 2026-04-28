import { useState, useEffect, useRef } from 'react';
import apiClient, { extractData } from '../utils/api';
import ImageCropperWithUpload from '../components/ImageCropperWithUpload';
import { IMAGE_CONFIGS } from '../config/imageConfig';
import './Categories.css';

interface Product {
  id: number;
  name: string;
}

interface Collection {
  id: number;
  name: string;
  slug: string;
  subtitle: string;
  description: string;
  tags: string;
  image_url: string;
  is_active: boolean;
  product_count: number;
  products: number[];
  created_at: string;
}

interface CollectionFormData {
  name: string;
  subtitle: string;
  description: string;
  tags: string;
  image_url: string;
  is_active: boolean;
  products: number[];
}

// ── Drag-Drop Image Upload ──────────────────────────────────────────────────
interface DragDropProps {
  value: string;
  onChange: (url: string) => void;
  label?: string;
  error?: string;
  aspectRatio?: number;
}
const DragDropImageUpload = ({ value, onChange, label, error, aspectRatio = 16/9 }: DragDropProps) => {
  const [dragging, setDragging] = useState(false);
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
        onClick={!value ? handleClick : undefined}
      >
        {value ? (
          <>
            <img src={value} alt="Preview" className="cat-drop-preview" />
            <button type="button" className="cat-drop-remove" onClick={e => { e.stopPropagation(); onChange(''); }}>
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
            <span className="cat-drop-placeholder-sub">PNG, JPG, WEBP</span>
          </div>
        )}
      </div>
      <div style={{ display: 'none' }}>
        <ImageCropperWithUpload value={value} onChange={onChange} aspectRatio={aspectRatio} />
      </div>
      <input ref={fileInputRef} type="file" accept="image/*" style={{ display: 'none' }}
        onChange={e => {
          const file = e.target.files?.[0];
          if (!file) return;
          const hiddenInput = e.target.parentElement?.querySelector('.image-uploader input[type="file"]') as HTMLInputElement;
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

// ── Main Component ──────────────────────────────────────────────────
const Collections = () => {
  const [collections, setCollections] = useState<Collection[]>([]);
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCollection, setEditingCollection] = useState<Collection | null>(null);
  const [form, setForm] = useState<CollectionFormData>({
    name: '', subtitle: '', description: '', tags: '', image_url: '', is_active: true, products: []
  });

  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchCollections();
    fetchProducts();
  }, []);

  const fetchCollections = async () => {
    try {
      setLoading(true);
      const r = await apiClient.get('/collections/');
      setCollections(extractData<Collection>(r.data));
    } catch {
      alert('Failed to load collections');
    } finally {
      setLoading(false);
    }
  };

  const fetchProducts = async () => {
    try {
      // Just fetch lightweight product list if possible, or paginated
      const r = await apiClient.get('/products/');
      setAllProducts(extractData<Product>(r.data));
    } catch {
      console.error('Failed to fetch products');
    }
  };

  const filteredCollections = collections.filter(c => {
    if (searchTerm && !c.name.toLowerCase().includes(searchTerm.toLowerCase())) return false;
    return true;
  });

  const openAdd = () => {
    setEditingCollection(null);
    setForm({ name: '', subtitle: '', description: '', tags: '', image_url: '', is_active: true, products: [] });
    setFormErrors({});
    setIsModalOpen(true);
  };

  const openEdit = (c: Collection) => {
    setEditingCollection(c);
    setForm({
      name: c.name,
      subtitle: c.subtitle,
      description: c.description,
      tags: c.tags,
      image_url: c.image_url,
      is_active: c.is_active,
      products: c.products || []
    });
    setFormErrors({});
    setIsModalOpen(true);
  };

  const handleDelete = async (c: Collection) => {
    if (!window.confirm(`Delete "${c.name}"?`)) return;
    try {
      await apiClient.delete(`/collections/${c.slug}/`);
      fetchCollections();
    } catch {
      alert('Failed to delete collection');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errors: Record<string, string> = {};
    if (!form.name.trim()) errors.name = 'Name is required';
    if (!form.image_url.trim()) errors.image_url = 'Image is required';
    
    setFormErrors(errors);
    if (Object.keys(errors).length > 0) return;
    
    setSubmitting(true);
    try {
      if (editingCollection) {
        await apiClient.put(`/collections/${editingCollection.slug}/`, form);
      } else {
        await apiClient.post('/collections/', form);
      }
      setIsModalOpen(false);
      fetchCollections();
    } catch (err: any) {
      if (err.response?.data) setFormErrors(err.response.data);
      else alert('Failed to save collection');
    } finally {
      setSubmitting(false);
    }
  };

  const handleProductToggle = (productId: number) => {
    setForm(prev => {
      const isSelected = prev.products.includes(productId);
      if (isSelected) {
        return { ...prev, products: prev.products.filter(id => id !== productId) };
      } else {
        return { ...prev, products: [...prev.products, productId] };
      }
    });
  };

  return (
    <div className="cat-page animate-fadeIn">
      <div className="cat-header">
        <div className="cat-header-left">
          <h1 className="cat-title">Collections</h1>
          <span className="cat-count">{collections.length}</span>
        </div>
        <div className="cat-header-actions">
          <button className="btn-add-cat" onClick={openAdd}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
            Create Collection
          </button>
        </div>
      </div>

      <div className="cat-filters">
        <div className="cat-search-wrap">
          <svg className="cat-search-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          <input className="cat-search" type="text" placeholder="Search collections…"
            value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
        </div>
      </div>

      {loading ? (
        <div className="cat-loading"><div className="cat-spinner" /><span>Loading…</span></div>
      ) : filteredCollections.length === 0 ? (
        <div className="cat-empty">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2">
            <path d="M22 19a2 2 0 01-2 2H4a2 2 0 01-2-2V5a2 2 0 012-2h5l2 3h9a2 2 0 012 2z"/>
          </svg>
          <p>No collections found</p>
          <button className="btn-add-cat" onClick={openAdd}>
            Create your first collection
          </button>
        </div>
      ) : (
        <div className="cat-grid">
          {filteredCollections.map(item => (
            <div key={item.id} className="cat-card">
              <div className="cat-card-img-wrap" style={{ aspectRatio: '16/9' }}>
                {item.image_url ? (
                  <img src={item.image_url} alt={item.name} className="cat-card-img" style={{ objectFit: 'cover' }} />
                ) : (
                  <div className="cat-card-img-placeholder">
                    <span>No image</span>
                  </div>
                )}
                <div className="cat-card-overlay">
                  <button className="cat-btn-edit" onClick={() => openEdit(item)}>Edit</button>
                  <button className="cat-btn-delete" onClick={() => handleDelete(item)}>Delete</button>
                </div>
              </div>
              <div className="cat-card-body">
                <div className="cat-card-name">{item.name}</div>
                {item.subtitle && <div className="cat-card-subtitle">{item.subtitle}</div>}
                <div className="cat-card-meta">
                  <span className={`cat-badge ${item.is_active ? 'cat-badge-active' : 'cat-badge-inactive'}`}>
                    {item.is_active ? 'Active' : 'Inactive'}
                  </span>
                  <span className="cat-badge cat-badge-count">{item.product_count} products</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {isModalOpen && (
        <div className="cat-modal-overlay" onClick={e => { if (e.target === e.currentTarget) setIsModalOpen(false); }}>
          <div className="cat-modal">
            <div className="cat-modal-header">
              <h2 className="cat-modal-title">{editingCollection ? 'Edit Collection' : 'New Collection'}</h2>
              <button className="cat-modal-close" onClick={() => setIsModalOpen(false)}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            </div>
            <form onSubmit={handleSubmit} style={{ display: 'contents' }}>
              <div className="cat-modal-body">
                <div className="cat-form-section">
                  <div className="cat-form-section-title">Basic Information</div>
                  <div className="cat-form-group">
                    <label className="cat-form-label">Name <span>*</span></label>
                    <input className={`cat-form-input ${formErrors.name ? 'error' : ''}`} type="text"
                      placeholder="e.g. Summer Edit" value={form.name}
                      onChange={e => setForm({ ...form, name: e.target.value })} />
                    {formErrors.name && <span className="cat-form-error">{formErrors.name}</span>}
                  </div>
                  <div className="cat-form-group">
                    <label className="cat-form-label">Subtitle</label>
                    <input className="cat-form-input" type="text"
                      placeholder="Tagline" value={form.subtitle}
                      onChange={e => setForm({ ...form, subtitle: e.target.value })} />
                  </div>
                  <div className="cat-form-group">
                    <label className="cat-form-label">Description</label>
                    <textarea className="cat-form-textarea" rows={3} 
                      placeholder="Describe this collection…" value={form.description}
                      onChange={e => setForm({ ...form, description: e.target.value })} />
                  </div>
                  <div className="cat-form-group">
                    <label className="cat-form-label">Tags</label>
                    <input className="cat-form-input" type="text"
                      placeholder="Comma separated tags" value={form.tags}
                      onChange={e => setForm({ ...form, tags: e.target.value })} />
                  </div>
                </div>

                <div className="cat-form-section">
                  <div className="cat-form-section-title">Collection Image</div>
                  <DragDropImageUpload
                    value={form.image_url}
                    onChange={url => setForm({ ...form, image_url: url })}
                    error={formErrors.image_url}
                    aspectRatio={16/9}
                  />
                </div>
                
                <div className="cat-form-section">
                  <div className="cat-form-section-title">Products</div>
                  <div className="cat-form-group">
                    <label className="cat-form-label">Select Products</label>
                    <div style={{ maxHeight: '200px', overflowY: 'auto', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '10px' }}>
                      {allProducts.length === 0 ? (
                        <div style={{ padding: '10px', color: 'var(--text-muted)' }}>No products available.</div>
                      ) : (
                        allProducts.map(p => (
                          <label key={p.id} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '6px 0', cursor: 'pointer' }}>
                            <input 
                              type="checkbox" 
                              checked={form.products.includes(p.id)}
                              onChange={() => handleProductToggle(p.id)}
                            />
                            <span style={{ fontSize: '0.9rem' }}>{p.name}</span>
                          </label>
                        ))
                      )}
                    </div>
                  </div>
                </div>

                <div className="cat-form-section">
                  <div className="cat-form-section-title">Settings</div>
                  <Toggle checked={form.is_active} onChange={v => setForm({ ...form, is_active: v })}
                    label="Active" desc="Visible to customers on the website" />
                </div>
              </div>
              <div className="cat-modal-footer">
                <button type="button" className="btn-cancel" onClick={() => setIsModalOpen(false)} disabled={submitting}>Cancel</button>
                <button type="submit" className="btn-save" disabled={submitting}>
                  {submitting ? 'Saving…' : editingCollection ? 'Update Collection' : 'Create Collection'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Collections;
