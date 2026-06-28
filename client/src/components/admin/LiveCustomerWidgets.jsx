import React from 'react';

const LiveCustomerWidgets = ({ customersData }) => {
  if (!customersData) return null;

  return (
    <div className="row g-3 mb-4">
      <div className="col-12 col-md-4">
        <div className="card shadow-sm border-0 h-100 bg-white">
          <div className="card-body d-flex justify-content-between align-items-center">
            <div>
              <h6 className="text-muted mb-2">Total Customers</h6>
              <h3 className="mb-0 fw-bold text-dark">{customersData.totalCustomers?.toLocaleString()}</h3>
            </div>
            <div className="fs-1 text-secondary opacity-25"><i className="bi bi-people"></i></div>
          </div>
        </div>
      </div>
      <div className="col-12 col-md-4">
        <div className="card shadow-sm border-0 h-100 bg-white">
          <div className="card-body d-flex justify-content-between align-items-center">
            <div>
              <h6 className="text-muted mb-2">New (This Month)</h6>
              <h3 className="mb-0 fw-bold text-success">+{customersData.newCustomersThisMonth?.toLocaleString()}</h3>
            </div>
            <div className="fs-1 text-success opacity-25"><i className="bi bi-person-plus"></i></div>
          </div>
        </div>
      </div>
      <div className="col-12 col-md-4">
        <div className="card shadow-sm border-0 h-100 bg-white">
          <div className="card-body d-flex justify-content-between align-items-center">
            <div>
              <h6 className="text-muted mb-2">Returning Customers</h6>
              <h3 className="mb-0 fw-bold text-primary">{customersData.returningCustomers?.toLocaleString()}</h3>
            </div>
            <div className="fs-1 text-primary opacity-25"><i className="bi bi-person-check"></i></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LiveCustomerWidgets;
