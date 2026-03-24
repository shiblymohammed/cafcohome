import { useState, useEffect } from 'react';
import apiClient, { extractData } from '../utils/api';
import DataTable from '../components/DataTable';
import Modal from '../components/Modal';
import './Staff.css';

interface Staff {
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

const Staff = () => {
  const [staffList, setStaffList] = useState<Staff[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState<StaffFormData>({
    username: '',
    password: '',
    name: '',
    phone_number: '',
    role: 'staff',
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchStaff();
  }, []);

  const fetchStaff = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get('/staff/');
      setStaffList(extractData(response.data));
    } catch (error) {
      console.error('Failed to fetch staff:', error);
      alert('Failed to load staff members');
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = () => {
    setFormData({
      username: '',
      password: '',
      name: '',
      phone_number: '',
      role: 'staff',
    });
    setFormErrors({});
    setIsModalOpen(true);
  };

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!formData.username.trim()) {
      errors.username = 'Username is required';
    } else if (formData.username.length < 3) {
      errors.username = 'Username must be at least 3 characters';
    }

    if (!formData.password) {
      errors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      errors.password = 'Password must be at least 8 characters';
    }

    if (!formData.name.trim()) {
      errors.name = 'Name is required';
    }

    if (!formData.phone_number.trim()) {
      errors.phone_number = 'Phone number is required';
    } else if (!/^\+?[\d\s-()]+$/.test(formData.phone_number)) {
      errors.phone_number = 'Invalid phone number format';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setSubmitting(true);

    try {
      await apiClient.post('/staff/create/', formData);
      alert('Staff member created successfully');
      setIsModalOpen(false);
      fetchStaff();
    } catch (error: any) {
      console.error('Failed to create staff:', error);
      if (error.response?.data) {
        // Handle validation errors from backend
        const backendErrors: Record<string, string> = {};
        Object.keys(error.response.data).forEach((key) => {
          const errorValue = error.response.data[key];
          if (Array.isArray(errorValue)) {
            backendErrors[key] = errorValue[0];
          } else {
            backendErrors[key] = errorValue;
          }
        });
        setFormErrors(backendErrors);
      } else {
        alert('Failed to create staff member');
      }
    } finally {
      setSubmitting(false);
    }
  };

  const getRoleBadgeClass = (role: string): string => {
    return role === 'admin' ? 'role-admin' : 'role-staff';
  };

  const columns = [
    {
      key: 'name',
      label: 'Name',
      render: (item: Staff) => (
        <span className="staff-name">{item.name}</span>
      ),
    },
    {
      key: 'username',
      label: 'Username',
      render: (item: Staff) => (
        <span className="staff-username">{item.username}</span>
      ),
    },
    {
      key: 'phone_number',
      label: 'Phone Number',
      render: (item: Staff) => (
        <span className="phone-number">{item.phone_number}</span>
      ),
    },
    {
      key: 'role',
      label: 'Role',
      render: (item: Staff) => (
        <span className={`role-badge ${getRoleBadgeClass(item.role)}`}>
          {item.role === 'admin' ? 'Admin' : 'Staff'}
        </span>
      ),
    },
    {
      key: 'created_at',
      label: 'Created Date',
      render: (item: Staff) => (
        <div className="created-date">
          <div>{new Date(item.created_at).toLocaleDateString()}</div>
          <div className="created-time">
            {new Date(item.created_at).toLocaleTimeString()}
          </div>
        </div>
      ),
    },
  ];

  return (
    <div className="staff-page">
      <div className="page-header">
        <h1>Staff Management</h1>
        <button className="btn-primary" onClick={handleAdd}>
          Add Staff Member
        </button>
      </div>

      <DataTable
        columns={columns}
        data={staffList}
        loading={loading}
        emptyMessage="No staff members found. Create your first staff account!"
      />

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Add Staff Member"
        size="medium"
      >
        <form onSubmit={handleSubmit} className="staff-form">
          <div className="form-group">
            <label htmlFor="name">Full Name *</label>
            <input
              type="text"
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className={formErrors.name ? 'error' : ''}
              placeholder="Enter full name"
            />
            {formErrors.name && <span className="error-message">{formErrors.name}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="username">Username *</label>
            <input
              type="text"
              id="username"
              value={formData.username}
              onChange={(e) => setFormData({ ...formData, username: e.target.value })}
              className={formErrors.username ? 'error' : ''}
              placeholder="Enter username (min 3 characters)"
            />
            {formErrors.username && <span className="error-message">{formErrors.username}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="password">Password *</label>
            <input
              type="password"
              id="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              className={formErrors.password ? 'error' : ''}
              placeholder="Enter password (min 8 characters)"
            />
            {formErrors.password && <span className="error-message">{formErrors.password}</span>}
            <small className="field-hint">Password must be at least 8 characters long</small>
          </div>

          <div className="form-group">
            <label htmlFor="phone_number">Phone Number *</label>
            <input
              type="tel"
              id="phone_number"
              value={formData.phone_number}
              onChange={(e) => setFormData({ ...formData, phone_number: e.target.value })}
              className={formErrors.phone_number ? 'error' : ''}
              placeholder="Enter phone number"
            />
            {formErrors.phone_number && (
              <span className="error-message">{formErrors.phone_number}</span>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="role">Role *</label>
            <select
              id="role"
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value as 'admin' | 'staff' })}
              className={formErrors.role ? 'error' : ''}
            >
              <option value="staff">Staff (Limited Access)</option>
              <option value="admin">Admin (Full Access)</option>
            </select>
            {formErrors.role && <span className="error-message">{formErrors.role}</span>}
            <small className="field-hint">
              Staff can only manage orders. Admins have full system access.
            </small>
          </div>

          <div className="form-actions">
            <button
              type="button"
              className="btn-secondary"
              onClick={() => setIsModalOpen(false)}
              disabled={submitting}
            >
              Cancel
            </button>
            <button type="submit" className="btn-primary" disabled={submitting}>
              {submitting ? 'Creating...' : 'Create Staff Member'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Staff;
