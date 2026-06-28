import React from 'react';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend
} from 'chart.js';
import { Doughnut } from 'react-chartjs-2';

ChartJS.register(ArcElement, Tooltip, Legend);

const InventoryDoughnutChart = ({ total, lowStock, outOfStock }) => {
  const healthyStock = total - (lowStock + outOfStock);

  const chartData = {
    labels: ['Healthy Stock', 'Low Stock', 'Out of Stock'],
    datasets: [
      {
        data: [healthyStock, lowStock, outOfStock],
        backgroundColor: [
          'rgba(25, 135, 84, 0.8)',  // Success
          'rgba(255, 193, 7, 0.8)',  // Warning
          'rgba(220, 53, 69, 0.8)',  // Danger
        ],
        borderWidth: 1,
      }
    ]
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
      }
    },
    cutout: '65%'
  };

  return <Doughnut data={chartData} options={options} />;
};

export default InventoryDoughnutChart;
