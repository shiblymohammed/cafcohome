import { useState, useEffect } from 'react';
import apiClient, { extractData } from '../utils/api';
import './Staff.css';

interface StaffMember {
  id: number;
  username: string;
  name: string;
  phone_number: string;
  role: 'admin' | 'staff';
  created_at: string;
}

interface StaffFormData {
  username: string;
  password: string;
  name: string;
  phone_number: string;
  role: 'admin' | 'staff';
}

const ROLE_CONFIG = {
  admin: { label: 'Admin', color: 'beta', desc: 'Full system access' },
  staff: { label: 'Staff', color: 'zeta', desc: 'Order management only' },
};

const getInitials = (name: string) =>
  name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);

const AVATAR_COLORS = ['alpha', 'beta', 'gamma', 'delta', 'epsilon', 'zeta', 'eta'];
const getAvatarColor = (id: number) => AVATAR_COLORS[id % AVATAR_COLORS.length];

const Toggle = ({ checked, onChange, label, desc }: { checked: boolean; onChange: (v: boolean) => void; label: string; desc?: string }) => (
  <div className="sf-toggle-row">
    <div className="sf-toggle-info">
      <span className="sf-toggle-label">{label}</span>
      {desc && <span className="sf-toggle-desc">{desc}</span>}
    </div>
    <label className="sf-toggle">
      <input type="checkbox" className="sf-toggle-input" checked={checked} onChange={e => onChange(e.target.checked)} />
      <span className="sf-toggle-slider" />
    </label>
  </div>
);

