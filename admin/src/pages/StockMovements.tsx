import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import apiClient from '../utils/api';
import './StockMovements.css';

interface StockMovement {
  id: number;
  variant_id: number;
  product_name: string;
  sku: string;
  color: string;
  material: string;
  movement_type: string;
  movement_type_display: string;
  quantity: number;
  quantity_before: number;
  quantity_after: number;
  cost_price: string | null;
  reference_type: string | null;
  reference_id: number | null;
  notes: string;
  created_by_name: string | null;
  created_at: string;
}

const StockMovements = () => {
  const navigate = useNavigate();
  const [movements, setMovements] = useState<StockMovement[]>([]);
  const [loading, setLoading] = useState(true);
  const [movementTypeFilter, setMovementTypeFilter] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFilter, setDateFilter] = useState('');

  useEffect(() => {
    fetchMovements();
  }, [movementTypeFilter, searchTerm, dateFilter]);

  const fetchMovements = async () => {
    try {
      setLoading(true);
      const params: any = {};
      
      if (movementTypeFilter) params.movement_type = movementTypeFilter;
      if (searchTerm) params.search = searchTerm;
      if (dateFilter) params.date = dateFilter;

      const response = await apiClient.get('/inventory/movements/', { params });
      setMovements(response.data);
    } catch (error) {
      console.error('Failed to fetch stock movements:', error);
      alert('Failed to load stock movements');
    } finally {
      setLoading(false);
    }
  };

  const getMovementIcon = (type: string) => {
    switch (type) {
      case 'restock':
        return '📦';
      case 'sale':
        return '🛒';
      case 'reservation':
        return '🔒';
      case 'release':
        return '🔓';
      case 'adjustment':
        return '⚙️';
      case 'damage':
        return '⚠️';
      case 'return':
        return '↩️';
      default:
        return '📋';
    }
  };

  const getMovementClass = (type: string) => {
    switch (type) {
      case 'restock':
      case 'return':
      case 'release':
        return 'positive';
      case 'sale':
      case 'reservation':
      case 'damage':
        return 'negative';
      default:
        return 'neutral';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleClearFilters = () => {
    setMovementTypeFilter('');
    setSearchTerm('');
    setDateFilter('');
  };

  return (
    <div className="stock-movements-page">
      <div className="page-header">
        <div>
          <h1>📋 Stock Movements</h1>
          <p className="page-subtitle">Track all inventory movements and changes</p>
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
            placeholder="Search by product name, SKU, or notes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          
          <select
            className="filter-select"
            value={movementTypeFilter}
            onChange={(e) => setMovementTypeFilter(e.target.value)}
          >
            <option value="">All Movement Types</option>
            <option value="restock">Restock</option>
            <option value="sale">Sale</option>
            <option value="reservation">Reservation</option>
            <option value="release">Release</option>
            <option value="adjustment">Adjustment</option>
            <option value="damage">Damage</option>
            <option value="return">Return</option>
          </select>

          <input
            type="date"
            className="filter-date"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
          />

          {(searchTerm || movementTypeFilter || dateFilter) && (
            <button className="btn-clear-filters" onClick={handleClearFilters}>
              Clear Filters
            </button>
          )}
        </div>
      </div>

      {/* Movements Table */}
      {loading ? (
        <div className="loading">Loading stock movements...</div>
      ) : movements.length === 0 ? (
        <div className="no-data">No stock movements found</div>
      ) : (
        <div className="movements-table-container">
          <table className="movements-table">
            <thead>
              <tr>
                <th>Date & Time</th>
                <th>Product</th>
                <th>SKU</th>
                <th>Variant</th>
                <th>Movement Type</th>
                <th>Quantity</th>
                <th>Before → After</th>
                <th>Cost Price</th>
                <th>By</th>
                <th>Notes</th>
              </tr>
            </thead>
            <tbody>
              {movements.map((movement) => (
                <tr key={movement.id}>
                  <td className="date-time">{formatDate(movement.created_at)}</td>
                  <td className="product-name">{movement.product_name}</td>
                  <td className="sku">{movement.sku}</td>
                  <td className="variant">
                    {movement.color} / {movement.material}
                  </td>
                  <td>
                    <span className={`movement-badge ${getMovementClass(movement.movement_type)}`}>
                      {getMovementIcon(movement.movement_type)} {movement.movement_type_display}
                    </span>
                  </td>
                  <td className={`quantity ${getMovementClass(movement.movement_type)}`}>
                    {movement.quantity > 0 ? '+' : ''}{movement.quantity}
                  </td>
                  <td className="stock-change">
                    {movement.quantity_before} → {movement.quantity_after}
                  </td>
                  <td className="cost-price">
                    {movement.cost_price ? `₹${parseFloat(movement.cost_price).toLocaleString()}` : '-'}
                  </td>
                  <td className="created-by">{movement.created_by_name || 'System'}</td>
                  <td className="notes">{movement.notes || '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default StockMovements;
