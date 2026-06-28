import { useState, useEffect, useCallback } from 'react';
import dashboardApiService from '../services/dashboardApiService';

/**
 * Custom hook to poll the live dashboard data every 30 seconds.
 */
const useLiveDashboard = (intervalMs = 30000) => {
  const [data, setData] = useState({
    summary: null,
    revenue: null,
    orders: null,
    products: null,
    customers: null,
    inventory: null,
    activity: null,
    analytics: null
  });
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(new Date());

  const fetchAllData = useCallback(async (isPolling = false) => {
    try {
      if (!isPolling) setLoading(true);
      setError(null);
      
      const [
        summaryRes,
        revenueRes,
        ordersRes,
        productsRes,
        customersRes,
        inventoryRes,
        activityRes,
        analyticsRes
      ] = await Promise.all([
        dashboardApiService.getSummary(),
        dashboardApiService.getRevenue(),
        dashboardApiService.getOrders(),
        dashboardApiService.getProducts(),
        dashboardApiService.getCustomers(),
        dashboardApiService.getInventory(),
        dashboardApiService.getActivity(),
        dashboardApiService.getAnalytics()
      ]);

      setData({
        summary: summaryRes,
        revenue: revenueRes,
        orders: ordersRes,
        products: productsRes,
        customers: customersRes,
        inventory: inventoryRes,
        activity: activityRes,
        analytics: analyticsRes
      });
      
      setLastUpdated(new Date());
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to fetch dashboard data');
      console.error("Dashboard Fetch Error", err);
    } finally {
      if (!isPolling) setLoading(false);
    }
  }, []);

  useEffect(() => {
    // Initial fetch
    fetchAllData();

    // Setup polling interval
    const intervalId = setInterval(() => {
      fetchAllData(true);
    }, intervalMs);

    return () => clearInterval(intervalId);
  }, [fetchAllData, intervalMs]);

  return { data, loading, error, lastUpdated, refetch: fetchAllData };
};

export default useLiveDashboard;
