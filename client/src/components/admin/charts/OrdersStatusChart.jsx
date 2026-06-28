import React from 'react';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend
} from 'chart.js';
import { Pie } from 'react-chartjs-2';

ChartJS.register(ArcElement, Tooltip, Legend);

const OrdersStatusChart = ({ data }) => {
  const statusColors = {
    pending: 'rgba(255, 193, 7, 0.8)',
    processing: 'rgba(13, 202, 240, 0.8)',
    shipped: 'rgba(13, 110, 253, 0.8)',
    delivered: 'rgba(25, 135, 84, 0.8)',
    cancelled: 'rgba(220, 53, 69, 0.8)'
  };

  const chartData = {
    labels: data.map(d => d.label.charAt(0).toUpperCase() + d.label.slice(1)),
    datasets: [
      {
        data: data.map(d => d.value),
        backgroundColor: data.map(d => statusColors[d.label] || 'rgba(108, 117, 125, 0.8)'),
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
    }
  };

  return <Pie data={chartData} options={options} />;
};

export default OrdersStatusChart;
