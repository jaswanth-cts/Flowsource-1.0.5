import React from 'react';

import { Chart as ChartJS } from 'chart.js/auto';
import { Chart } from 'react-chartjs-2';

import { Bar } from 'react-chartjs-2';

import cssClasses from './VeracodeCss';

import log from 'loglevel';


const GroupedBarChart = ({ values }) => {
  const classes = cssClasses();
  const data = {
    // labels: ['0-15days', '15-30days', '1-3Months', '>3Months'],
    labels: values.vulnerabilityAsOfCurrentDate ? Object.keys(values.vulnerabilityAsOfCurrentDate) : [],
    datasets: [
      {
        label: 'High',
        backgroundColor: '#ee2400',
        //data: [100, 300, 200, 400],
        data: values.vulnerabilityAsOfCurrentDate ? Object.values(values.vulnerabilityAsOfCurrentDate).map(item => item.High) : [],
      },
      {
        label: 'Medium',
        backgroundColor: '#ffbf00',
        // data: [200, 400, 300, 500],
        data: values.vulnerabilityAsOfCurrentDate ?  Object.values(values.vulnerabilityAsOfCurrentDate).map(item => item.Medium) : [],
      },
      {
        label: 'Low',
        backgroundColor: '#238823',
        //data: [400, 200, 100, 300],
        data: values.vulnerabilityAsOfCurrentDate ? Object.values(values.vulnerabilityAsOfCurrentDate).map(item => item.Low) : [],
      },
    ],
  };
  log.info("grouped bar chart " + JSON.stringify(values.vulnerabilityAsOfCurrentDate));
  // Options for the chart
  const options = {
    responsive: true,
    maintainAspectRatio: false,
    barThickness: 20,
    scales: {
      x: {
        stacked: false, // Set to false to have bars side by side
        grid: {
          display: false
        }
      },
      y: {
        stacked: false,
        grid: {
          display: false
        }
      },
    },
    plugins: {
      datalabels: {
        anchor: 'end',
        align: 'end',
        font: {
          size: 8
        },
      },
      legend: {
        display: true,
        position: 'top', // Position of the legend (you can use 'top', 'bottom', 'left', 'right')
        labels: {
          boxWidth: 20, // Width of each legend box
          padding: 10, // Padding between each legend item
          font: {
            size: 12, // Font size of the legend text
            weight: 'bold', // Font weight of the legend text
          },
        },
      },
    },
  };

  const isNoData = !values.vulnerabilityAsOfCurrentDate || Object.values(values.vulnerabilityAsOfCurrentDate).every(item => Object.values(item).every(value => value === null || value === 0));

  return (
    <div className={classes.cardStyle}>
     {isNoData?
        <p className={`${classes.pStyle}`}><strong>No Vulnerabilities Available</strong></p>
        : (
          <Bar data={data} options={options} style={{ height: '230px' }} />
        )}
    </div>
  );
};

export default GroupedBarChart;