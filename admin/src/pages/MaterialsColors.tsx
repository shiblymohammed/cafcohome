import { useState, useEffect } from 'react';
import apiClient, { extractData } from '../utils/api';
import DataTable from '../components/DataTable';
import ImageCropperWithUpload from '../components/ImageCropperWithUpload';
import { IMAGE_CONFIGS } from '../config/imageConfig';
import './MaterialsColors.css';

/* ─── Interfaces ─────────────────────── */
interface Color {
  id: number;
  name: string;
  hex_code: string;
  is_active: boolean;
  created_at: string;
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

interface ColorFormData {
  name: string;
  hex_code: string;
  is_active: boolean;
}

interface MaterialFormData {
  name: string;
  title: string;
  description: string;
  image_url: string;
  is_active: boolean;
}

/* ─── Toggle component ─────────────────────── */
const Toggle = ({
  checked, onChange, label, desc,
}: { checked: boolean; onChange: (v: boolean) => void; label: string; desc?: string }) => (
  <div className="mc-toggle-row">
    <div className="mc-toggle-info">
      <span className="mc-toggle-label">{label}</span>
      {desc && <span className="mc-toggle-desc">{desc}</span>}
    </div>
    <label className="mc-toggle">
      <input type="checkbox" className="mc-toggle-input" checked={checked}
        onChange={e => onChange(e.target.checked)} />
      <span className="mc-toggle-slider" />
    </label>
  </div>
);

/* ─── Main Component ─────────────────────── */
const MaterialsColors = () => {
  const [activeTab, setActiveTab] = useState<'materials' | 'colors'>('materials');
  const [materials, setMaterials] = useState<Material[]>([]);
  const [colors, setColors]       = useState<Color[]>([]);
  const [loading, setLoading]     = useState(true);

  // Material panel
  const [matPanelOpen, setMatPanelOpen]     = useState(false);
  const [editingMaterial, setEditingMaterial] = useState<Material | null>(null);
  const [matForm, setMatForm] = useState<MaterialFormData>({
    name: '', title: '', description: '', image_url: '', is_active: true,
  });

  // Color panel
  const [clrPanelOpen, setClrPanelOpen]   = useState(false);
  const [editingColor, setEditingColor]   = useState<Color | null>(null);
  const [clrForm, setClrForm] = useState<ColorFormData>({
    name: '', hex_code: '#000000', is_active: true,
  });

  // Manage colors panel
  const [colorsPanelOpen, setColorsPanelOpen]   = useState(false);
  const [selectedMaterial, setSelectedMaterial] = useState<Material | null>(null);
  const [colorSearch, setColorSearch]           = useState('');

  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => { fetchMaterials(); fetchColors(); }, []);

  const fetchMaterials = async () => {
    try {
      setLoading(true);
      const r = await apiClient.get('/materials/');
      setMaterials(extractData(r.data));
    } catch { console.error('Failed to fetch materials'); }
    finally { setLoading(false); }
  };

  const fetchColors = async () => {
    try {
      setLoading(true);
      const r = await apiClient.get('/colors/');
      setColors(extractData(r.data));
    } catch { console.error('Failed to fetch colors'); }
    finally { setLoading(false); }
  };

  /* ── Material handlers ── */
  const openAddMaterial = () => {
    setEditingMaterial(null);
    setMatForm({ name: '', title: '', description: '', image_url: '', is_active: true });
    setFormErrors({});
    setMatPanelOpen(true);
  };

  const openEditMaterial = (m: Material) => {
    setEditingMaterial(m);
    setMatForm({
      name: m.name, title: m.title || '',
      description: m.description || '', image_url: m.image_url || '',
      is_active: m.is_active,
    });
    setFormErrors({});
    setMatPanelOpen(true);
  };

  const openManageColors = (m: Material) => {
    setSelectedMaterial(m);
    setColorSearch('');
    setColorsPanelOpen(true);
  };

  const deleteMaterial = async (m: Material) => {
    if (!window.confirm(`Delete "${m.name}"?`)) return;
    try { await apiClient.delete(`/materials/${m.id}/`); fetchMaterials(); }
    catch { alert('Failed to delete material'); }
  };

