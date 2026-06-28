import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Filler,
  Legend,
} from 'chart.js';
import { Line } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Filler,
  Legend
);

const RevenueChart = ({ data }) => {
  if (!data || data.length === 0) return <div>No data available</div>;

  const chartData = {
    labels: data.map(d => d.label),
    datasets: [
      {
        fill: true,
        label: 'Revenue (₹)',
        data: data.map(d => d.value),
        borderColor: '#6C63FF', // var(--color-primary)
        backgroundColor: 'rgba(108, 99, 255, 0.2)',
        tension: 0.4,
        pointBackgroundColor: '#6C63FF',
        pointBorderColor: '#fff',
        pointHoverBackgroundColor: '#fff',
        pointHoverBorderColor: '#6C63FF',
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            let label = context.dataset.label || '';
            if (label) {
              label += ': ';
            }
            if (context.parsed.y !== null) {
              label += new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(context.parsed.y);
            }
            return label;
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: function(value) {
            if (value >= 100000) {
              return '₹' + (value / 100000) + 'L';
            }
            if (value >= 1000) {
              return '₹' + (value / 1000) + 'k';
            }
            return '₹' + value;
          }
        },
        grid: {
          color: 'rgba(0, 0, 0, 0.05)'
        }
      },
      x: {
        grid: {
          display: false
        }
      }
    },
  };

  return (
    <div style={{ height: '300px', width: '100%' }}>
      <Line options={options} data={chartData} />
    </div>
  );
};

export default RevenueChart;
