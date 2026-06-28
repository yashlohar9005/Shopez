import React from 'react';
import { Link } from 'react-router-dom';

const EmptyState = ({ icon = 'bi-box-seam', title = 'No Data Found', message = '', actionText, actionLink }) => {
  return (
    <div className="text-center py-5 bg-white rounded shadow-sm w-100">
      <i className={`bi ${icon} fs-1 text-muted mb-3 d-block`}></i>
      <h4 className="text-muted mb-2">{title}</h4>
      {message && <p className="text-muted small mb-4">{message}</p>}
      
      {actionText && actionLink && (
        <Link to={actionLink} className="btn btn-primary px-4 rounded-pill">
          {actionText}
        </Link>
      )}
    </div>
  );
};

export default EmptyState;
