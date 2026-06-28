import React, { useState, useEffect } from 'react';
import adminService from '../../services/adminService';
import Loader from '../../components/Loader';
import Pagination from '../../components/Pagination';

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({});
  const [unreadOnly, setUnreadOnly] = useState(false);

  const searchParams = new URLSearchParams(window.location.search);
  const pageNumber = searchParams.get('page') || 1;

  useEffect(() => {
    fetchNotifications();
  }, [pageNumber, unreadOnly]);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      setError(null);
      const params = { page: pageNumber, limit: 15 };
      if (unreadOnly) params.isRead = 'false';

      const data = await adminService.getNotifications(params);
      setNotifications(data.notifications || []);
      setPagination(data.pagination || {});
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to load notifications');
    } finally {
      setLoading(false);
    }
  };

  const handleMarkRead = async (id) => {
    try {
      await adminService.markNotificationRead(id);
      setNotifications(notifications.map(n => n._id === id ? { ...n, isRead: true } : n));
      
      // Update global unread count via context or event (if implemented)
      window.dispatchEvent(new Event('notificationRead'));
    } catch (err) {
      alert(err.response?.data?.message || err.message);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await adminService.markAllNotificationsRead();
      setNotifications(notifications.map(n => ({ ...n, isRead: true })));
      window.dispatchEvent(new Event('notificationRead'));
    } catch (err) {
      alert(err.response?.data?.message || err.message);
    }
  };

  const getIconForType = (type) => {
    switch (type) {
      case 'order': return { icon: 'bi-box-seam', color: 'primary' };
      case 'user': return { icon: 'bi-person-plus', color: 'info' };
      case 'product': return { icon: 'bi-tag', color: 'success' };
      case 'system': return { icon: 'bi-gear', color: 'secondary' };
      case 'alert': return { icon: 'bi-exclamation-triangle', color: 'danger' };
      default: return { icon: 'bi-bell', color: 'secondary' };
    }
  };

  const timeAgo = (date) => {
    const seconds = Math.floor((new Date() - new Date(date)) / 1000);
    
    let interval = seconds / 31536000;
    if (interval > 1) return Math.floor(interval) + 'y ago';
    
    interval = seconds / 2592000;
    if (interval > 1) return Math.floor(interval) + 'm ago';
    
    interval = seconds / 86400;
    if (interval > 1) return Math.floor(interval) + 'd ago';
    
    interval = seconds / 3600;
    if (interval > 1) return Math.floor(interval) + 'h ago';
    
    interval = seconds / 60;
    if (interval > 1) return Math.floor(interval) + ' min ago';
    
    return 'Just now';
  };

  return (
    <div className="pb-4">
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-4 gap-3">
        <div>
          <h2 className="fw-bold m-0 text-dark">Notifications</h2>
          <p className="text-muted mb-0 small">Stay updated on store activities</p>
        </div>
        
        <div className="d-flex gap-2 align-items-center">
          <div className="form-check form-switch me-3">
            <input 
              className="form-check-input cursor-pointer" 
              type="checkbox" 
              id="unreadToggle"
              checked={unreadOnly}
              onChange={(e) => setUnreadOnly(e.target.checked)}
            />
            <label className="form-check-label" htmlFor="unreadToggle">Unread Only</label>
          </div>
          
          <button 
            className="btn btn-outline-primary shadow-sm text-nowrap"
            onClick={handleMarkAllRead}
            disabled={notifications.every(n => n.isRead)}
          >
            <i className="bi bi-check2-all me-1"></i> Mark All Read
          </button>
        </div>
      </div>

      {error && <div className="alert alert-danger shadow-sm border-0">{error}</div>}

      <div className="card shadow-sm border-0 rounded-3 bg-white">
        <div className="card-body p-0">
          {loading ? (
            <div className="p-5"><Loader /></div>
          ) : notifications.length === 0 ? (
            <div className="text-center py-5">
              <i className="bi bi-bell-slash text-muted opacity-50 mb-3 d-block" style={{ fontSize: '3rem' }}></i>
              <h5 className="text-muted">You're all caught up!</h5>
              <p className="text-muted small">No notifications found.</p>
            </div>
          ) : (
            <div className="list-group list-group-flush rounded-3">
              {notifications.map((notification) => {
                const { icon, color } = getIconForType(notification.type);
                
                return (
                  <div 
                    key={notification._id} 
                    className={`list-group-item list-group-item-action p-4 d-flex gap-3 align-items-start ${notification.isRead ? 'bg-white' : 'bg-light'}`}
                    style={{ transition: 'all 0.2s' }}
                  >
                    <div className={`flex-shrink-0 bg-${color} bg-opacity-10 text-${color} rounded-circle d-flex justify-content-center align-items-center mt-1`} style={{ width: '40px', height: '40px' }}>
                      <i className={`bi ${icon} fs-5`}></i>
                    </div>
                    
                    <div className="flex-grow-1">
                      <div className="d-flex justify-content-between align-items-center mb-1">
                        <h6 className={`mb-0 ${notification.isRead ? 'text-dark' : 'fw-bold text-dark'}`}>
                          {notification.title}
                        </h6>
                        <small className={`text-muted ${!notification.isRead ? 'fw-bold' : ''}`}>
                          {timeAgo(notification.createdAt)}
                        </small>
                      </div>
                      <p className={`mb-2 small ${notification.isRead ? 'text-muted' : 'text-dark'}`}>
                        {notification.message}
                      </p>
                      
                      {notification.link && (
                        <a href={notification.link} className="btn btn-sm btn-link p-0 text-decoration-none">
                          View Details <i className="bi bi-arrow-right small"></i>
                        </a>
                      )}
                    </div>
                    
                    {!notification.isRead && (
                      <div className="flex-shrink-0 ms-2">
                        <button 
                          className="btn btn-sm btn-light border rounded-circle"
                          onClick={() => handleMarkRead(notification._id)}
                          title="Mark as read"
                        >
                          <i className="bi bi-check2 text-success"></i>
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
      
      {!loading && notifications.length > 0 && (
        <div className="mt-4 d-flex justify-content-between align-items-center">
          <div className="text-muted small">
            Showing page <span className="fw-bold text-dark">{pagination.page}</span> of <span className="fw-bold text-dark">{pagination.pages}</span>
          </div>
          <Pagination pages={pagination.pages} page={pagination.page} isAdmin={true} />
        </div>
      )}
    </div>
  );
};

export default Notifications;
