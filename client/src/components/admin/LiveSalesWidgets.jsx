import React from 'react';

const LiveSalesWidgets = ({ revenueData }) => {
  if (!revenueData) return null;

  return (
    <div className="row g-3 mb-4">
      <div className="col-6 col-md-3">
        <div className="card shadow-sm border-0 h-100 bg-primary text-white">
          <div className="card-body">
            <h6 className="text-white-50 mb-2">Today's Sales</h6>
            <h3 className="mb-0 fw-bold">₹{revenueData.revenueToday?.toLocaleString()}</h3>
          </div>
        </div>
      </div>
      <div className="col-6 col-md-3">
        <div className="card shadow-sm border-0 h-100 bg-info text-white">
          <div className="card-body">
            <h6 className="text-white-50 mb-2">Weekly Sales</h6>
            <h3 className="mb-0 fw-bold">₹{revenueData.revenueThisWeek?.toLocaleString()}</h3>
          </div>
        </div>
      </div>
      <div className="col-6 col-md-3">
        <div className="card shadow-sm border-0 h-100 bg-success text-white">
          <div className="card-body">
            <h6 className="text-white-50 mb-2">Monthly Sales</h6>
            <h3 className="mb-0 fw-bold">₹{revenueData.revenueThisMonth?.toLocaleString()}</h3>
          </div>
        </div>
      </div>
      <div className="col-6 col-md-3">
        <div className="card shadow-sm border-0 h-100 bg-dark text-white">
          <div className="card-body">
            <h6 className="text-white-50 mb-2">Total Revenue</h6>
            <h3 className="mb-0 fw-bold">₹{revenueData.totalSales?.toLocaleString()}</h3>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LiveSalesWidgets;