const Staff = () => {
  const [staffList, setStaffList] = useState<StaffMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [formData, setFormData] = useState<StaffFormData>({
    username: '', password: '', name: '', phone_number: '', role: 'staff',
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => { fetchStaff(); }, []);

  const fetchStaff = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get('/staff/');
      setStaffList(extractData(response.data));
    } catch (error) {
      console.error('Failed to fetch staff:', error);
      setStaffList([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = () => {
    setFormData({ username: '', password: '', name: '', phone_number: '', role: 'staff' });
    setFormErrors({});
    setShowPassword(false);
    setIsPanelOpen(true);
  };

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};
    if (!formData.name.trim()) errors.name = 'Name is required';
    if (!formData.username.trim()) errors.username = 'Username is required';
    else if (formData.username.length < 3) errors.username = 'Min 3 characters';
    if (!formData.password) errors.password = 'Password is required';
    else if (formData.password.length < 8) errors.password = 'Min 8 characters';
    if (!formData.phone_number.trim()) errors.phone_number = 'Phone is required';
    else if (!/^\+?[\d\s\-()]+$/.test(formData.phone_number)) errors.phone_number = 'Invalid phone format';
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    setSubmitting(true);
    try {
      await apiClient.post('/staff/create/', formData);
      setIsPanelOpen(false);
      fetchStaff();
    } catch (error: any) {
      if (error.response?.data) {
        const errs: Record<string, string> = {};
        Object.keys(error.response.data).forEach(k => {
          const v = error.response.data[k];
          errs[k] = Array.isArray(v) ? v[0] : v;
        });
        setFormErrors(errs);
      } else {
        alert('Failed to create staff member');
      }
    } finally {
      setSubmitting(false);
    }
  };

  const filtered = staffList.filter(s => {
    const matchSearch = !searchTerm ||
      s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.phone_number.includes(searchTerm);
    const matchRole = !roleFilter || s.role === roleFilter;
    return matchSearch && matchRole;
  });

  const adminCount = staffList.filter(s => s.role === 'admin').length;
  const staffCount = staffList.filter(s => s.role === 'staff').length;

  return (
    <div className="sf-page">
      {/* Header */}
      <div className="sf-header">
        <div className="sf-header-left">
          <h1 className="sf-title">Staff</h1>
          <span className="sf-count">{staffList.length}</span>
        </div>
        <button className="sf-btn-add" onClick={handleAdd}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
          Add Staff
        </button>
      </div>

      {/* Stats */}
      <div className="sf-stats">
        <div className="sf-stat">
          <div className="sf-stat-val">{staffList.length}</div>
          <div className="sf-stat-label">Total Members</div>
        </div>
        <div className="sf-stat sf-stat-admin">
          <div className="sf-stat-val">{adminCount}</div>
          <div className="sf-stat-label">Admins</div>
        </div>
        <div className="sf-stat sf-stat-staff">
          <div className="sf-stat-val">{staffCount}</div>
          <div className="sf-stat-label">Staff</div>
        </div>
      </div>

      {/* Filters */}
      <div className="sf-filters">
        <div className="sf-search-wrap">
          <svg className="sf-search-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          <input className="sf-search" type="text" placeholder="Search by name, username, phone…"
            value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
        </div>
        <select className="sf-filter-select" value={roleFilter} onChange={e => setRoleFilter(e.target.value)}>
          <option value="">All Roles</option>
          <option value="admin">Admin</option>
          <option value="staff">Staff</option>
        </select>
      </div>

      {/* Content */}
      {loading ? (
        <div className="sf-loading"><div className="sf-spinner" /><span>Loading…</span></div>
      ) : filtered.length === 0 ? (
        <div className="sf-empty">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2">
            <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/>
            <circle cx="9" cy="7" r="4"/>
            <path d="M23 21v-2a4 4 0 00-3-3.87"/>
            <path d="M16 3.13a4 4 0 010 7.75"/>
          </svg>
          <p>No staff members found</p>
          <button className="sf-btn-add" onClick={handleAdd}>Add first member</button>
        </div>
      ) : (
        <div className="sf-grid">
          {filtered.map(member => {
            const roleConf = ROLE_CONFIG[member.role];
            const avatarColor = getAvatarColor(member.id);
            return (
              <div key={member.id} className="sf-card">
                <div className="sf-card-top">
                  <div className={`sf-avatar sf-avatar-${avatarColor}`}>
                    {getInitials(member.name)}
                  </div>
                  <span className={`sf-role-badge sf-role-${member.role}`}>
                    {roleConf.label}
                  </span>
                </div>
                <div className="sf-card-body">
                  <div className="sf-card-name">{member.name}</div>
                  <div className="sf-card-username">@{member.username}</div>
                  <div className="sf-card-phone">
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.81a19.79 19.79 0 01-3.07-8.67A2 2 0 012 .84h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.09 8.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z"/>
                    </svg>
                    {member.phone_number}
                  </div>
                  <div className="sf-card-joined">
                    Joined {new Date(member.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                  </div>
                </div>
                <div className="sf-card-footer">
                  <div className="sf-role-desc">{roleConf.desc}</div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Slide-in Panel */}
      {isPanelOpen && (
        <div className="sf-overlay" onClick={e => { if (e.target === e.currentTarget) setIsPanelOpen(false); }}>
          <div className="sf-panel">
            <div className="sf-panel-header">
              <h2 className="sf-panel-title">New Staff Member</h2>
              <button className="sf-panel-close" onClick={() => setIsPanelOpen(false)}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            </div>
            <form onSubmit={handleSubmit} style={{ display: 'contents' }}>
              <div className="sf-panel-body">

                <div className="sf-form-section">
                  <div className="sf-form-section-title">Personal Info</div>
                  <div className="sf-form-group">
                    <label className="sf-form-label">Full Name <span>*</span></label>
                    <input className={`sf-form-input ${formErrors.name ? 'error' : ''}`}
                      type="text" placeholder="e.g. Rahul Sharma"
                      value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} />
                    {formErrors.name && <span className="sf-form-error">{formErrors.name}</span>}
                  </div>
                  <div className="sf-form-group">
                    <label className="sf-form-label">Phone Number <span>*</span></label>
                    <input className={`sf-form-input ${formErrors.phone_number ? 'error' : ''}`}
                      type="tel" placeholder="+91 98765 43210"
                      value={formData.phone_number} onChange={e => setFormData({ ...formData, phone_number: e.target.value })} />
                    {formErrors.phone_number && <span className="sf-form-error">{formErrors.phone_number}</span>}
                  </div>
                </div>

                <div className="sf-form-section">
                  <div className="sf-form-section-title">Account Credentials</div>
                  <div className="sf-form-group">
                    <label className="sf-form-label">Username <span>*</span></label>
                    <input className={`sf-form-input ${formErrors.username ? 'error' : ''}`}
                      type="text" placeholder="min 3 characters"
                      value={formData.username} onChange={e => setFormData({ ...formData, username: e.target.value })} />
                    {formErrors.username && <span className="sf-form-error">{formErrors.username}</span>}
                  </div>
                  <div className="sf-form-group">
                    <label className="sf-form-label">Password <span>*</span></label>
                    <div className="sf-password-wrap">
                      <input className={`sf-form-input ${formErrors.password ? 'error' : ''}`}
                        type={showPassword ? 'text' : 'password'} placeholder="min 8 characters"
                        value={formData.password} onChange={e => setFormData({ ...formData, password: e.target.value })} />
                      <button type="button" className="sf-password-toggle" onClick={() => setShowPassword(!showPassword)}>
                        {showPassword ? (
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24"/>
                            <line x1="1" y1="1" x2="23" y2="23"/>
                          </svg>
                        ) : (
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                            <circle cx="12" cy="12" r="3"/>
                          </svg>
                        )}
                      </button>
                    </div>
                    {formErrors.password && <span className="sf-form-error">{formErrors.password}</span>}
                  </div>
                </div>

                <div className="sf-form-section">
                  <div className="sf-form-section-title">Role & Permissions</div>
                  <div className="sf-role-cards">
                    {(['staff', 'admin'] as const).map(role => (
                      <div key={role}
                        className={`sf-role-card ${formData.role === role ? 'selected' : ''}`}
                        onClick={() => setFormData({ ...formData, role })}>
                        <div className="sf-role-card-header">
                          <span className={`sf-role-badge sf-role-${role}`}>{ROLE_CONFIG[role].label}</span>
                          {formData.role === role && (
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                              <polyline points="20 6 9 17 4 12"/>
                            </svg>
                          )}
                        </div>
                        <div className="sf-role-card-desc">{ROLE_CONFIG[role].desc}</div>
                      </div>
                    ))}
                  </div>
                </div>

              </div>
              <div className="sf-panel-footer">
                <button type="button" className="sf-btn-cancel" onClick={() => setIsPanelOpen(false)} disabled={submitting}>Cancel</button>
                <button type="submit" className="sf-btn-save" disabled={submitting}>
                  {submitting ? 'Creating…' : 'Create Member'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Staff;