  const submitMaterial = async (e: React.FormEvent) => {
    e.preventDefault();
    const errors: Record<string, string> = {};
    if (!matForm.name.trim()) errors.name = 'Material name is required';
    setFormErrors(errors);
    if (Object.keys(errors).length > 0) return;
    setSubmitting(true);
    try {
      if (editingMaterial) await apiClient.put(`/materials/${editingMaterial.id}/`, matForm);
      else await apiClient.post('/materials/', matForm);
      setMatPanelOpen(false);
      fetchMaterials();
    } catch (err: any) {
      if (err.response?.data) setFormErrors(err.response.data);
      else alert('Failed to save material');
    } finally { setSubmitting(false); }
  };

  /* ── Color toggle in manage panel ── */
  const toggleMaterialColor = async (colorId: number) => {
    if (!selectedMaterial) return;
    const existing = selectedMaterial.available_colors.find(mc => mc.color_id === colorId);
    try {
      if (existing) await apiClient.delete(`/material-colors/${existing.id}/`);
      else await apiClient.post('/material-colors/', { material: selectedMaterial.id, color: colorId, is_active: true });
      const r = await apiClient.get('/materials/');
      const updated = extractData<Material>(r.data);
      setMaterials(updated);
      const refreshed = updated.find(m => m.id === selectedMaterial.id);
      if (refreshed) setSelectedMaterial(refreshed);
    } catch { alert('Failed to update colors'); }
  };

  /* ── Color handlers ── */
  const openAddColor = () => {
    setEditingColor(null);
    setClrForm({ name: '', hex_code: '#000000', is_active: true });
    setFormErrors({});
    setClrPanelOpen(true);
  };

  const openEditColor = (c: Color) => {
    setEditingColor(c);
    setClrForm({ name: c.name, hex_code: c.hex_code || '#000000', is_active: c.is_active });
    setFormErrors({});
    setClrPanelOpen(true);
  };

  const deleteColor = async (c: Color) => {
    if (!window.confirm(`Delete "${c.name}"?`)) return;
    try { await apiClient.delete(`/colors/${c.id}/`); fetchColors(); }
    catch { alert('Failed to delete color'); }
  };

