import { useState, useEffect } from 'react';
import apiClient, { extractData } from '../utils/api';
import DataTable from '../components/DataTable';
import Modal from '../components/Modal';
import MultiImageCropperWithUpload from '../components/MultiImageCropperWithUpload';
import { IMAGE_CONFIGS } from '../config/imageConfig';
import './Products.css';

interface Category {
  id: number;
  name: string;
}

interface Subcategory {
  id: number;
  name: string;
  category: number;
}

interface Brand {
  id: number;
  name: string;
}

interface Color {
  id: number;
  name: string;
  hex_code: string;
  is_active: boolean;
}

interface Material {
  id: number;
  name: string;
  description: string;
  is_active: boolean;
}

interface MaterialColorSelection {
  materialId: number;
  materialName: string;
  colorIds: number[];
  colorNames: string[];
}

interface ImageData {
  url: string;
  alt: string;
  order: number;
}

interface Product {
  id: number;
  name: string;
  slug: string;
  description: string;
  dimensions: { length: number; width: number; height: number; unit: string };
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
    images: ImageData[];
  }>;
}

interface VariantFormData {
  materialId: number;
  materialName: string;
  colorId: number;
  colorName: string;
  colorHex: string;
  images: ImageData[];
  mrp: string;
  price: string;
  stock_quantity: number;
  low_stock_threshold: number;
  is_default: boolean;
}

interface ProductFormData {
  name: string;
  description: string;
  dimensions: { length: number; width: number; height: number; unit: string };
  category: number | '';
  subcategory: number | '';
  brand: number | '';
  is_bestseller: boolean;
  is_hot_selling: boolean;
  is_active: boolean;
  variants: VariantFormData[];
}

