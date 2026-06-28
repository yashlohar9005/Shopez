import React from 'react';
import { Link } from 'react-router-dom';

const StatsCard = ({ title, value, icon, bgColor, textColor = 'white', linkTo }) => {
  return (
    <div className={`card bg-${bgColor} text-${textColor} h-100 border-0 shadow-sm rounded-3 overflow-hidden`}>
      <div className="card-body position-relative z-1 p-4">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h6 className="text-uppercase mb-0 opacity-75 fw-bold" style={{ letterSpacing: '0.5px', fontSize: '0.8rem' }}>{title}</h6>
          <i className={`bi ${icon} fs-3 opacity-50`}></i>
        </div>
        <h3 className="fw-bold mb-0">{value}</h3>
      </div>
      
      {/* Decorative background element */}
      <div className="position-absolute top-0 end-0 opacity-10" style={{ transform: 'translate(20%, -20%) scale(2)' }}>
        <i className={`bi ${icon}`} style={{ fontSize: '100px' }}></i>
      </div>

      {linkTo && (
        <div className={`card-footer bg-${bgColor} border-top border-${textColor === 'white' ? 'light' : 'dark'} border-opacity-25 py-2 position-relative z-1`}>
          <Link to={linkTo} className={`text-${textColor} text-decoration-none small d-flex justify-content-between align-items-center fw-medium`}>
            <span>View Details</span> <i className="bi bi-arrow-right"></i>
          </Link>
        </div>
      )}
    </div>
  );
};

export default StatsCard;
