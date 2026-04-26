import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import apiClient, { extractData } from '../utils/api';
import DataTable from '../components/DataTable';
import './Products.css';

const GridIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="7" height="7"></rect>
    <rect x="14" y="3" width="7" height="7"></rect>
    <rect x="14" y="14" width="7" height="7"></rect>
    <rect x="3" y="14" width="7" height="7"></rect>
  </svg>
);

const ListIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="8" y1="6" x2="21" y2="6"></line>
    <line x1="8" y1="12" x2="21" y2="12"></line>
    <line x1="8" y1="18" x2="21" y2="18"></line>
    <line x1="3" y1="6" x2="3.01" y2="6"></line>
    <line x1="3" y1="12" x2="3.01" y2="12"></line>
    <line x1="3" y1="18" x2="3.01" y2="18"></line>
  </svg>
);

interface Category {
  id: number;
  name: string;
}

interface Subcategory {
  id: number;
  name: string;
  category: number;
}

interface Product {
  id: number;
  name: string;
  slug: string;
  description: string;
  category: number;
  category_name: string;
  subcategory: number;
  subcategory_name: string;
  brand: number | null;
  brand_name: string | null;
  is_bestseller: boolean;
  is_hot_selling: boolean;
  is_active: boolean;
  variants?: Array<{
    id: number;
    color: string;
    material: string;
    sku: string;
    mrp: string;
    price: string;
    stock_quantity: number;
    images: Array<{ url: string; alt: string; order: number }>;
  }>;
}

