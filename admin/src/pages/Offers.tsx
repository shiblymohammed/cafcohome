import { useState, useEffect } from 'react';
import apiClient, { extractData } from '../utils/api';
import DataTable from '../components/DataTable';
import Modal from '../components/Modal';
import ImageUploader from '../components/ImageUploader';
import './Offers.css';

interface Product {
  id: number;
  name: string;
}

interface Collection {
  id: number;
  name: string;
}

interface Category {
  id: number;
  name: string;
}

interface Brand {
  id: number;
  name: string;
}

interface Offer {
  id: number;
  name: string;
  description: string;
  image_url?: string;
  discount_percentage: string;
  apply_to: 'product' | 'collection' | 'category' | 'brand';
  products?: number[];
  collections?: number[];
  categories?: number[];
  brands?: number[];
  start_date: string;
  end_date: string;
  is_active: boolean;
  is_featured: boolean;
  is_valid: boolean;
  applicable_products_count: number;
  created_at: string;
}

interface OfferFormData {
  name: string;
  description: string;
  image_url: string;
  discount_percentage: string;
  apply_to: 'product' | 'collection' | 'category' | 'brand' | '';
  products: number[];
  collections: number[];
  categories: number[];
  brands: number[];
  start_date: string;
  end_date: string;
  is_active: boolean;
  is_featured: boolean;
}

