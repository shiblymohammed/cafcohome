import { useState, useEffect } from 'react';
import apiClient, { extractData } from '../utils/api';
import DataTable from '../components/DataTable';
import Modal from '../components/Modal';
import ImageUploader from '../components/ImageUploader';
import './Categories.css';

interface Category {
  id: number;
  name: string;
  slug: string;
  subtitle: string;
  description: string;
  image_url: string;
  display_order: number;
  is_featured: boolean;
  is_active: boolean;
  product_count: number;
  created_at: string;
}

interface Subcategory {
  id: number;
  name: string;
  slug: string;
  description: string;
  image_url: string;
  featured_icon_url: string;
  category: number;
  category_name: string;
  display_order: number;
  is_featured: boolean;
  is_active: boolean;
  product_count: number;
  created_at: string;
}

interface CategoryFormData {
  name: string;
  subtitle: string;
  description: string;
  image_url: string;
  display_order: number;
  is_featured: boolean;
  is_active: boolean;
}

interface SubcategoryFormData {
  name: string;
  description: string;
  image_url: string;
  featured_icon_url: string;
  category: number | '';
  display_order: number;
  is_featured: boolean;
  is_active: boolean;
}

const CategoriesManagement = () => {
  const [activeTab, setActiveTab] = useState<'categories' | 'subcategories'>('categories');
  const [categories, setCategories] = useState<Category[]>([]);
  const [subcategories, setSubcategories] = useState<Subcategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  
  // Category modal state
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [categoryFormData, setCategoryFormData] = useState<CategoryFormData>({
    name: '',
    subtitle: '',
    description: '',
    image_url: '',
    display_order: 0,
    is_featured: false,
    is_active: true,
  });
  
  // Subcategory modal state
  const [isSubcategoryModalOpen, setIsSubcategoryModalOpen] = useState(false);
  const [editingSubcategory, setEditingSubcategory] = useState<Subcategory | null>(null);
  const [subcategoryFormData, setSubcategoryFormData] = useState<SubcategoryFormData>({
    name: '',
    description: '',
    image_url: '',
    featured_icon_url: '',
    category: '',
    display_order: 0,
    is_featured: false,
    is_active: true,
  });
  
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchCategories();
    fetchSubcategories();
  }, []);

  useEffect(() => {
    if (activeTab === 'subcategories') {
      fetchSubcategories();
    }
  }, [selectedCategory, activeTab]);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get('/categories/');
      setCategories(extractData<Category>(response.data));
    } catch (error) {
      console.error('Failed to fetch categories:', error);
      alert('Failed to load categories');
    } finally {
      setLoading(false);
    }
  };

  const fetchSubcategories = async () => {
    try {
      setLoading(true);
      const params = selectedCategory ? { category: selectedCategory } : {};
      const response = await apiClient.get('/subcategories/', { params });
      setSubcategories(extractData<Subcategory>(response.data));
    } catch (error) {
      console.error('Failed to fetch subcategories:', error);
      alert('Failed to load subcategories');
      setSubcategories([]);
    } finally {
      setLoading(false);
    }
  };

  // Category handlers
  const handleAddCategory = () => {
    setEditingCategory(null);
    setCategoryFormData({
      name: '',
      subtitle: '',
      description: '',
      image_url: '',
      display_order: 0,
      is_featured: false,
      is_active: true,
    });
    setFormErrors({});
    setIsCategoryModalOpen(true);
  };

  const handleEditCategory = (category: Category) => {
    setEditingCategory(category);
    setCategoryFormData({
      name: category.name,
      subtitle: category.subtitle,
      description: category.description,
      image_url: category.image_url,
      display_order: category.display_order,
      is_featured: category.is_featured,
      is_active: category.is_active,
    });
    setFormErrors({});
    setIsCategoryModalOpen(true);
  };

  const handleDeleteCategory = async (category: Category) => {
    if (!window.confirm(`Are you sure you want to delete "${category.name}"? This will also affect all subcategories under it.`)) {
      return;
    }

    try {
      await apiClient.delete(`/categories/${category.slug}/`);
      alert('Category deleted successfully');
      fetchCategories();
      fetchSubcategories();
    } catch (error) {
      console.error('Failed to delete category:', error);
      alert('Failed to delete category');
    }
  };

  const validateCategoryForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!categoryFormData.name.trim()) {
      errors.name = 'Name is required';
    }

    if (!categoryFormData.description.trim()) {
      errors.description = 'Description is required';
    }

    if (!categoryFormData.image_url.trim()) {
      errors.image_url = 'Image is required';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleCategorySubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateCategoryForm()) {
      return;
    }

    setSubmitting(true);

    try {
      if (editingCategory) {
        await apiClient.put(`/categories/${editingCategory.slug}/`, categoryFormData);
        alert('Category updated successfully');
      } else {
        await apiClient.post('/categories/', categoryFormData);
        alert('Category created successfully');
      }
      setIsCategoryModalOpen(false);
      fetchCategories();
    } catch (error: any) {
      console.error('Failed to save category:', error);
      if (error.response?.data) {
        setFormErrors(error.response.data);
      } else {
        alert('Failed to save category');
      }
    } finally {
      setSubmitting(false);
    }
  };

  // Subcategory handlers
  const handleAddSubcategory = () => {
    setEditingSubcategory(null);
    setSubcategoryFormData({
      name: '',
      description: '',
      image_url: '',
      featured_icon_url: '',
      category: selectedCategory ? parseInt(selectedCategory) : '',
      display_order: 0,
      is_featured: false,
      is_active: true,
    });
    setFormErrors({});
    setIsSubcategoryModalOpen(true);
  };

  const handleEditSubcategory = (subcategory: Subcategory) => {
    setEditingSubcategory(subcategory);
    setSubcategoryFormData({
      name: subcategory.name,
      description: subcategory.description,
      image_url: subcategory.image_url || '',
      featured_icon_url: subcategory.featured_icon_url || '',
      category: subcategory.category,
      display_order: subcategory.display_order,
      is_featured: subcategory.is_featured,
      is_active: subcategory.is_active,
    });
    setFormErrors({});
    setIsSubcategoryModalOpen(true);
  };

  const handleDeleteSubcategory = async (subcategory: Subcategory) => {
    if (!window.confirm(`Are you sure you want to delete "${subcategory.name}"?`)) {
      return;
    }

    try {
      await apiClient.delete(`/subcategories/${subcategory.slug}/`);
      alert('Subcategory deleted successfully');
      fetchSubcategories();
    } catch (error) {
      console.error('Failed to delete subcategory:', error);
      alert('Failed to delete subcategory');
    }
  };

  const validateSubcategoryForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!subcategoryFormData.name.trim()) {
      errors.name = 'Name is required';
    }

    if (!subcategoryFormData.description.trim()) {
      errors.description = 'Description is required';
    }

    if (!subcategoryFormData.category) {
      errors.category = 'Category is required';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubcategorySubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateSubcategoryForm()) {
      return;
    }

    setSubmitting(true);

    try {
      if (editingSubcategory) {
        await apiClient.put(`/subcategories/${editingSubcategory.slug}/`, subcategoryFormData);
        alert('Subcategory updated successfully');
      } else {
        await apiClient.post('/subcategories/', subcategoryFormData);
        alert('Subcategory created successfully');
      }
      setIsSubcategoryModalOpen(false);
      fetchSubcategories();
    } catch (error: any) {
      console.error('Failed to save subcategory:', error);
      if (error.response?.data) {
        setFormErrors(error.response.data);
      } else {
        alert('Failed to save subcategory');
      }
    } finally {
      setSubmitting(false);
    }
  };

  const categoryColumns = [
    {
      key: 'image_url',
      label: 'Image',
      render: (item: Category) => (
        <img src={item.image_url} alt={item.name} className="collection-thumbnail" />
      ),
    },
    { key: 'name', label: 'Name' },
    { key: 'subtitle', label: 'Subtitle' },
    { 
      key: 'description', 
      label: 'Description',
      render: (item: Category) => (
        <span className="truncate-text">{item.description}</span>
      ),
    },
    { key: 'display_order', label: 'Order' },
    { key: 'product_count', label: 'Products' },
    {
      key: 'is_featured',
      label: 'Featured',
      render: (item: Category) => (
        <span className={`status-badge ${item.is_featured ? 'featured' : 'regular'}`}>
          {item.is_featured ? 'Featured' : 'Regular'}
        </span>
      ),
    },
    {
      key: 'is_active',
      label: 'Status',
      render: (item: Category) => (
        <span className={`status-badge ${item.is_active ? 'active' : 'inactive'}`}>
          {item.is_active ? 'Active' : 'Inactive'}
        </span>
      ),
    },
  ];

  const subcategoryColumns = [
    { key: 'name', label: 'Name' },
    { key: 'category_name', label: 'Category' },
    { key: 'description', label: 'Description' },
    { key: 'display_order', label: 'Order' },
    {
      key: 'is_featured',
      label: 'Featured',
      render: (item: Subcategory) => (
        <span className={`status-badge ${item.is_featured ? 'active' : 'inactive'}`}>
          {item.is_featured ? 'Yes' : 'No'}
        </span>
      ),
    },
    {
      key: 'is_active',
      label: 'Status',
      render: (item: Subcategory) => (
        <span className={`status-badge ${item.is_active ? 'active' : 'inactive'}`}>
          {item.is_active ? 'Active' : 'Inactive'}
        </span>
      ),
    },
  ];

  return (
    <div className="categories-page">
      <div className="page-header">
        <h1>Categories & Subcategories Management</h1>
      </div>

      {/* Tabs */}
      <div className="tabs">
        <button
          className={`tab ${activeTab === 'categories' ? 'active' : ''}`}
          onClick={() => setActiveTab('categories')}
        >
          Categories
        </button>
        <button
          className={`tab ${activeTab === 'subcategories' ? 'active' : ''}`}
          onClick={() => setActiveTab('subcategories')}
        >
          Subcategories
        </button>
      </div>

      {/* Categories Tab */}
      {activeTab === 'categories' && (
        <>
          <div className="page-header">
            <button className="btn-primary" onClick={handleAddCategory}>
              Add Category
            </button>
          </div>

          <DataTable
            columns={categoryColumns}
            data={categories}
            onEdit={handleEditCategory}
            onDelete={handleDeleteCategory}
            loading={loading}
            emptyMessage="No categories found. Create your first category!"
          />
        </>
      )}

      {/* Subcategories Tab */}
      {activeTab === 'subcategories' && (
        <>
          <div className="page-header">
            <div className="header-actions">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="collection-filter"
              >
                <option value="">All Categories</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
              <button className="btn-primary" onClick={handleAddSubcategory}>
                Add Subcategory
              </button>
            </div>
          </div>

          <DataTable
            columns={subcategoryColumns}
            data={subcategories}
            onEdit={handleEditSubcategory}
            onDelete={handleDeleteSubcategory}
            loading={loading}
            emptyMessage="No subcategories found. Create your first subcategory!"
          />
        </>
      )}

      {/* Category Modal */}
      <Modal
        isOpen={isCategoryModalOpen}
        onClose={() => setIsCategoryModalOpen(false)}
        title={editingCategory ? 'Edit Category' : 'Add Category'}
      >
        <form onSubmit={handleCategorySubmit} className="collection-form">
          <div className="form-group">
            <label htmlFor="name">Name *</label>
            <input
              type="text"
              id="name"
              value={categoryFormData.name}
              onChange={(e) => setCategoryFormData({ ...categoryFormData, name: e.target.value })}
              className={formErrors.name ? 'error' : ''}
            />
            {formErrors.name && <span className="error-message">{formErrors.name}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="subtitle">Subtitle</label>
            <input
              type="text"
              id="subtitle"
              value={categoryFormData.subtitle}
              onChange={(e) => setCategoryFormData({ ...categoryFormData, subtitle: e.target.value })}
              placeholder="Short tagline for the category"
              className={formErrors.subtitle ? 'error' : ''}
            />
            {formErrors.subtitle && <span className="error-message">{formErrors.subtitle}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="description">Description *</label>
            <textarea
              id="description"
              value={categoryFormData.description}
              onChange={(e) => setCategoryFormData({ ...categoryFormData, description: e.target.value })}
              rows={4}
              className={formErrors.description ? 'error' : ''}
            />
            {formErrors.description && (
              <span className="error-message">{formErrors.description}</span>
            )}
          </div>

          <ImageUploader
            label="Category Image *"
            value={categoryFormData.image_url}
            onChange={(url) => setCategoryFormData({ ...categoryFormData, image_url: url })}
            error={formErrors.image_url}
          />

          <div className="form-group">
            <label htmlFor="display_order">Display Order</label>
            <input
              type="number"
              id="display_order"
              value={categoryFormData.display_order}
              onChange={(e) =>
                setCategoryFormData({ ...categoryFormData, display_order: parseInt(e.target.value) || 0 })
              }
            />
          </div>

          <div className="form-group checkbox-group">
            <label>
              <input
                type="checkbox"
                checked={categoryFormData.is_featured}
                onChange={(e) => setCategoryFormData({ ...categoryFormData, is_featured: e.target.checked })}
              />
              <span>Featured Category</span>
            </label>
          </div>

          <div className="form-group checkbox-group">
            <label>
              <input
                type="checkbox"
                checked={categoryFormData.is_active}
                onChange={(e) => setCategoryFormData({ ...categoryFormData, is_active: e.target.checked })}
              />
              <span>Active</span>
            </label>
          </div>

          <div className="form-actions">
            <button
              type="button"
              className="btn-secondary"
              onClick={() => setIsCategoryModalOpen(false)}
              disabled={submitting}
            >
              Cancel
            </button>
            <button type="submit" className="btn-primary" disabled={submitting}>
              {submitting ? 'Saving...' : editingCategory ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Subcategory Modal */}
      <Modal
        isOpen={isSubcategoryModalOpen}
        onClose={() => setIsSubcategoryModalOpen(false)}
        title={editingSubcategory ? 'Edit Subcategory' : 'Add Subcategory'}
      >
        <form onSubmit={handleSubcategorySubmit} className="category-form">
          <div className="form-group">
            <label htmlFor="name">Name *</label>
            <input
              type="text"
              id="name"
              value={subcategoryFormData.name}
              onChange={(e) => setSubcategoryFormData({ ...subcategoryFormData, name: e.target.value })}
              className={formErrors.name ? 'error' : ''}
            />
            {formErrors.name && <span className="error-message">{formErrors.name}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="category">Category *</label>
            <select
              id="category"
              value={subcategoryFormData.category}
              onChange={(e) =>
                setSubcategoryFormData({ ...subcategoryFormData, category: parseInt(e.target.value) || '' })
              }
              className={formErrors.category ? 'error' : ''}
            >
              <option value="">Select a category</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
            {formErrors.category && (
              <span className="error-message">{formErrors.category}</span>
            )}
          </div>

          <div className="form-group">
            <label>Subcategory Image</label>
            <ImageUploader
              value={subcategoryFormData.image_url}
              onChange={(url) => setSubcategoryFormData({ ...subcategoryFormData, image_url: url })}
            />
            <small className="form-hint">Main subcategory image for subcategory pages</small>
          </div>

          <div className="form-group">
            <label>Featured Icon (SVG/PNG)</label>
            <ImageUploader
              value={subcategoryFormData.featured_icon_url}
              onChange={(url) => setSubcategoryFormData({ ...subcategoryFormData, featured_icon_url: url })}
            />
            <small className="form-hint">Icon displayed in homepage featured subcategories section</small>
          </div>

          <div className="form-group">
            <label htmlFor="description">Description *</label>
            <textarea
              id="description"
              value={subcategoryFormData.description}
              onChange={(e) => setSubcategoryFormData({ ...subcategoryFormData, description: e.target.value })}
              rows={4}
              className={formErrors.description ? 'error' : ''}
            />
            {formErrors.description && (
              <span className="error-message">{formErrors.description}</span>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="display_order">Display Order</label>
            <input
              type="number"
              id="display_order"
              value={subcategoryFormData.display_order}
              onChange={(e) =>
                setSubcategoryFormData({ ...subcategoryFormData, display_order: parseInt(e.target.value) || 0 })
              }
            />
          </div>

          <div className="form-group checkbox-group">
            <label>
              <input
                type="checkbox"
                checked={subcategoryFormData.is_featured}
                onChange={(e) => setSubcategoryFormData({ ...subcategoryFormData, is_featured: e.target.checked })}
              />
              <span>Featured (Show on homepage)</span>
            </label>
          </div>

          <div className="form-group checkbox-group">
            <label>
              <input
                type="checkbox"
                checked={subcategoryFormData.is_active}
                onChange={(e) => setSubcategoryFormData({ ...subcategoryFormData, is_active: e.target.checked })}
              />
              <span>Active</span>
            </label>
          </div>

          <div className="form-actions">
            <button
              type="button"
              className="btn-secondary"
              onClick={() => setIsSubcategoryModalOpen(false)}
              disabled={submitting}
            >
              Cancel
            </button>
            <button type="submit" className="btn-primary" disabled={submitting}>
              {submitting ? 'Saving...' : editingSubcategory ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default CategoriesManagement;
