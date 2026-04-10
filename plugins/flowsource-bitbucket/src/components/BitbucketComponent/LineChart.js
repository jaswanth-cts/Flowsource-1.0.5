import React from 'react';

import { Chart as ChartJS } from 'chart.js/auto'
import { Chart } from 'react-chartjs-2'

import { Line } from 'react-chartjs-2';
import 'chartjs-plugin-annotation';

import cssClasses from './css/BitbucketRepoMainCss';

const LineChart = ({values,count}) => {
  const classes = cssClasses();
const calculateStepSizeAndMax = (dataPointsCount) => {
  let stepSize, max;
  // Set multiples of 5 for the max value
  max = Math.ceil(dataPointsCount / 5) * 5;
  // If max is less than 5, set it to 5
  max = Math.max(max, 5);
  // Set stepSize based on max
  stepSize = max / 5;
  return { stepSize, max };
};
  const data = {
    //labels: ['Aug 2023', 'Sep 2023', 'Oct 2023', 'Nov 2023', 'Dec 2023', 'Jan 2024'],
    labels: values ? Object.keys(values) : [],
    datasets: [
      {
       // data: [10, 15, 13, 18, 20, 27],
       data: values ? Object.values(values) : [],
        backgroundColor: '#ffc4c4',
        fill: true,
        borderColor: 'black',
        borderWidth: 1,
        pointBackgroundColor:'red',
        pointBorderColor:'red',
        pointStyle:'circle',
        pointRadius:4,
        datalabels: {
          align: 'bottom',
          font: {
            size: 10
          }
        }
       
        
      },
    ],
  };
 
 
  const { stepSize, max } = calculateStepSizeAndMax(count);
 
  // Chart options
  const options = {
    responsive: true,
    
    scales: {
      y: {
        beginAtZero: true,
        offset: false,
        max: max,
        ticks: { stepSize: stepSize, callback: (value) => `${value}` ,
        font:{
            weight:'bold',
            color:'black',
        },
    }, // Customize y-axis ticks
      },
      x: {
        offset: true,
        ticks:{
            font:{
                weight:'bold',
                color:'black',
            },
            padding: 10,
        },
        stacked: false, // Set to false to have bars side by side
        grid: {
          display: false
        }
      },
    },
    plugins: {
      annotation: {
        annotations: data.labels.map((label, index) => ({
          type: 'line',
          mode: 'vertical',
          scaleID: 'x',
          value: label,
          borderColor: 'red',
          borderWidth: 1,
          label: {
            content: data.datasets[0].data[index].toString(),
            enabled: true,
            position: 'top',
          },
        })),
      },
      title: {
        display: true,
        text: 'Pull Request',
        position: 'left',
      },
      legend: {
        display: false, // Hide the legend
      },
    },
  };
  const isNoData = values && Object.values(values).every(value => value === null || value === 0);

  return (
    <div className={`${classes.cards}`}>
      {isNoData ? (
        <p className={`${classes.pStyle}`}><strong>No Data Available</strong></p>
      ) : (
        <Line data={data} options={options} style={{ height: '230px' }} />
      )}
    </div>
  );
};
 
export default LineChart;