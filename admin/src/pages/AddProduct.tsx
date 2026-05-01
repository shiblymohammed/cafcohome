import { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import apiClient, { extractData } from '../utils/api';
import MultiImageCropperWithUpload from '../components/MultiImageCropperWithUpload';
import CustomSelect from '../components/CustomSelect';
import { IMAGE_CONFIGS } from '../config/imageConfig';
import './AddProduct.css';

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

interface ImageData {
  url: string;
  alt: string;
  order: number;
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
  frequently_bought_together: number[];
}

const AddProduct = () => {
  const navigate = useNavigate();
  const { slug } = useParams();
  const isEditMode = !!slug;

  const [categories, setCategories] = useState<Category[]>([]);
  const [subcategories, setSubcategories] = useState<Subcategory[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [colors, setColors] = useState<Color[]>([]);
  const [materials, setMaterials] = useState<Material[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

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
    frequently_bought_together: [],
  });

  const [selectedMaterialId, setSelectedMaterialId] = useState<number | ''>('');
  const [selectedColorIds, setSelectedColorIds] = useState<number[]>([]);
  const [activeMaterialId, setActiveMaterialId] = useState<number | null>(null);
  const [activeColorId, setActiveColorId] = useState<number | null>(null);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  
  // Pricing control states
  const [pricingMode, setPricingMode] = useState<'individual' | 'unified'>('individual');
  const [unifiedPricing, setUnifiedPricing] = useState({ mrp: '', price: '' });
  const [copiedPricing, setCopiedPricing] = useState<{ mrp: string; price: string } | null>(null);

  // Auto-select first variant when variants change
  useEffect(() => {
    if (formData.variants.length > 0 && (!activeMaterialId || !activeColorId)) {
      const firstVariant = formData.variants[0];
      setActiveMaterialId(firstVariant.materialId);
      setActiveColorId(firstVariant.colorId);
    }
  }, [formData.variants.length]);

  useEffect(() => {
    fetchCategories();
    fetchBrands();
    fetchColors();
    fetchMaterials();
    fetchProducts();
    
    if (isEditMode && slug) {
      loadProductForEdit(slug);
    }
  }, [slug]);

  useEffect(() => {
    if (formData.category) {
      fetchSubcategories(formData.category as number);
    }
  }, [formData.category]);

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
      const response = await apiClient.get('/products/');
      setProducts(extractData(response.data));
    } catch (error) {
      console.error('Failed to fetch products:', error);
    }
  };

  const loadProductForEdit = async (productSlug: string) => {
    try {
      setLoading(true);
      const response = await apiClient.get(`/products/${productSlug}/`);
      const product = response.data;

      const variants: VariantFormData[] = product.variants?.map((v: any) => {
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

      setFormData({
        name: product.name,
        description: product.description,
        dimensions: product.dimensions,
        category: product.category,
        subcategory: product.subcategory,
        brand: product.brand || '',
        is_bestseller: product.is_bestseller,
        is_hot_selling: product.is_hot_selling,
        is_active: product.is_active,
        variants: variants,
        frequently_bought_together: product.frequently_bought_together?.map((p: any) => typeof p === 'object' ? p.id : p) || [],
      });
    } catch (error) {
      console.error('Failed to load product:', error);
      alert('Failed to load product for editing');
      navigate('/products');
    } finally {
      setLoading(false);
    }
  };

  const handleAddVariant = () => {
    if (!selectedMaterialId || selectedColorIds.length === 0) {
      alert('Please select material and at least one color');
      return;
    }

    const material = materials.find(m => m.id === selectedMaterialId);
    if (!material) return;

    const newVariants: VariantFormData[] = [];

    // Create a variant for each selected color
    selectedColorIds.forEach(colorId => {
      const color = colors.find(c => c.id === colorId);
      if (!color) return;

      // Check if this combination already exists
      const exists = formData.variants.some(
        v => v.materialId === material.id && v.colorId === color.id
      );

      if (!exists) {
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
          is_default: formData.variants.length === 0 && newVariants.length === 0,
        });
      }
    });

    if (newVariants.length === 0) {
      alert('All selected material-color combinations already exist');
      return;
    }

    setFormData({
      ...formData,
      variants: [...formData.variants, ...newVariants],
    });

    // Set active to first new variant
    if (newVariants.length > 0) {
      setActiveMaterialId(newVariants[0].materialId);
      setActiveColorId(newVariants[0].colorId);
    }

    setSelectedMaterialId('');
    setSelectedColorIds([]);
  };

  const toggleColorSelection = (colorId: number) => {
    if (selectedColorIds.includes(colorId)) {
      setSelectedColorIds(selectedColorIds.filter(id => id !== colorId));
    } else {
      setSelectedColorIds([...selectedColorIds, colorId]);
    }
  };

  // Get unique materials from variants
  const getUniqueMaterials = () => {
    const materialMap = new Map<number, { id: number; name: string }>();
    formData.variants.forEach(v => {
      if (!materialMap.has(v.materialId)) {
        materialMap.set(v.materialId, { id: v.materialId, name: v.materialName });
      }
    });
    return Array.from(materialMap.values());
  };

  // Get colors for active material
  const getColorsForMaterial = (materialId: number) => {
    return formData.variants.filter(v => v.materialId === materialId);
  };

  // Get active variant
  const getActiveVariant = () => {
    if (!activeMaterialId || !activeColorId) {
      return null;
    }
    return formData.variants.find(
      v => v.materialId === activeMaterialId && v.colorId === activeColorId
    ) || null;
  };

  const activeVariant = getActiveVariant();
  const activeVariantIndex = activeVariant 
    ? formData.variants.findIndex(v => v.materialId === activeMaterialId && v.colorId === activeColorId)
    : -1;

  const handleRemoveVariant = (materialId: number, colorId: number) => {
    const updatedVariants = formData.variants.filter(
      v => !(v.materialId === materialId && v.colorId === colorId)
    );
    
    // If removed variant was default, set first variant as default
    const removedVariant = formData.variants.find(
      v => v.materialId === materialId && v.colorId === colorId
    );
    if (removedVariant?.is_default && updatedVariants.length > 0) {
      updatedVariants[0].is_default = true;
    }

    setFormData({ ...formData, variants: updatedVariants });
    
    // Update active selection if removed variant was active
    if (activeMaterialId === materialId && activeColorId === colorId) {
      if (updatedVariants.length > 0) {
        setActiveMaterialId(updatedVariants[0].materialId);
        setActiveColorId(updatedVariants[0].colorId);
      } else {
        setActiveMaterialId(null);
        setActiveColorId(null);
      }
    }
  };

  const updateVariant = (index: number, updates: Partial<VariantFormData>) => {
    const updatedVariants = [...formData.variants];
    updatedVariants[index] = { ...updatedVariants[index], ...updates };
    setFormData({ ...formData, variants: updatedVariants });
  };

  const setVariantAsDefault = (materialId: number, colorId: number) => {
    const updatedVariants = formData.variants.map((v) => ({
      ...v,
      is_default: v.materialId === materialId && v.colorId === colorId,
    }));
    setFormData({ ...formData, variants: updatedVariants });
  };

  // Pricing control functions
  const handleCopyPricing = () => {
    if (activeVariant) {
      setCopiedPricing({ mrp: activeVariant.mrp, price: activeVariant.price });
      alert('Pricing copied!');
    }
  };

  const handleApplyToAll = (pricing?: { mrp: string; price: string }) => {
    const pricingToApply = pricing || (activeVariant ? { mrp: activeVariant.mrp, price: activeVariant.price } : null);
    if (!pricingToApply) return;

    const updatedVariants = formData.variants.map(v => ({
      ...v,
      mrp: pricingToApply.mrp,
      price: pricingToApply.price,
    }));
    setFormData({ ...formData, variants: updatedVariants });
    alert(`Pricing applied to all ${formData.variants.length} variants`);
  };

  const handleApplyToMaterial = () => {
    if (!activeMaterialId || !activeVariant) return;

    const updatedVariants = formData.variants.map(v => 
      v.materialId === activeMaterialId 
        ? { ...v, mrp: activeVariant.mrp, price: activeVariant.price }
        : v
    );
    setFormData({ ...formData, variants: updatedVariants });
    
    const count = formData.variants.filter(v => v.materialId === activeMaterialId).length;
    alert(`Pricing applied to ${count} variant(s) of ${activeVariant.materialName}`);
  };

  const handlePastePricing = () => {
    if (!copiedPricing || activeVariantIndex === -1) return;
    
    updateVariant(activeVariantIndex, copiedPricing);
    alert('Pricing pasted!');
  };

  const handleUnifiedPricingChange = (field: 'mrp' | 'price', value: string) => {
    const newUnifiedPricing = { ...unifiedPricing, [field]: value };
    setUnifiedPricing(newUnifiedPricing);
    
    // Auto-apply to all variants in unified mode
    if (pricingMode === 'unified' && formData.variants.length > 0) {
      const updatedVariants = formData.variants.map(v => ({
        ...v,
        [field]: value,
      }));
      setFormData({ ...formData, variants: updatedVariants });
    }
  };

  const handlePricingModeChange = (mode: 'individual' | 'unified') => {
    setPricingMode(mode);
    
    if (mode === 'unified' && formData.variants.length > 0) {
      // Set unified pricing from first variant
      const firstVariant = formData.variants[0];
      setUnifiedPricing({ mrp: firstVariant.mrp, price: firstVariant.price });
    }
  };

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!formData.name.trim()) errors.name = 'Product name is required';
    if (!formData.description.trim()) errors.description = 'Description is required';
    if (!formData.category) errors.category = 'Category is required';
    if (!formData.subcategory) errors.subcategory = 'Subcategory is required';
    if (formData.variants.length === 0) errors.variants = 'At least one variant is required';

    // Validate each variant
    formData.variants.forEach((variant, index) => {
      if (variant.images.length === 0) {
        errors[`variant_${index}_images`] = 'At least one image required';
      }
      if (!variant.mrp || parseFloat(variant.mrp) <= 0) {
        errors[`variant_${index}_mrp`] = 'Valid MRP required';
      }
      if (!variant.price || parseFloat(variant.price) <= 0) {
        errors[`variant_${index}_price`] = 'Valid price required';
      }
      if (parseFloat(variant.price) > parseFloat(variant.mrp)) {
        errors[`variant_${index}_price`] = 'Price cannot exceed MRP';
      }
    });

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (isDraft = false) => {
    if (!validateForm()) {
      alert('Please fix all validation errors');
      return;
    }

    setSubmitting(true);

    try {
      const formattedVariants = formData.variants.map(variant => ({
        color: variant.colorName,
        material: variant.materialName,
        mrp: parseFloat(variant.mrp),
        price: parseFloat(variant.price),
        stock_quantity: variant.stock_quantity,
        low_stock_threshold: variant.low_stock_threshold,
        images: variant.images,
        is_active: true,
        is_default: variant.is_default,
      }));

      const submitData = {
        name: formData.name,
        description: formData.description,
        dimensions: formData.dimensions,
        category: formData.category,
        subcategory: formData.subcategory,
        brand: formData.brand || null,
        is_bestseller: formData.is_bestseller,
        is_hot_selling: formData.is_hot_selling,
        is_active: isDraft ? false : formData.is_active,
        variants: formattedVariants,
        frequently_bought_together: formData.frequently_bought_together,
      };

      if (isEditMode && slug) {
        await apiClient.put(`/products/${slug}/`, submitData);
        alert('Product updated successfully');
      } else {
        await apiClient.post('/products/', submitData);
        alert(isDraft ? 'Product saved as draft' : 'Product created successfully');
      }

      navigate('/products');
    } catch (error: any) {
      console.error('Failed to save product:', error);
      if (error.response?.data) {
        const errorData = error.response.data;
        if (typeof errorData === 'object') {
          setFormErrors(errorData);
          alert('Validation errors occurred. Please check the form.');
        } else {
          alert(`Error: ${JSON.stringify(errorData)}`);
        }
      } else {
        alert('Failed to save product');
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="add-product-loading">
        <div className="spinner"></div>
        <p>Loading product data...</p>
      </div>
    );
  }

  return (
    <div className="add-product-page">
      {/* Header */}
      <div className="add-product-header">
        <div className="add-product-header-left">
          <button className="btn-back" onClick={() => navigate('/products')}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="19" y1="12" x2="5" y2="12"></line>
              <polyline points="12 19 5 12 12 5"></polyline>
            </svg>
            Back to Products
          </button>
          <div>
            <h1>{isEditMode ? 'Edit Product' : 'Add New Product'}</h1>
            <p className="add-product-subtitle">
              {isEditMode ? 'Update product information and variants' : 'Create a new product with variants'}
            </p>
          </div>
        </div>
      </div>

      <div className="add-product-layout">
        {/* Main Content */}
        <div className="add-product-main">
          {/* Basic Information */}
          <div className="add-product-card">
            <h2 className="card-title">Basic Information</h2>
            <div className="form-grid">
              <div className="form-group full-width">
                <label>Product Name <span className="required">*</span></label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Luxury Sofa Set"
                  className={formErrors.name ? 'error' : ''}
                />
                {formErrors.name && <span className="error-text">{formErrors.name}</span>}
              </div>

              <div className="form-group full-width">
                <label>Description <span className="required">*</span></label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Describe the product in detail..."
                  rows={4}
                  className={formErrors.description ? 'error' : ''}
                />
                {formErrors.description && <span className="error-text">{formErrors.description}</span>}
              </div>

              <div className="form-group">
                <label>Category <span className="required">*</span></label>
                <CustomSelect
                  value={formData.category}
                  onChange={v => setFormData({ ...formData, category: v === '' ? '' : Number(v), subcategory: '' })}
                  options={[{ value: '', label: 'Select category…' }, ...categories.map(c => ({ value: c.id, label: c.name }))]}
                  placeholder="Select category…"
                  error={!!formErrors.category}
                />
                {formErrors.category && <span className="error-text">{formErrors.category}</span>}
              </div>

              <div className="form-group">
                <label>Subcategory <span className="required">*</span></label>
                <CustomSelect
                  value={formData.subcategory}
                  onChange={v => setFormData({ ...formData, subcategory: v === '' ? '' : Number(v) })}
                  options={[{ value: '', label: 'Select subcategory…' }, ...subcategories.filter(s => s.category === formData.category).map(s => ({ value: s.id, label: s.name }))]}
                  placeholder="Select subcategory…"
                  disabled={!formData.category}
                  error={!!formErrors.subcategory}
                />
                {formErrors.subcategory && <span className="error-text">{formErrors.subcategory}</span>}
              </div>

              <div className="form-group">
                <label>Brand</label>
                <CustomSelect
                  value={formData.brand}
                  onChange={v => setFormData({ ...formData, brand: v === '' ? '' : Number(v) })}
                  options={[{ value: '', label: 'No brand' }, ...brands.map(b => ({ value: b.id, label: b.name }))]}
                  placeholder="No brand"
                />
              </div>
            </div>
          </div>

          {/* Dimensions */}
          <div className="add-product-card">
            <h2 className="card-title">Dimensions</h2>
            <div className="form-grid dimensions-grid">
              <div className="form-group">
                <label>Length</label>
                <input
                  type="number"
                  value={formData.dimensions.length}
                  onChange={(e) => setFormData({ ...formData, dimensions: { ...formData.dimensions, length: parseFloat(e.target.value) || 0 } })}
                  placeholder="0"
                />
              </div>
              <div className="form-group">
                <label>Width</label>
                <input
                  type="number"
                  value={formData.dimensions.width}
                  onChange={(e) => setFormData({ ...formData, dimensions: { ...formData.dimensions, width: parseFloat(e.target.value) || 0 } })}
                  placeholder="0"
                />
              </div>
              <div className="form-group">
                <label>Height</label>
                <input
                  type="number"
                  value={formData.dimensions.height}
                  onChange={(e) => setFormData({ ...formData, dimensions: { ...formData.dimensions, height: parseFloat(e.target.value) || 0 } })}
                  placeholder="0"
                />
              </div>
              <div className="form-group">
                <label>Unit</label>
                <CustomSelect
                  value={formData.dimensions.unit}
                  onChange={v => setFormData({ ...formData, dimensions: { ...formData.dimensions, unit: String(v) } })}
                  options={[
                    { value: 'cm', label: 'cm' },
                    { value: 'inch', label: 'inch' },
                    { value: 'm', label: 'm' },
                    { value: 'ft', label: 'ft' },
                  ]}
                />
              </div>
            </div>
          </div>

          {/* Variants */}
          <div className="add-product-card">
            <div className="card-header-with-action">
              <h2 className="card-title">Product Variants <span className="required">*</span></h2>
            </div>

            {formErrors.variants && <span className="error-text">{formErrors.variants}</span>}

            {/* Variant Add Section */}
            <div className="variant-add-section">
              <div className="form-group">
                <label>Select Material <span className="required">*</span></label>
                <CustomSelect
                  value={selectedMaterialId}
                  onChange={v => { setSelectedMaterialId(v === '' ? '' : Number(v)); setSelectedColorIds([]); }}
                  options={[{ value: '', label: 'Choose a material…' }, ...materials.map(m => ({ value: m.id, label: m.name }))]}
                  placeholder="Choose a material…"
                />
              </div>

              {selectedMaterialId && (
                <div className="form-group">
                  <label>Select Colors <span className="required">*</span> (Multiple allowed)</label>
                  <div className="color-selection-grid">
                    {colors.map((color) => (
                      <label 
                        key={color.id} 
                        className={`color-checkbox-card ${selectedColorIds.includes(color.id) ? 'selected' : ''}`}
                      >
                        <input
                          type="checkbox"
                          checked={selectedColorIds.includes(color.id)}
                          onChange={() => toggleColorSelection(color.id)}
                        />
                        <div className="color-checkbox-content">
                          <div 
                            className="color-preview" 
                            style={{ backgroundColor: color.hex_code || '#CCCCCC' }} 
                          />
                          <span className="color-name">{color.name}</span>
                        </div>
                      </label>
                    ))}
                  </div>
                  {colors.length === 0 && (
                    <p className="empty-message">No colors available.</p>
                  )}
                </div>
              )}

              <button 
                className="btn-add-variant-full" 
                onClick={handleAddVariant}
                disabled={!selectedMaterialId || selectedColorIds.length === 0}
              >
                + Add {selectedColorIds.length > 0 ? `${selectedColorIds.length} Variant${selectedColorIds.length > 1 ? 's' : ''}` : 'Variants'}
              </button>
            </div>

            {formData.variants.length === 0 ? (
              <div className="empty-state">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <rect x="3" y="3" width="7" height="7"></rect>
                  <rect x="14" y="3" width="7" height="7"></rect>
                  <rect x="14" y="14" width="7" height="7"></rect>
                  <rect x="3" y="14" width="7" height="7"></rect>
                </svg>
                <p>No variants added yet. Add material-color combinations above.</p>
              </div>
            ) : (
              <div className="variants-two-level-tabs">
                {/* Level 1: Material Tabs */}
                <div className="material-tabs-bar">
                  {getUniqueMaterials().map((material) => (
                    <button
                      key={material.id}
                      type="button"
                      className={`material-tab ${activeMaterialId === material.id ? 'active' : ''}`}
                      onClick={() => {
                        setActiveMaterialId(material.id);
                        // Auto-select first color for this material
                        const firstColor = getColorsForMaterial(material.id)[0];
                        if (firstColor) {
                          setActiveColorId(firstColor.colorId);
                        }
                      }}
                    >
                      {material.name}
                    </button>
                  ))}
                </div>

                {/* Level 2: Color Tabs (for active material) */}
                {activeMaterialId && (
                  <div className="color-tabs-bar">
                    {getColorsForMaterial(activeMaterialId).map((variant) => (
                      <button
                        key={variant.colorId}
                        type="button"
                        className={`color-tab ${activeColorId === variant.colorId ? 'active' : ''}`}
                        onClick={() => setActiveColorId(variant.colorId)}
                      >
                        <div 
                          className="color-tab-swatch" 
                          style={{ backgroundColor: variant.colorHex }}
                        />
                        <span className="color-tab-name">{variant.colorName}</span>
                        {variant.is_default && (
                          <span className="color-tab-badge">Default</span>
                        )}
                        {variant.images.length > 0 && (
                          <span className="color-tab-image-count">{variant.images.length}</span>
                        )}
                      </button>
                    ))}
                  </div>
                )}

                {/* Active Variant Content */}
                {activeVariant && (
                  <div className="variant-content-panel">
                    {/* Variant Header */}
                    <div className="variant-panel-header">
                      <div className="variant-panel-title-section">
                        <div 
                          className="variant-panel-color-swatch" 
                          style={{ backgroundColor: activeVariant.colorHex }}
                        />
                        <div>
                          <h3 className="variant-panel-title">
                            {activeVariant.materialName} — {activeVariant.colorName}
                          </h3>
                          <p className="variant-panel-subtitle">
                            Variant {activeVariantIndex + 1} of {formData.variants.length}
                          </p>
                        </div>
                      </div>
                      <button 
                        type="button"
                        className="btn-remove-variant" 
                        onClick={() => handleRemoveVariant(activeVariant.materialId, activeVariant.colorId)}
                        title="Remove this variant"
                      >
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <polyline points="3 6 5 6 21 6"></polyline>
                          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                        </svg>
                        Remove Variant
                      </button>
                    </div>

                    {/* Images Section */}
                    <div className="variant-content-section">
                      <div className="section-header">
                        <h4 className="section-title">
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                            <circle cx="8.5" cy="8.5" r="1.5"></circle>
                            <polyline points="21 15 16 10 5 21"></polyline>
                          </svg>
                          Product Images
                        </h4>
                        <span className="section-subtitle">Upload images for this variant. First image will be the thumbnail.</span>
                      </div>
                      <MultiImageCropperWithUpload
                        value={activeVariant.images}
                        onChange={(images) => updateVariant(activeVariantIndex, { images })}
                        error={formErrors[`variant_${activeVariantIndex}_images`]}
                        aspectRatio={IMAGE_CONFIGS.product.aspectRatio}
                      />
                      {formErrors[`variant_${activeVariantIndex}_images`] && (
                        <span className="error-text">{formErrors[`variant_${activeVariantIndex}_images`]}</span>
                      )}
                    </div>

                    {/* Stock Section */}
                    <div className="variant-content-section">
                      <div className="section-header">
                        <h4 className="section-title">
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M21 8l-2-4H5L3 8"></path>
                            <rect x="3" y="8" width="18" height="13" rx="1"></rect>
                            <path d="M10 12h4"></path>
                          </svg>
                          Stock Management
                        </h4>
                      </div>
                      <div className="form-grid">
                        <div className="form-group">
                          <label>Stock Quantity</label>
                          <input
                            type="number"
                            value={activeVariant.stock_quantity}
                            onChange={(e) => updateVariant(activeVariantIndex, { stock_quantity: parseInt(e.target.value) || 0 })}
                            placeholder="0"
                          />
                        </div>
                        <div className="form-group">
                          <label>Low Stock Alert Threshold</label>
                          <input
                            type="number"
                            value={activeVariant.low_stock_threshold}
                            onChange={(e) => updateVariant(activeVariantIndex, { low_stock_threshold: parseInt(e.target.value) || 5 })}
                            placeholder="5"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Default Variant */}
                    <div className="variant-content-section">
                      <label className="checkbox-label-inline">
                        <input
                          type="checkbox"
                          checked={activeVariant.is_default}
                          onChange={() => setVariantAsDefault(activeVariant.materialId, activeVariant.colorId)}
                        />
                        <div className="checkbox-label-content">
                          <span className="checkbox-label-title">Set as Default Variant</span>
                          <span className="checkbox-label-desc">This variant will be shown first to customers</span>
                        </div>
                      </label>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="add-product-sidebar">
          {/* Product Flags */}
          <div className="add-product-card">
            <h2 className="card-title">Product Flags</h2>
            <div className="flags-list">
              <label className="flag-item">
                <input
                  type="checkbox"
                  checked={formData.is_bestseller}
                  onChange={(e) => setFormData({ ...formData, is_bestseller: e.target.checked })}
                />
                <div>
                  <span className="flag-label">Bestseller</span>
                  <span className="flag-desc">Mark as bestselling product</span>
                </div>
              </label>
              <label className="flag-item">
                <input
                  type="checkbox"
                  checked={formData.is_hot_selling}
                  onChange={(e) => setFormData({ ...formData, is_hot_selling: e.target.checked })}
                />
                <div>
                  <span className="flag-label">Hot Selling</span>
                  <span className="flag-desc">Mark as hot selling item</span>
                </div>
              </label>
              <label className="flag-item">
                <input
                  type="checkbox"
                  checked={formData.is_active}
                  onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                />
                <div>
                  <span className="flag-label">Active</span>
                  <span className="flag-desc">Product visible to customers</span>
                </div>
              </label>
            </div>
          </div>

          {/* Pricing Section */}
          {formData.variants.length > 0 && (
            <div className="add-product-card">
              <h2 className="card-title">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="12" y1="1" x2="12" y2="23"></line>
                  <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
                </svg>
                Pricing
              </h2>

              {/* Pricing Tabs */}
              <div className="pricing-tabs">
                <button
                  type="button"
                  className={`pricing-tab ${pricingMode === 'unified' ? 'active' : ''}`}
                  onClick={() => handlePricingModeChange('unified')}
                >
                  Unified Price
                </button>
                <button
                  type="button"
                  className={`pricing-tab ${pricingMode === 'individual' ? 'active' : ''}`}
                  onClick={() => handlePricingModeChange('individual')}
                >
                  Individual Pricing
                </button>
              </div>

              {/* Unified Pricing Tab Content */}
              {pricingMode === 'unified' && (
                <div className="pricing-tab-content">
                  <p className="pricing-tab-desc">Set one price for all {formData.variants.length} variants</p>
                  <div className="form-group">
                    <label>MRP (₹) <span className="required">*</span></label>
                    <input
                      type="number"
                      step="0.01"
                      value={unifiedPricing.mrp}
                      onChange={(e) => handleUnifiedPricingChange('mrp', e.target.value)}
                      placeholder="0.00"
                    />
                  </div>
                  <div className="form-group">
                    <label>Selling Price (₹) <span className="required">*</span></label>
                    <input
                      type="number"
                      step="0.01"
                      value={unifiedPricing.price}
                      onChange={(e) => handleUnifiedPricingChange('price', e.target.value)}
                      placeholder="0.00"
                    />
                  </div>
                  {unifiedPricing.mrp && unifiedPricing.price && parseFloat(unifiedPricing.price) < parseFloat(unifiedPricing.mrp) && (
                    <div className="discount-badge" style={{ marginTop: '12px' }}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M20.59 13.41l-7.17 7.17a2 2 0 01-2.83 0L2 12V2h10l8.59 8.59a2 2 0 010 2.82z" />
                        <line x1="7" y1="7" x2="7.01" y2="7" strokeWidth="3" />
                      </svg>
                      {Math.round(((parseFloat(unifiedPricing.mrp) - parseFloat(unifiedPricing.price)) / parseFloat(unifiedPricing.mrp)) * 100)}% OFF
                    </div>
                  )}
                </div>
              )}

              {/* Individual Pricing Tab Content */}
              {pricingMode === 'individual' && (
                <div className="pricing-tab-content">
                  <p className="pricing-tab-desc">Select variants and apply pricing</p>
                  
                  {/* Pricing Inputs */}
                  <div className="form-group">
                    <label>MRP (₹) <span className="required">*</span></label>
                    <input
                      type="number"
                      step="0.01"
                      value={unifiedPricing.mrp}
                      onChange={(e) => setUnifiedPricing({ ...unifiedPricing, mrp: e.target.value })}
                      placeholder="0.00"
                    />
                  </div>
                  <div className="form-group">
                    <label>Selling Price (₹) <span className="required">*</span></label>
                    <input
                      type="number"
                      step="0.01"
                      value={unifiedPricing.price}
                      onChange={(e) => setUnifiedPricing({ ...unifiedPricing, price: e.target.value })}
                      placeholder="0.00"
                    />
                  </div>

                  {/* Variant Selection List */}
                  <div className="variant-selection-list">
                    <label className="variant-select-all">
                      <input
                        type="checkbox"
                        checked={selectedColorIds.length === formData.variants.length && formData.variants.length > 0}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedColorIds(formData.variants.map(v => v.colorId));
                          } else {
                            setSelectedColorIds([]);
                          }
                        }}
                      />
                      <span>Select All ({formData.variants.length})</span>
                    </label>

                    {formData.variants.map((variant, index) => {
                      const isSelected = selectedColorIds.includes(variant.colorId);
                      const hasPricing = variant.mrp && variant.price && parseFloat(variant.mrp) > 0 && parseFloat(variant.price) > 0;
                      
                      return (
                        <label key={index} className={`variant-select-item ${hasPricing ? 'has-pricing' : ''}`}>
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedColorIds([...selectedColorIds, variant.colorId]);
                              } else {
                                setSelectedColorIds(selectedColorIds.filter(id => id !== variant.colorId));
                              }
                            }}
                          />
                          <div 
                            className="variant-select-color" 
                            style={{ backgroundColor: variant.colorHex }}
                          />
                          <div className="variant-select-info">
                            <span className="variant-select-name">{variant.materialName} - {variant.colorName}</span>
                            {hasPricing ? (
                              <span className="variant-select-price">₹{variant.price}</span>
                            ) : (
                              <span className="variant-select-no-price">No pricing</span>
                            )}
                          </div>
                        </label>
                      );
                    })}
                  </div>

                  {/* Apply Button */}
                  <button
                    type="button"
                    className="btn-apply-pricing"
                    onClick={() => {
                      if (!unifiedPricing.mrp || !unifiedPricing.price) {
                        alert('Please enter MRP and Price');
                        return;
                      }
                      if (selectedColorIds.length === 0) {
                        alert('Please select at least one variant');
                        return;
                      }

                      const updatedVariants = formData.variants.map(v => 
                        selectedColorIds.includes(v.colorId)
                          ? { ...v, mrp: unifiedPricing.mrp, price: unifiedPricing.price }
                          : v
                      );
                      setFormData({ ...formData, variants: updatedVariants });
                      setSelectedColorIds([]);
                      alert(`Pricing applied to ${selectedColorIds.length} variant(s)`);
                    }}
                    disabled={selectedColorIds.length === 0 || !unifiedPricing.mrp || !unifiedPricing.price}
                  >
                    Apply to Selected ({selectedColorIds.length})
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Cross-sell Products */}
          <div className="add-product-card">
            <div className="card-header-with-action">
              <h2 className="card-title">Frequently Bought Together</h2>
              {formData.frequently_bought_together.length > 0 && (
                <span className="crosssell-count">{formData.frequently_bought_together.length} selected</span>
              )}
            </div>
            {products.filter(p => p.slug !== (isEditMode ? slug : undefined)).length === 0 ? (
              <p className="crosssell-empty">No other products available.</p>
            ) : (
              <div className="crosssell-selector">
                {products
                  .filter(p => p.slug !== (isEditMode ? slug : undefined))
                  .slice(0, 20)
                  .map((product) => {
                    const isChecked = formData.frequently_bought_together.includes(product.id);
                    return (
                      <label key={product.id} className={`crosssell-item ${isChecked ? 'selected' : ''}`}>
                        <div className="crosssell-checkbox">
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setFormData({
                                  ...formData,
                                  frequently_bought_together: [...formData.frequently_bought_together, product.id],
                                });
                              } else {
                                setFormData({
                                  ...formData,
                                  frequently_bought_together: formData.frequently_bought_together.filter(id => id !== product.id),
                                });
                              }
                            }}
                          />
                          <div className="crosssell-checkmark">
                            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                              <polyline points="20 6 9 17 4 12"/>
                            </svg>
                          </div>
                        </div>
                        <span className="crosssell-name">{product.name}</span>
                      </label>
                    );
                  })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Sticky Save Footer */}
      <div className="add-product-footer">
        <div className="add-product-footer-inner">
          <div className="add-product-footer-info">
            <span className="footer-product-name">{formData.name || 'Untitled Product'}</span>
            <span className="footer-variant-count">
              {formData.variants.length} variant{formData.variants.length !== 1 ? 's' : ''}
            </span>
          </div>
          <div className="add-product-footer-actions">
            <button
              type="button"
              className="ap-btn-cancel"
              onClick={() => navigate('/products')}
              disabled={submitting}
            >
              Cancel
            </button>
            <button
              type="button"
              className="ap-btn-draft"
              onClick={() => handleSubmit(true)}
              disabled={submitting}
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/>
                <polyline points="14 2 14 8 20 8"/>
              </svg>
              Save as Draft
            </button>
            <button
              type="button"
              className="ap-btn-save"
              onClick={() => handleSubmit(false)}
              disabled={submitting}
            >
              {submitting ? (
                <>
                  <div className="ap-btn-spinner" />
                  Saving…
                </>
              ) : (
                <>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <polyline points="20 6 9 17 4 12"/>
                  </svg>
                  {isEditMode ? 'Update Product' : 'Create Product'}
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddProduct;
