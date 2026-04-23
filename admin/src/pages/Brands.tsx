import { useState, useEffect } from 'react';
import apiClient, { extractData } from '../utils/api';
import DataTable from '../components/DataTable';
import Modal from '../components/Modal';
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

const Brands = () => {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBrand, setEditingBrand] = useState<Brand | null>(null);
  const [formData, setFormData] = useState<BrandFormData>({
    name: '',
    description: '',
    logo_url: '',
    is_active: true,
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchBrands();
  }, []);

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
    setFormData({
      name: '',
      description: '',
      logo_url: '',
      is_active: true,
    });
    setFormErrors({});
    setIsModalOpen(true);
  };

  const handleEdit = (brand: Brand) => {
    setEditingBrand(brand);
    setFormData({
      name: brand.name,
      description: brand.description,
      logo_url: brand.logo_url,
      is_active: brand.is_active,
    });
    setFormErrors({});
    setIsModalOpen(true);
  };

  const handleDelete = async (brand: Brand) => {
    if (!window.confirm(`Are you sure you want to delete "${brand.name}"?`)) {
      return;
    }

    try {
      await apiClient.delete(`/brands/${brand.slug}/`);
      alert('Brand deleted successfully');
      fetchBrands();
    } catch (error) {
      console.error('Failed to delete brand:', error);
      alert('Failed to delete brand');
    }
  };

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!formData.name.trim()) {
      errors.name = 'Name is required';
    }

    if (!formData.description.trim()) {
      errors.description = 'Description is required';
    }

    if (!formData.logo_url.trim()) {
      errors.logo_url = 'Logo is required';
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
      if (editingBrand) {
        await apiClient.put(`/brands/${editingBrand.slug}/`, formData);
        alert('Brand updated successfully');
      } else {
        await apiClient.post('/brands/', formData);
        alert('Brand created successfully');
      }
      setIsModalOpen(false);
      fetchBrands();
    } catch (error: any) {
      console.error('Failed to save brand:', error);
      if (error.response?.data) {
        setFormErrors(error.response.data);
      } else {
        alert('Failed to save brand');
      }
    } finally {
      setSubmitting(false);
    }
  };

  const columns = [
    {
      key: 'logo_url',
      label: 'Logo',
      render: (item: Brand) => (
        <img src={item.logo_url} alt={item.name} className="brand-logo" />
      ),
    },
    { key: 'name', label: 'Name' },
    { key: 'description', label: 'Description' },
    {
      key: 'is_active',
      label: 'Status',
      render: (item: Brand) => (
        <span className={`status-badge ${item.is_active ? 'active' : 'inactive'}`}>
          {item.is_active ? 'Active' : 'Inactive'}
        </span>
      ),
    },
  ];

  return (
    <div className="brands-page">
      <div className="page-header">
        <h1>Brands Management</h1>
        <button className="btn-primary" onClick={handleAdd}>
          Add Brand
        </button>
      </div>

      <DataTable
        columns={columns}
        data={brands}
        onEdit={handleEdit}
        onDelete={handleDelete}
        loading={loading}
        emptyMessage="No brands found. Create your first brand!"
      />

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingBrand ? 'Edit Brand' : 'Add Brand'}
      >
        <form onSubmit={handleSubmit} className="brand-form">
          <div className="form-group">
            <label htmlFor="name">Name *</label>
            <input
              type="text"
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className={formErrors.name ? 'error' : ''}
            />
            {formErrors.name && <span className="error-message">{formErrors.name}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="description">Description *</label>
            <textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={4}
              className={formErrors.description ? 'error' : ''}
            />
            {formErrors.description && (
              <span className="error-message">{formErrors.description}</span>
            )}
          </div>

          <ImageCropperWithUpload
            label="Brand Logo *"
            value={formData.logo_url}
            onChange={(url) => setFormData({ ...formData, logo_url: url })}
            error={formErrors.logo_url}
            aspectRatio={IMAGE_CONFIGS.brand.aspectRatio}
          />

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
              {submitting ? 'Saving...' : editingBrand ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Brands;
