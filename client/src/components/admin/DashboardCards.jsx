import React from 'react';
import StatsCard from './StatsCard';

const DashboardCards = ({ stats }) => {
  if (!stats) return null;

  const formattedRevenue = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(stats.totalRevenue || 0);

  return (
    <div className="row g-4 mb-4">
      <div className="col-sm-6 col-xl-4">
        <StatsCard 
          title="Total Revenue" 
          value={formattedRevenue} 
          icon="bi-currency-rupee" 
          bgColor="primary" 
        />
      </div>
      <div className="col-sm-6 col-xl-4">
        <StatsCard 
          title="Total Orders" 
          value={stats.totalOrders || 0} 
          icon="bi-cart-check" 
          bgColor="success" 
          linkTo="/admin/orders" 
        />
      </div>
      <div className="col-sm-6 col-xl-4">
        <StatsCard 
          title="Total Products" 
          value={stats.totalProducts || 0} 
          icon="bi-box-seam" 
          bgColor="info" 
          textColor="dark"
          linkTo="/admin/products" 
        />
      </div>
      <div className="col-sm-6 col-xl-4">
        <StatsCard 
          title="Total Users" 
          value={stats.totalUsers || 0} 
          icon="bi-people" 
          bgColor="secondary" 
          linkTo="/admin/users" 
        />
      </div>
      <div className="col-sm-6 col-xl-4">
        <StatsCard 
          title="Pending Orders" 
          value={stats.pendingOrders || 0} 
          icon="bi-hourglass-split" 
          bgColor="warning"
          textColor="dark"
          linkTo="/admin/orders?status=processing" 
        />
      </div>
      <div className="col-sm-6 col-xl-4">
        <StatsCard 
          title="Out of Stock" 
          value={stats.outOfStockProducts || 0} 
          icon="bi-exclamation-triangle" 
          bgColor="danger" 
          linkTo="/admin/inventory?filter=out_of_stock" 
        />
      </div>
    </div>
  );
};

export default DashboardCards;
