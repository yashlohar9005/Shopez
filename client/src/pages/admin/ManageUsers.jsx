import React, { useState, useEffect } from 'react';
import adminService from '../../services/adminService';
import UserTable from '../../components/admin/UserTable';
import Loader from '../../components/Loader';
import Pagination from '../../components/Pagination';

const ManageUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({});
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('');

  const searchParams = new URLSearchParams(window.location.search);
  const pageNumber = searchParams.get('page') || 1;

  useEffect(() => {
    fetchUsers();
  }, [pageNumber, roleFilter]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      const params = { page: pageNumber, limit: 10 };
      if (searchTerm) params.search = searchTerm;
      if (roleFilter) params.role = roleFilter;

      const data = await adminService.getUsers(params);
      setUsers(data.users || []);
      setPagination(data.pagination || {});
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchUsers();
  };

  const handleRoleChange = async (id, newRole) => {
    try {
      await adminService.updateUserRole(id, newRole);
      setUsers(users.map(u => u._id === id ? { ...u, role: newRole } : u));
    } catch (err) {
      alert(err.response?.data?.message || err.message);
    }
  };

  const handleStatusToggle = async (id) => {
    try {
      const result = await adminService.toggleUserStatus(id);
      setUsers(users.map(u => u._id === id ? { ...u, isBlocked: result.isBlocked } : u));
    } catch (err) {
      alert(err.response?.data?.message || err.message);
    }
  };

  const handleDelete = async (id) => {
    try {
      await adminService.deleteUser(id);
      fetchUsers(); // Refresh after delete
    } catch (err) {
      alert(err.response?.data?.message || err.message);
    }
  };

  return (
    <div className="pb-4">
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-4 gap-3">
        <div>
          <h2 className="fw-bold m-0 text-dark">Manage Users</h2>
          <p className="text-muted mb-0 small">View and manage all registered users</p>
        </div>
        
        {/* Filters and Search */}
        <div className="d-flex flex-column flex-md-row gap-2">
          <select 
            className="form-select border-0 shadow-sm text-muted" 
            value={roleFilter} 
            onChange={(e) => setRoleFilter(e.target.value)}
            style={{ minWidth: '150px' }}
          >
            <option value="">All Roles</option>
            <option value="user">Users Only</option>
            <option value="admin">Admins Only</option>
          </select>
          
          <form onSubmit={handleSearch} className="d-flex">
            <div className="input-group shadow-sm rounded-3 overflow-hidden">
              <input 
                type="text" 
                className="form-control border-0" 
                placeholder="Search users..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <button className="btn btn-primary border-0 px-3" type="submit">
                <i className="bi bi-search"></i>
              </button>
            </div>
          </form>
        </div>
      </div>

      {error && <div className="alert alert-danger shadow-sm border-0">{error}</div>}

      {loading ? (
        <Loader />
      ) : (
        <>
          <UserTable 
            users={users} 
            onRoleChange={handleRoleChange} 
            onStatusToggle={handleStatusToggle} 
            onDelete={handleDelete}
          />
          
          <div className="mt-4 d-flex justify-content-between align-items-center">
            <div className="text-muted small">
              Showing <span className="fw-bold text-dark">{users.length}</span> of <span className="fw-bold text-dark">{pagination.total}</span> users
            </div>
            <Pagination pages={pagination.pages} page={pagination.page} isAdmin={true} />
          </div>
        </>
      )}
    </div>
  );
};

export default ManageUsers;
