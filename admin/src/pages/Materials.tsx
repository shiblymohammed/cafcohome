import { useState, useEffect } from 'react';
import apiClient, { extractData } from '../utils/api';
import DataTable from '../components/DataTable';
import Modal from '../components/Modal';
import './Materials.css';

interface Color {
  id: number;
  name: string;
  hex_code: string;
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
  description: string;
  is_active: boolean;
  available_colors: MaterialColor[];
  created_at: string;
}

interface MaterialFormData {
  name: string;
  description: string;
  is_active: boolean;
}

const Materials = () => {
  const [materials, setMaterials] = useState<Material[]>([]);
  const [colors, setColors] = useState<Color[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isColorModalOpen, setIsColorModalOpen] = useState(false);
  const [editingMaterial, setEditingMaterial] = useState<Material | null>(null);
  const [selectedMaterial, setSelectedMaterial] = useState<Material | null>(null);
  const [formData, setFormData] = useState<MaterialFormData>({
    name: '',
    description: '',
    is_active: true,
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchMaterials();
    fetchColors();
  }, []);

  const fetchMaterials = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get('/materials/');
      setMaterials(extractData(response.data));
    } catch (error) {
      console.error('Failed to fetch materials:', error);
      alert('Failed to load materials');
    } finally {
      setLoading(false);
    }
  };

  const fetchColors = async () => {
    try {
      const response = await apiClient.get('/colors/');
      setColors(extractData(response.data).filter((c: Color) => c.is_active));
    } catch (error) {
      console.error('Failed to fetch colors:', error);
    }
  };

  const handleAdd = () => {
    setEditingMaterial(null);
    setFormData({
      name: '',
      description: '',
      is_active: true,
    });
    setFormErrors({});
    setIsModalOpen(true);
  };

  const handleEdit = (material: Material) => {
    setEditingMaterial(material);
    setFormData({
      name: material.name,
      description: material.description || '',
      is_active: material.is_active,
    });
    setFormErrors({});
    setIsModalOpen(true);
  };

  const handleManageColors = (material: Material) => {
    setSelectedMaterial(material);
    setIsColorModalOpen(true);
  };

  const handleDelete = async (material: Material) => {
    if (!window.confirm(`Are you sure you want to delete "${material.name}"?`)) {
      return;
    }

    try {
      await apiClient.delete(`/materials/${material.id}/`);
      alert('Material deleted successfully');
      fetchMaterials();
    } catch (error) {
      console.error('Failed to delete material:', error);
      alert('Failed to delete material');
    }
  };

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!formData.name.trim()) {
      errors.name = 'Material name is required';
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
      if (editingMaterial) {
        await apiClient.put(`/materials/${editingMaterial.id}/`, formData);
        alert('Material updated successfully');
      } else {
        await apiClient.post('/materials/', formData);
        alert('Material created successfully');
      }
      setIsModalOpen(false);
      fetchMaterials();
    } catch (error: any) {
      console.error('Failed to save material:', error);
      if (error.response?.data) {
        setFormErrors(error.response.data);
      } else {
        alert('Failed to save material');
      }
    } finally {
      setSubmitting(false);
    }
  };

  const toggleMaterialColor = async (colorId: number) => {
    if (!selectedMaterial) return;

    const existingRelation = selectedMaterial.available_colors.find(
      (mc) => mc.color_id === colorId
    );

    try {
      if (existingRelation) {
        // Remove the relationship
        await apiClient.delete(`/material-colors/${existingRelation.id}/`);
      } else {
        // Add the relationship
        await apiClient.post('/material-colors/', {
          material: selectedMaterial.id,
          color: colorId,
          is_active: true,
        });
      }
      fetchMaterials();
    } catch (error) {
      console.error('Failed to update material-color relationship:', error);
      alert('Failed to update colors');
    }
  };

  const columns = [
    { key: 'name', label: 'Name' },
    {
      key: 'description',
      label: 'Description',
      render: (item: Material) => (
        <span style={{ color: '#666' }}>{item.description || 'No description'}</span>
      ),
    },
    {
      key: 'available_colors',
      label: 'Available Colors',
      render: (item: Material) => (
        <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
          {item.available_colors && item.available_colors.length > 0 ? (
            item.available_colors.slice(0, 5).map((mc) => (
              <div
                key={mc.id}
                style={{
                  width: '24px',
                  height: '24px',
                  backgroundColor: mc.color_hex_code || '#CCCCCC',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                }}
                title={mc.color_name}
              />
            ))
          ) : (
            <span style={{ color: '#999', fontSize: '12px' }}>No colors</span>
          )}
          {item.available_colors && item.available_colors.length > 5 && (
            <span style={{ fontSize: '12px', color: '#666' }}>
              +{item.available_colors.length - 5}
            </span>
          )}
        </div>
      ),
    },
    {
      key: 'is_active',
      label: 'Status',
      render: (item: Material) => (
        <span className={`status-badge ${item.is_active ? 'active' : 'inactive'}`}>
          {item.is_active ? 'Active' : 'Inactive'}
        </span>
      ),
    },
    {
      key: 'actions',
      label: 'Colors',
      render: (item: Material) => (
        <button
          className="btn-manage-colors"
          onClick={(e) => {
            e.stopPropagation();
            handleManageColors(item);
          }}
        >
          Manage Colors
        </button>
      ),
    },
  ];

  return (
    <div className="materials-page">
      <div className="page-header">
        <h1>Materials Management</h1>
        <button className="btn-primary" onClick={handleAdd}>
          Add Material
        </button>
      </div>

      <DataTable
        columns={columns}
        data={materials}
        onEdit={handleEdit}
        onDelete={handleDelete}
        loading={loading}
        emptyMessage="No materials found. Create your first material!"
      />

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingMaterial ? 'Edit Material' : 'Add Material'}
      >
        <form onSubmit={handleSubmit} className="material-form">
          <div className="form-group">
            <label htmlFor="name">Material Name *</label>
            <input
              type="text"
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className={formErrors.name ? 'error' : ''}
              placeholder="e.g., Velvet"
            />
            {formErrors.name && <span className="error-message">{formErrors.name}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="description">Description</label>
            <textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
              placeholder="Optional description of the material"
            />
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
              {submitting ? 'Saving...' : editingMaterial ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Manage Colors Modal */}
      <Modal
        isOpen={isColorModalOpen}
        onClose={() => {
          setIsColorModalOpen(false);
          setSelectedMaterial(null);
        }}
        title={`Manage Colors for ${selectedMaterial?.name || ''}`}
        size="large"
      >
        <div className="manage-colors-content">
          <p style={{ marginBottom: '20px', color: '#666' }}>
            Select which colors are available for this material:
          </p>
          <div className="color-selection-grid">
            {colors.map((color) => {
              const isSelected = selectedMaterial?.available_colors.some(
                (mc) => mc.color_id === color.id
              );
              return (
                <label key={color.id} className={`color-checkbox-card ${isSelected ? 'selected' : ''}`}>
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => toggleMaterialColor(color.id)}
                  />
                  <div className="color-checkbox-content">
                    <div
                      className="color-preview-large"
                      style={{ backgroundColor: color.hex_code || '#CCCCCC' }}
                    />
                    <span>{color.name}</span>
                  </div>
                </label>
              );
            })}
          </div>
          <div className="form-actions" style={{ marginTop: '24px' }}>
            <button
              type="button"
              className="btn-primary"
              onClick={() => {
                setIsColorModalOpen(false);
                setSelectedMaterial(null);
              }}
            >
              Done
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Materials;
