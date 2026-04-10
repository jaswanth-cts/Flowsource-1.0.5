import React from 'react';

import { Chart as ChartJS } from 'chart.js/auto'
import { Chart } from 'react-chartjs-2'

import { Bar } from 'react-chartjs-2';
import cssClasses from './DynatraceCss.js';

const BarChart = ({ values }) => {
  const classes = cssClasses();
  const data = {
    labels: values.labels.map(value => value),
    datasets: [
      {
        backgroundColor: ['#FB6868'],
        borderColor: ['#FB6868'],
        borderWidth: 1,
        hoverBackgroundColor: ['#FB6868'],
        hoverBorderColor: ['#FB6868'],
        data: values.datasets.map(value => value)
      },
    ],
  };

  //push daywise data to data variable
  const calculateStepSizeAndMax = dataPointsCount => {
    let stepSize, max;
    // Set multiples of 5 for the max value
    max = Math.ceil(dataPointsCount / 5) * 5;
    // If max is less than 10, set it to 10
    max = Math.max(max, 5);

    // Set stepSize based on max
    stepSize = max / 5;

    return { stepSize, max };
  };
  const totalerrorrecords = values.datasets.reduce((accumulator, currentvalue) =>
    accumulator + currentvalue, 0
  );

  const { stepSize, max } = calculateStepSizeAndMax(
    totalerrorrecords
  );

  // Options for the chart
  const options = {
    barThickness: 30,
    scales: {
      x: {
        ticks: {
          font: {
            weight: 'bold',
            color: 'black',
          },
        },
        stacked: false, // Set to false to have bars side by side
        grid: {
          display: false,
        },
      },
      y: {
        ticks: {
          stepSize: stepSize,
          font: {
            weight: 'bold',
            color: 'black',
          },
        },
        max: max,
        beginZero: true,
      },
    },
    plugins: {
      title: {
        display: true,
        text: 'Errors Count',
        position: 'left',
      },
      datalabels: {
        anchor: 'end',
        align: 'end',
        font: {
          size: 8,
        },
      },
      legend: {
        display: false,
      },
    },
  };

  return (
    <div className={`${classes.cards}`}>
      <h2 className={classes.chartHeading}></h2> {/* Add heading element */}
      <Bar
        data={data}
        options={options}
        style={{ height: '250px', width: '400px' }} />

    </div>
  );
};

export default BarChart;