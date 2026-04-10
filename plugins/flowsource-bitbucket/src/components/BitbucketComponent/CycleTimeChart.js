import React from 'react';
import { Line } from 'react-chartjs-2';
import 'chartjs-plugin-annotation';
import cssClasses from './css/BitbucketRepoMainCss';
const CycleTimeChart = ({ data, count }) => {
  const classes = cssClasses();

  // Extract average cycle times and check for no data
  const values =
    data && data.monthlyAvgCycleTimes ? data.monthlyAvgCycleTimes : {};
  const isNoData = values && Object.values(values).every(value => value === 0);

  // Calculate step size and max for the Y-axis
  const calculateStepSizeAndMax = dataPoints => {
    const max = Math.ceil(Math.max(...dataPoints) * 1.2); // Add 20% buffer to the max value
    const stepSize = max / 5; // Divide into 5 steps
    return { stepSize, max };
  };

  const { stepSize, max } = calculateStepSizeAndMax(Object.values(values));

  // Prepare chart data
  const chartData = {
    labels: values ? Object.keys(values) : [],
    datasets: [
      {
        data: values ? Object.values(values) : [],
        backgroundColor: 'rgb(255, 196, 196)',
        fill: true,
        borderColor: 'black',
        borderWidth: 1,
        pointBackgroundColor: 'red',
        pointBorderColor: 'red',
        pointStyle: 'circle',
        pointRadius: 4,
      },
    ],
  };

  // Chart options
  const options = {
    responsive: true,
    scales: {
      y: {
        beginAtZero: true,
        offset: false,
        max: max,
        ticks: {
          stepSize: stepSize,
          callback: value => `${value.toFixed(2)} days`, // Display values in days
          font: { weight: 'bold', color: 'black' },
          padding: 0,
        },
        title: {
          display: true,
          text: 'Avg PR Cycle Time (days)',
          font: { weight: 'bold', size: 12 },
        },
      },
      x: {
        beginAtZero: true,
        offset: true,
        ticks: {
          font: { weight: 'bold', color: 'black' },
          padding: 0,
        },
        grid: {
          display: false,
        },
        title: {
          display: true,
          text: 'Created Date',
          font: { weight: 'bold', color: 'black' },
        },
      },
    },
    plugins: {
      annotation: {
        annotations: chartData.labels.map((label, index) => ({
          type: 'line',
          mode: 'vertical',
          scaleID: 'x',
          value: label,
          borderColor: 'blue',
          borderWidth: 1,
          label: {
            content: chartData.datasets[0].data[index]?.toFixed(2) || '',
            enabled: true,
            position: 'top',
          },
        })),
      },
      legend: { display: false },
    },
  };

  // Render the chart or a "No Data Available" message
  return (
    <div className={`${classes.cards}`}>
      {isNoData ? (
        <p className={`${classes.pStyle}`}>
          <strong>No Data Available</strong>
        </p>
      ) : (
        <Line data={chartData} options={options} style={{ height: '230px' }} />
      )}
    </div>
  );
};

export default CycleTimeChart;
