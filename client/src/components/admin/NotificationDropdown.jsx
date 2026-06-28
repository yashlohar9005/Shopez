import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import adminService from '../../services/adminService';

const NotificationDropdown = () => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);

  const fetchNotifications = async () => {
    try {
      const data = await adminService.getNotifications({ limit: 5, isRead: 'false' });
      setNotifications(data.notifications || []);
      
      const countData = await adminService.getUnreadNotificationCount();
      setUnreadCount(countData.count || 0);
    } catch (err) {
      console.error("Failed to load notifications", err);
    }
  };

  useEffect(() => {
    fetchNotifications();
    // Poll notifications every 30s as well
    const interval = setInterval(fetchNotifications, 30000);
    
    // Listen for read events from the main notifications page
    const handleReadEvent = () => fetchNotifications();
    window.addEventListener('notificationRead', handleReadEvent);
    
    return () => {
      clearInterval(interval);
      window.removeEventListener('notificationRead', handleReadEvent);
    };
  }, []);

  const handleMarkRead = async (e, id) => {
    e.stopPropagation();
    try {
      await adminService.markNotificationRead(id);
      fetchNotifications();
    } catch (err) {
      console.error(err);
    }
  };

  const handleMarkAllRead = async (e) => {
    e.stopPropagation();
    try {
      await adminService.markAllNotificationsRead();
      fetchNotifications();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="dropdown">
      <button 
        className="btn btn-light position-relative rounded-circle p-2 d-flex align-items-center justify-content-center"
        onClick={() => setIsOpen(!isOpen)}
        style={{ width: '40px', height: '40px' }}
      >
        <i className="bi bi-bell fs-5 text-secondary"></i>
        {unreadCount > 0 && (
          <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger" style={{ fontSize: '0.65rem' }}>
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <>
          <div className="dropdown-menu dropdown-menu-end shadow border-0 show" style={{ width: '320px', right: 0, position: 'absolute', zIndex: 1050 }}>
            <div className="d-flex justify-content-between align-items-center px-3 py-2 border-bottom bg-light">
              <h6 className="mb-0 fw-bold">Notifications</h6>
              {unreadCount > 0 && (
                <button className="btn btn-link btn-sm p-0 text-decoration-none" onClick={handleMarkAllRead}>
                  Mark all read
                </button>
              )}
            </div>
            
            <div className="list-group list-group-flush" style={{ maxHeight: '300px', overflowY: 'auto' }}>
              {notifications.length === 0 ? (
                <div className="text-center p-4 text-muted small">
                  No new notifications
                </div>
              ) : (
                notifications.map(notif => (
                  <div key={notif._id} className="list-group-item list-group-item-action p-3 position-relative">
                    <div className="d-flex justify-content-between align-items-start mb-1">
                      <strong className="small text-truncate me-2" style={{ maxWidth: '200px' }}>{notif.title}</strong>
                      <small className="text-muted" style={{ fontSize: '0.7rem' }}>
                        {new Date(notif.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </small>
                    </div>
                    <p className="small mb-0 text-muted" style={{ fontSize: '0.8rem' }}>{notif.message}</p>
                    <button 
                      className="btn btn-sm btn-link p-0 position-absolute end-0 bottom-0 m-2"
                      onClick={(e) => handleMarkRead(e, notif._id)}
                      title="Mark as read"
                    >
                      <i className="bi bi-check2 text-success"></i>
                    </button>
                  </div>
                ))
              )}
            </div>
            
            <div className="border-top text-center p-2 bg-light">
              <Link to="/admin/notifications" className="small text-decoration-none" onClick={() => setIsOpen(false)}>
                View All Notifications
              </Link>
            </div>
          </div>
          <div className="position-fixed top-0 start-0 w-100 h-100" style={{ zIndex: 1040 }} onClick={() => setIsOpen(false)}></div>
        </>
      )}
    </div>
  );
};

export default NotificationDropdown;