const Offers = () => {
  const [offers, setOffers] = useState<Offer[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [collections, setCollections] = useState<Collection[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingOffer, setEditingOffer] = useState<Offer | null>(null);
  const [formData, setFormData] = useState<OfferFormData>({
    name: '',
    description: '',
    image_url: '',
    discount_percentage: '',
    apply_to: '',
    products: [],
    collections: [],
    categories: [],
    brands: [],
    start_date: '',
    end_date: '',
    is_active: true,
    is_featured: false,
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchOffers();
    fetchProducts();
    fetchCollections();
    fetchCategories();
    fetchBrands();
  }, []);

  useEffect(() => {
    fetchOffers();
  }, [filterStatus]);

  const fetchOffers = async () => {
    try {
      setLoading(true);
      const params: any = {};
      if (filterStatus !== 'all') {
        params.is_active = filterStatus === 'active';
      }
      // Add cache-busting parameter
      params._t = Date.now();
      const response = await apiClient.get('/offers/', { params });
      const extractedData = extractData(response.data);
      setOffers(extractedData);
    } catch (error) {
      console.error('Failed to fetch offers:', error);
      alert('Failed to load offers');
    } finally {
      setLoading(false);
    }
  };

  const fetchProducts = async () => {
    try {
      const response = await apiClient.get('/products/');
      setProducts(extractData(response.data));
    } catch (error) {
      console.error('Failed to fetch products:', error);
    }
  };

  const fetchCollections = async () => {
    try {
      const response = await apiClient.get('/collections/');
      setCollections(extractData(response.data));
    } catch (error) {
      console.error('Failed to fetch collections:', error);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await apiClient.get('/categories/');
      setCategories(extractData(response.data));
    } catch (error) {
      console.error('Failed to fetch categories:', error);
    }
  };

  const fetchBrands = async () => {
    try {
      const response = await apiClient.get('/brands/');
      setBrands(extractData(response.data));
    } catch (error) {
      console.error('Failed to fetch brands:', error);
    }
  };

  const handleAdd = () => {
    setEditingOffer(null);
    setFormData({
      name: '',
      description: '',
      image_url: '',
      discount_percentage: '',
      apply_to: '',
      products: [],
      collections: [],
      categories: [],
      brands: [],
      start_date: '',
      end_date: '',
      is_active: true,
      is_featured: false,
    });
    setFormErrors({});
    setIsModalOpen(true);
  };

  const handleEdit = (offer: Offer) => {
    setEditingOffer(offer);
    setFormData({
      name: offer.name || '',
      description: offer.description || '',
      image_url: offer.image_url || '',
      discount_percentage: offer.discount_percentage || '',
      apply_to: offer.apply_to || 'product',
      products: Array.isArray(offer.products) ? offer.products : [],
      collections: Array.isArray(offer.collections) ? offer.collections : [],
      categories: Array.isArray(offer.categories) ? offer.categories : [],
      brands: Array.isArray(offer.brands) ? offer.brands : [],
      start_date: offer.start_date ? offer.start_date.slice(0, 16) : '',
      end_date: offer.end_date ? offer.end_date.slice(0, 16) : '',
      is_active: offer.is_active ?? true,
      is_featured: offer.is_featured ?? false,
    });
    setFormErrors({});
    setIsModalOpen(true);
  };

  const handleDelete = async (offer: Offer) => {
    if (!window.confirm(`Are you sure you want to delete "${offer.name}"?`)) {
      return;
    }

    try {
      await apiClient.delete(`/offers/${offer.id}/`);
      alert('Offer deleted successfully');
      fetchOffers();
    } catch (error) {
      console.error('Failed to delete offer:', error);
      alert('Failed to delete offer');
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

    if (!formData.discount_percentage || parseFloat(formData.discount_percentage) <= 0 || parseFloat(formData.discount_percentage) > 100) {
      errors.discount_percentage = 'Discount must be between 0 and 100';
    }

    if (!formData.apply_to) {
      errors.apply_to = 'Applicability is required';
    }

    if (formData.apply_to === 'product' && formData.products.length === 0) {
      errors.products = 'At least one product must be selected';
    }

    if (formData.apply_to === 'collection' && formData.collections.length === 0) {
      errors.collections = 'At least one collection must be selected';
    }

    if (formData.apply_to === 'category' && formData.categories.length === 0) {
      errors.categories = 'At least one category must be selected';
    }

    if (formData.apply_to === 'brand' && formData.brands.length === 0) {
      errors.brands = 'At least one brand must be selected';
    }

    if (!formData.start_date) {
      errors.start_date = 'Start date is required';
    }

    if (!formData.end_date) {
      errors.end_date = 'End date is required';
    }

    if (formData.start_date && formData.end_date && new Date(formData.start_date) >= new Date(formData.end_date)) {
      errors.end_date = 'End date must be after start date';
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
      const submitData = {
        ...formData,
        start_date: new Date(formData.start_date).toISOString(),
        end_date: new Date(formData.end_date).toISOString(),
      };

      if (editingOffer) {
        await apiClient.put(`/offers/${editingOffer.id}/`, submitData);
        alert('Offer updated successfully');
      } else {
        await apiClient.post('/offers/', submitData);
        alert('Offer created successfully');
      }
      setIsModalOpen(false);
      setEditingOffer(null); // Reset editing state
      setFormData({ // Reset form data
        name: '',
        description: '',
        image_url: '',
        discount_percentage: '',
        apply_to: '',
        products: [],
        collections: [],
        categories: [],
        brands: [],
        start_date: '',
        end_date: '',
        is_active: true,
        is_featured: false,
      });
      setFormErrors({});
      fetchOffers();
    } catch (error: any) {
      console.error('Failed to save offer:', error);
      if (error.response?.data?.error?.details) {
        setFormErrors(error.response.data.error.details);
      } else if (error.response?.data) {
        setFormErrors(error.response.data);
      } else {
        alert('Failed to save offer');
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleApplicabilityChange = (value: string) => {
    setFormData({
      ...formData,
      apply_to: value as any,
      products: [],
      collections: [],
      categories: [],
      brands: [],
    });
  };

  const handleMultiSelectChange = (field: 'products' | 'collections' | 'categories' | 'brands', selectedIds: number[]) => {
    setFormData({
      ...formData,
      [field]: selectedIds,
    });
  };

  const columns = [
    { key: 'name', label: 'Name' },
    {
      key: 'discount_percentage',
      label: 'Discount',
      render: (item: Offer) => `${item.discount_percentage}%`,
    },
    {
      key: 'apply_to',
      label: 'Applies To',
      render: (item: Offer) => (
        <span className="apply-to-badge">
          {item.apply_to.charAt(0).toUpperCase() + item.apply_to.slice(1)}
        </span>
      ),
    },
    {
      key: 'applicable_products_count',
      label: 'Products',
      render: (item: Offer) => `${item.applicable_products_count} products`,
    },
    {
      key: 'validity',
      label: 'Validity',
      render: (item: Offer) => (
        <div className="validity-info">
          <div>{new Date(item.start_date).toLocaleDateString()}</div>
          <div>to {new Date(item.end_date).toLocaleDateString()}</div>
        </div>
      ),
    },
    {
      key: 'status',
      label: 'Status',
      render: (item: Offer) => (
        <div className="offer-status">
          <span className={`status-badge ${item.is_active ? 'active' : 'inactive'}`}>
            {item.is_active ? 'Active' : 'Inactive'}
          </span>
          {item.is_featured && (
            <span className="featured-badge">Featured</span>
          )}
          {item.is_valid && item.is_active && (
            <span className="valid-badge">Valid</span>
          )}
          {!item.is_valid && item.is_active && (
            <span className="expired-badge">Expired</span>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="offers-page">
      <div className="page-header">
        <h1>Offers Management</h1>
        <button className="btn-primary" onClick={handleAdd}>
          Add Offer
        </button>
      </div>

      <div className="filters-bar">
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="filter-select"
        >
          <option value="all">All Offers</option>
          <option value="active">Active Only</option>
          <option value="inactive">Inactive Only</option>
        </select>
      </div>

      <DataTable
        columns={columns}
        data={offers}
        onEdit={handleEdit}
        onDelete={handleDelete}
        loading={loading}
        emptyMessage="No offers found. Create your first offer!"
      />

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingOffer ? 'Edit Offer' : 'Add Offer'}
        size="large"
      >
        <form onSubmit={handleSubmit} className="offer-form">
          <div className="form-group">
            <label htmlFor="name">Offer Name *</label>
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
            <label>Offer Image</label>
            <ImageUploader
              value={formData.image_url}
              onChange={(url) => setFormData({ ...formData, image_url: url })}
            />
          </div>

          <div className="form-group">
            <label htmlFor="description">Description *</label>
            <textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
              className={formErrors.description ? 'error' : ''}
            />
            {formErrors.description && (
              <span className="error-message">{formErrors.description}</span>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="discount_percentage">Discount Percentage (%) *</label>
            <input
              type="number"
              id="discount_percentage"
              step="0.01"
              min="0"
              max="100"
              value={formData.discount_percentage}
              onChange={(e) => setFormData({ ...formData, discount_percentage: e.target.value })}
              className={formErrors.discount_percentage ? 'error' : ''}
            />
            {formErrors.discount_percentage && (
              <span className="error-message">{formErrors.discount_percentage}</span>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="apply_to">Apply To *</label>
            <select
              id="apply_to"
              value={formData.apply_to}
              onChange={(e) => handleApplicabilityChange(e.target.value)}
              className={formErrors.apply_to ? 'error' : ''}
            >
              <option value="">Select applicability</option>
              <option value="product">Specific Products</option>
              <option value="collection">Collections</option>
              <option value="category">Categories</option>
              <option value="brand">Brands</option>
            </select>
            {formErrors.apply_to && <span className="error-message">{formErrors.apply_to}</span>}
          </div>

          {formData.apply_to === 'product' && (
            <div className="form-group">
              <label>Select Products *</label>
              <div className="multi-select-container">
                {products.map((product) => (
                  <label key={product.id} className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={(formData.products || []).includes(product.id)}
                      onChange={(e) => {
                        const currentProducts = formData.products || [];
                        const newProducts = e.target.checked
                          ? [...currentProducts, product.id]
                          : currentProducts.filter((id) => id !== product.id);
                        handleMultiSelectChange('products', newProducts);
                      }}
                    />
                    <span>{product.name}</span>
                  </label>
                ))}
              </div>
              {formErrors.products && <span className="error-message">{formErrors.products}</span>}
            </div>
          )}

          {formData.apply_to === 'collection' && (
            <div className="form-group">
              <label>Select Collections *</label>
              <div className="multi-select-container">
                {collections.map((collection) => (
                  <label key={collection.id} className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={(formData.collections || []).includes(collection.id)}
                      onChange={(e) => {
                        const currentCollections = formData.collections || [];
                        const newCollections = e.target.checked
                          ? [...currentCollections, collection.id]
                          : currentCollections.filter((id) => id !== collection.id);
                        handleMultiSelectChange('collections', newCollections);
                      }}
                    />
                    <span>{collection.name}</span>
                  </label>
                ))}
              </div>
              {formErrors.collections && (
                <span className="error-message">{formErrors.collections}</span>
              )}
            </div>
          )}

          {formData.apply_to === 'category' && (
            <div className="form-group">
              <label>Select Categories *</label>
              <div className="multi-select-container">
                {categories.map((category) => (
                  <label key={category.id} className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={(formData.categories || []).includes(category.id)}
                      onChange={(e) => {
                        const currentCategories = formData.categories || [];
                        const newCategories = e.target.checked
                          ? [...currentCategories, category.id]
                          : currentCategories.filter((id) => id !== category.id);
                        handleMultiSelectChange('categories', newCategories);
                      }}
                    />
                    <span>{category.name}</span>
                  </label>
                ))}
              </div>
              {formErrors.categories && (
                <span className="error-message">{formErrors.categories}</span>
              )}
            </div>
          )}

          {formData.apply_to === 'brand' && (
            <div className="form-group">
              <label>Select Brands *</label>
              <div className="multi-select-container">
                {brands.map((brand) => (
                  <label key={brand.id} className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={(formData.brands || []).includes(brand.id)}
                      onChange={(e) => {
                        const currentBrands = formData.brands || [];
                        const newBrands = e.target.checked
                          ? [...currentBrands, brand.id]
                          : currentBrands.filter((id) => id !== brand.id);
                        handleMultiSelectChange('brands', newBrands);
                      }}
                    />
                    <span>{brand.name}</span>
                  </label>
                ))}
              </div>
              {formErrors.brands && <span className="error-message">{formErrors.brands}</span>}
            </div>
          )}

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="start_date">Start Date *</label>
              <input
                type="datetime-local"
                id="start_date"
                value={formData.start_date}
                onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                className={formErrors.start_date ? 'error' : ''}
              />
              {formErrors.start_date && (
                <span className="error-message">{formErrors.start_date}</span>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="end_date">End Date *</label>
              <input
                type="datetime-local"
                id="end_date"
                value={formData.end_date}
                onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                className={formErrors.end_date ? 'error' : ''}
              />
              {formErrors.end_date && <span className="error-message">{formErrors.end_date}</span>}
            </div>
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

          <div className="form-group checkbox-group">
            <label>
              <input
                type="checkbox"
                checked={formData.is_featured}
                onChange={(e) => setFormData({ ...formData, is_featured: e.target.checked })}
              />
              <span>Featured (Max 4 offers can be featured)</span>
            </label>
            {formErrors.is_featured && (
              <span className="error-message">{formErrors.is_featured}</span>
            )}
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
              {submitting ? 'Saving...' : editingOffer ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Offers;
