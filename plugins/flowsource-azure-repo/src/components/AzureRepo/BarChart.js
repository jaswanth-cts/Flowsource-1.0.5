import React from 'react';

import { Chart as ChartJS } from 'chart.js/auto'
import { Chart } from 'react-chartjs-2'

import { Bar } from 'react-chartjs-2';
import cssClasses from './css/AzureRepoMainCss';

const BarChart = ({values = {}, count = 0}) => {
  const classes = cssClasses();
  const data = {
    // labels: ['0-15days', '15-30days', '1-3Months', '>3Months'],
    // labels: values ? Object.keys(values) : [],
    labels: values ? Object.keys(values) : [],
    datasets: [
      {
      backgroundColor: ['#6ed265','#ffc531','#9780f1','#f47d27'],
      borderColor: ['#6ed265','#ffc531','#9780f1','#f47d27'],
      borderWidth: 1,
      hoverBackgroundColor:['#6ed265','#ffc531','#9780f1','#f47d27'],
      hoverBorderColor: ['#6ed265','#ffc531','#9780f1','#f47d27'],
      //data: [20, 30, 15, 10],
      data: values ? Object.values(values) : [],
      },
    ],
  };
 
 const calculateStepSizeAndMax = (dataPointsCount) => {
  let stepSize, max;
  // Set multiples of 5 for the max value
  max = Math.ceil(dataPointsCount / 5) * 5;
  // If max is less than 10, set it to 10
  max = Math.max(max, 5);
 
  // Set stepSize based on max
  stepSize = max / 5;
 
  return { stepSize, max };
};
const { stepSize, max } = calculateStepSizeAndMax(count);
  // Options for the chart
  const options = {
    // responsive: true,
    // maintainAspectRatio: false,
    barThickness: 30,
    scales: {
      x: {
        ticks:{
          font:{
              weight:'bold',
              color:'black',
          },
      },
        stacked: false, // Set to false to have bars side by side
        grid: {
          display: false
        }
      },
      y: {
        ticks:{
          stepSize: stepSize,
          font:{
              weight:'bold',
              color:'black',
          },
      },
        beginZero: true,
        max: max,
      },
    },
    plugins: {
      title: {
        display: true,
        text: 'Aging',
        position: 'left',
      },
      datalabels: {
        anchor: 'end',
        align: 'end',
        font: {
          size: 8
        },
      },
      legend: {
        display: false,
    
      },
    },
  };

  const isNoData = values && Object.values(values).every(value => value === null || value === 0);

  return (
    <div className={`${classes.cards}`}>
     {isNoData?
        <p className={`${classes.pStyle}`}><strong>No Data Available</strong></p>
        : (
          <Bar data={data} options={options} style={{ height: '230px' }} />
        )}
    </div>
   
  );
};

export default BarChart;