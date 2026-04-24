import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import apiClient from '../utils/api';
import './StockManagement.css';

interface ProductVariant {
  id: number;
  product_name: string;
  product_slug: string;
  category_name: string;
  subcategory_name: string;
  brand_name: string | null;
  color: string;
  material: string;
  sku: string;
  mrp: string;
  price: string;
  cost_price: string | null;
  stock_quantity: number;
  reserved_quantity: number;
  available_quantity: number;
  low_stock_threshold: number;
  reorder_point: number;
  reorder_quantity: number;
  last_restocked: string | null;
  is_in_stock: boolean;
  is_low_stock: boolean;
  is_out_of_stock: boolean;
  stock_status: string;
  stock_status_display: string;
  inventory_value: number | null;
  retail_value: number;
}

interface StockAdjustmentData {
  variant_id: number;
  adjustment_type: 'restock' | 'adjustment' | 'damage' | 'return';
  quantity: number;
  cost_price?: number;
  notes: string;
}

const StockManagement = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [variants, setVariants] = useState<ProductVariant[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [stockStatusFilter, setStockStatusFilter] = useState('');
  const [showAdjustModal, setShowAdjustModal] = useState(false);
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null);
  const [adjustmentData, setAdjustmentData] = useState<StockAdjustmentData>({
    variant_id: 0,
    adjustment_type: 'restock',
    quantity: 0,
    notes: ''
  });
  const [adjusting, setAdjusting] = useState(false);

  useEffect(() => {
    fetchInventory();
    
    // Check if we need to open adjustment modal for a specific variant
    const variantId = searchParams.get('variant');
    if (variantId) {
      // Will open modal after variants are loaded
      setTimeout(() => {
        const variant = variants.find(v => v.id === parseInt(variantId));
        if (variant) {
          openAdjustModal(variant);
        }
      }, 500);
    }
  }, [searchTerm, stockStatusFilter]);

  const fetchInventory = async () => {
    try {
      setLoading(true);
      const params: any = {};
      
      if (searchTerm) params.search = searchTerm;
      if (stockStatusFilter) params.stock_status = stockStatusFilter;

      const response = await apiClient.get('/inventory/', { params });
      setVariants(response.data);
    } catch (error) {
      console.error('Failed to fetch inventory:', error);
      alert('Failed to load inventory');
    } finally {
      setLoading(false);
    }
  };

  const openAdjustModal = (variant: ProductVariant) => {
    setSelectedVariant(variant);
    setAdjustmentData({
      variant_id: variant.id,
      adjustment_type: 'restock',
      quantity: variant.reorder_quantity,
      cost_price: variant.cost_price ? parseFloat(variant.cost_price) : undefined,
      notes: ''
    });
    setShowAdjustModal(true);
  };

  const closeAdjustModal = () => {
    setShowAdjustModal(false);
    setSelectedVariant(null);
    setAdjustmentData({
      variant_id: 0,
      adjustment_type: 'restock',
      quantity: 0,
      notes: ''
    });
  };

  const handleAdjustStock = async () => {
    if (!selectedVariant || adjustmentData.quantity <= 0) {
      alert('Please enter a valid quantity');
      return;
    }

    setAdjusting(true);
    try {
      await apiClient.post('/inventory/adjust/', adjustmentData);
      alert('Stock adjusted successfully');
      closeAdjustModal();
      fetchInventory();
    } catch (error: any) {
      console.error('Failed to adjust stock:', error);
      alert(error.response?.data?.error?.message || 'Failed to adjust stock');
    } finally {
      setAdjusting(false);
    }
  };

  const getStockStatusBadge = (variant: ProductVariant) => {
    if (variant.is_out_of_stock) {
      return <span className="stock-badge out">🔴 Out of Stock</span>;
    } else if (variant.is_low_stock) {
      return <span className="stock-badge low">🟡 Low Stock</span>;
    } else {
      return <span className="stock-badge in">🟢 In Stock</span>;
    }
  };

  const handleClearFilters = () => {
    setSearchTerm('');
    setStockStatusFilter('');
  };

  return (
    <div className="stock-management-page">
      <div className="page-header">
        <div>
          <h1>📦 Stock Management</h1>
          <p className="page-subtitle">Manage inventory levels and stock adjustments</p>
        </div>
        <button className="btn-back" onClick={() => navigate('/inventory')}>
          ← Back to Dashboard
        </button>
      </div>

      {/* Filters */}
      <div className="filters-section">
        <div className="filters-row">
          <input
            type="text"
            className="search-input"
            placeholder="Search by product name, SKU, color, or material..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          
          <select
            className="filter-select"
            value={stockStatusFilter}
            onChange={(e) => setStockStatusFilter(e.target.value)}
          >
            <option value="">All Stock Status</option>
            <option value="in_stock">In Stock</option>
            <option value="low_stock">Low Stock</option>
            <option value="out_of_stock">Out of Stock</option>
          </select>

          {(searchTerm || stockStatusFilter) && (
            <button className="btn-clear-filters" onClick={handleClearFilters}>
              Clear Filters
            </button>
          )}
        </div>
      </div>

      {/* Stock Table */}
      {loading ? (
        <div className="loading">Loading inventory...</div>
      ) : variants.length === 0 ? (
        <div className="no-data">No inventory items found</div>
      ) : (
        <div className="stock-table-container">
          <table className="stock-table">
            <thead>
              <tr>
                <th>Product</th>
                <th>SKU</th>
                <th>Variant</th>
                <th>Stock</th>
                <th>Reserved</th>
                <th>Available</th>
                <th>Status</th>
                <th>Value</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {variants.map((variant) => (
                <tr key={variant.id}>
                  <td>
                    <div className="product-info">
                      <div className="product-name">{variant.product_name}</div>
                      <div className="product-category">{variant.category_name}</div>
                    </div>
                  </td>
                  <td className="sku">{variant.sku}</td>
                  <td>
                    <div className="variant-info">
                      <div>{variant.color}</div>
                      <div className="variant-material">{variant.material}</div>
                    </div>
                  </td>
                  <td className="stock-qty">{variant.stock_quantity}</td>
                  <td className="reserved-qty">{variant.reserved_quantity}</td>
                  <td className="available-qty">
                    <strong>{variant.available_quantity}</strong>
                  </td>
                  <td>{getStockStatusBadge(variant)}</td>
                  <td>
                    <div className="value-info">
                      {variant.inventory_value && (
                        <div className="cost-value">₹{variant.inventory_value.toLocaleString()}</div>
                      )}
                      <div className="retail-value">₹{variant.retail_value.toLocaleString()}</div>
                    </div>
                  </td>
                  <td>
                    <button
                      className="btn-adjust"
                      onClick={() => openAdjustModal(variant)}
                    >
                      Adjust
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Stock Adjustment Modal */}
      {showAdjustModal && selectedVariant && (
        <div className="modal-overlay" onClick={closeAdjustModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Adjust Stock</h2>
              <button className="modal-close" onClick={closeAdjustModal}>✕</button>
            </div>
            
            <div className="modal-body">
              <div className="variant-summary">
                <h3>{selectedVariant.product_name}</h3>
                <p>{selectedVariant.color} / {selectedVariant.material}</p>
                <p className="sku">SKU: {selectedVariant.sku}</p>
                <div className="current-stock">
                  Current Stock: <strong>{selectedVariant.stock_quantity}</strong> units
                </div>
              </div>

              <div className="form-group">
                <label>Adjustment Type</label>
                <select
                  value={adjustmentData.adjustment_type}
                  onChange={(e) => setAdjustmentData({
                    ...adjustmentData,
                    adjustment_type: e.target.value as any
                  })}
                >
                  <option value="restock">Restock (Add Stock)</option>
                  <option value="adjustment">Manual Adjustment</option>
                  <option value="damage">Damage/Loss (Reduce Stock)</option>
                  <option value="return">Customer Return (Add Stock)</option>
                </select>
              </div>

              <div className="form-group">
                <label>Quantity</label>
                <input
                  type="number"
                  min="1"
                  value={adjustmentData.quantity}
                  onChange={(e) => setAdjustmentData({
                    ...adjustmentData,
                    quantity: parseInt(e.target.value) || 0
                  })}
                />
              </div>

              {adjustmentData.adjustment_type === 'restock' && (
                <div className="form-group">
                  <label>Cost Price (Optional)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={adjustmentData.cost_price || ''}
                    onChange={(e) => setAdjustmentData({
                      ...adjustmentData,
                      cost_price: parseFloat(e.target.value) || undefined
                    })}
                    placeholder="Enter cost price per unit"
                  />
                </div>
              )}

              <div className="form-group">
                <label>Notes</label>
                <textarea
                  value={adjustmentData.notes}
                  onChange={(e) => setAdjustmentData({
                    ...adjustmentData,
                    notes: e.target.value
                  })}
                  placeholder="Add notes about this adjustment..."
                  rows={3}
                />
              </div>

              <div className="adjustment-preview">
                {adjustmentData.adjustment_type === 'damage' ? (
                  <p>New Stock: <strong>{selectedVariant.stock_quantity - adjustmentData.quantity}</strong> units</p>
                ) : (
                  <p>New Stock: <strong>{selectedVariant.stock_quantity + adjustmentData.quantity}</strong> units</p>
                )}
              </div>
            </div>

            <div className="modal-footer">
              <button className="btn-cancel" onClick={closeAdjustModal} disabled={adjusting}>
                Cancel
              </button>
              <button className="btn-confirm" onClick={handleAdjustStock} disabled={adjusting}>
                {adjusting ? 'Adjusting...' : 'Confirm Adjustment'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StockManagement;