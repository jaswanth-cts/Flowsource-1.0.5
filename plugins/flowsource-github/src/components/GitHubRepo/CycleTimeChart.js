import React from 'react';
import { Line } from 'react-chartjs-2';
import 'chartjs-plugin-annotation';
import cssClasses from './css/GitHubRepoMainCss';

const CycleTimeChart = ({ data, count }) => {
  const classes = cssClasses();
  const calculateStepSizeAndMax = (dataPointsCount) => {
    let stepSize, max;
    max = Math.ceil(dataPointsCount / 5) * 5;
    max = Math.max(max, 5);
    stepSize = max / 5;
    return { stepSize, max };
  };

  const values = data && data.monthlyCounts ? data.monthlyCounts : {};
  const { stepSize, max } = calculateStepSizeAndMax(count);

  const chartData = {
    labels: values ? Object.keys(values) : [],
    datasets: [
      {
        data: values ? Object.values(values) : [],
        backgroundColor: '#ffc4c4',
        fill: true,
        borderColor: 'black',
        borderWidth: 1,
        pointBackgroundColor: 'red',
        pointBorderColor: 'red',
        pointStyle: 'circle',
        pointRadius: 4,
        datalabels: {
          align: 'bottom',
          font: {
            size: 10
          }
        }
      },
    ],
  };

  const options = {
    responsive: true,
    scales: {
      y: {
        beginAtZero: true,
        offset: false,
        max: max,
        ticks: { stepSize: stepSize, callback: (value) => `${value}`, font: { weight: 'bold', color: 'black' } },
      },
      x: {
        offset: true,
        ticks: { font: { weight: 'bold', color: 'black' }, padding: 10 },
        stacked: false,
        grid: { display: false }
      },
    },
    plugins: {
      annotation: {
        annotations: chartData.labels.map((label, index) => ({
          type: 'line',
          mode: 'vertical',
          scaleID: 'x',
          value: label,
          borderColor: 'red',
          borderWidth: 1,
          label: {
            content: chartData.datasets[0].data[index].toString(),
            enabled: true,
            position: 'top',
          },
        })),
      },
      title: { display: true, text: 'Pull Request', position: 'left', padding: {
        top: 10, 
        bottom: 0
      } },
      legend: { display: false },
    },
  };

  const isNoData = values && Object.values(values).every(value => value === null || value === 0);

  return (
    <div className={`${classes.cards}`}>
      {isNoData ? (
        <p className={`${classes.pStyle}`}><strong>No Data Available</strong></p>
      ) : (
        <Line data={chartData} options={options} style={{ height: '230px' }} />
      )}
    </div>
  );
};

export default CycleTimeChart;