const Products = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [subcategories, setSubcategories] = useState<Subcategory[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [colors, setColors] = useState<Color[]>([]);
  const [materials, setMaterials] = useState<Material[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [filterSubcategory, setFilterSubcategory] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<ProductFormData>({
    name: '',
    description: '',
    dimensions: { length: 0, width: 0, height: 0, unit: 'cm' },
    category: '',
    subcategory: '',
    brand: '',
    is_bestseller: false,
    is_hot_selling: false,
    is_active: true,
    variants: [],
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  
  // Step 1: Material-Color selection state (temporary)
  const [materialColorSelections, setMaterialColorSelections] = useState<MaterialColorSelection[]>([]);
  const [selectedMaterialId, setSelectedMaterialId] = useState<number | ''>('');
  const [selectedColorIds, setSelectedColorIds] = useState<number[]>([]);
  
  const [showAddColorModal, setShowAddColorModal] = useState(false);
  const [showAddMaterialModal, setShowAddMaterialModal] = useState(false);
  const [newColorName, setNewColorName] = useState('');
  const [newColorHex, setNewColorHex] = useState('#000000');
  const [newMaterialName, setNewMaterialName] = useState('');
  const [newMaterialDesc, setNewMaterialDesc] = useState('');

  useEffect(() => {
    fetchCategories();
    fetchSubcategories(); // Fetch all subcategories for filters
    fetchBrands();
    fetchColors();
    fetchMaterials();
    fetchProducts();
  }, []);

  useEffect(() => {
    if (formData.category) {
      fetchSubcategories(formData.category as number);
    }
  }, [formData.category]);

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

  const fetchSubcategories = async (categoryId?: number) => {
    try {
      const params = categoryId ? { category: categoryId } : {};
      const response = await apiClient.get('/subcategories/', { params });
      setSubcategories(extractData(response.data));
    } catch (error) {
      console.error('Failed to fetch subcategories:', error);
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

  const fetchColors = async () => {
    try {
      const response = await apiClient.get('/colors/');
      setColors(extractData(response.data).filter((c: Color) => c.is_active));
    } catch (error) {
      console.error('Failed to fetch colors:', error);
    }
  };

  const fetchMaterials = async () => {
    try {
      const response = await apiClient.get('/materials/');
      setMaterials(extractData(response.data).filter((m: Material) => m.is_active));
    } catch (error) {
      console.error('Failed to fetch materials:', error);
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

  const handleAdd = () => {
    setEditingProduct(null);
    setCurrentStep(1);
    setFormData({
      name: '',
      description: '',
      dimensions: { length: 0, width: 0, height: 0, unit: 'cm' },
      category: '',
      subcategory: '',
      brand: '',
      is_bestseller: false,
      is_hot_selling: false,
      is_active: true,
      variants: [],
    });
    setMaterialColorSelections([]);
    setSelectedMaterialId('');
    setSelectedColorIds([]);
    setFormErrors({});
    setIsModalOpen(true);
  };

  const handleEdit = async (product: Product) => {
      try {
        setEditingProduct(product);
        setCurrentStep(1);

        // Fetch detailed product data including variants
        const response = await apiClient.get(`/products/${product.slug}/`);
        const detailedProduct = response.data; // Don't use extractData for single object
        console.log('Detailed product data:', detailedProduct);
        console.log('Variants:', detailedProduct.variants);

        // Convert product variants to form data
        const variants: VariantFormData[] = detailedProduct.variants?.map((v: any) => {
          const color = colors.find(c => c.name === v.color);
          const material = materials.find(m => m.name === v.material);

          return {
            materialId: material?.id || 0,
            materialName: v.material,
            colorId: color?.id || 0,
            colorName: v.color,
            colorHex: color?.hex_code || '#CCCCCC',
            images: v.images || [],
            mrp: v.mrp,
            price: v.price,
            stock_quantity: v.stock_quantity,
            low_stock_threshold: v.low_stock_threshold || 5,
            is_default: v.is_default || false,
          };
        }) || [];
        
        console.log('Processed variants:', variants);

        // Reconstruct material-color selections for Step 1
        const materialColorMap = new Map<number, { materialName: string; colorIds: number[]; colorNames: string[] }>();

        variants.forEach(v => {
          if (!materialColorMap.has(v.materialId)) {
            materialColorMap.set(v.materialId, {
              materialName: v.materialName,
              colorIds: [],
              colorNames: [],
            });
          }
          const entry = materialColorMap.get(v.materialId)!;
          if (!entry.colorIds.includes(v.colorId)) {
            entry.colorIds.push(v.colorId);
            entry.colorNames.push(v.colorName);
          }
        });

        const materialColorSelections: MaterialColorSelection[] = Array.from(materialColorMap.entries()).map(
          ([materialId, data]) => ({
            materialId,
            materialName: data.materialName,
            colorIds: data.colorIds,
            colorNames: data.colorNames,
          })
        );

        setMaterialColorSelections(materialColorSelections);
        setFormData({
          name: detailedProduct.name,
          description: detailedProduct.description,
          dimensions: detailedProduct.dimensions,
          category: detailedProduct.category,
          subcategory: detailedProduct.subcategory,
          brand: detailedProduct.brand || '',
          is_bestseller: detailedProduct.is_bestseller,
          is_hot_selling: detailedProduct.is_hot_selling,
          is_active: detailedProduct.is_active,
          variants: variants,
        });
        setSelectedMaterialId('');
        setSelectedColorIds([]);
        setFormErrors({});
        setIsModalOpen(true);
      } catch (error) {
        console.error('Failed to fetch product details:', error);
        alert('Failed to load product details for editing');
      }
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

  const validateStep = (step: number): boolean => {
    const errors: Record<string, string> = {};

    if (step === 1) {
      if (!formData.name.trim()) errors.name = 'Name is required';
      if (!formData.description.trim()) errors.description = 'Description is required';
      if (!formData.category) errors.category = 'Category is required';
      if (!formData.subcategory) errors.subcategory = 'Subcategory is required';
      if (materialColorSelections.length === 0) {
        errors.variants = 'At least one material-color combination is required';
      }
    } else if (step === 2) {
      // Validate that all variants have at least one image
      const variantsWithoutImages = formData.variants.filter(v => v.images.length === 0);
      if (variantsWithoutImages.length > 0) {
        errors.images = `${variantsWithoutImages.length} variant(s) need at least one image`;
      }
    } else if (step === 3) {
      // Validate pricing and stock for all variants
      for (const variant of formData.variants) {
        if (!variant.mrp || parseFloat(variant.mrp) <= 0) {
          errors.pricing = 'All variants must have valid MRP';
          break;
        }
        if (!variant.price || parseFloat(variant.price) <= 0) {
          errors.pricing = 'All variants must have valid price';
          break;
        }
        if (parseFloat(variant.price) > parseFloat(variant.mrp)) {
          errors.pricing = 'Price cannot be greater than MRP for any variant';
          break;
        }
      }
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleNext = (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    
    if (!validateStep(currentStep)) {
      return;
    }

    // Convert material-color selections to variants when moving from Step 1 to Step 2
    if (currentStep === 1) {
      // If we're editing a product, preserve existing variant data
      if (editingProduct && formData.variants.length > 0) {
        // Don't recreate variants, just proceed to next step
        // The variants are already loaded from the API in handleEdit
      } else {
        // Creating a new product, generate variants from selections
        const newVariants: VariantFormData[] = [];
        
        materialColorSelections.forEach(selection => {
          const material = materials.find(m => m.id === selection.materialId);
          
          selection.colorIds.forEach((colorId, index) => {
            const color = colors.find(c => c.id === colorId);
            if (material && color) {
              newVariants.push({
                materialId: material.id,
                materialName: material.name,
                colorId: color.id,
                colorName: color.name,
                colorHex: color.hex_code,
                images: [],
                mrp: '',
                price: '',
                stock_quantity: 0,
                low_stock_threshold: 5,
                is_default: false, // Will be set manually by user
              });
            }
          });
        });
        
        // Set first variant as default if no default is set
        if (newVariants.length > 0 && !newVariants.some(v => v.is_default)) {
          newVariants[0].is_default = true;
        }
        
        setFormData({ ...formData, variants: newVariants });
      }
    }

    setCurrentStep(prev => prev + 1);
  };

  const handlePrevious = () => {
    setCurrentStep(currentStep - 1);
    setFormErrors({});
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('handleSubmit called, current step:', currentStep);

    // Only submit if we're on the last step
    if (currentStep < 4) {
      console.log('Not on last step, calling handleNext instead');
      handleNext();
      return;
    }

    console.log('On last step, proceeding with submit');

    if (!validateStep(currentStep)) {
      return;
    }

    setSubmitting(true);

    try {
      // Format variants for backend
      const formattedVariants = formData.variants.map((variant, index) => {
        const mrp = parseFloat(variant.mrp);
        const price = parseFloat(variant.price);
        
        // Validate numeric values
        if (isNaN(mrp) || mrp <= 0) {
          throw new Error(`Invalid MRP for variant ${index + 1}: ${variant.mrp}`);
        }
        if (isNaN(price) || price <= 0) {
          throw new Error(`Invalid price for variant ${index + 1}: ${variant.price}`);
        }
        if (price > mrp) {
          throw new Error(`Price cannot be greater than MRP for variant ${index + 1}`);
        }
        
        return {
          color: variant.colorName,
          material: variant.materialName,
          mrp: mrp,
          price: price,
          stock_quantity: variant.stock_quantity,
          low_stock_threshold: variant.low_stock_threshold,
          images: variant.images,
          is_active: true,
          is_default: variant.is_default,
        };
      });

      const submitData = {
        name: formData.name,
        description: formData.description,
        dimensions: formData.dimensions,
        category: formData.category,
        subcategory: formData.subcategory,
        brand: formData.brand || null,
        is_bestseller: formData.is_bestseller,
        is_hot_selling: formData.is_hot_selling,
        is_active: formData.is_active,
        variants: formattedVariants,
      };

      console.log('Submitting product data:', JSON.stringify(submitData, null, 2));

      if (editingProduct) {
        await apiClient.put(`/products/${editingProduct.slug}/`, submitData);
        alert('Product updated successfully');
      } else {
        await apiClient.post('/products/', submitData);
        alert('Product created successfully');
      }
      setIsModalOpen(false);
      fetchProducts();
    } catch (error: any) {
      console.error('Failed to save product:', error);
      
      // Handle different error formats
      if (error.response?.data) {
        const errorData = error.response.data;
        
        // If it's a structured error with field-specific messages
        if (typeof errorData === 'object' && !errorData.error) {
          setFormErrors(errorData);
          
          // Show a summary of validation errors
          const errorMessages = Object.entries(errorData)
            .map(([field, messages]) => `${field}: ${Array.isArray(messages) ? messages.join(', ') : messages}`)
            .join('\n');
          alert(`Validation errors:\n${errorMessages}`);
        } 
        // If it's a structured API error
        else if (errorData.error) {
          alert(`Error: ${errorData.error.message || 'Unknown error'}`);
          if (errorData.error.details) {
            setFormErrors(errorData.error.details);
          }
        }
        // Generic error data
        else {
          alert(`Error: ${JSON.stringify(errorData)}`);
        }
      } else if (error.message) {
        alert(`Error: ${error.message}`);
      } else {
        alert('Failed to save product. Please check the console for details.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleAddNewColor = async () => {
    if (!newColorName.trim()) {
      alert('Color name is required');
      return;
    }

    try {
      const response = await apiClient.post('/colors/', {
        name: newColorName.trim(),
        hex_code: newColorHex,
        is_active: true,
      });
      const newColor = response.data;
      setColors([...colors, newColor]);
      setShowAddColorModal(false);
      setNewColorName('');
      setNewColorHex('#000000');
      alert('Color added successfully');
    } catch (error: any) {
      console.error('Failed to add color:', error);
      alert(error.response?.data?.name?.[0] || 'Failed to add color');
    }
  };

  const handleAddNewMaterial = async () => {
    if (!newMaterialName.trim()) {
      alert('Material name is required');
      return;
    }

    try {
      const response = await apiClient.post('/materials/', {
        name: newMaterialName.trim(),
        description: newMaterialDesc.trim(),
        is_active: true,
      });
      const newMaterial = response.data;
      setMaterials([...materials, { ...newMaterial, available_colors: [] }]);
      setShowAddMaterialModal(false);
      setNewMaterialName('');
      setNewMaterialDesc('');
      alert('Material added successfully');
    } catch (error: any) {
      console.error('Failed to add material:', error);
      alert(error.response?.data?.name?.[0] || 'Failed to add material');
    }
  };

  const addMaterialColorSelection = () => {
    if (!selectedMaterialId) {
      alert('Please select a material');
      return;
    }
    
    if (selectedColorIds.length === 0) {
      alert('Please select at least one color');
      return;
    }

    const material = materials.find(m => m.id === selectedMaterialId);
    if (!material) return;

    const colorNames = colors
      .filter(c => selectedColorIds.includes(c.id))
      .map(c => c.name);

    const newSelection: MaterialColorSelection = {
      materialId: material.id,
      materialName: material.name,
      colorIds: selectedColorIds,
      colorNames: colorNames,
    };

    setMaterialColorSelections([...materialColorSelections, newSelection]);

    // Reset selection
    setSelectedMaterialId('');
    setSelectedColorIds([]);
  };

  const removeMaterialColorSelection = (materialId: number) => {
    setMaterialColorSelections(
      materialColorSelections.filter(mcs => mcs.materialId !== materialId)
    );
  };

  const toggleColorSelection = (colorId: number) => {
    if (selectedColorIds.includes(colorId)) {
      setSelectedColorIds(selectedColorIds.filter(id => id !== colorId));
    } else {
      setSelectedColorIds([...selectedColorIds, colorId]);
    }
  };

  const setVariantAsDefault = (variantIndex: number) => {
    const updatedVariants = formData.variants.map((variant, index) => ({
      ...variant,
      is_default: index === variantIndex
    }));
    
    setFormData({ ...formData, variants: updatedVariants });
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
        <button className="btn-primary" onClick={handleAdd}>
          Add Product
        </button>
      </div>

      <div className="filters-bar">
        <input
          type="text"
          placeholder="Search products..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-input"
        />
        <select
          value={filterCategory}
          onChange={(e) => {
            setFilterCategory(e.target.value);
            setFilterSubcategory('');
          }}
          className="filter-select"
        >
          <option value="">All Categories</option>
          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </select>
        <select
          value={filterSubcategory}
          onChange={(e) => setFilterSubcategory(e.target.value)}
          className="filter-select"
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

      <DataTable
        columns={columns}
        data={products}
        onEdit={handleEdit}
        onDelete={handleDelete}
        loading={loading}
        emptyMessage="No products found. Create your first product!"
      />

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingProduct ? 'Edit Product' : 'Add Product'}
        size="large"
      >
        <div className="product-form-steps">
          <div className="steps-indicator">
            <div className={`step ${currentStep >= 1 ? 'active' : ''}`}>1. Basic Info</div>
            <div className={`step ${currentStep >= 2 ? 'active' : ''}`}>2. Images</div>
            <div className={`step ${currentStep >= 3 ? 'active' : ''}`}>3. Pricing & Stock</div>
            <div className={`step ${currentStep >= 4 ? 'active' : ''}`}>4. Attributes</div>
          </div>

          <form 
            onSubmit={handleSubmit} 
            onKeyDown={(e) => {
              // Prevent Enter key from submitting form on steps 1-3
              if (e.key === 'Enter' && currentStep < 4) {
                e.preventDefault();
                handleNext();
              }
            }}
            className="product-form"
          >
            {currentStep === 1 && (
              <div className="form-step">
                <div className="form-group">
                  <label htmlFor="name">Product Name *</label>
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

                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="category">Category *</label>
                    <select
                      id="category"
                      value={formData.category}
                      onChange={(e) => {
                        const categoryId = parseInt(e.target.value) || '';
                        setFormData({ ...formData, category: categoryId, subcategory: '' });
                      }}
                      className={formErrors.category ? 'error' : ''}
                    >
                      <option value="">Select category</option>
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
                    <label htmlFor="subcategory">Subcategory *</label>
                    <select
                      id="subcategory"
                      value={formData.subcategory}
                      onChange={(e) =>
                        setFormData({ ...formData, subcategory: parseInt(e.target.value) || '' })
                      }
                      className={formErrors.subcategory ? 'error' : ''}
                      disabled={!formData.category}
                    >
                      <option value="">Select subcategory</option>
                      {subcategories
                        .filter((sub) => sub.category === formData.category)
                        .map((subcategory) => (
                          <option key={subcategory.id} value={subcategory.id}>
                            {subcategory.name}
                          </option>
                        ))}
                    </select>
                    {formErrors.subcategory && (
                      <span className="error-message">{formErrors.subcategory}</span>
                    )}
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="brand">Brand (Optional)</label>
                  <select
                    id="brand"
                    value={formData.brand}
                    onChange={(e) =>
                      setFormData({ ...formData, brand: parseInt(e.target.value) || '' })
                    }
                  >
                    <option value="">No brand</option>
                    {brands.map((brand) => (
                      <option key={brand.id} value={brand.id}>
                        {brand.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Material-Color Selection Section */}
                <div className="material-color-section">
                  <h3 style={{ marginBottom: '16px', fontSize: '16px', fontWeight: '600' }}>
                    Material & Color Combinations *
                  </h3>
                  
                  {/* Add Material-Color Combination */}
                  <div className="add-material-color-box">
                    <div className="form-row">
                      <div className="form-group">
                        <label htmlFor="select_material">Select Material</label>
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <select
                            id="select_material"
                            value={selectedMaterialId}
                            onChange={(e) => {
                              setSelectedMaterialId(parseInt(e.target.value) || '');
                              setSelectedColorIds([]);
                            }}
                            style={{ flex: 1 }}
                          >
                            <option value="">Choose a material...</option>
                            {materials.map((material) => (
                              <option key={material.id} value={material.id}>
                                {material.name}
                              </option>
                            ))}
                          </select>
                          <button
                            type="button"
                            className="btn-add-new"
                            onClick={() => setShowAddMaterialModal(true)}
                            style={{ fontSize: '12px', padding: '8px 12px', whiteSpace: 'nowrap' }}
                          >
                            + New
                          </button>
                        </div>
                      </div>
                    </div>

                    {selectedMaterialId && (
                      <div className="form-group">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                          <label>Select Colors</label>
                          <button
                            type="button"
                            className="btn-add-new"
                            onClick={() => setShowAddColorModal(true)}
                            style={{ fontSize: '12px', padding: '4px 12px' }}
                          >
                            + New Color
                          </button>
                        </div>
                        <div className="color-selection-grid-inline">
                          {colors.map((color) => (
                            <label key={color.id} className={`color-checkbox-inline ${selectedColorIds.includes(color.id) ? 'selected' : ''}`}>
                              <input
                                type="checkbox"
                                checked={selectedColorIds.includes(color.id)}
                                onChange={() => toggleColorSelection(color.id)}
                              />
                              <div className="color-checkbox-content-inline">
                                <div
                                  className="color-preview-small"
                                  style={{ backgroundColor: color.hex_code || '#CCCCCC' }}
                                />
                                <span>{color.name}</span>
                              </div>
                            </label>
                          ))}
                        </div>
                        {colors.length === 0 && (
                          <p style={{ color: '#999', fontSize: '13px', marginTop: '8px' }}>
                            No colors available. Click "+ New Color" to add one.
                          </p>
                        )}
                      </div>
                    )}

                    <button
                      type="button"
                      className="btn-add-combination"
                      onClick={addMaterialColorSelection}
                      disabled={!selectedMaterialId || selectedColorIds.length === 0}
                    >
                      + Add This Combination
                    </button>
                  </div>

                  {/* Display Added Combinations */}
                  {materialColorSelections.length > 0 && (
                    <div className="added-combinations">
                      <h4 style={{ fontSize: '14px', fontWeight: '600', marginBottom: '12px' }}>
                        Added Combinations ({materialColorSelections.length})
                      </h4>
                      {materialColorSelections.map((selection) => (
                        <div key={selection.materialId} className="combination-card">
                          <div className="combination-header">
                            <strong>{selection.materialName}</strong>
                            <button
                              type="button"
                              className="btn-remove-combination"
                              onClick={() => removeMaterialColorSelection(selection.materialId)}
                            >
                              ✕
                            </button>
                          </div>
                          <div className="combination-colors">
                            {selection.colorNames.map((colorName, idx) => {
                              const color = colors.find(c => c.name === colorName);
                              return (
                                <div key={idx} className="color-tag">
                                  <div
                                    className="color-tag-preview"
                                    style={{ backgroundColor: color?.hex_code || '#CCCCCC' }}
                                  />
                                  <span>{colorName}</span>
                                </div>
                              );
                            })}
                          </div>
                          <div className="combination-info">
                            {selection.colorNames.length} color{selection.colorNames.length !== 1 ? 's' : ''} selected
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {materialColorSelections.length === 0 && (
                    <div className="empty-combinations">
                      <p style={{ color: '#999', fontSize: '13px', textAlign: 'center', padding: '20px' }}>
                        No material-color combinations added yet. Add at least one to continue.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {currentStep === 2 && (
              <div className="form-step">
                <h3 style={{ marginBottom: '20px', fontSize: '16px', fontWeight: '600' }}>
                  Upload Images for Each Variant
                </h3>
                {formData.variants.map((variant, index) => (
                  <div key={index} className="variant-image-section">
                    <div className="variant-header-section">
                      <div className="variant-info">
                        <div
                          className="variant-color-indicator"
                          style={{ backgroundColor: variant.colorHex }}
                        />
                        <h4>{variant.materialName} - {variant.colorName}</h4>
                      </div>
                    </div>
                    <MultiImageCropperWithUpload
                      label={`Images for ${variant.materialName} - ${variant.colorName}`}
                      value={variant.images}
                      onChange={(images) => {
                        const updatedVariants = [...formData.variants];
                        updatedVariants[index].images = images;
                        setFormData({ ...formData, variants: updatedVariants });
                      }}
                      error={formErrors[`variant_${index}_images`]}
                      aspectRatio={IMAGE_CONFIGS.product.aspectRatio}
                    />
                  </div>
                ))}
                {formErrors.images && (
                  <div className="error-message" style={{ marginTop: '12px' }}>
                    {formErrors.images}
                  </div>
                )}
              </div>
            )}

            {currentStep === 3 && (
              <div className="form-step">
                <h3 style={{ marginBottom: '20px', fontSize: '16px', fontWeight: '600' }}>
                  Pricing & Stock for Each Variant
                </h3>
                
                <div className="variant-pricing-table">
                  <table>
                    <thead>
                      <tr>
                        <th>Variant</th>
                        <th>MRP (₹) *</th>
                        <th>Price (₹) *</th>
                        <th>Stock *</th>
                        <th>Low Stock Alert</th>
                        <th>Default</th>
                      </tr>
                    </thead>
                    <tbody>
                      {formData.variants.map((variant, index) => (
                        <tr key={index}>
                          <td>
                            <div className="variant-name-cell">
                              <div
                                className="variant-color-dot"
                                style={{ backgroundColor: variant.colorHex }}
                              />
                              <span>{variant.materialName} - {variant.colorName}</span>
                            </div>
                          </td>
                          <td>
                            <input
                              type="number"
                              step="0.01"
                              min="0"
                              value={variant.mrp}
                              onChange={(e) => {
                                const updatedVariants = [...formData.variants];
                                updatedVariants[index].mrp = e.target.value;
                                setFormData({ ...formData, variants: updatedVariants });
                              }}
                              placeholder="0.00"
                            />
                          </td>
                          <td>
                            <input
                              type="number"
                              step="0.01"
                              min="0"
                              value={variant.price}
                              onChange={(e) => {
                                const updatedVariants = [...formData.variants];
                                updatedVariants[index].price = e.target.value;
                                setFormData({ ...formData, variants: updatedVariants });
                              }}
                              placeholder="0.00"
                            />
                          </td>
                          <td>
                            <input
                              type="number"
                              min="0"
                              value={variant.stock_quantity}
                              onChange={(e) => {
                                const updatedVariants = [...formData.variants];
                                updatedVariants[index].stock_quantity = parseInt(e.target.value) || 0;
                                setFormData({ ...formData, variants: updatedVariants });
                              }}
                              placeholder="0"
                            />
                          </td>
                          <td>
                            <input
                              type="number"
                              min="0"
                              value={variant.low_stock_threshold}
                              onChange={(e) => {
                                const updatedVariants = [...formData.variants];
                                updatedVariants[index].low_stock_threshold = parseInt(e.target.value) || 5;
                                setFormData({ ...formData, variants: updatedVariants });
                              }}
                              placeholder="5"
                            />
                          </td>
                          <td>
                            <input
                              type="radio"
                              name="defaultVariant"
                              checked={variant.is_default}
                              onChange={() => setVariantAsDefault(index)}
                              title="Set as default variant"
                            />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                
                {formErrors.pricing && (
                  <div className="error-message" style={{ marginTop: '12px' }}>
                    {formErrors.pricing}
                  </div>
                )}
              </div>
            )}

            {currentStep === 4 && (
              <div className="form-step">
                <div className="form-group">
                  <label>Dimensions</label>
                  <div className="dimensions-group">
                    <input
                      type="number"
                      placeholder="Length"
                      value={formData.dimensions.length}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          dimensions: {
                            ...formData.dimensions,
                            length: parseFloat(e.target.value) || 0,
                          },
                        })
                      }
                    />
                    <input
                      type="number"
                      placeholder="Width"
                      value={formData.dimensions.width}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          dimensions: {
                            ...formData.dimensions,
                            width: parseFloat(e.target.value) || 0,
                          },
                        })
                      }
                    />
                    <input
                      type="number"
                      placeholder="Height"
                      value={formData.dimensions.height}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          dimensions: {
                            ...formData.dimensions,
                            height: parseFloat(e.target.value) || 0,
                          },
                        })
                      }
                    />
                    <select
                      value={formData.dimensions.unit}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          dimensions: { ...formData.dimensions, unit: e.target.value },
                        })
                      }
                    >
                      <option value="cm">cm</option>
                      <option value="inch">inch</option>
                      <option value="m">m</option>
                    </select>
                  </div>
                </div>

                <div className="form-group checkbox-group">
                  <label>
                    <input
                      type="checkbox"
                      checked={formData.is_bestseller}
                      onChange={(e) => setFormData({ ...formData, is_bestseller: e.target.checked })}
                    />
                    <span>Mark as Bestseller</span>
                  </label>
                </div>

                <div className="form-group checkbox-group">
                  <label>
                    <input
                      type="checkbox"
                      checked={formData.is_hot_selling}
                      onChange={(e) =>
                        setFormData({ ...formData, is_hot_selling: e.target.checked })
                      }
                    />
                    <span>Mark as Hot Selling</span>
                  </label>
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
              </div>
            )}

            <div className="form-actions">
              {currentStep > 1 && (
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={handlePrevious}
                  disabled={submitting}
                >
                  Previous
                </button>
              )}
              {currentStep < 4 ? (
                <button 
                  type="button" 
                  className="btn-primary" 
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    handleNext(e);
                  }}
                >
                  Next
                </button>
              ) : (
                <button type="submit" className="btn-primary" disabled={submitting}>
                  {submitting ? 'Saving...' : editingProduct ? 'Update' : 'Create'}
                </button>
              )}
            </div>
          </form>
        </div>
      </Modal>

      {/* Add Color Modal */}
      <Modal
        isOpen={showAddColorModal}
        onClose={() => {
          setShowAddColorModal(false);
          setNewColorName('');
          setNewColorHex('#000000');
        }}
        title="Add New Color"
      >
        <div className="add-item-form">
          <div className="form-group">
            <label htmlFor="new_color_name">Color Name *</label>
            <input
              type="text"
              id="new_color_name"
              value={newColorName}
              onChange={(e) => setNewColorName(e.target.value)}
              placeholder="e.g., Navy Blue"
            />
          </div>
          <div className="form-group">
            <label htmlFor="new_color_hex">Hex Code *</label>
            <div className="color-picker-group">
              <input
                type="color"
                value={newColorHex}
                onChange={(e) => setNewColorHex(e.target.value)}
                className="color-picker"
              />
              <input
                type="text"
                id="new_color_hex"
                value={newColorHex}
                onChange={(e) => setNewColorHex(e.target.value)}
                placeholder="#000000"
                maxLength={7}
              />
            </div>
          </div>
          <div className="form-actions">
            <button
              type="button"
              className="btn-secondary"
              onClick={() => {
                setShowAddColorModal(false);
                setNewColorName('');
                setNewColorHex('#000000');
              }}
            >
              Cancel
            </button>
            <button type="button" className="btn-primary" onClick={handleAddNewColor}>
              Add Color
            </button>
          </div>
        </div>
      </Modal>

      {/* Add Material Modal */}
      <Modal
        isOpen={showAddMaterialModal}
        onClose={() => {
          setShowAddMaterialModal(false);
          setNewMaterialName('');
          setNewMaterialDesc('');
        }}
        title="Add New Material"
      >
        <div className="add-item-form">
          <div className="form-group">
            <label htmlFor="new_material_name">Material Name *</label>
            <input
              type="text"
              id="new_material_name"
              value={newMaterialName}
              onChange={(e) => setNewMaterialName(e.target.value)}
              placeholder="e.g., Velvet"
            />
          </div>
          <div className="form-group">
            <label htmlFor="new_material_desc">Description</label>
            <textarea
              id="new_material_desc"
              value={newMaterialDesc}
              onChange={(e) => setNewMaterialDesc(e.target.value)}
              rows={3}
              placeholder="Optional description"
            />
          </div>
          <div className="form-actions">
            <button
              type="button"
              className="btn-secondary"
              onClick={() => {
                setShowAddMaterialModal(false);
                setNewMaterialName('');
                setNewMaterialDesc('');
              }}
            >
              Cancel
            </button>
            <button type="button" className="btn-primary" onClick={handleAddNewMaterial}>
              Add Material
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Products;
