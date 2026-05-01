import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import apiClient, { extractData } from '../utils/api';
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

const STAGE_CONFIG: Record<string, { label: string; color: string }> = {
  order_received: { label: 'Received', color: 'zeta' },
  processing: { label: 'Processing', color: 'gamma' },
  shipped: { label: 'Shipped', color: 'beta' },
  delivered: { label: 'Delivered', color: 'delta' },
};

const getInitials = (name: string) =>
  name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);

const AVATAR_COLORS = ['alpha', 'beta', 'gamma', 'delta', 'zeta', 'eta'];
const getAvatarColor = (id: number) => AVATAR_COLORS[id % AVATAR_COLORS.length];

const Users = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterBlocked, setFilterBlocked] = useState('');
  const [selectedUser, setSelectedUser] = useState<UserDetail | null>(null);
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => { fetchUsers(); }, [searchTerm, filterBlocked]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const params: Record<string, string> = {};
      if (searchTerm) params.search = searchTerm;
      if (filterBlocked) params.is_blocked = filterBlocked;
      const response = await apiClient.get('/users/', { params });
      setUsers(extractData(response.data));
    } catch (error) {
      console.error('Failed to fetch users:', error);
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserDetail = async (userId: number) => {
    try {
      setLoadingDetail(true);
      setIsPanelOpen(true);
      const [userRes, ordersRes] = await Promise.all([
        apiClient.get(`/users/${userId}/`),
        apiClient.get('/orders/', { params: { user: userId } }),
      ]);
      setSelectedUser({
        ...userRes.data,
        orders: ordersRes.data.results || ordersRes.data,
      });
    } catch (error) {
      console.error('Failed to fetch user detail:', error);
    } finally {
      setLoadingDetail(false);
    }
  };

  const handleBlockUser = async (user: User) => {
    const action = user.is_blocked ? 'unblock' : 'block';
    if (!window.confirm(`${action === 'block' ? 'Block' : 'Unblock'} "${user.name}"?`)) return;
    setActionLoading(true);
    try {
      await apiClient.patch(`/users/${user.id}/${action}/`);
      fetchUsers();
      if (selectedUser?.id === user.id) {
        setSelectedUser({ ...selectedUser, is_blocked: !user.is_blocked });
      }
    } catch (error) {
      console.error(`Failed to ${action} user:`, error);
      alert(`Failed to ${action} user`);
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteUser = async (user: User) => {
    if (!window.confirm(`Delete "${user.name}"? This cannot be undone.`)) return;
    setActionLoading(true);
    try {
      await apiClient.delete(`/users/${user.id}/delete/`);
      fetchUsers();
      if (selectedUser?.id === user.id) { setIsPanelOpen(false); setSelectedUser(null); }
    } catch (error) {
      console.error('Failed to delete user:', error);
      alert('Failed to delete user');
    } finally {
      setActionLoading(false);
    }
  };

  const activeCount = users.filter(u => !u.is_blocked).length;
  const blockedCount = users.filter(u => u.is_blocked).length;

  return (
    <div className="cu-page">
      {/* Header */}
      <div className="cu-header">
        <div className="cu-header-left">
          <h1 className="cu-title">Users</h1>
          <span className="cu-count">{users.length}</span>
        </div>
      </div>

      {/* Stats */}
      <div className="cu-stats">
        <div className="cu-stat">
          <div className="cu-stat-val">{users.length}</div>
          <div className="cu-stat-label">Total Users</div>
        </div>
        <div className="cu-stat cu-stat-active">
          <div className="cu-stat-val">{activeCount}</div>
          <div className="cu-stat-label">Active</div>
        </div>
        <div className="cu-stat cu-stat-blocked">
          <div className="cu-stat-val">{blockedCount}</div>
          <div className="cu-stat-label">Blocked</div>
        </div>
      </div>

      {/* Filters */}
      <div className="cu-filters">
        <div className="cu-search-wrap">
          <svg className="cu-search-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          <input className="cu-search" type="text" placeholder="Search by name or phone…"
            value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
        </div>
        <select className="cu-filter-select" value={filterBlocked} onChange={e => setFilterBlocked(e.target.value)}>
          <option value="">All Users</option>
          <option value="false">Active</option>
          <option value="true">Blocked</option>
        </select>
        {(searchTerm || filterBlocked) && (
          <button className="cu-btn-clear" onClick={() => { setSearchTerm(''); setFilterBlocked(''); }}>
            Clear
          </button>
        )}
      </div>

      {/* Table */}
      {loading ? (
        <div className="cu-loading"><div className="cu-spinner" /><span>Loading…</span></div>
      ) : users.length === 0 ? (
        <div className="cu-empty">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2">
            <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/>
            <circle cx="12" cy="7" r="4"/>
          </svg>
          <p>No users found</p>
        </div>
      ) : (
        <div className="cu-table-wrap">
          <div className="cu-table-header">
            <span>User</span>
            <span>Phone</span>
            <span>Address</span>
            <span>Joined</span>
            <span>Status</span>
            <span>Actions</span>
          </div>
          {users.map(user => (
            <div key={user.id} className={`cu-table-row ${user.is_blocked ? 'blocked' : ''}`}>
              <div className="cu-user-cell">
                <div className={`cu-avatar cu-avatar-${getAvatarColor(user.id)}`}>
                  {getInitials(user.name)}
                </div>
                <div>
                  <div className="cu-user-name">{user.name}</div>
                  <div className="cu-user-id">ID #{user.id}</div>
                </div>
              </div>
              <div className="cu-phone">{user.phone_number}</div>
              <div className="cu-address">{user.address || '—'}</div>
              <div className="cu-joined">
                {new Date(user.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
              </div>
              <div>
                <span className={`cu-status-badge ${user.is_blocked ? 'blocked' : 'active'}`}>
                  {user.is_blocked ? 'Blocked' : 'Active'}
                </span>
              </div>
              <div className="cu-row-actions">
                <button className="cu-btn-view" onClick={() => fetchUserDetail(user.id)}>View</button>
                <button className={`cu-btn-block ${user.is_blocked ? 'unblock' : ''}`}
                  onClick={() => handleBlockUser(user)}>
                  {user.is_blocked ? 'Unblock' : 'Block'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Detail Panel */}
      {isPanelOpen && (
        <div className="cu-overlay" onClick={e => { if (e.target === e.currentTarget) setIsPanelOpen(false); }}>
          <div className="cu-panel">
            <div className="cu-panel-header">
              <h2 className="cu-panel-title">User Details</h2>
              <button className="cu-panel-close" onClick={() => setIsPanelOpen(false)}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            </div>
            <div className="cu-panel-body">
              {loadingDetail ? (
                <div className="cu-panel-loading"><div className="cu-spinner" /><span>Loading…</span></div>
              ) : selectedUser ? (
                <>
                  {/* User Profile */}
                  <div className="cu-detail-profile">
                    <div className={`cu-avatar cu-avatar-lg cu-avatar-${getAvatarColor(selectedUser.id)}`}>
                      {getInitials(selectedUser.name)}
                    </div>
                    <div className="cu-detail-info">
                      <div className="cu-detail-name">{selectedUser.name}</div>
                      <div className="cu-detail-phone">{selectedUser.phone_number}</div>
                      <span className={`cu-status-badge ${selectedUser.is_blocked ? 'blocked' : 'active'}`}>
                        {selectedUser.is_blocked ? 'Blocked' : 'Active'}
                      </span>
                    </div>
                  </div>

                  {/* Info Grid */}
                  <div className="cu-detail-section">
                    <div className="cu-detail-section-title">Account Info</div>
                    <div className="cu-info-grid">
                      <div className="cu-info-item">
                        <span className="cu-info-label">Address</span>
                        <span className="cu-info-val">{selectedUser.address || '—'}</span>
                      </div>
                      <div className="cu-info-item">
                        <span className="cu-info-label">Joined</span>
                        <span className="cu-info-val">{new Date(selectedUser.created_at).toLocaleString('en-IN')}</span>
                      </div>
                      <div className="cu-info-item">
                        <span className="cu-info-label">User ID</span>
                        <span className="cu-info-val">#{selectedUser.id}</span>
                      </div>
                    </div>
                  </div>

                  {/* Orders */}
                  <div className="cu-detail-section">
                    <div className="cu-detail-section-title">
                      Order History
                      <span className="cu-order-count">{selectedUser.orders?.length || 0}</span>
                    </div>
                    {selectedUser.orders && selectedUser.orders.length > 0 ? (
                      <div className="cu-orders-list">
                        {selectedUser.orders.map(order => {
                          const stageConf = STAGE_CONFIG[order.stage] || { label: order.stage, color: 'zeta' };
                          return (
                            <div key={order.id} className="cu-order-item"
                              onClick={() => { setIsPanelOpen(false); navigate(`/orders/${order.order_number}`); }}>
                              <div className="cu-order-left">
                                <div className="cu-order-num">#{order.order_number}</div>
                                <div className="cu-order-date">
                                  {new Date(order.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                                </div>
                              </div>
                              <div className="cu-order-right">
                                <div className="cu-order-total">₹{parseFloat(order.total).toLocaleString()}</div>
                                <span className={`cu-stage-badge cu-stage-${stageConf.color}`}>{stageConf.label}</span>
                              </div>
                              <svg className="cu-order-arrow" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <polyline points="9 18 15 12 9 6"/>
                              </svg>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="cu-no-orders">No orders yet</div>
                    )}
                  </div>

                  {/* Danger Zone */}
                  <div className="cu-detail-section cu-danger-zone">
                    <div className="cu-detail-section-title">Actions</div>
                    <div className="cu-danger-actions">
                      <button
                        className={`cu-btn-danger-block ${selectedUser.is_blocked ? 'unblock' : ''}`}
                        onClick={() => handleBlockUser(selectedUser)}
                        disabled={actionLoading}>
                        {selectedUser.is_blocked ? (
                          <>
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <circle cx="12" cy="12" r="10"/><polyline points="9 12 11 14 15 10"/>
                            </svg>
                            Unblock User
                          </>
                        ) : (
                          <>
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <circle cx="12" cy="12" r="10"/><line x1="4.93" y1="4.93" x2="19.07" y2="19.07"/>
                            </svg>
                            Block User
                          </>
                        )}
                      </button>
                      <button className="cu-btn-danger-delete"
                        onClick={() => handleDeleteUser(selectedUser)}
                        disabled={actionLoading}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <polyline points="3 6 5 6 21 6"/>
                          <path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/>
                          <path d="M10 11v6M14 11v6"/>
                          <path d="M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2"/>
                        </svg>
                        Delete User
                      </button>
                    </div>
                  </div>
                </>
              ) : null}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Users;
