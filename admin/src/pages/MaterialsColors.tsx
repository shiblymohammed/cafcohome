import { useState, useEffect } from 'react';
import apiClient, { extractData } from '../utils/api';
import DataTable from '../components/DataTable';
import Modal from '../components/Modal';
import './MaterialsColors.css';

interface Color {
  id: number;
  name: string;
  hex_code: string;
  is_active: boolean;
  created_at: string;
}

interface Material {
  id: number;
  name: string;
  description: string;
  is_active: boolean;
  created_at: string;
}

interface ColorFormData {
  name: string;
  hex_code: string;
  is_active: boolean;
}

interface MaterialFormData {
  name: string;
  description: string;
  is_active: boolean;
}

const MaterialsColors = () => {
  const [activeTab, setActiveTab] = useState<'materials' | 'colors'>('materials');
  const [materials, setMaterials] = useState<Material[]>([]);
  const [colors, setColors] = useState<Color[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Material modal state
  const [isMaterialModalOpen, setIsMaterialModalOpen] = useState(false);
  const [editingMaterial, setEditingMaterial] = useState<Material | null>(null);
  const [materialFormData, setMaterialFormData] = useState<MaterialFormData>({
    name: '',
    description: '',
    is_active: true,
  });
  
  // Color modal state
  const [isColorModalOpen, setIsColorModalOpen] = useState(false);
  const [editingColor, setEditingColor] = useState<Color | null>(null);
  const [colorFormData, setColorFormData] = useState<ColorFormData>({
    name: '',
    hex_code: '#000000',
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
    } finally {
      setLoading(false);
    }
  };

  const fetchColors = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get('/colors/');
      setColors(extractData(response.data));
    } catch (error) {
      console.error('Failed to fetch colors:', error);
    } finally {
      setLoading(false);
    }
  };

  // Material handlers
  const handleAddMaterial = () => {
    setEditingMaterial(null);
    setMaterialFormData({ name: '', description: '', is_active: true });
    setFormErrors({});
    setIsMaterialModalOpen(true);
  };

  const handleEditMaterial = (material: Material) => {
    setEditingMaterial(material);
    setMaterialFormData({
      name: material.name,
      description: material.description || '',
      is_active: material.is_active,
    });
    setFormErrors({});
    setIsMaterialModalOpen(true);
  };

  const handleDeleteMaterial = async (material: Material) => {
    if (!window.confirm(`Are you sure you want to delete "${material.name}"?`)) return;
    try {
      await apiClient.delete(`/materials/${material.id}/`);
      alert('Material deleted successfully');
      fetchMaterials();
    } catch (error) {
      console.error('Failed to delete material:', error);
      alert('Failed to delete material');
    }
  };

  const handleSubmitMaterial = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!materialFormData.name.trim()) {
      setFormErrors({ name: 'Material name is required' });
      return;
    }

    setSubmitting(true);
    try {
      if (editingMaterial) {
        await apiClient.put(`/materials/${editingMaterial.id}/`, materialFormData);
        alert('Material updated successfully');
      } else {
        await apiClient.post('/materials/', materialFormData);
        alert('Material created successfully');
      }
      setIsMaterialModalOpen(false);
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

  // Color handlers
  const handleAddColor = () => {
    setEditingColor(null);
    setColorFormData({ name: '', hex_code: '#000000', is_active: true });
    setFormErrors({});
    setIsColorModalOpen(true);
  };

  const handleEditColor = (color: Color) => {
    setEditingColor(color);
    setColorFormData({
      name: color.name,
      hex_code: color.hex_code || '#000000',
      is_active: color.is_active,
    });
    setFormErrors({});
    setIsColorModalOpen(true);
  };

  const handleDeleteColor = async (color: Color) => {
    if (!window.confirm(`Are you sure you want to delete "${color.name}"?`)) return;
    try {
      await apiClient.delete(`/colors/${color.id}/`);
      alert('Color deleted successfully');
      fetchColors();
    } catch (error) {
      console.error('Failed to delete color:', error);
      alert('Failed to delete color');
    }
  };

  const handleSubmitColor = async (e: React.FormEvent) => {
    e.preventDefault();
    const errors: Record<string, string> = {};
    if (!colorFormData.name.trim()) errors.name = 'Color name is required';
    if (!colorFormData.hex_code.match(/^#[0-9A-Fa-f]{6}$/)) {
      errors.hex_code = 'Valid hex code is required (e.g., #FF5733)';
    }
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    setSubmitting(true);
    try {
      if (editingColor) {
        await apiClient.put(`/colors/${editingColor.id}/`, colorFormData);
        alert('Color updated successfully');
      } else {
        await apiClient.post('/colors/', colorFormData);
        alert('Color created successfully');
      }
      setIsColorModalOpen(false);
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

  const materialColumns = [
    { key: 'name', label: 'Name' },
    {
      key: 'description',
      label: 'Description',
      render: (item: Material) => (
        <span style={{ color: '#666' }}>{item.description || 'No description'}</span>
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
  ];

  const colorColumns = [
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
    <div className="materials-colors-page">
      <div className="page-header">
        <h1>Materials & Colors Management</h1>
        <button
          className="btn-primary"
          onClick={activeTab === 'materials' ? handleAddMaterial : handleAddColor}
        >
          {activeTab === 'materials' ? 'Add Material' : 'Add Color'}
        </button>
      </div>

      <div className="tabs">
        <button
          className={`tab ${activeTab === 'materials' ? 'active' : ''}`}
          onClick={() => setActiveTab('materials')}
        >
          Materials ({materials.length})
        </button>
        <button
          className={`tab ${activeTab === 'colors' ? 'active' : ''}`}
          onClick={() => setActiveTab('colors')}
        >
          Colors ({colors.length})
        </button>
      </div>

      {activeTab === 'materials' ? (
        <DataTable
          columns={materialColumns}
          data={materials}
          onEdit={handleEditMaterial}
          onDelete={handleDeleteMaterial}
          loading={loading}
          emptyMessage="No materials found. Create your first material!"
        />
      ) : (
        <DataTable
          columns={colorColumns}
          data={colors}
          onEdit={handleEditColor}
          onDelete={handleDeleteColor}
          loading={loading}
          emptyMessage="No colors found. Create your first color!"
        />
      )}

      {/* Material Modal */}
      <Modal
        isOpen={isMaterialModalOpen}
        onClose={() => setIsMaterialModalOpen(false)}
        title={editingMaterial ? 'Edit Material' : 'Add Material'}
      >
        <form onSubmit={handleSubmitMaterial} className="form">
          <div className="form-group">
            <label htmlFor="material_name">Material Name *</label>
            <input
              type="text"
              id="material_name"
              value={materialFormData.name}
              onChange={(e) => setMaterialFormData({ ...materialFormData, name: e.target.value })}
              className={formErrors.name ? 'error' : ''}
              placeholder="e.g., Velvet"
            />
            {formErrors.name && <span className="error-message">{formErrors.name}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="material_description">Description</label>
            <textarea
              id="material_description"
              value={materialFormData.description}
              onChange={(e) => setMaterialFormData({ ...materialFormData, description: e.target.value })}
              rows={3}
              placeholder="Optional description"
            />
          </div>

          <div className="form-group checkbox-group">
            <label>
              <input
                type="checkbox"
                checked={materialFormData.is_active}
                onChange={(e) => setMaterialFormData({ ...materialFormData, is_active: e.target.checked })}
              />
              <span>Active</span>
            </label>
          </div>

          <div className="form-actions">
            <button
              type="button"
              className="btn-secondary"
              onClick={() => setIsMaterialModalOpen(false)}
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

      {/* Color Modal */}
      <Modal
        isOpen={isColorModalOpen}
        onClose={() => setIsColorModalOpen(false)}
        title={editingColor ? 'Edit Color' : 'Add Color'}
      >
        <form onSubmit={handleSubmitColor} className="form">
          <div className="form-group">
            <label htmlFor="color_name">Color Name *</label>
            <input
              type="text"
              id="color_name"
              value={colorFormData.name}
              onChange={(e) => setColorFormData({ ...colorFormData, name: e.target.value })}
              className={formErrors.name ? 'error' : ''}
              placeholder="e.g., Navy Blue"
            />
            {formErrors.name && <span className="error-message">{formErrors.name}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="color_hex">Hex Code *</label>
            <div className="color-picker-group">
              <input
                type="color"
                value={colorFormData.hex_code}
                onChange={(e) => setColorFormData({ ...colorFormData, hex_code: e.target.value })}
                className="color-picker"
              />
              <input
                type="text"
                id="color_hex"
                value={colorFormData.hex_code}
                onChange={(e) => setColorFormData({ ...colorFormData, hex_code: e.target.value })}
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
                checked={colorFormData.is_active}
                onChange={(e) => setColorFormData({ ...colorFormData, is_active: e.target.checked })}
              />
              <span>Active</span>
            </label>
          </div>

          <div className="form-actions">
            <button
              type="button"
              className="btn-secondary"
              onClick={() => setIsColorModalOpen(false)}
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

export default MaterialsColors;
