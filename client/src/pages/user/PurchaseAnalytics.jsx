import React, { useEffect, useState } from 'react';
import customerApiService from '../../services/customerApiService';
import Loader from '../../components/Loader';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import { Bar, Pie, Line } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale, LinearScale, BarElement, ArcElement,
  PointElement, LineElement, Title, Tooltip, Legend
);

const PurchaseAnalytics = () => {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const data = await customerApiService.getPurchaseAnalytics();
        setAnalytics(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, []);

  if (loading) return <Loader />;
  if (!analytics) return <div className="alert alert-danger">Failed to load analytics</div>;

  const { monthlySpending, categoryDistribution, stats } = analytics;

  const spendingChartData = {
    labels: monthlySpending.map(d => d.label),
    datasets: [
      {
        label: 'Spent (₹)',
        data: monthlySpending.map(d => d.spent),
        borderColor: '#0d6efd',
        backgroundColor: 'rgba(13, 110, 253, 0.1)',
        tension: 0.4,
        fill: true,
      }
    ]
  };

  const categoryChartData = {
    labels: categoryDistribution.map(d => d.label),
    datasets: [
      {
        data: categoryDistribution.map(d => d.value),
        backgroundColor: [
          'rgba(13, 110, 253, 0.8)',
          'rgba(25, 135, 84, 0.8)',
          'rgba(220, 53, 69, 0.8)',
          'rgba(255, 193, 7, 0.8)',
          'rgba(13, 202, 240, 0.8)'
        ]
      }
    ]
  };

  return (
    <div>
      <h3 className="fw-bold mb-4">Purchase Analytics</h3>

      <div className="row g-4 mb-5">
        <div className="col-12 col-md-4">
          <div className="card shadow-sm border-0 h-100 bg-white">
            <div className="card-body text-center py-4">
              <h6 className="text-muted">Total Products Purchased</h6>
              <h2 className="mb-0 fw-bold">{stats.totalProductsPurchased}</h2>
            </div>
          </div>
        </div>
        <div className="col-12 col-md-4">
          <div className="card shadow-sm border-0 h-100 bg-white">
            <div className="card-body text-center py-4">
              <h6 className="text-muted">Total Amount Spent</h6>
              <h2 className="mb-0 fw-bold text-primary">₹{stats.totalSpent.toLocaleString()}</h2>
            </div>
          </div>
        </div>
        <div className="col-12 col-md-4">
          <div className="card shadow-sm border-0 h-100 bg-white">
            <div className="card-body text-center py-4">
              <h6 className="text-muted">Average Order Value</h6>
              <h2 className="mb-0 fw-bold text-success">₹{Math.round(stats.avgOrderValue || 0).toLocaleString()}</h2>
            </div>
          </div>
        </div>
      </div>

      <div className="row g-4">
        <div className="col-lg-8">
          <div className="card shadow-sm border-0 rounded-3 h-100">
            <div className="card-header bg-white py-3 border-bottom">
              <h6 className="mb-0 fw-bold">Spending History</h6>
            </div>
            <div className="card-body" style={{ height: '350px' }}>
              <Line data={spendingChartData} options={{ maintainAspectRatio: false }} />
            </div>
          </div>
        </div>
        <div className="col-lg-4">
          <div className="card shadow-sm border-0 rounded-3 h-100">
            <div className="card-header bg-white py-3 border-bottom">
              <h6 className="mb-0 fw-bold">Favorite Categories</h6>
            </div>
            <div className="card-body" style={{ height: '350px' }}>
              {categoryDistribution.length > 0 ? (
                <Pie data={categoryChartData} options={{ maintainAspectRatio: false, plugins: { legend: { position: 'bottom' } } }} />
              ) : (
                <p className="text-muted text-center mt-5">No category data available</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PurchaseAnalytics;
