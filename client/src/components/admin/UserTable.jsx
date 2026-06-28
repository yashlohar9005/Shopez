import React from 'react';
import useAuth from '../../hooks/useAuth';

const UserTable = ({ users, onRoleChange, onStatusToggle, onDelete }) => {
  const { user: currentUser } = useAuth();

  if (!users || users.length === 0) {
    return (
      <div className="card border-0 shadow-sm">
        <div className="card-body text-center py-5">
          <i className="bi bi-people text-muted opacity-50 mb-3 d-block" style={{ fontSize: '3rem' }}></i>
          <h5 className="text-muted">No users found.</h5>
        </div>
      </div>
    );
  }

  return (
    <div className="table-responsive bg-white rounded-3 shadow-sm border-0">
      <table className="table table-hover align-middle mb-0">
        <thead className="table-light">
          <tr>
            <th scope="col" className="ps-4 py-3">User</th>
            <th scope="col" className="py-3">Email</th>
            <th scope="col" className="py-3">Joined</th>
            <th scope="col" className="py-3">Role</th>
            <th scope="col" className="py-3">Status</th>
            <th scope="col" className="text-end pe-4 py-3">Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map((u) => {
            const isSelf = u._id === currentUser?._id;
            
            return (
              <tr key={u._id} className={u.isBlocked ? 'table-danger' : ''}>
                <td className="ps-4 py-3">
                  <div className="d-flex align-items-center">
                    <img 
                      src={u.avatar || 'https://via.placeholder.com/40'} 
                      alt={u.name} 
                      className="rounded-circle me-3 object-fit-cover shadow-sm"
                      style={{ width: '40px', height: '40px' }}
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = 'https://via.placeholder.com/40';
                      }}
                    />
                    <div>
                      <div className="fw-bold text-dark">{u.name} {isSelf && <span className="badge bg-secondary ms-1">You</span>}</div>
                      <div className="text-muted small font-monospace">#{u._id.substring(18)}</div>
                    </div>
                  </div>
                </td>
                <td className="py-3 text-muted">{u.email}</td>
                <td className="py-3 text-muted">{new Date(u.createdAt).toLocaleDateString()}</td>
                <td className="py-3">
                  <span className={`badge rounded-pill ${u.role === 'admin' ? 'bg-primary' : 'bg-secondary bg-opacity-25 text-dark'}`}>
                    {u.role.toUpperCase()}
                  </span>
                </td>
                <td className="py-3">
                  {u.isBlocked ? (
                    <span className="badge rounded-pill bg-danger"><i className="bi bi-lock-fill me-1"></i> Blocked</span>
                  ) : (
                    <span className="badge rounded-pill bg-success"><i className="bi bi-check-circle-fill me-1"></i> Active</span>
                  )}
                </td>
                <td className="text-end pe-4 py-3">
                  <div className="dropdown">
                    <button className="btn btn-sm btn-light rounded-circle" type="button" data-bs-toggle="dropdown" aria-expanded="false">
                      <i className="bi bi-three-dots-vertical"></i>
                    </button>
                    <ul className="dropdown-menu dropdown-menu-end shadow border-0">
                      {!isSelf && (
                        <>
                          {/* Role Toggle */}
                          {!u.isBlocked && (
                            <li>
                              <button 
                                className="dropdown-item py-2"
                                onClick={() => onRoleChange(u._id, u.role === 'admin' ? 'user' : 'admin')}
                              >
                                <i className={`bi ${u.role === 'admin' ? 'bi-person-down text-warning' : 'bi-person-up text-primary'} me-2`}></i>
                                {u.role === 'admin' ? 'Demote to User' : 'Promote to Admin'}
                              </button>
                            </li>
                          )}
                          
                          {/* Block/Unblock Toggle */}
                          {u.role !== 'admin' && (
                            <li>
                              <button 
                                className="dropdown-item py-2"
                                onClick={() => onStatusToggle(u._id)}
                              >
                                <i className={`bi ${u.isBlocked ? 'bi-unlock text-success' : 'bi-lock text-danger'} me-2`}></i>
                                {u.isBlocked ? 'Unblock User' : 'Block User'}
                              </button>
                            </li>
                          )}

                          {/* Delete */}
                          {u.role !== 'admin' && (
                            <>
                              <li><hr className="dropdown-divider" /></li>
                              <li>
                                <button 
                                  className="dropdown-item py-2 text-danger"
                                  onClick={() => {
                                    if(window.confirm(`Are you sure you want to delete ${u.name}? This cannot be undone.`)) {
                                      onDelete(u._id);
                                    }
                                  }}
                                >
                                  <i className="bi bi-trash me-2"></i> Delete User
                                </button>
                              </li>
                            </>
                          )}
                        </>
                      )}
                      {isSelf && (
                        <li><span className="dropdown-item text-muted py-2">No actions available</span></li>
                      )}
                    </ul>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default UserTable;