const Products = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [subcategories, setSubcategories] = useState<Subcategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [filterSubcategory, setFilterSubcategory] = useState('');
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('grid');

  useEffect(() => {
    fetchCategories();
    fetchSubcategories();
    fetchProducts();
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [searchTerm, filterCategory, filterSubcategory]);

  const fetchCategories = async () => {
    try {
      const response = await apiClient.get('/categories/');
      setCategories(extractData(response.data));
    } catch (error) {
      console.error('Failed to fetch categories:', error);
    }
  };

  const fetchSubcategories = async () => {
    try {
      const response = await apiClient.get('/subcategories/');
      setSubcategories(extractData(response.data));
    } catch (error) {
      console.error('Failed to fetch subcategories:', error);
    }
  };

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const params: any = {};
      if (searchTerm) params.search = searchTerm;
      if (filterCategory) params.category = filterCategory;
      if (filterSubcategory) params.subcategory = filterSubcategory;
      
      const response = await apiClient.get('/products/', { params });
      setProducts(extractData(response.data));
    } catch (error) {
      console.error('Failed to fetch products:', error);
      alert('Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (product: Product) => {
    navigate(`/products/edit/${product.slug}`);
  };

  const handleDelete = async (product: Product) => {
    if (!window.confirm(`Are you sure you want to delete "${product.name}"?`)) {
      return;
    }

    try {
      await apiClient.delete(`/products/${product.slug}/`);
      alert('Product deleted successfully');
      fetchProducts();
    } catch (error) {
      console.error('Failed to delete product:', error);
      alert('Failed to delete product');
    }
  };

  const columns = [
    {
      key: 'image',
      label: 'Image',
      render: (item: Product) => {
        const firstVariant = item.variants?.[0];
        const imageUrl = firstVariant?.images?.[0]?.url || '';
        return imageUrl ? (
          <img
            src={imageUrl}
            alt={item.name}
            className="product-thumbnail"
          />
        ) : (
          <div className="product-thumbnail-placeholder">No Image</div>
        );
      },
    },
    { key: 'name', label: 'Name' },
    { key: 'category_name', label: 'Category' },
    { key: 'subcategory_name', label: 'Subcategory' },
    {
      key: 'variants',
      label: 'Variants',
      render: (item: Product) => (
        <span>{item.variants?.length || 0} variant{item.variants?.length !== 1 ? 's' : ''}</span>
      ),
    },
    {
      key: 'price_range',
      label: 'Price Range',
      render: (item: Product) => {
        if (!item.variants || item.variants.length === 0) return 'N/A';
        const prices = item.variants.map(v => parseFloat(v.price));
        const minPrice = Math.min(...prices);
        const maxPrice = Math.max(...prices);
        if (minPrice === maxPrice) {
          return `₹${minPrice.toLocaleString()}`;
        }
        return `₹${minPrice.toLocaleString()} - ₹${maxPrice.toLocaleString()}`;
      },
    },
    {
      key: 'stock',
      label: 'Total Stock',
      render: (item: Product) => {
        if (!item.variants || item.variants.length === 0) return '0';
        const totalStock = item.variants.reduce((sum, v) => sum + v.stock_quantity, 0);
        return totalStock;
      },
    },
    {
      key: 'flags',
      label: 'Flags',
      render: (item: Product) => (
        <div className="product-flags">
          {item.is_bestseller && <span className="flag-badge bestseller">Bestseller</span>}
          {item.is_hot_selling && <span className="flag-badge hot">Hot</span>}
        </div>
      ),
    },
    {
      key: 'is_active',
      label: 'Status',
      render: (item: Product) => (
        <span className={`status-badge ${item.is_active ? 'active' : 'inactive'}`}>
          {item.is_active ? 'Active' : 'Inactive'}
        </span>
      ),
    },
  ];

  return (
    <div className="products-page">
      <div className="page-header">
        <h1>Products Management</h1>
      </div>

      <div className="filters-bar-container">
        <div className="filters-bar">
          <div className="search-box">
            <svg className="search-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
            <input
              type="text"
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>
          <div className="filters-right">
            <div className="select-wrapper">
              <select
                value={filterCategory}
                onChange={(e) => {
                  setFilterCategory(e.target.value);
                  setFilterSubcategory('');
                }}
                className="filter-select custom-select"
              >
                <option value="">All Categories</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="select-wrapper">
              <select
                value={filterSubcategory}
                onChange={(e) => setFilterSubcategory(e.target.value)}
                className="filter-select custom-select"
              >
                <option value="">All Subcategories</option>
                {subcategories
                  .filter((sub) => !filterCategory || sub.category === parseInt(filterCategory))
                  .map((subcategory) => (
                    <option key={subcategory.id} value={subcategory.id}>
                      {subcategory.name}
                    </option>
                  ))}
              </select>
            </div>
            <div className="view-toggles">
              <button 
                className={`view-btn ${viewMode === 'grid' ? 'active' : ''}`}
                onClick={() => setViewMode('grid')}
                title="Grid View"
              >
                <GridIcon />
              </button>
              <button 
                className={`view-btn ${viewMode === 'list' ? 'active' : ''}`}
                onClick={() => setViewMode('list')}
                title="List View"
              >
                <ListIcon />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="products-layout">
        <div className="products-main">
          {viewMode === 'list' ? (
            <div className="table-container-modern">
              <DataTable
                columns={columns}
                data={products}
                onEdit={handleEdit}
                onDelete={handleDelete}
                loading={loading}
                emptyMessage="No products found. Create your first product!"
              />
            </div>
          ) : (
            <div className="products-grid">
              {loading ? (
                <div className="grid-loading">
                  <div className="spinner"></div>
                  <span>Loading products...</span>
                </div>
              ) : products.length === 0 ? (
                <div className="grid-empty">
                  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#ccc" strokeWidth="1.5">
                    <path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z" />
                    <polyline points="3.27,6.96 12,12.01 20.73,6.96" />
                    <line x1="12" y1="22.08" x2="12" y2="12" />
                  </svg>
                  <p>No products found. Create your first product!</p>
                </div>
              ) : (
                products.map((product) => (
                  <div key={product.id} className="product-grid-card" onClick={() => handleEdit(product)}>
                    <div className="product-card-image">
                      {product.variants?.[0]?.images?.[0]?.url ? (
                        <img src={product.variants[0].images[0].url} alt={product.name} />
                      ) : (
                        <div className="no-image-placeholder">
                          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                            <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                            <circle cx="8.5" cy="8.5" r="1.5"></circle>
                            <polyline points="21 15 16 10 5 21"></polyline>
                          </svg>
                        </div>
                      )}
                      <div className="product-card-flags">
                        {product.is_bestseller && <span className="flag-badge bestseller">Bestseller</span>}
                        {product.is_hot_selling && <span className="flag-badge hot">Hot</span>}
                      </div>
                      <div className="product-card-overlay-actions">
                        <button className="icon-btn edit-btn" onClick={(e) => { e.stopPropagation(); handleEdit(product); }} title="Edit">
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                          </svg>
                        </button>
                        <button className="icon-btn delete-btn" onClick={(e) => { e.stopPropagation(); handleDelete(product); }} title="Delete">
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <polyline points="3 6 5 6 21 6"></polyline>
                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                          </svg>
                        </button>
                      </div>
                    </div>
                    <div className="product-card-content">
                      <div className="product-card-header">
                        <h3 className="product-card-title">{product.name}</h3>
                        <span className={`status-dot ${product.is_active ? 'active' : 'inactive'}`} title={product.is_active ? 'Active' : 'Inactive'}></span>
                      </div>
                      <div className="product-card-categories">
                        <span className="category-tag">{product.category_name}</span>
                        <span className="category-separator">/</span>
                        <span className="category-tag">{product.subcategory_name}</span>
                      </div>
                      <div className="product-card-details">
                        <div className="detail-item">
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <rect x="3" y="3" width="7" height="7"></rect>
                            <rect x="14" y="3" width="7" height="7"></rect>
                            <rect x="14" y="14" width="7" height="7"></rect>
                            <rect x="3" y="14" width="7" height="7"></rect>
                          </svg>
                          <span>{product.variants?.length || 0} Variants</span>
                        </div>
                        <div className="detail-item">
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M21 8l-2-4H5L3 8"></path>
                            <rect x="3" y="8" width="18" height="13" rx="1"></rect>
                            <path d="M10 12h4"></path>
                          </svg>
                          <span>{product.variants?.reduce((sum, v) => sum + v.stock_quantity, 0) || 0} Stock</span>
                        </div>
                      </div>
                      <div className="product-card-footer">
                        <div className="product-card-price">
                          {(() => {
                            if (!product.variants || product.variants.length === 0) return 'N/A';
                            const prices = product.variants.map(v => parseFloat(v.price));
                            const minPrice = Math.min(...prices);
                            const maxPrice = Math.max(...prices);
                            if (minPrice === maxPrice) return `₹${minPrice.toLocaleString()}`;
                            return `₹${minPrice.toLocaleString()} - ₹${maxPrice.toLocaleString()}`;
                          })()}
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Products;
