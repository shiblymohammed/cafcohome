import { useState, useEffect } from 'react';
import apiClient, { extractData } from '../utils/api';
import DataTable from '../components/DataTable';
import Modal from '../components/Modal';
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
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingColor, setEditingColor] = useState<Color | null>(null);
  const [formData, setFormData] = useState<ColorFormData>({
    name: '',
    hex_code: '#000000',
    is_active: true,
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchColors();
  }, []);

  const fetchColors = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get('/colors/');
      setColors(extractData(response.data));
    } catch (error) {
      console.error('Failed to fetch colors:', error);
      alert('Failed to load colors');
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = () => {
    setEditingColor(null);
    setFormData({
      name: '',
      hex_code: '#000000',
      is_active: true,
    });
    setFormErrors({});
    setIsModalOpen(true);
  };

  const handleEdit = (color: Color) => {
    setEditingColor(color);
    setFormData({
      name: color.name,
      hex_code: color.hex_code || '#000000',
      is_active: color.is_active,
    });
    setFormErrors({});
    setIsModalOpen(true);
  };

  const handleDelete = async (color: Color) => {
    if (!window.confirm(`Are you sure you want to delete "${color.name}"?`)) {
      return;
    }

    try {
      await apiClient.delete(`/colors/${color.id}/`);
      alert('Color deleted successfully');
      fetchColors();
    } catch (error) {
      console.error('Failed to delete color:', error);
      alert('Failed to delete color');
    }
  };

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!formData.name.trim()) {
      errors.name = 'Color name is required';
    }

    if (!formData.hex_code.match(/^#[0-9A-Fa-f]{6}$/)) {
      errors.hex_code = 'Valid hex code is required (e.g., #FF5733)';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setSubmitting(true);

    try {
      if (editingColor) {
        await apiClient.put(`/colors/${editingColor.id}/`, formData);
        alert('Color updated successfully');
      } else {
        await apiClient.post('/colors/', formData);
        alert('Color created successfully');
      }
      setIsModalOpen(false);
      fetchColors();
    } catch (error: any) {
      console.error('Failed to save color:', error);
      if (error.response?.data) {
        setFormErrors(error.response.data);
      } else {
        alert('Failed to save color');
      }
    } finally {
      setSubmitting(false);
    }
  };

  const columns = [
    {
      key: 'hex_code',
      label: 'Preview',
      render: (item: Color) => (
        <div
          style={{
            width: '40px',
            height: '40px',
            backgroundColor: item.hex_code || '#CCCCCC',
            border: '1px solid #ddd',
            borderRadius: '4px',
          }}
        />
      ),
    },
    { key: 'name', label: 'Name' },
    {
      key: 'hex_code',
      label: 'Hex Code',
      render: (item: Color) => (
        <span style={{ fontFamily: 'monospace' }}>{item.hex_code || 'N/A'}</span>
      ),
    },
    {
      key: 'is_active',
      label: 'Status',
      render: (item: Color) => (
        <span className={`status-badge ${item.is_active ? 'active' : 'inactive'}`}>
          {item.is_active ? 'Active' : 'Inactive'}
        </span>
      ),
    },
  ];

  return (
    <div className="colors-page">
      <div className="page-header">
        <h1>Colors Management</h1>
        <button className="btn-primary" onClick={handleAdd}>
          Add Color
        </button>
      </div>

      <DataTable
        columns={columns}
        data={colors}
        onEdit={handleEdit}
        onDelete={handleDelete}
        loading={loading}
        emptyMessage="No colors found. Create your first color!"
      />

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingColor ? 'Edit Color' : 'Add Color'}
      >
        <form onSubmit={handleSubmit} className="color-form">
          <div className="form-group">
            <label htmlFor="name">Color Name *</label>
            <input
              type="text"
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className={formErrors.name ? 'error' : ''}
              placeholder="e.g., Navy Blue"
            />
            {formErrors.name && <span className="error-message">{formErrors.name}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="hex_code">Hex Code *</label>
            <div className="color-picker-group">
              <input
                type="color"
                id="color_picker"
                value={formData.hex_code}
                onChange={(e) => setFormData({ ...formData, hex_code: e.target.value })}
                className="color-picker"
              />
              <input
                type="text"
                id="hex_code"
                value={formData.hex_code}
                onChange={(e) => setFormData({ ...formData, hex_code: e.target.value })}
                className={formErrors.hex_code ? 'error' : ''}
                placeholder="#000000"
                maxLength={7}
              />
            </div>
            {formErrors.hex_code && <span className="error-message">{formErrors.hex_code}</span>}
          </div>

          <div className="form-group checkbox-group">
            <label>
              <input
                type="checkbox"
                checked={formData.is_active}
                onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
              />
              <span>Active</span>
            </label>
          </div>

          <div className="form-actions">
            <button
              type="button"
              className="btn-secondary"
              onClick={() => setIsModalOpen(false)}
              disabled={submitting}
            >
              Cancel
            </button>
            <button type="submit" className="btn-primary" disabled={submitting}>
              {submitting ? 'Saving...' : editingColor ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Colors;
