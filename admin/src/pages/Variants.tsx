import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import type { RootState } from '../store';
import api from '../utils/api';
import DataTable from '../components/DataTable';
import Modal from '../components/Modal';
import { ErrorMessage } from '../components/ErrorMessage';
import { LoadingSpinner } from '../components/LoadingSpinner';
import MultiImageUploader from '../components/MultiImageUploader';
import './Variants.css';

interface Product {
  id: number;
  name: string;
  slug: string;
}

interface ImageData {
  url: string;
  alt: string;
  order: number;
}

interface Variant {
  id: number;
  product: number;
  product_name: string;
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
  discount_percentage: string;
}

interface VariantFormData {
  product: number | '';
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

const Variants = () => {
  const token = useSelector((state: RootState) => state.auth.token);
  const [variants, setVariants] = useState<Variant[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingVariant, setEditingVariant] = useState<Variant | null>(null);
  const [formData, setFormData] = useState<VariantFormData>({
    product: '',
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
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [selectedProductForBulk, setSelectedProductForBulk] = useState<number | ''>('');

  useEffect(() => {
    fetchVariants();
    fetchProducts();
  }, []);

  const fetchVariants = async () => {
    try {
      setLoading(true);
      const response = await api.get('/variants/', {
        headers: { Authorization: `Bearer ${token}` },
      });
      // Handle paginated response
      const variantsData = response.data.results || response.data;
      setVariants(Array.isArray(variantsData) ? variantsData : []);
      setError('');
    } catch (err: any) {
      setError(err.response?.data?.error?.message || 'Failed to fetch variants');
    } finally {
      setLoading(false);
    }
  };

  const fetchProducts = async () => {
    try {
      const response = await api.get('/products/', {
        headers: { Authorization: `Bearer ${token}` },
      });
      // Handle paginated response
      const productsData = response.data.results || response.data;
      setProducts(Array.isArray(productsData) ? productsData : []);
    } catch (err) {
      console.error('Failed to fetch products:', err);
    }
  };

  const handleOpenModal = (variant?: Variant) => {
    if (variant) {
      setEditingVariant(variant);
      setFormData({
        product: variant.product,
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
    } else {
      setEditingVariant(null);
      setFormData({
        product: '',
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
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingVariant(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingVariant) {
        await api.put(`/variants/${editingVariant.id}/`, formData, {
          headers: { Authorization: `Bearer ${token}` },
        });
      } else {
        await api.post('/variants/', formData, {
          headers: { Authorization: `Bearer ${token}` },
        });
      }
      fetchVariants();
      handleCloseModal();
    } catch (err: any) {
      setError(err.response?.data?.error?.message || 'Failed to save variant');
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this variant?')) return;
    
    try {
      await api.delete(`/variants/${id}/`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchVariants();
    } catch (err: any) {
      setError(err.response?.data?.error?.message || 'Failed to delete variant');
    }
  };

  const handleImagesChange = (images: ImageData[]) => {
    setFormData({ ...formData, images });
  };

  const handleBulkGenerate = async () => {
    if (!selectedProductForBulk) {
      setError('Please select a product');
      return;
    }

    try {
      const response = await api.post('/variants/bulk-generate/', 
        { product_id: selectedProductForBulk },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      alert(`Successfully created ${response.data.created.length} variants!`);
      if (response.data.skipped.length > 0) {
        alert(`Skipped ${response.data.skipped.length} existing variants: ${response.data.skipped.join(', ')}`);
      }
      
      fetchVariants();
      setShowBulkModal(false);
      setSelectedProductForBulk('');
    } catch (err: any) {
      setError(err.response?.data?.error?.message || 'Failed to generate variants');
    }
  };

  const columns = [
    { key: 'sku', label: 'SKU' },
    { key: 'product_name', label: 'Product' },
    { key: 'color', label: 'Color' },
    { key: 'material', label: 'Material' },
    { 
      key: 'price', 
      label: 'Price',
      render: (variant: Variant) => `₹${parseFloat(variant.price).toLocaleString()}`
    },
    { 
      key: 'stock_quantity', 
      label: 'Stock',
      render: (variant: Variant) => (
        <span className={variant.is_low_stock ? 'low-stock' : variant.is_in_stock ? 'in-stock' : 'out-of-stock'}>
          {variant.stock_quantity}
        </span>
      )
    },
    {
      key: 'is_default',
      label: 'Default',
      render: (variant: Variant) => (
        <span className={`badge ${variant.is_default ? 'badge-success' : 'badge-secondary'}`}>
          {variant.is_default ? 'Yes' : 'No'}
        </span>
      )
    },
    {
      key: 'is_active',
      label: 'Status',
      render: (variant: Variant) => (
        <span className={`badge ${variant.is_active ? 'badge-success' : 'badge-danger'}`}>
          {variant.is_active ? 'Active' : 'Inactive'}
        </span>
      )
    },
  ];

  if (loading) return <LoadingSpinner />;

  return (
    <div className="variants-page">
      <div className="page-header">
        <h1>Product Variants</h1>
        <div className="header-actions">
          <button className="btn btn-secondary" onClick={() => setShowBulkModal(true)}>
            Generate Variants
          </button>
          <button className="btn btn-primary" onClick={() => handleOpenModal()}>
            Add Variant
          </button>
        </div>
      </div>

      {error && <ErrorMessage message={error} onDismiss={() => setError('')} />}

      <DataTable
        columns={columns}
        data={variants}
        onEdit={handleOpenModal}
        onDelete={(variant: Variant) => handleDelete(variant.id)}
      />

      <Modal isOpen={isModalOpen} onClose={handleCloseModal} title={editingVariant ? 'Edit Variant' : 'Add Variant'}>
        <form onSubmit={handleSubmit} className="variant-form">
          <div className="form-group">
            <label>Product *</label>
            <select
              value={formData.product}
              onChange={(e) => setFormData({ ...formData, product: parseInt(e.target.value) })}
              required
              disabled={!!editingVariant}
            >
              <option value="">Select Product</option>
              {products.map((product) => (
                <option key={product.id} value={product.id}>
                  {product.name}
                </option>
              ))}
            </select>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Color *</label>
              <input
                type="text"
                value={formData.color}
                onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                placeholder="e.g., Navy Blue"
                required
              />
            </div>

            <div className="form-group">
              <label>Material *</label>
              <input
                type="text"
                value={formData.material}
                onChange={(e) => setFormData({ ...formData, material: e.target.value })}
                placeholder="e.g., Velvet"
                required
              />
            </div>
          </div>

          {editingVariant && (
            <div className="form-group">
              <label>SKU</label>
              <input
                type="text"
                value={editingVariant.sku}
                disabled
                className="readonly-input"
              />
              <small>SKU is auto-generated and cannot be changed</small>
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
                placeholder="0.00"
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
                placeholder="0.00"
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
              onChange={handleImagesChange}
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
            <button type="button" className="btn btn-secondary" onClick={handleCloseModal}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              {editingVariant ? 'Update' : 'Create'} Variant
            </button>
          </div>
        </form>
      </Modal>

      <Modal isOpen={showBulkModal} onClose={() => setShowBulkModal(false)} title="Bulk Generate Variants">
        <div className="bulk-generate-form">
          <p>Generate all possible variants for a product based on its colors and materials.</p>
          
          <div className="form-group">
            <label>Select Product *</label>
            <select
              value={selectedProductForBulk}
              onChange={(e) => setSelectedProductForBulk(parseInt(e.target.value))}
              required
            >
              <option value="">Choose a product...</option>
              {products.map((product) => (
                <option key={product.id} value={product.id}>
                  {product.name}
                </option>
              ))}
            </select>
          </div>

          <div className="form-actions">
            <button type="button" className="btn btn-secondary" onClick={() => setShowBulkModal(false)}>
              Cancel
            </button>
            <button type="button" className="btn btn-primary" onClick={handleBulkGenerate}>
              Generate Variants
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Variants;
