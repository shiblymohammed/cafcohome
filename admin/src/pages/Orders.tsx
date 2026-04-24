import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import apiClient, { extractData } from '../utils/api';
import DataTable from '../components/DataTable';
import './Orders.css';

interface Order {
  id: number;
  order_number: string;
  user: {
    id: number;
    name: string;
    phone_number: string;
  };
  delivery_address: string;
  phone_number: string;
  stage: 'order_received' | 'processing' | 'shipped' | 'delivered';
  assigned_to: {
    id: number;
    name: string;
  } | null;
  subtotal: string;
  discount: string;
  total: string;
  order_summary: {
    total_items: number;
    unique_products: number;
    total_mrp: number | null;
    total_offer_price: number | null;
    total_discount: number;
    has_offers: boolean;
    active_offers_count: number;
    final_total: number;
    total_mrp_savings: number;
    total_offer_savings: number;
  };
  created_at: string;
  updated_at: string;
}

interface Staff {
  id: number;
  name: string;
  username: string;
}

const Orders = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState<Order[]>([]);
  const [staff, setStaff] = useState<Staff[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStage, setFilterStage] = useState('');
  const [filterStaff, setFilterStaff] = useState('');
  const [filterStartDate, setFilterStartDate] = useState('');
  const [filterEndDate, setFilterEndDate] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const itemsPerPage = 20;

  useEffect(() => {
    fetchStaff();
  }, []);

  useEffect(() => {
    fetchOrders();
  }, [searchTerm, filterStage, filterStaff, filterStartDate, filterEndDate, currentPage]);

  const fetchStaff = async () => {
    try {
      const response = await apiClient.get('/staff/');
      setStaff(extractData(response.data));
    } catch (error) {
      console.error('Failed to fetch staff:', error);
    }
  };

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const params: any = {
        page: currentPage,
        page_size: itemsPerPage,
      };
      
      if (searchTerm) params.search = searchTerm;
      if (filterStage) params.stage = filterStage;
      if (filterStaff) params.assigned_to = filterStaff;
      if (filterStartDate) params.start_date = filterStartDate;
      if (filterEndDate) params.end_date = filterEndDate;

      const response = await apiClient.get('/orders/', { params });
      
      // Handle both paginated and non-paginated responses
      if (response.data.results) {
        setOrders(response.data.results);
        setTotalPages(Math.ceil(response.data.count / itemsPerPage));
      } else {
        setOrders(extractData(response.data));
        setTotalPages(1);
      }
    } catch (error) {
      console.error('Failed to fetch orders:', error);
      alert('Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  const handleViewOrder = (order: Order) => {
    navigate(`/orders/${order.order_number}`);
  };

  const handleQuickSendQuotation = (order: Order) => {
    // Generate a simplified quotation message for quick send
    const message = generateQuickQuotationMessage(order);
    
    // Clean phone number
    const phoneNumber = order.phone_number.replace(/[^\d+]/g, '');
    
    // Create WhatsApp URL
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
    
    // Open WhatsApp
    window.open(whatsappUrl, '_blank');
  };

  const generateQuickQuotationMessage = (order: Order): string => {
    const summary = order.order_summary;
    let message = `🏠 *CAFCO FURNITURE*\n\n`;
    
    message += `Hi ${order.user.name}!\n\n`;
    message += `📋 Your Order #${order.order_number}\n`;
    message += `📅 ${new Date(order.created_at).toLocaleDateString()}\n\n`;
    
    message += `🛋️ Items: ${summary?.total_items || 0} items (${summary?.unique_products || 0} products)\n\n`;
    
    if (parseFloat(order.total) > 0) {
      if (summary?.total_mrp && summary.total_mrp > parseFloat(order.total)) {
        message += `💰 Total: ₹${parseFloat(order.total).toLocaleString()}\n`;
        message += `💚 You Save: ₹${(summary.total_mrp - parseFloat(order.total)).toLocaleString()}\n\n`;
      } else {
        message += `💰 Total: ₹${parseFloat(order.total).toLocaleString()}\n\n`;
      }
    } else {
      message += `💰 Total: As per discussion\n\n`;
    }
    
    message += `📞 For details, please reply or call us.\n`;
    message += `Thank you for choosing CAFCO! 🙏`;
    
    return message;
  };

  const getStageLabel = (stage: string): string => {
    const labels: Record<string, string> = {
      order_received: 'Order Received',
      processing: 'Processing',
      shipped: 'Shipped',
      delivered: 'Delivered',
    };
    return labels[stage] || stage;
  };

  const getStageClass = (stage: string): string => {
    const classes: Record<string, string> = {
      order_received: 'stage-received',
      processing: 'stage-processing',
      shipped: 'stage-shipped',
      delivered: 'stage-delivered',
    };
    return classes[stage] || '';
  };

  const handleClearFilters = () => {
    setSearchTerm('');
    setFilterStage('');
    setFilterStaff('');
    setFilterStartDate('');
    setFilterEndDate('');
    setCurrentPage(1);
  };

  const columns = [
    {
      key: 'order_number',
      label: 'Order #',
      render: (item: Order) => (
        <span className="order-number">{item.order_number}</span>
      ),
    },
    {
      key: 'customer',
      label: 'Customer',
      render: (item: Order) => (
        <div className="customer-info">
          <div className="customer-name">{item.user.name}</div>
          <div className="customer-phone">{item.user.phone_number}</div>
        </div>
      ),
    },
    {
      key: 'items',
      label: 'Items',
      render: (item: Order) => (
        <div className="order-items-info">
          <div className="items-count">
            {item.order_summary?.total_items || 0} items
          </div>
          <div className="products-count">
            {item.order_summary?.unique_products || 0} products
          </div>
        </div>
      ),
    },
    {
      key: 'total',
      label: 'Total',
      render: (item: Order) => {
        const total = parseFloat(item.total);
        const summary = item.order_summary;
        return (
          <div className="order-pricing">
            <div className="order-total">
              {total > 0 ? `₹${total.toLocaleString()}` : 'Quotation Pending'}
            </div>
            {summary?.has_offers && (
              <div className="has-offers">
                🏷️ {summary.active_offers_count} Offers Applied
              </div>
            )}
            {summary?.total_mrp && summary.total_mrp > total && (
              <div className="mrp-info">
                MRP: ₹{summary.total_mrp.toLocaleString()}
              </div>
            )}
            {summary?.total_offer_price && summary.total_offer_price !== summary.total_mrp && (
              <div className="offer-price-info">
                Offer: ₹{summary.total_offer_price.toLocaleString()}
              </div>
            )}
            {(summary?.total_mrp_savings > 0 || summary?.total_offer_savings > 0) && (
              <div className="savings-info">
                Discount: ₹{(summary.total_mrp_savings + summary.total_offer_savings).toLocaleString()}
              </div>
            )}
          </div>
        );
      },
    },
    {
      key: 'stage',
      label: 'Status',
      render: (item: Order) => (
        <span className={`stage-badge ${getStageClass(item.stage)}`}>
          {getStageLabel(item.stage)}
        </span>
      ),
    },
    {
      key: 'assigned_to',
      label: 'Assigned To',
      render: (item: Order) => (
        <span className="assigned-staff">
          {item.assigned_to ? item.assigned_to.name : 'Unassigned'}
        </span>
      ),
    },
    {
      key: 'created_at',
      label: 'Date',
      render: (item: Order) => (
        <div className="order-date">
          <div>{new Date(item.created_at).toLocaleDateString()}</div>
          <div className="order-time">{new Date(item.created_at).toLocaleTimeString()}</div>
        </div>
      ),
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (item: Order) => (
        <div className="order-actions">
          <button
            className="btn-view"
            onClick={() => handleViewOrder(item)}
          >
            View
          </button>
          <button
            className="btn-send-quotation-small"
            onClick={(e) => {
              e.stopPropagation();
              handleQuickSendQuotation(item);
            }}
            title="Send Quotation via WhatsApp"
          >
            📱
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="orders-page">
      <div className="page-header">
        <h1>Orders Management</h1>
      </div>

      <div className="filters-section">
        <div className="filters-row">
          <input
            type="text"
            placeholder="Search by order number or customer..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            className="search-input"
          />
          
          <select
            value={filterStage}
            onChange={(e) => {
              setFilterStage(e.target.value);
              setCurrentPage(1);
            }}
            className="filter-select"
          >
            <option value="">All Stages</option>
            <option value="order_received">Order Received</option>
            <option value="processing">Processing</option>
            <option value="shipped">Shipped</option>
            <option value="delivered">Delivered</option>
          </select>

          <select
            value={filterStaff}
            onChange={(e) => {
              setFilterStaff(e.target.value);
              setCurrentPage(1);
            }}
            className="filter-select"
          >
            <option value="">All Staff</option>
            <option value="unassigned">Unassigned</option>
            {staff.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
        </div>

        <div className="filters-row">
          <div className="date-filter">
            <label>From:</label>
            <input
              type="date"
              value={filterStartDate}
              onChange={(e) => {
                setFilterStartDate(e.target.value);
                setCurrentPage(1);
              }}
              className="date-input"
            />
          </div>

          <div className="date-filter">
            <label>To:</label>
            <input
              type="date"
              value={filterEndDate}
              onChange={(e) => {
                setFilterEndDate(e.target.value);
                setCurrentPage(1);
              }}
              className="date-input"
            />
          </div>

          {(searchTerm || filterStage || filterStaff || filterStartDate || filterEndDate) && (
            <button className="btn-clear-filters" onClick={handleClearFilters}>
              Clear Filters
            </button>
          )}
        </div>
      </div>

      <DataTable
        columns={columns}
        data={orders}
        onEdit={handleViewOrder}
        loading={loading}
        emptyMessage="No orders found"
      />

      {totalPages > 1 && (
        <div className="pagination">
          <button
            className="pagination-btn"
            onClick={() => setCurrentPage(currentPage - 1)}
            disabled={currentPage === 1}
          >
            Previous
          </button>
          <span className="pagination-info">
            Page {currentPage} of {totalPages}
          </span>
          <button
            className="pagination-btn"
            onClick={() => setCurrentPage(currentPage + 1)}
            disabled={currentPage === totalPages}
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default Orders;
