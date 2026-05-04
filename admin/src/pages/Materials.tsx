import { useState, useEffect } from 'react';
import apiClient, { extractData } from '../utils/api';
import ImageCropperWithUpload from '../components/ImageCropperWithUpload';
import { IMAGE_CONFIGS } from '../config/imageConfig';
import './Materials.css';

interface Color {
  id: number;
  name: string;
  hex_code: string;
  is_active: boolean;
}

interface MaterialColor {
  id: number;
  color: number;
  color_id: number;
  color_name: string;
  color_hex_code: string;
  is_active: boolean;
}

interface Material {
  id: number;
  name: string;
  title: string;
  description: string;
  image_url: string;
  is_active: boolean;
  available_colors: MaterialColor[];
  created_at: string;
}

interface MaterialFormData {
  name: string;
  title: string;
  description: string;
  image_url: string;
  is_active: boolean;
}

const Materials = () => {
  const [materials, setMaterials]       = useState<Material[]>([]);
  const [colors, setColors]             = useState<Color[]>([]);
  const [loading, setLoading]           = useState(true);
  const [isModalOpen, setIsModalOpen]   = useState(false);
  const [isColorModalOpen, setIsColorModalOpen] = useState(false);
  const [editingMaterial, setEditingMaterial]   = useState<Material | null>(null);
  const [selectedMaterial, setSelectedMaterial] = useState<Material | null>(null);
  const [colorSearch, setColorSearch]   = useState('');
  const [formData, setFormData] = useState<MaterialFormData>({
    name: '', title: '', description: '', image_url: '', is_active: true,
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => { fetchMaterials(); fetchColors(); }, []);

  const fetchMaterials = async () => {
    try {
      setLoading(true);
      const r = await apiClient.get('/materials/');
      setMaterials(extractData(r.data) as Material[]);
    } catch { alert('Failed to load materials'); }
    finally { setLoading(false); }
  };

  const fetchColors = async () => {
    try {
      const r = await apiClient.get('/colors/');
      setColors((extractData(r.data) as Color[]).filter((c: Color) => c.is_active));
    } catch { console.error('Failed to fetch colors'); }
  };

  const openAdd = () => {
    setEditingMaterial(null);
    setFormData({ name: '', title: '', description: '', image_url: '', is_active: true });
    setFormErrors({});
    setIsModalOpen(true);
  };

  const openEdit = (m: Material) => {
    setEditingMaterial(m);
    setFormData({
      name: m.name, title: m.title || '',
      description: m.description || '', image_url: m.image_url || '',
      is_active: m.is_active,
    });
    setFormErrors({});
    setIsModalOpen(true);
  };

  const openColors = (m: Material) => {
    setSelectedMaterial(m);
    setColorSearch('');
    setIsColorModalOpen(true);
  };

  const handleDelete = async (m: Material) => {
    if (!window.confirm(`Delete "${m.name}"?`)) return;
    try { await apiClient.delete(`/materials/${m.id}/`); fetchMaterials(); }
    catch { alert('Failed to delete material'); }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errors: Record<string, string> = {};
    if (!formData.name.trim()) errors.name = 'Material name is required';
    setFormErrors(errors);
    if (Object.keys(errors).length > 0) return;

    setSubmitting(true);
    try {
      if (editingMaterial) await apiClient.put(`/materials/${editingMaterial.id}/`, formData);
      else await apiClient.post('/materials/', formData);
      setIsModalOpen(false);
      fetchMaterials();
    } catch (err: any) {
      if (err.response?.data) setFormErrors(err.response.data);
      else alert('Failed to save material');
    } finally { setSubmitting(false); }
  };

  const toggleColor = async (colorId: number) => {
    if (!selectedMaterial) return;
    const existing = selectedMaterial.available_colors.find(mc => mc.color_id === colorId);
    try {
      if (existing) await apiClient.delete(`/material-colors/${existing.id}/`);
      else await apiClient.post('/material-colors/', { material: selectedMaterial.id, color: colorId, is_active: true });
      // Refresh and keep panel open with updated data
      const r = await apiClient.get('/materials/');
      const updated = extractData<Material>(r.data);
      setMaterials(updated);
      const refreshed = updated.find(m => m.id === selectedMaterial.id);
      if (refreshed) setSelectedMaterial(refreshed);
    } catch { alert('Failed to update colors'); }
  };

  const filteredColors = colors.filter(c =>
    !colorSearch || c.name.toLowerCase().includes(colorSearch.toLowerCase())
  );

  const columns = [
    {
      key: 'image_url', label: 'Image',
      render: (item: Material) => item.image_url ? (
        <img src={item.image_url} alt={item.name} className="material-thumbnail" />
      ) : (
        <div className="material-thumbnail-placeholder">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <rect x="3" y="3" width="18" height="18" rx="2"/>
            <circle cx="8.5" cy="8.5" r="1.5"/>
            <polyline points="21 15 16 10 5 21"/>
          </svg>
        </div>
      ),
    },
    { key: 'name', label: 'Name' },
    {
      key: 'title', label: 'Display Title',
      render: (item: Material) => (
        <span className={item.title ? '' : 'mat-no-value'}>
          {item.title || 'No title set'}
        </span>
      ),
    },
    {
      key: 'available_colors', label: 'Colors',
      render: (item: Material) => (
        <div className="mat-color-dots">
          {item.available_colors?.length > 0 ? (
            <>
              {item.available_colors.slice(0, 6).map(mc => (
                <div key={mc.id} className="mat-color-dot"
                  style={{ background: mc.color_hex_code || '#ccc' }}
                  title={mc.color_name}
                />
              ))}
              {item.available_colors.length > 6 && (
                <span className="mat-color-more">+{item.available_colors.length - 6}</span>
              )}
            </>
          ) : (
            <span className="mat-no-value">None</span>
          )}
        </div>
      ),
    },
    {
      key: 'is_active', label: 'Status',
      render: (item: Material) => (
        <span className={`mat-status ${item.is_active ? 'active' : 'inactive'}`}>
          {item.is_active ? 'Active' : 'Inactive'}
        </span>
      ),
    },
    {
      key: 'manage_colors', label: 'Manage',
      render: (item: Material) => (
        <button className="mat-btn-colors" onClick={e => { e.stopPropagation(); openColors(item); }}>
          Colors ({item.available_colors?.length || 0})
        </button>
      ),
    },
  ];

  return (
    <div className="materials-page">

      {/* Header */}
      <div className="mat-header">
        <div className="mat-header-left">
          <h1 className="mat-title">Materials</h1>
          <span className="mat-count">{materials.length}</span>
        </div>
        <button className="mat-btn-add" onClick={openAdd}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
          Add Material
        </button>
      </div>

      <div className="mat-list">
        <div className="mat-list-header">
          <span>Image</span>
          <span>Name</span>
          <span>Display Title</span>
          <span>Colors</span>
          <span>Status</span>
          <span>Manage</span>
          <span>Actions</span>
        </div>
        {loading ? (
          <div className="mat-loading"><div className="mat-spinner" /><span>Loading…</span></div>
        ) : materials.length === 0 ? (
          <div className="mat-empty">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2">
              <rect x="3" y="3" width="18" height="18" rx="2"/>
              <circle cx="8.5" cy="8.5" r="1.5"/>
              <polyline points="21 15 16 10 5 21"/>
            </svg>
            <p>No materials found</p>
            <button className="mat-btn-add" onClick={openAdd}>Create first material</button>
          </div>
        ) : (
          materials.map(item => (
            <div key={item.id} className="mat-list-row">
              <div>
                {item.image_url ? (
                  <img src={item.image_url} alt={item.name} className="material-thumbnail" />
                ) : (
                  <div className="material-thumbnail-placeholder">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <rect x="3" y="3" width="18" height="18" rx="2"/>
                      <circle cx="8.5" cy="8.5" r="1.5"/>
                      <polyline points="21 15 16 10 5 21"/>
                    </svg>
                  </div>
                )}
              </div>
              <div className="mat-list-name">{item.name}</div>
              <div className="mat-list-title">{item.title || <span className="mat-no-value">No title set</span>}</div>
              <div>
                <div className="mat-color-dots">
                  {item.available_colors?.length > 0 ? (
                    <>
                      {item.available_colors.slice(0, 6).map(mc => (
                        <div key={mc.id} className="mat-color-dot" style={{ background: mc.color_hex_code || '#ccc' }} title={mc.color_name} />
                      ))}
                      {item.available_colors.length > 6 && (
                        <span className="mat-color-more">+{item.available_colors.length - 6}</span>
                      )}
                    </>
                  ) : <span className="mat-no-value">None</span>}
                </div>
              </div>
              <div>
                <span className={`mat-status ${item.is_active ? 'active' : 'inactive'}`}>
                  {item.is_active ? 'Active' : 'Inactive'}
                </span>
              </div>
              <div>
                <button className="mat-btn-colors" onClick={e => { e.stopPropagation(); openColors(item); }}>
                  Colors ({item.available_colors?.length || 0})
                </button>
              </div>
              <div className="mat-list-actions">
                <button className="mat-btn-edit" onClick={() => openEdit(item)}>Edit</button>
                <button className="mat-btn-delete" onClick={() => handleDelete(item)}>Delete</button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* ── Add / Edit Material Panel ── */}
      {isModalOpen && (
        <div className="mat-overlay" onClick={e => { if (e.target === e.currentTarget) setIsModalOpen(false); }}>
          <div className="mat-panel">
            <div className="mat-panel-header">
              <h2 className="mat-panel-title">{editingMaterial ? 'Edit Material' : 'New Material'}</h2>
              <button className="mat-panel-close" onClick={() => setIsModalOpen(false)}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            </div>

            <form onSubmit={handleSubmit} style={{ display: 'contents' }}>
              <div className="mat-panel-body">

                {/* Basic Info */}
                <div className="mat-section">
                  <div className="mat-section-title">Basic Information</div>

                  <div className="mat-field">
                    <label className="mat-label">
                      Name <span className="mat-required">*</span>
                    </label>
                    <input
                      className={`mat-input ${formErrors.name ? 'error' : ''}`}
                      type="text"
                      value={formData.name}
                      onChange={e => setFormData({ ...formData, name: e.target.value })}
                      placeholder="e.g., velvet"
                    />
                    {formErrors.name && <span className="mat-error">{formErrors.name}</span>}
                    <span className="mat-hint">Internal identifier used in product variants</span>
                  </div>

                  <div className="mat-field">
                    <label className="mat-label">Display Title</label>
                    <input
                      className={`mat-input ${formErrors.title ? 'error' : ''}`}
                      type="text"
                      value={formData.title}
                      onChange={e => setFormData({ ...formData, title: e.target.value })}
                      placeholder="e.g., Premium Velvet Fabric"
                    />
                    {formErrors.title && <span className="mat-error">{formErrors.title}</span>}
                    <span className="mat-hint">Customer-facing label. Falls back to name if empty.</span>
                  </div>

                  <div className="mat-field">
                    <label className="mat-label">Description</label>
                    <textarea
                      className="mat-textarea"
                      rows={3}
                      value={formData.description}
                      onChange={e => setFormData({ ...formData, description: e.target.value })}
                      placeholder="Describe the texture, feel, and properties…"
                    />
                  </div>
                </div>

                {/* Image */}
                <div className="mat-section">
                  <div className="mat-section-title">Material Image</div>
                  <div className="mat-drop-zone-wrap">
                    {formData.image_url ? (
                      <div className="mat-img-preview-wrap">
                        <img src={formData.image_url} alt="preview" className="mat-img-preview" />
                        <button type="button" className="mat-img-remove"
                          onClick={() => setFormData({ ...formData, image_url: '' })}>
                          &times;
                        </button>
                        <div className="mat-img-replace">
                          <ImageCropperWithUpload
                            value={formData.image_url}
                            onChange={url => setFormData({ ...formData, image_url: url })}
                            aspectRatio={IMAGE_CONFIGS.category?.aspectRatio ?? 1}
                          />
                        </div>
                      </div>
                    ) : (
                      <div className="mat-drop-zone">
                        <div className="mat-drop-placeholder">
                          <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2">
                            <rect x="3" y="3" width="18" height="18" rx="2"/>
                            <circle cx="8.5" cy="8.5" r="1.5"/>
                            <polyline points="21 15 16 10 5 21"/>
                          </svg>
                          <span className="mat-drop-title">Upload texture image</span>
                          <span className="mat-drop-sub">PNG, JPG, WEBP · 1:1 recommended</span>
                        </div>
                        <div className="mat-drop-uploader">
                          <ImageCropperWithUpload
                            value={formData.image_url}
                            onChange={url => setFormData({ ...formData, image_url: url })}
                            aspectRatio={IMAGE_CONFIGS.category?.aspectRatio ?? 1}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Settings */}
                <div className="mat-section">
                  <div className="mat-section-title">Settings</div>
                  <div className="mat-toggle-row">
                    <div className="mat-toggle-info">
                      <span className="mat-toggle-label">Active</span>
                      <span className="mat-toggle-desc">Available for product variants</span>
                    </div>
                    <label className="mat-toggle">
                      <input type="checkbox" className="mat-toggle-input"
                        checked={formData.is_active}
                        onChange={e => setFormData({ ...formData, is_active: e.target.checked })} />
                      <span className="mat-toggle-slider" />
                    </label>
                  </div>
                </div>

              </div>

              <div className="mat-panel-footer">
                <button type="button" className="mat-btn-cancel"
                  onClick={() => setIsModalOpen(false)} disabled={submitting}>
                  Cancel
                </button>
                <button type="submit" className="mat-btn-save" disabled={submitting}>
                  {submitting ? 'Saving…' : editingMaterial ? 'Update Material' : 'Create Material'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Manage Colors Panel ── */}
      {isColorModalOpen && (
        <div className="mat-overlay" onClick={e => { if (e.target === e.currentTarget) setIsColorModalOpen(false); }}>
          <div className="mat-panel">
            <div className="mat-panel-header">
              <div>
                <h2 className="mat-panel-title">Manage Colors</h2>
                <p className="mat-panel-sub">
                  {selectedMaterial?.name}
                  {selectedMaterial?.title && ` · ${selectedMaterial.title}`}
                </p>
              </div>
              <button className="mat-panel-close" onClick={() => setIsColorModalOpen(false)}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            </div>

            <div className="mat-panel-body">
              {/* Selected count */}
              <div className="mat-colors-info">
                <span className="mat-colors-count">
                  {selectedMaterial?.available_colors?.length || 0} colors selected
                </span>
              </div>

              {/* Search */}
              <div className="mat-color-search-wrap">
                <svg className="mat-color-search-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
                </svg>
                <input
                  className="mat-color-search"
                  type="text"
                  placeholder="Search colors…"
                  value={colorSearch}
                  onChange={e => setColorSearch(e.target.value)}
                />
              </div>

              {/* Color grid */}
              <div className="mat-color-grid">
                {filteredColors.map(color => {
                  const selected = selectedMaterial?.available_colors.some(mc => mc.color_id === color.id);
                  return (
                    <label key={color.id} className={`mat-color-card ${selected ? 'selected' : ''}`}>
                      <input type="checkbox" checked={!!selected}
                        onChange={() => toggleColor(color.id)} />
                      <div className="mat-color-swatch"
                        style={{ background: color.hex_code || '#ccc' }} />
                      <span className="mat-color-name">{color.name}</span>
                      <span className="mat-color-hex">{color.hex_code}</span>
                      {selected && (
                        <div className="mat-color-check">
                          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                            <polyline points="20 6 9 17 4 12"/>
                          </svg>
                        </div>
                      )}
                    </label>
                  );
                })}
                {filteredColors.length === 0 && (
                  <div className="mat-colors-empty">No colors match your search</div>
                )}
              </div>
            </div>

            <div className="mat-panel-footer">
              <button className="mat-btn-save" style={{ flex: 1 }}
                onClick={() => setIsColorModalOpen(false)}>
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Materials;
