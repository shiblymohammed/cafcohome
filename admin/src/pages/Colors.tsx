import { useState, useEffect } from 'react';
import apiClient, { extractData } from '../utils/api';
import DataTable from '../components/DataTable';
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
  const [colors, setColors]           = useState<Color[]>([]);
  const [loading, setLoading]         = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingColor, setEditingColor] = useState<Color | null>(null);
  const [formData, setFormData] = useState<ColorFormData>({
    name: '', hex_code: '#000000', is_active: true,
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => { fetchColors(); }, []);

  const fetchColors = async () => {
    try {
      setLoading(true);
      const r = await apiClient.get('/colors/');
      setColors(extractData(r.data));
    } catch { alert('Failed to load colors'); }
    finally { setLoading(false); }
  };

  const openAdd = () => {
    setEditingColor(null);
    setFormData({ name: '', hex_code: '#000000', is_active: true });
    setFormErrors({});
    setIsModalOpen(true);
  };

  const openEdit = (color: Color) => {
    setEditingColor(color);
    setFormData({ name: color.name, hex_code: color.hex_code || '#000000', is_active: color.is_active });
    setFormErrors({});
    setIsModalOpen(true);
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
    if (!formData.hex_code.match(/^#[0-9A-Fa-f]{6}$/)) errors.hex_code = 'Valid hex code required (e.g., #FF5733)';
    setFormErrors(errors);
    if (Object.keys(errors).length > 0) return;

    setSubmitting(true);
    try {
      if (editingColor) await apiClient.put(`/colors/${editingColor.id}/`, formData);
      else await apiClient.post('/colors/', formData);
      setIsModalOpen(false);
      fetchColors();
    } catch (err: any) {
      if (err.response?.data) setFormErrors(err.response.data);
      else alert('Failed to save color');
    } finally { setSubmitting(false); }
  };

  const columns = [
    {
      key: 'hex_code', label: 'Preview',
      render: (item: Color) => (
        <div className="clr-swatch-cell"
          style={{ background: item.hex_code || '#ccc' }}
          title={item.hex_code}
        />
      ),
    },
    { key: 'name', label: 'Name' },
    {
      key: 'hex_code_mono', label: 'Hex Code',
      render: (item: Color) => (
        <span className="clr-hex-cell">{item.hex_code || '—'}</span>
      ),
    },
    {
      key: 'is_active', label: 'Status',
      render: (item: Color) => (
        <span className={`clr-status ${item.is_active ? 'active' : 'inactive'}`}>
          {item.is_active ? 'Active' : 'Inactive'}
        </span>
      ),
    },
  ];

  return (
    <div className="colors-page">

      {/* Header */}
      <div className="clr-header">
        <div className="clr-header-left">
          <h1 className="clr-title">Colors</h1>
          <span className="clr-count">{colors.length}</span>
        </div>
        <button className="clr-btn-add" onClick={openAdd}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
          Add Color
        </button>
      </div>

      <DataTable
        columns={columns}
        data={colors}
        onEdit={openEdit}
        onDelete={handleDelete}
        loading={loading}
        emptyMessage="No colors found. Create your first color!"
      />

      {/* ── Add / Edit Color Panel ── */}
      {isModalOpen && (
        <div className="clr-overlay" onClick={e => { if (e.target === e.currentTarget) setIsModalOpen(false); }}>
          <div className="clr-panel">
            <div className="clr-panel-header">
              <h2 className="clr-panel-title">{editingColor ? 'Edit Color' : 'New Color'}</h2>
              <button className="clr-panel-close" onClick={() => setIsModalOpen(false)}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            </div>

            <form onSubmit={handleSubmit} style={{ display: 'contents' }}>
              <div className="clr-panel-body">

                {/* Live preview */}
                <div className="clr-preview-section">
                  <div className="clr-preview-swatch"
                    style={{ background: formData.hex_code || '#000' }} />
                  <div className="clr-preview-info">
                    <span className="clr-preview-name">{formData.name || 'Color Name'}</span>
                    <span className="clr-preview-hex">{formData.hex_code}</span>
                  </div>
                </div>

                {/* Basic Info */}
                <div className="clr-section">
                  <div className="clr-section-title">Color Details</div>

                  <div className="clr-field">
                    <label className="clr-label">
                      Color Name <span className="clr-required">*</span>
                    </label>
                    <input
                      className={`clr-input ${formErrors.name ? 'error' : ''}`}
                      type="text"
                      value={formData.name}
                      onChange={e => setFormData({ ...formData, name: e.target.value })}
                      placeholder="e.g., Navy Blue"
                    />
                    {formErrors.name && <span className="clr-error">{formErrors.name}</span>}
                  </div>

                  <div className="clr-field">
                    <label className="clr-label">
                      Hex Code <span className="clr-required">*</span>
                    </label>
                    <div className="clr-picker-row">
                      <input
                        type="color"
                        className="clr-picker"
                        value={formData.hex_code}
                        onChange={e => setFormData({ ...formData, hex_code: e.target.value })}
                      />
                      <input
                        className={`clr-input clr-input-hex ${formErrors.hex_code ? 'error' : ''}`}
                        type="text"
                        value={formData.hex_code}
                        onChange={e => setFormData({ ...formData, hex_code: e.target.value })}
                        placeholder="#000000"
                        maxLength={7}
                      />
                    </div>
                    {formErrors.hex_code && <span className="clr-error">{formErrors.hex_code}</span>}
                    <span className="clr-hint">Click the swatch to open the color picker</span>
                  </div>
                </div>

                {/* Settings */}
                <div className="clr-section">
                  <div className="clr-section-title">Settings</div>
                  <div className="clr-toggle-row">
                    <div className="clr-toggle-info">
                      <span className="clr-toggle-label">Active</span>
                      <span className="clr-toggle-desc">Available for product variants</span>
                    </div>
                    <label className="clr-toggle">
                      <input type="checkbox" className="clr-toggle-input"
                        checked={formData.is_active}
                        onChange={e => setFormData({ ...formData, is_active: e.target.checked })} />
                      <span className="clr-toggle-slider" />
                    </label>
                  </div>
                </div>

              </div>

              <div className="clr-panel-footer">
                <button type="button" className="clr-btn-cancel"
                  onClick={() => setIsModalOpen(false)} disabled={submitting}>
                  Cancel
                </button>
                <button type="submit" className="clr-btn-save" disabled={submitting}>
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
