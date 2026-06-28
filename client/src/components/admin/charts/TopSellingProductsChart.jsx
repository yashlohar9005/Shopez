import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const TopSellingProductsChart = ({ data }) => {
  const chartData = {
    labels: data.map(d => (d.name.length > 15 ? d.name.substring(0, 15) + '...' : d.name)),
    datasets: [
      {
        label: 'Units Sold',
        data: data.map(d => d.totalSold),
        backgroundColor: 'rgba(13, 202, 240, 0.8)', // Info color
        borderRadius: 4,
      }
    ]
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: { precision: 0 }
      },
      x: {
        grid: { display: false }
      }
    }
  };

  return <Bar data={chartData} options={options} />;
};

export default TopSellingProductsChart;
