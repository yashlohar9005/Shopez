import React from 'react';

const LiveInventoryWidgets = ({ inventoryData }) => {
  if (!inventoryData) return null;

  return (
    <div className="row g-3 mb-4">
      <div className="col-6 col-md-3">
        <div className="card shadow-sm border-0 h-100 bg-white">
          <div className="card-body text-center">
            <h6 className="text-muted mb-2">Total Inventory</h6>
            <h3 className="mb-0 fw-bold text-dark">{inventoryData.totalInventory?.toLocaleString()}</h3>
          </div>
        </div>
      </div>
      <div className="col-6 col-md-3">
        <div className="card shadow-sm border-0 h-100 bg-white">
          <div className="card-body text-center">
            <h6 className="text-muted mb-2">Inventory Value</h6>
            <h3 className="mb-0 fw-bold text-success">₹{inventoryData.inventoryValue?.toLocaleString()}</h3>
          </div>
        </div>
      </div>
      <div className="col-6 col-md-3">
        <div className="card shadow-sm border-0 h-100 bg-white border-bottom border-warning border-3">
          <div className="card-body text-center">
            <h6 className="text-muted mb-2">Low Stock Items</h6>
            <h3 className="mb-0 fw-bold text-warning">{inventoryData.lowStock?.length || 0}</h3>
          </div>
        </div>
      </div>
      <div className="col-6 col-md-3">
        <div className="card shadow-sm border-0 h-100 bg-white border-bottom border-danger border-3">
          <div className="card-body text-center">
            <h6 className="text-muted mb-2">Out of Stock</h6>
            <h3 className="mb-0 fw-bold text-danger">{inventoryData.outOfStock?.length || 0}</h3>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LiveInventoryWidgets;
