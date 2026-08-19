import React from 'react';
import { Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend);

const RiskChart = ({ data = { safe: 0, suspicious: 0, scam: 0 } }) => {
  const chartData = {
    labels: ['Safe', 'Suspicious', 'Scam'],
    datasets: [
      {
        data: [data.safe || 0, data.suspicious || 0, data.scam || 0],
        backgroundColor: ['#388e3c', '#f57c00', '#d32f2f'],
        borderColor: ['#388e3c', '#f57c00', '#d32f2f'],
        borderWidth: 2,
        hoverOffset: 8,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: true,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          padding: 16,
          usePointStyle: true,
          color: 'var(--text-primary)',
        },
      },
      tooltip: {
        callbacks: {
          label: (ctx) => `${ctx.label}: ${ctx.parsed} jobs`,
        },
      },
    },
    cutout: '65%',
  };

  return (
    <div className="card">
      <div className="card-header"><h3>Risk Distribution</h3></div>
      <div className="chart-container">
        <Doughnut data={chartData} options={options} />
      </div>
    </div>
  );
};

export default RiskChart;
