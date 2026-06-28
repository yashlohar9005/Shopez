import React, { useState, useEffect } from 'react';
import adminService from '../../services/adminService';
import TransactionTable from '../../components/admin/TransactionTable';
import Loader from '../../components/Loader';
import Pagination from '../../components/Pagination';
import StatsCard from '../../components/admin/StatsCard';

const Transactions = () => {
  const [transactions, setTransactions] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({});
  
  const [dateFilter, setDateFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const searchParams = new URLSearchParams(window.location.search);
  const pageNumber = searchParams.get('page') || 1;

  useEffect(() => {
    fetchTransactions();
    fetchStats();
  }, [pageNumber, dateFilter, statusFilter]);

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      
      const params = { page: pageNumber, limit: 15 };
      if (statusFilter) params.paymentStatus = statusFilter;
      
      if (dateFilter) {
        const today = new Date();
        if (dateFilter === 'today') {
          params.startDate = today.toISOString().split('T')[0];
        } else if (dateFilter === '7days') {
          const past = new Date(today.setDate(today.getDate() - 7));
          params.startDate = past.toISOString().split('T')[0];
        } else if (dateFilter === '30days') {
          const past = new Date(today.setDate(today.getDate() - 30));
          params.startDate = past.toISOString().split('T')[0];
        }
      }

      const data = await adminService.getTransactions(params);
      setTransactions(data.transactions || []);
      setPagination(data.pagination || {});
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const data = await adminService.getTransactionStats();
      setStats(data);
    } catch (err) {
      console.error('Failed to fetch transaction stats:', err);
    }
  };

  const formattedRevenue = stats ? new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(stats.totalRevenue) : '₹0';

  return (
    <div className="pb-4">
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-4 gap-3">
        <div>
          <h2 className="fw-bold m-0 text-dark">Transactions</h2>
          <p className="text-muted mb-0 small">Monitor payments and refunds</p>
        </div>
        
        {/* Filters */}
        <div className="d-flex flex-column flex-md-row gap-2">
          <select 
            className="form-select border-0 shadow-sm text-muted" 
            value={statusFilter} 
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="">All Statuses</option>
            <option value="paid">Successful</option>
            <option value="pending">Pending</option>
            <option value="failed">Failed</option>
            <option value="refunded">Refunded</option>
          </select>
          
          <select 
            className="form-select border-0 shadow-sm text-muted" 
            value={dateFilter} 
            onChange={(e) => setDateFilter(e.target.value)}
          >
            <option value="">All Time</option>
            <option value="today">Today</option>
            <option value="7days">Last 7 Days</option>
            <option value="30days">Last 30 Days</option>
          </select>
        </div>
      </div>

      {error && <div className="alert alert-danger shadow-sm border-0">{error}</div>}

      {stats && (
        <div className="row g-4 mb-4">
          <div className="col-md-4">
            <StatsCard 
              title="Total Revenue" 
              value={formattedRevenue} 
              icon="bi-cash-stack" 
              bgColor="success" 
            />
          </div>
          <div className="col-md-4">
            <StatsCard 
              title="Successful Payments" 
              value={stats.successfulPayments} 
              icon="bi-check2-circle" 
              bgColor="primary" 
            />
          </div>
          <div className="col-md-4">
            <StatsCard 
              title="Failed / Refunds" 
              value={`${stats.failedPayments} / ${stats.refunds}`} 
              icon="bi-exclamation-octagon" 
              bgColor="danger" 
            />
          </div>
        </div>
      )}

      {loading ? (
        <Loader />
      ) : (
        <>
          <TransactionTable transactions={transactions} />
          
          <div className="mt-4 d-flex justify-content-between align-items-center">
            <div className="text-muted small">
              Showing <span className="fw-bold text-dark">{transactions.length}</span> of <span className="fw-bold text-dark">{pagination.total}</span> transactions
            </div>
            <Pagination pages={pagination.pages} page={pagination.page} isAdmin={true} />
          </div>
        </>
      )}
    </div>
  );
};

export default Transactions;
