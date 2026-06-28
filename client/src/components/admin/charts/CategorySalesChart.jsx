import React from 'react';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend
} from 'chart.js';
import { Doughnut } from 'react-chartjs-2';

ChartJS.register(ArcElement, Tooltip, Legend);

const CategorySalesChart = ({ data }) => {
  const chartData = {
    labels: data.map(d => d.label),
    datasets: [
      {
        data: data.map(d => d.value),
        backgroundColor: [
          'rgba(13, 110, 253, 0.8)', // Primary
          'rgba(25, 135, 84, 0.8)',  // Success
          'rgba(220, 53, 69, 0.8)',  // Danger
          'rgba(255, 193, 7, 0.8)',  // Warning
          'rgba(13, 202, 240, 0.8)', // Info
          'rgba(102, 16, 242, 0.8)'  // Purple
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
        position: 'right',
      }
    },
    cutout: '70%'
  };

  return <Doughnut data={chartData} options={options} />;
};

export default CategorySalesChart;
