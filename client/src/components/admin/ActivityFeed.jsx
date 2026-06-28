import React from 'react';

const ActivityFeed = ({ activities }) => {
  if (!activities || activities.length === 0) {
    return <div className="text-muted text-center py-4">No recent activity</div>;
  }

  const getIcon = (type) => {
    switch(type) {
      case 'order': return <i className="bi bi-cart-check text-success"></i>;
      case 'user': return <i className="bi bi-person-plus text-primary"></i>;
      case 'product': return <i className="bi bi-box-seam text-info"></i>;
      default: return <i className="bi bi-bell text-secondary"></i>;
    }
  };

  return (
    <div className="activity-feed">
      {activities.map((activity, index) => (
        <div key={activity.id || index} className="d-flex mb-3 align-items-start">
          <div className="flex-shrink-0 bg-light rounded-circle p-2 d-flex align-items-center justify-content-center" style={{ width: '40px', height: '40px' }}>
            {getIcon(activity.type)}
          </div>
          <div className="flex-grow-1 ms-3">
            <h6 className="mb-0 fw-bold fs-6">{activity.title}</h6>
            <p className="text-muted mb-0 small">{activity.description}</p>
            <small className="text-muted" style={{ fontSize: '0.75rem' }}>
              {new Date(activity.timestamp).toLocaleString()}
            </small>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ActivityFeed;
