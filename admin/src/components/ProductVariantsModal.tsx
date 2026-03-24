import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import type { RootState } from '../store';
import api from '../utils/api';
import Modal from './Modal';
import MultiImageUploader from './MultiImageUploader';
import './ProductVariantsModal.css';

interface ImageData {
  url: string;
  alt: string;
  order: number;
}

interface ProductVariant {
  id: number;
  product: number;
  color: string;
  material: string;
  sku: string;
  mrp: string;
  price: string;
  stock_quantity: number;
  low_stock_threshold: number;
  images: ImageData[];
  is_active: boolean;
  is_default: boolean;
  is_in_stock: boolean;
  is_low_stock: boolean;
}

interface VariantFormData {
  color: string;
  material: string;
  mrp: string;
  price: string;
  stock_quantity: number;
  low_stock_threshold: number;
  images: ImageData[];
  is_active: boolean;
  is_default: boolean;
}

interface ProductVariantsModalProps {
  isOpen: boolean;
  onClose: () => void;
  productId: number;
  productName: string;
  productColors: string[];
  productMaterials: string[];
}

const ProductVariantsModal = ({
  isOpen,
  onClose,
  productId,
  productName,
  productColors,
  productMaterials,
}: ProductVariantsModalProps) => {
  const token = useSelector((state: RootState) => state.auth.token);
  const [variants, setVariants] = useState<ProductVariant[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingVariant, setEditingVariant] = useState<ProductVariant | null>(null);
  const [formData, setFormData] = useState<VariantFormData>({
    color: '',
    material: '',
    mrp: '',
    price: '',
    stock_quantity: 0,
    low_stock_threshold: 5,
    images: [],
    is_active: true,
    is_default: false,
  });

  useEffect(() => {
    if (isOpen && productId) {
      fetchVariants();
    }
  }, [isOpen, productId]);

  const fetchVariants = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/variants/?product=${productId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const variantsData = response.data.results || response.data;
      setVariants(Array.isArray(variantsData) ? variantsData : []);
    } catch (err: any) {
      setError('Failed to fetch variants');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleBulkGenerate = async () => {
    if (!window.confirm(`Generate all color-material combinations for ${productName}?`)) return;

    try {
      const response = await api.post(
        '/variants/bulk-generate/',
        { product_id: productId },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      alert(`Created ${response.data.created.length} variants!`);
      if (response.data.skipped.length > 0) {
        alert(`Skipped ${response.data.skipped.length} existing variants`);
      }
      fetchVariants();
    } catch (err: any) {
      setError('Failed to generate variants');
    }
  };

  const handleAddVariant = () => {
    setEditingVariant(null);
    setFormData({
      color: productColors[0] || '',
      material: productMaterials[0] || '',
      mrp: '',
      price: '',
      stock_quantity: 0,
      low_stock_threshold: 5,
      images: [],
      is_active: true,
      is_default: variants.length === 0,
    });
    setShowAddForm(true);
  };

  const handleEditVariant = (variant: ProductVariant) => {
    setEditingVariant(variant);
    setFormData({
      color: variant.color,
      material: variant.material,
      mrp: variant.mrp,
      price: variant.price,
      stock_quantity: variant.stock_quantity,
      low_stock_threshold: variant.low_stock_threshold,
      images: variant.images,
      is_active: variant.is_active,
      is_default: variant.is_default,
    });
    setShowAddForm(true);
  };

  const handleSaveVariant = async () => {
    try {
      const payload = {
        product: productId,
        ...formData,
      };

      if (editingVariant) {
        await api.put(`/variants/${editingVariant.id}/`, payload, {
          headers: { Authorization: `Bearer ${token}` },
        });
      } else {
        await api.post('/variants/', payload, {
          headers: { Authorization: `Bearer ${token}` },
        });
      }

      fetchVariants();
      setShowAddForm(false);
      setError('');
    } catch (err: any) {
      setError(err.response?.data?.error?.message || 'Failed to save variant');
    }
  };

  const handleDeleteVariant = async (id: number) => {
    if (!window.confirm('Delete this variant?')) return;

    try {
      await api.delete(`/variants/${id}/`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchVariants();
    } catch (err: any) {
      setError('Failed to delete variant');
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Manage Variants - ${productName}`}
      size="large"
    >
      <div className="product-variants-modal">
        {error && <div className="error-message">{error}</div>}

        {!showAddForm ? (
          <>
            <div className="variants-header">
              <div className="variants-actions">
                <button className="btn btn-secondary" onClick={handleBulkGenerate}>
                  Generate All Variants
                </button>
                <button className="btn btn-primary" onClick={handleAddVariant}>
                  Add Variant
                </button>
              </div>
            </div>

            {loading ? (
              <p>Loading variants...</p>
            ) : variants.length === 0 ? (
              <div className="empty-state">
                <p>No variants yet. Generate all combinations or add manually.</p>
              </div>
            ) : (
              <div className="variants-list">
                {variants.map((variant) => (
                  <div key={variant.id} className="variant-card">
                    <div className="variant-info">
                      <div className="variant-header">
                        <span className="variant-sku">{variant.sku}</span>
                        {variant.is_default && <span className="badge badge-primary">Default</span>}
                        {!variant.is_active && <span className="badge badge-secondary">Inactive</span>}
                      </div>
                      <div className="variant-details">
                        <p><strong>Color:</strong> {variant.color}</p>
                        <p><strong>Material:</strong> {variant.material}</p>
                        <p><strong>Price:</strong> ₹{parseFloat(variant.price).toLocaleString()}</p>
                        <p>
                          <strong>Stock:</strong>{' '}
                          <span className={variant.is_low_stock ? 'text-warning' : variant.is_in_stock ? 'text-success' : 'text-danger'}>
                            {variant.stock_quantity}
                          </span>
                        </p>
                      </div>
                    </div>
                    <div className="variant-actions">
                      <button className="btn-icon" onClick={() => handleEditVariant(variant)} title="Edit">
                        ✏️
                      </button>
                      <button className="btn-icon" onClick={() => handleDeleteVariant(variant.id)} title="Delete">
                        🗑️
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        ) : (
          <div className="variant-form">
            <h3>{editingVariant ? 'Edit Variant' : 'Add Variant'}</h3>

            <div className="form-row">
              <div className="form-group">
                <label>Color *</label>
                <select
                  value={formData.color}
                  onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                  required
                >
                  <option value="">Select Color</option>
                  {productColors.map((color) => (
                    <option key={color} value={color}>
                      {color}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Material *</label>
                <select
                  value={formData.material}
                  onChange={(e) => setFormData({ ...formData, material: e.target.value })}
                  required
                >
                  <option value="">Select Material</option>
                  {productMaterials.map((material) => (
                    <option key={material} value={material}>
                      {material}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {editingVariant && (
              <div className="form-group">
                <label>SKU</label>
                <input type="text" value={editingVariant.sku} disabled className="readonly-input" />
              </div>
            )}

            <div className="form-row">
              <div className="form-group">
                <label>MRP *</label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.mrp}
                  onChange={(e) => setFormData({ ...formData, mrp: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label>Selling Price *</label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Stock Quantity *</label>
                <input
                  type="number"
                  value={formData.stock_quantity}
                  onChange={(e) => setFormData({ ...formData, stock_quantity: parseInt(e.target.value) })}
                  min="0"
                  required
                />
              </div>

              <div className="form-group">
                <label>Low Stock Threshold</label>
                <input
                  type="number"
                  value={formData.low_stock_threshold}
                  onChange={(e) => setFormData({ ...formData, low_stock_threshold: parseInt(e.target.value) })}
                  min="0"
                />
              </div>
            </div>

            <div className="form-group">
              <label>Variant Images</label>
              <MultiImageUploader
                value={formData.images}
                onChange={(images) => setFormData({ ...formData, images })}
              />
            </div>

            <div className="form-group checkbox-group">
              <label>
                <input
                  type="checkbox"
                  checked={formData.is_default}
                  onChange={(e) => setFormData({ ...formData, is_default: e.target.checked })}
                />
                Set as default variant
              </label>
            </div>

            <div className="form-group checkbox-group">
              <label>
                <input
                  type="checkbox"
                  checked={formData.is_active}
                  onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                />
                Active
              </label>
            </div>

            <div className="form-actions">
              <button className="btn btn-secondary" onClick={() => setShowAddForm(false)}>
                Cancel
              </button>
              <button className="btn btn-primary" onClick={handleSaveVariant}>
                {editingVariant ? 'Update' : 'Create'} Variant
              </button>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
};

export default ProductVariantsModal;
