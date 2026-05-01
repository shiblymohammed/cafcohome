import { useState, useEffect } from 'react';
import apiClient, { extractData } from '../utils/api';
import './Colors.css';

interface Color {
  id: number;
  name: string;
  hex_code: string;
  is_active: boolean;
  created_at: string;
}

interface ColorFormData {
  name: string;
  hex_code: string;
  is_active: boolean;
}

const Colors = () => {
  const [colors, setColors] = useState<Color[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchTerm, setSearchTerm] = useState('');
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [editingColor, setEditingColor] = useState<Color | null>(null);
  const [formData, setFormData] = useState<ColorFormData>({ name: '', hex_code: '#000000', is_active: true });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => { fetchColors(); }, []);

  const fetchColors = async () => {
    try {
      setLoading(true);
      const r = await apiClient.get('/colors/');
      setColors(extractData<Color>(r.data));
    } catch { alert('Failed to load colors'); }
    finally { setLoading(false); }
  };

  const openAdd = () => {
    setEditingColor(null);
    setFormData({ name: '', hex_code: '#000000', is_active: true });
    setFormErrors({}); setIsPanelOpen(true);
  };

  const openEdit = (color: Color) => {
    setEditingColor(color);
    setFormData({ name: color.name, hex_code: color.hex_code || '#000000', is_active: color.is_active });
    setFormErrors({}); setIsPanelOpen(true);
  };

  const handleDelete = async (color: Color) => {
    if (!window.confirm(`Delete "${color.name}"?`)) return;
    try { await apiClient.delete(`/colors/${color.id}/`); fetchColors(); }
    catch { alert('Failed to delete color'); }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errors: Record<string, string> = {};
    if (!formData.name.trim()) errors.name = 'Color name is required';
    if (!formData.hex_code.match(/^#[0-9A-Fa-f]{6}$/)) errors.hex_code = 'Valid hex code required (e.g. #FF5733)';
    setFormErrors(errors);
    if (Object.keys(errors).length > 0) return;
    setSubmitting(true);
    try {
      if (editingColor) await apiClient.put(`/colors/${editingColor.id}/`, formData);
      else await apiClient.post('/colors/', formData);
      setIsPanelOpen(false); fetchColors();
    } catch (err: any) {
      if (err.response?.data) setFormErrors(err.response.data);
      else alert('Failed to save color');
    } finally { setSubmitting(false); }
  };

  const filtered = colors.filter(c =>
    !searchTerm || c.name.toLowerCase().includes(searchTerm.toLowerCase()) || c.hex_code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="cl-page">
      <div className="cl-header">
        <div className="cl-header-left">
          <h1 className="cl-title">Colors</h1>
          <span className="cl-count">{colors.length}</span>
        </div>
        <div className="cl-header-actions">
          <div className="cl-view-toggle">
            <button className={`cl-view-btn ${viewMode === 'grid' ? 'active' : ''}`} onClick={() => setViewMode('grid')} title="Grid view">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
                <rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>
              </svg>
            </button>
            <button className={`cl-view-btn ${viewMode === 'list' ? 'active' : ''}`} onClick={() => setViewMode('list')} title="List view">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/>
                <line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/>
                <line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/>
              </svg>
            </button>
          </div>
          <button className="cl-btn-add" onClick={openAdd}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
            Add Color
          </button>
        </div>
      </div>

      <div className="cl-filters">
        <div className="cl-search-wrap">
          <svg className="cl-search-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          <input className="cl-search" type="text" placeholder="Search by name or hex code…" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
        </div>
      </div>

      {loading ? (
        <div className="cl-loading"><div className="cl-spinner" /><span>Loading…</span></div>
      ) : filtered.length === 0 ? (
        <div className="cl-empty">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2">
            <circle cx="12" cy="12" r="10"/><path d="M8 12h8M12 8v8"/>
          </svg>
          <p>No colors found</p>
          <button className="cl-btn-add" onClick={openAdd}>Create first color</button>
        </div>
      ) : viewMode === 'grid' ? (
        <div className="cl-grid">
          {filtered.map(color => (
            <div key={color.id} className="cl-card">
              <div className="cl-card-swatch" style={{ background: color.hex_code || '#ccc' }}>
                <div className="cl-card-overlay">
                  <button className="cl-btn-edit" onClick={() => openEdit(color)}>Edit</button>
                  <button className="cl-btn-delete" onClick={() => handleDelete(color)}>Delete</button>
                </div>
              </div>
              <div className="cl-card-body">
                <div className="cl-card-name">{color.name}</div>
                <div className="cl-card-hex">{color.hex_code}</div>
                <div className="cl-card-meta">
                  <span className={`cl-badge ${color.is_active ? 'cl-badge-active' : 'cl-badge-inactive'}`}>
                    {color.is_active ? 'Active' : 'Inactive'}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="cl-list">
          <div className="cl-list-header">
            <span>Swatch</span><span>Name</span><span>Hex Code</span><span>Status</span><span>Actions</span>
          </div>
          {filtered.map(color => (
            <div key={color.id} className="cl-list-row">
              <div><div className="cl-swatch" style={{ background: color.hex_code || '#ccc' }} title={color.hex_code} /></div>
              <div className="cl-list-name">{color.name}</div>
              <div className="cl-list-hex">{color.hex_code}</div>
              <div><span className={`cl-badge ${color.is_active ? 'cl-badge-active' : 'cl-badge-inactive'}`}>{color.is_active ? 'Active' : 'Inactive'}</span></div>
              <div className="cl-list-actions">
                <button className="cl-btn-edit" onClick={() => openEdit(color)}>Edit</button>
                <button className="cl-btn-delete" onClick={() => handleDelete(color)}>Delete</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {isPanelOpen && (
        <div className="cl-overlay" onClick={e => { if (e.target === e.currentTarget) setIsPanelOpen(false); }}>
          <div className="cl-panel">
            <div className="cl-panel-header">
              <h2 className="cl-panel-title">{editingColor ? 'Edit Color' : 'New Color'}</h2>
              <button className="cl-panel-close" onClick={() => setIsPanelOpen(false)}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            </div>
            <form onSubmit={handleSubmit} style={{ display: 'contents' }}>
              <div className="cl-panel-body">
                <div className="cl-preview-section">
                  <div className="cl-preview-swatch" style={{ background: formData.hex_code || '#000' }} />
                  <div className="cl-preview-info">
                    <span className="cl-preview-name">{formData.name || 'Color Name'}</span>
                    <span className="cl-preview-hex">{formData.hex_code}</span>
                  </div>
                </div>
                <div className="cl-section">
                  <div className="cl-section-title">Color Details</div>
                  <div className="cl-field">
                    <label className="cl-label">Color Name <span className="cl-required">*</span></label>
                    <input className={`cl-input ${formErrors.name ? 'error' : ''}`} type="text" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} placeholder="e.g. Navy Blue" />
                    {formErrors.name && <span className="cl-error">{formErrors.name}</span>}
                  </div>
                  <div className="cl-field">
                    <label className="cl-label">Hex Code <span className="cl-required">*</span></label>
                    <div className="cl-picker-row">
                      <input type="color" className="cl-picker" value={formData.hex_code} onChange={e => setFormData({ ...formData, hex_code: e.target.value })} />
                      <input className={`cl-input cl-input-hex ${formErrors.hex_code ? 'error' : ''}`} type="text" value={formData.hex_code} onChange={e => setFormData({ ...formData, hex_code: e.target.value })} placeholder="#000000" maxLength={7} />
                    </div>
                    {formErrors.hex_code && <span className="cl-error">{formErrors.hex_code}</span>}
                    <span className="cl-hint">Click the swatch to open the color picker</span>
                  </div>
                </div>
                <div className="cl-section">
                  <div className="cl-section-title">Settings</div>
                  <div className="cl-toggle-row">
                    <div className="cl-toggle-info">
                      <span className="cl-toggle-label">Active</span>
                      <span className="cl-toggle-desc">Available for product variants</span>
                    </div>
                    <label className="cl-toggle">
                      <input type="checkbox" className="cl-toggle-input" checked={formData.is_active} onChange={e => setFormData({ ...formData, is_active: e.target.checked })} />
                      <span className="cl-toggle-slider" />
                    </label>
                  </div>
                </div>
              </div>
              <div className="cl-panel-footer">
                <button type="button" className="cl-btn-cancel" onClick={() => setIsPanelOpen(false)} disabled={submitting}>Cancel</button>
                <button type="submit" className="cl-btn-save" disabled={submitting}>
                  {submitting ? 'Saving…' : editingColor ? 'Update Color' : 'Create Color'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Colors;