  const submitColor = async (e: React.FormEvent) => {
    e.preventDefault();
    const errors: Record<string, string> = {};
    if (!clrForm.name.trim()) errors.name = 'Color name is required';
    if (!clrForm.hex_code.match(/^#[0-9A-Fa-f]{6}$/)) errors.hex_code = 'Valid hex code required (e.g., #FF5733)';
    setFormErrors(errors);
    if (Object.keys(errors).length > 0) return;
    setSubmitting(true);
    try {
      if (editingColor) await apiClient.put(`/colors/${editingColor.id}/`, clrForm);
      else await apiClient.post('/colors/', clrForm);
      setClrPanelOpen(false);
      fetchColors();
    } catch (err: any) {
      if (err.response?.data) setFormErrors(err.response.data);
      else alert('Failed to save color');
    } finally { setSubmitting(false); }
  };

  /* ── Table columns ── */
  const materialColumns = [
    {
      key: 'image_url', label: 'Image',
      render: (item: Material) => item.image_url ? (
        <img src={item.image_url} alt={item.name} className="mc-thumb" />
      ) : (
        <div className="mc-thumb-placeholder">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
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
        <span className={item.title ? '' : 'mc-muted'}>{item.title || '—'}</span>
      ),
    },
    {
      key: 'available_colors', label: 'Colors',
      render: (item: Material) => (
        <div className="mc-dots">
          {item.available_colors?.length > 0 ? (
            <>
              {item.available_colors.slice(0, 6).map(mc => (
                <div key={mc.id} className="mc-dot"
                  style={{ background: mc.color_hex_code || '#ccc' }}
                  title={mc.color_name} />
              ))}
              {item.available_colors.length > 6 && (
                <span className="mc-dots-more">+{item.available_colors.length - 6}</span>
              )}
            </>
          ) : <span className="mc-muted">None</span>}
        </div>
      ),
    },
    {
      key: 'is_active', label: 'Status',
      render: (item: Material) => (
        <span className={`mc-badge ${item.is_active ? 'active' : 'inactive'}`}>
          {item.is_active ? 'Active' : 'Inactive'}
        </span>
      ),
    },
    {
      key: 'manage', label: 'Colors',
      render: (item: Material) => (
        <button className="mc-btn-colors"
          onClick={e => { e.stopPropagation(); openManageColors(item); }}>
          Manage ({item.available_colors?.length || 0})
        </button>
      ),
    },
  ];

  const colorColumns = [
    {
      key: 'hex_code', label: 'Preview',
      render: (item: Color) => (
        <div className="mc-color-swatch-cell"
          style={{ background: item.hex_code || '#ccc' }} />
      ),
    },
    { key: 'name', label: 'Name' },
    {
      key: 'hex_code_mono', label: 'Hex',
      render: (item: Color) => <span className="mc-hex">{item.hex_code || '—'}</span>,
    },
    {
      key: 'is_active', label: 'Status',
      render: (item: Color) => (
        <span className={`mc-badge ${item.is_active ? 'active' : 'inactive'}`}>
          {item.is_active ? 'Active' : 'Inactive'}
        </span>
      ),
    },
  ];

  const filteredColors = colors.filter(c =>
    c.is_active && (!colorSearch || c.name.toLowerCase().includes(colorSearch.toLowerCase()))
  );

  return (
    <div className="mc-page animate-fadeIn">

      {/* ── Header ── */}
      <div className="mc-header">
        <div className="mc-header-left">
          <h1 className="mc-title">Materials & Colors</h1>
          <span className="mc-count">
            {activeTab === 'materials' ? materials.length : colors.length}
          </span>
        </div>
        <button className="mc-btn-add"
          onClick={activeTab === 'materials' ? openAddMaterial : openAddColor}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
          {activeTab === 'materials' ? 'Add Material' : 'Add Color'}
        </button>
      </div>

      {/* ── Tabs ── */}
      <div className="mc-tabs">
        <button className={`mc-tab ${activeTab === 'materials' ? 'active' : ''}`}
          onClick={() => setActiveTab('materials')}>
          Materials ({materials.length})
        </button>
        <button className={`mc-tab ${activeTab === 'colors' ? 'active' : ''}`}
          onClick={() => setActiveTab('colors')}>
          Colors ({colors.length})
        </button>
      </div>

      {/* ── Table ── */}
      {activeTab === 'materials' ? (
        <DataTable
          columns={materialColumns}
          data={materials}
          onEdit={openEditMaterial}
          onDelete={deleteMaterial}
          loading={loading}
          emptyMessage="No materials found. Create your first material!"
        />
      ) : (
        <DataTable
          columns={colorColumns}
          data={colors}
          onEdit={openEditColor}
          onDelete={deleteColor}
          loading={loading}
          emptyMessage="No colors found. Create your first color!"
        />
      )}

      {/* ══════════════════════════════════════
          MATERIAL ADD / EDIT PANEL
      ══════════════════════════════════════ */}
      {matPanelOpen && (
        <div className="mc-overlay"
          onClick={e => { if (e.target === e.currentTarget) setMatPanelOpen(false); }}>
          <div className="mc-panel">
            <div className="mc-panel-header">
              <h2 className="mc-panel-title">
                {editingMaterial ? 'Edit Material' : 'New Material'}
              </h2>
              <button className="mc-panel-close" onClick={() => setMatPanelOpen(false)}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            </div>

            <form onSubmit={submitMaterial} style={{ display: 'contents' }}>
              <div className="mc-panel-body">

                {/* Basic Info */}
                <div className="mc-section">
                  <div className="mc-section-title">Basic Information</div>

                  <div className="mc-field">
                    <label className="mc-label">Name <span className="mc-req">*</span></label>
                    <input className={`mc-input ${formErrors.name ? 'error' : ''}`}
                      type="text" value={matForm.name}
                      onChange={e => setMatForm({ ...matForm, name: e.target.value })}
                      placeholder="e.g., velvet" />
                    {formErrors.name && <span className="mc-error">{formErrors.name}</span>}
                    <span className="mc-hint">Internal identifier used in product variants</span>
                  </div>

                  <div className="mc-field">
                    <label className="mc-label">Display Title</label>
                    <input className="mc-input" type="text" value={matForm.title}
                      onChange={e => setMatForm({ ...matForm, title: e.target.value })}
                      placeholder="e.g., Premium Velvet Fabric" />
                    <span className="mc-hint">Customer-facing label. Falls back to name if empty.</span>
                  </div>

                  <div className="mc-field">
                    <label className="mc-label">Description</label>
                    <textarea className="mc-textarea" rows={3} value={matForm.description}
                      onChange={e => setMatForm({ ...matForm, description: e.target.value })}
                      placeholder="Describe the texture, feel, and properties…" />
                  </div>
                </div>

                {/* Image */}
                <div className="mc-section">
                  <div className="mc-section-title">Material Image</div>
                  {matForm.image_url ? (
                    <div className="mc-img-preview-wrap">
                      <img src={matForm.image_url} alt="preview" className="mc-img-preview" />
                      <button type="button" className="mc-img-remove"
                        onClick={() => setMatForm({ ...matForm, image_url: '' })}>
                        &times;
                      </button>
                      <div className="mc-img-replace">
                        <ImageCropperWithUpload
                          value={matForm.image_url}
                          onChange={url => setMatForm({ ...matForm, image_url: url })}
                          aspectRatio={IMAGE_CONFIGS.category?.aspectRatio ?? 1}
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="mc-drop-zone">
                      <div className="mc-drop-placeholder">
                        <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2">
                          <rect x="3" y="3" width="18" height="18" rx="2"/>
                          <circle cx="8.5" cy="8.5" r="1.5"/>
                          <polyline points="21 15 16 10 5 21"/>
                        </svg>
                        <span className="mc-drop-title">Upload texture image</span>
                        <span className="mc-drop-sub">PNG, JPG, WEBP · 1:1 recommended</span>
                      </div>
                      <div className="mc-drop-uploader">
                        <ImageCropperWithUpload
                          value={matForm.image_url}
                          onChange={url => setMatForm({ ...matForm, image_url: url })}
                          aspectRatio={IMAGE_CONFIGS.category?.aspectRatio ?? 1}
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* Settings */}
                <div className="mc-section">
                  <div className="mc-section-title">Settings</div>
                  <Toggle checked={matForm.is_active}
                    onChange={v => setMatForm({ ...matForm, is_active: v })}
                    label="Active" desc="Available for product variants" />
                </div>

              </div>
              <div className="mc-panel-footer">
                <button type="button" className="mc-btn-cancel"
                  onClick={() => setMatPanelOpen(false)} disabled={submitting}>
                  Cancel
                </button>
                <button type="submit" className="mc-btn-save" disabled={submitting}>
                  {submitting ? 'Saving…' : editingMaterial ? 'Update Material' : 'Create Material'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════
          MANAGE COLORS PANEL
      ══════════════════════════════════════ */}
      {colorsPanelOpen && (
        <div className="mc-overlay"
          onClick={e => { if (e.target === e.currentTarget) setColorsPanelOpen(false); }}>
          <div className="mc-panel">
            <div className="mc-panel-header">
              <div>
                <h2 className="mc-panel-title">Manage Colors</h2>
                <p className="mc-panel-sub">
                  {selectedMaterial?.name}
                  {selectedMaterial?.title && ` · ${selectedMaterial.title}`}
                </p>
              </div>
              <button className="mc-panel-close" onClick={() => setColorsPanelOpen(false)}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            </div>

            <div className="mc-panel-body">
              <div className="mc-colors-count-badge">
                {selectedMaterial?.available_colors?.length || 0} colors selected
              </div>

              <div className="mc-color-search-wrap">
                <svg className="mc-color-search-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
                </svg>
                <input className="mc-color-search" type="text" placeholder="Search colors…"
                  value={colorSearch} onChange={e => setColorSearch(e.target.value)} />
              </div>

              <div className="mc-color-grid">
                {filteredColors.map(color => {
                  const selected = selectedMaterial?.available_colors.some(mc => mc.color_id === color.id);
                  return (
                    <label key={color.id} className={`mc-color-card ${selected ? 'selected' : ''}`}>
                      <input type="checkbox" checked={!!selected}
                        onChange={() => toggleMaterialColor(color.id)} />
                      <div className="mc-color-card-swatch"
                        style={{ background: color.hex_code || '#ccc' }} />
                      <span className="mc-color-card-name">{color.name}</span>
                      <span className="mc-color-card-hex">{color.hex_code}</span>
                      {selected && (
                        <div className="mc-color-card-check">
                          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                            <polyline points="20 6 9 17 4 12"/>
                          </svg>
                        </div>
                      )}
                    </label>
                  );
                })}
                {filteredColors.length === 0 && (
                  <div className="mc-colors-empty">No colors match your search</div>
                )}
              </div>
            </div>

            <div className="mc-panel-footer">
              <button className="mc-btn-save" style={{ flex: 1 }}
                onClick={() => setColorsPanelOpen(false)}>
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════
          COLOR ADD / EDIT PANEL
      ══════════════════════════════════════ */}
      {clrPanelOpen && (
        <div className="mc-overlay"
          onClick={e => { if (e.target === e.currentTarget) setClrPanelOpen(false); }}>
          <div className="mc-panel">
            <div className="mc-panel-header">
              <h2 className="mc-panel-title">
                {editingColor ? 'Edit Color' : 'New Color'}
              </h2>
              <button className="mc-panel-close" onClick={() => setClrPanelOpen(false)}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            </div>

            <form onSubmit={submitColor} style={{ display: 'contents' }}>
              <div className="mc-panel-body">

                {/* Live preview */}
                <div className="mc-clr-preview">
                  <div className="mc-clr-preview-swatch"
                    style={{ background: clrForm.hex_code || '#000' }} />
                  <div className="mc-clr-preview-info">
                    <span className="mc-clr-preview-name">{clrForm.name || 'Color Name'}</span>
                    <span className="mc-clr-preview-hex">{clrForm.hex_code}</span>
                  </div>
                </div>

                {/* Color Details */}
                <div className="mc-section">
                  <div className="mc-section-title">Color Details</div>

                  <div className="mc-field">
                    <label className="mc-label">Name <span className="mc-req">*</span></label>
                    <input className={`mc-input ${formErrors.name ? 'error' : ''}`}
                      type="text" value={clrForm.name}
                      onChange={e => setClrForm({ ...clrForm, name: e.target.value })}
                      placeholder="e.g., Navy Blue" />
                    {formErrors.name && <span className="mc-error">{formErrors.name}</span>}
                  </div>

                  <div className="mc-field">
                    <label className="mc-label">Hex Code <span className="mc-req">*</span></label>
                    <div className="mc-picker-row">
                      <input type="color" className="mc-picker"
                        value={clrForm.hex_code}
                        onChange={e => setClrForm({ ...clrForm, hex_code: e.target.value })} />
                      <input className={`mc-input mc-input-hex ${formErrors.hex_code ? 'error' : ''}`}
                        type="text" value={clrForm.hex_code} maxLength={7}
                        onChange={e => setClrForm({ ...clrForm, hex_code: e.target.value })}
                        placeholder="#000000" />
                    </div>
                    {formErrors.hex_code && <span className="mc-error">{formErrors.hex_code}</span>}
                    <span className="mc-hint">Click the swatch to open the color picker</span>
                  </div>
                </div>

                {/* Settings */}
                <div className="mc-section">
                  <div className="mc-section-title">Settings</div>
                  <Toggle checked={clrForm.is_active}
                    onChange={v => setClrForm({ ...clrForm, is_active: v })}
                    label="Active" desc="Available for product variants" />
                </div>

              </div>
              <div className="mc-panel-footer">
                <button type="button" className="mc-btn-cancel"
                  onClick={() => setClrPanelOpen(false)} disabled={submitting}>
                  Cancel
                </button>
                <button type="submit" className="mc-btn-save" disabled={submitting}>
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

export default MaterialsColors;
