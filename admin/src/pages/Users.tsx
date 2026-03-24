import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import apiClient, { extractData } from '../utils/api';
import DataTable from '../components/DataTable';
import Modal from '../components/Modal';
import './Users.css';

interface Order {
  id: number;
  order_number: string;
  total: string;
  stage: string;
  created_at: string;
}

interface User {
  id: number;
  name: string;
  phone_number: string;
  address: string;
  firebase_uid: string;
  created_at: string;
  is_blocked?: boolean;
}

interface UserDetail extends User {
  orders?: Order[];
}

const Users = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterBlocked, setFilterBlocked] = useState('');
  const [selectedUser, setSelectedUser] = useState<UserDetail | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [loadingDetail, setLoadingDetail] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, [searchTerm, filterBlocked]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const params: any = {};
      
      if (searchTerm) params.search = searchTerm;
      if (filterBlocked) params.is_blocked = filterBlocked;

      const response = await apiClient.get('/users/', { params });
      setUsers(extractData(response.data));
    } catch (error) {
      console.error('Failed to fetch users:', error);
      alert('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const fetchUserDetail = async (userId: number) => {
    try {
      setLoadingDetail(true);
      const response = await apiClient.get(`/users/${userId}/`);
      
      // Fetch user's orders
      const ordersResponse = await apiClient.get('/orders/', {
        params: { user: userId }
      });
      
      setSelectedUser({
        ...response.data,
        orders: ordersResponse.data.results || ordersResponse.data
      });
      setIsDetailModalOpen(true);
    } catch (error) {
      console.error('Failed to fetch user detail:', error);
      alert('Failed to load user details');
    } finally {
      setLoadingDetail(false);
    }
  };

  const handleViewUser = (user: User) => {
    fetchUserDetail(user.id);
  };

  const handleBlockUser = async (user: User) => {
    const action = user.is_blocked ? 'unblock' : 'block';
    const confirmMessage = user.is_blocked
      ? `Are you sure you want to unblock "${user.name}"?`
      : `Are you sure you want to block "${user.name}"? They will not be able to login.`;
    
    if (!window.confirm(confirmMessage)) {
      return;
    }

    try {
      const endpoint = user.is_blocked
        ? `/users/${user.id}/unblock/`
        : `/users/${user.id}/block/`;
      
      await apiClient.patch(endpoint);
      alert(`User ${action}ed successfully`);
      fetchUsers();
      
      // Update detail modal if open
      if (selectedUser && selectedUser.id === user.id) {
        setSelectedUser({
          ...selectedUser,
          is_blocked: !user.is_blocked
        });
      }
    } catch (error) {
      console.error(`Failed to ${action} user:`, error);
      alert(`Failed to ${action} user`);
    }
  };

  const handleDeleteUser = async (user: User) => {
    if (!window.confirm(
      `Are you sure you want to delete "${user.name}"? This action cannot be undone and will delete all their orders.`
    )) {
      return;
    }

    try {
      await apiClient.delete(`/users/${user.id}/delete/`);
      alert('User deleted successfully');
      fetchUsers();
      
      // Close detail modal if open
      if (selectedUser && selectedUser.id === user.id) {
        setIsDetailModalOpen(false);
        setSelectedUser(null);
      }
    } catch (error) {
      console.error('Failed to delete user:', error);
      alert('Failed to delete user');
    }
  };

  const handleClearFilters = () => {
    setSearchTerm('');
    setFilterBlocked('');
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

  const columns = [
    {
      key: 'name',
      label: 'Name',
      render: (item: User) => (
        <div className="user-name-cell">
          <div className="user-name">{item.name}</div>
          {item.is_blocked && <span className="blocked-badge">Blocked</span>}
        </div>
      ),
    },
    {
      key: 'phone_number',
      label: 'Phone Number',
      render: (item: User) => (
        <span className="phone-number">{item.phone_number}</span>
      ),
    },
    {
      key: 'address',
      label: 'Address',
      render: (item: User) => (
        <span className="user-address">{item.address}</span>
      ),
    },
    {
      key: 'created_at',
      label: 'Registration Date',
      render: (item: User) => (
        <div className="registration-date">
          <div>{new Date(item.created_at).toLocaleDateString()}</div>
          <div className="registration-time">
            {new Date(item.created_at).toLocaleTimeString()}
          </div>
        </div>
      ),
    },
  ];

  return (
    <div className="users-page">
      <div className="page-header">
        <h1>Users Management</h1>
      </div>

      <div className="filters-section">
        <div className="filters-row">
          <input
            type="text"
            placeholder="Search by name or phone number..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
          
          <select
            value={filterBlocked}
            onChange={(e) => setFilterBlocked(e.target.value)}
            className="filter-select"
          >
            <option value="">All Users</option>
            <option value="false">Active Users</option>
            <option value="true">Blocked Users</option>
          </select>

          {(searchTerm || filterBlocked) && (
            <button className="btn-clear-filters" onClick={handleClearFilters}>
              Clear Filters
            </button>
          )}
        </div>
      </div>

      <DataTable
        columns={columns}
        data={users}
        onEdit={handleViewUser}
        loading={loading}
        emptyMessage="No users found"
      />

      <Modal
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        title="User Details"
        size="large"
      >
        {loadingDetail ? (
          <div className="loading-detail">Loading user details...</div>
        ) : selectedUser ? (
          <div className="user-detail-content">
            <div className="user-info-section">
              <h3>Personal Information</h3>
              <div className="info-grid">
                <div className="info-item">
                  <label>Name:</label>
                  <span>{selectedUser.name}</span>
                </div>
                <div className="info-item">
                  <label>Phone Number:</label>
                  <span>{selectedUser.phone_number}</span>
                </div>
                <div className="info-item">
                  <label>Address:</label>
                  <span>{selectedUser.address}</span>
                </div>
                <div className="info-item">
                  <label>Registration Date:</label>
                  <span>{new Date(selectedUser.created_at).toLocaleString()}</span>
                </div>
                <div className="info-item">
                  <label>Status:</label>
                  <span className={selectedUser.is_blocked ? 'status-blocked' : 'status-active'}>
                    {selectedUser.is_blocked ? 'Blocked' : 'Active'}
                  </span>
                </div>
              </div>
            </div>

            <div className="user-orders-section">
              <h3>Order History ({selectedUser.orders?.length || 0} orders)</h3>
              {selectedUser.orders && selectedUser.orders.length > 0 ? (
                <div className="orders-list">
                  {selectedUser.orders.map((order) => (
                    <div
                      key={order.id}
                      className="order-item"
                      onClick={() => {
                        setIsDetailModalOpen(false);
                        navigate(`/orders/${order.order_number}`);
                      }}
                    >
                      <div className="order-item-header">
                        <span className="order-number">#{order.order_number}</span>
                        <span className={`stage-badge ${getStageClass(order.stage)}`}>
                          {getStageLabel(order.stage)}
                        </span>
                      </div>
                      <div className="order-item-details">
                        <span className="order-total">₹{parseFloat(order.total).toLocaleString()}</span>
                        <span className="order-date">
                          {new Date(order.created_at).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="no-orders">No orders yet</p>
              )}
            </div>

            <div className="user-actions">
              <button
                className={selectedUser.is_blocked ? 'btn-unblock' : 'btn-block'}
                onClick={() => handleBlockUser(selectedUser)}
              >
                {selectedUser.is_blocked ? 'Unblock User' : 'Block User'}
              </button>
              <button
                className="btn-delete-user"
                onClick={() => handleDeleteUser(selectedUser)}
              >
                Delete User
              </button>
            </div>
          </div>
        ) : null}
      </Modal>
    </div>
  );
};

export default Users;
