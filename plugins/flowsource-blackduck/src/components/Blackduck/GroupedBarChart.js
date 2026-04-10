import React from 'react';
import { Bar } from 'react-chartjs-2';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import Chart from 'chart.js/auto';

Chart.register(ChartDataLabels);

const GroupedBarChart = ({ values }) => {
  
  const getData = (category, severity) => {
    const data = [
      values?.['0-15days']?.[category]?.[severity] || 0,
      values?.['15-30days']?.[category]?.[severity] || 0,
      values?.['1-3Months']?.[category]?.[severity] || 0,
      values?.['grt-thn-3Months']?.[category]?.[severity] || 0,
    ];
    return data;
  };

  const data = {
    labels: ['0-15 days', '15-30 days', '1-3 Months', '>3Months'],
    datasets: [
      {
        label: 'Security - Critical',
        backgroundColor: '#8B0000', // Dark Red
        data: getData('securityRiskProfile', 'CRITICAL'),
        stack: 'Security',
      },
      {
        label: 'Security - High',
        backgroundColor: '#FF6347', // Light Red
        data: getData('securityRiskProfile', 'HIGH'),
        stack: 'Security',
      },
      {
        label: 'Security - Medium',
        backgroundColor: 'yellow',
        data: getData('securityRiskProfile', 'MEDIUM'),
        stack: 'Security',
      },
      {
        label: 'Security - Low',
        backgroundColor: 'green',
        data: getData('securityRiskProfile', 'LOW'),
        stack: 'Security',
      },
      {
        label: 'License - Critical',
        backgroundColor: '#8B0000',
        data: getData('licenseRiskProfile', 'CRITICAL'),
        stack: 'License',
      },
      {
        label: 'License - High',
        backgroundColor: '#FF6347',
        data: getData('licenseRiskProfile', 'HIGH'),
        stack: 'License',
      },
      {
        label: 'License - Medium',
        backgroundColor: 'yellow',
        data: getData('licenseRiskProfile', 'MEDIUM'),
        stack: 'License',
      },
      {
        label: 'License - Low',
        backgroundColor: 'green',
        data: getData('licenseRiskProfile', 'LOW'),
        stack: 'License',
      },
      {
        label: 'Operational - Critical',
        backgroundColor: '#8B0000',
        data: getData('operationalRiskProfile', 'CRITICAL'),
        stack: 'Operational',
      },
      {
        label: 'Operational - High',
        backgroundColor: '#FF6347',
        data: getData('operationalRiskProfile', 'HIGH'),
        stack: 'Operational',
      },
      {
        label: 'Operational - Medium',
        backgroundColor: 'yellow',
        data: getData('operationalRiskProfile', 'MEDIUM'),
        stack: 'Operational',
      },
      {
        label: 'Operational - Low',
        backgroundColor: 'green',
        data: getData('operationalRiskProfile', 'LOW'),
        stack: 'Operational',
      },
    ],
  };

  const options = {
    scales: {
      x: {
        stacked: true,
      },
      y: {
        stacked: true,
      },
    },
    plugins: {
      legend: {
        display: true,
        labels: {
          generateLabels: function (chart) {
            return [
              { text: 'Critical', fillStyle: '#8B0000' },
              { text: 'High', fillStyle: '#FF6347' },
              { text: 'Medium', fillStyle: 'yellow' },
              { text: 'Low', fillStyle: 'green' },
            ];
          },
        },
      },
      tooltip: {
        enabled: true,
      },
      datalabels: {
        display: true,
        align: 'end',
        anchor: 'end',
        formatter: function (value, context) {
          const datasetIndex = context.datasetIndex;
          const categoryIndex = Math.floor(datasetIndex / 4);
          const labels = ['S', 'L', 'O'];
          if (context.datasetIndex % 4 === 0) {
            return labels[categoryIndex];
          }
          return '';
        },
        color: 'black',
        font: {
          weight: 'bold',
        },
        padding: {
          top: 3, 
        },
      },
    },
  };

  return <Bar data={data} options={options} />;
};

export default GroupedBarChart;
