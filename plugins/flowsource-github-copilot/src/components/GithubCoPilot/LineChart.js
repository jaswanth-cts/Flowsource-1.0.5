import React from 'react';

import { Chart as ChartJS } from 'chart.js/auto';
import { Chart } from 'react-chartjs-2';

import { Line } from 'react-chartjs-2';
import 'chartjs-plugin-annotation';

import cssClasses from './CopilotPageCss';

const LineChart = ({ values, trendDays}) => {
  const classes = cssClasses();
  
  let labels = [];
  let chatsAccepted = [];
  Object.keys(values).forEach((key) => {
    labels.push(values[key].trendDate);
    chatsAccepted.push(values[key].chatsAccepted);
  });

  labels.reverse();
  chatsAccepted.reverse();
  labels = labels.slice(0, trendDays);
  chatsAccepted = chatsAccepted.slice(0, trendDays);

  labels.reverse();
  chatsAccepted.reverse();
  const formattedLabel = [];
  const monthOrder = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  // Converting the Date to DD-MMM-yyyy format
  labels.forEach((value) => {
    const createdDate = new Date(value);
    formattedLabel.push(createdDate.getDate() + '-' + monthOrder[createdDate.getMonth()] + '-' + createdDate.getFullYear());
  });

  const data = {
    labels: formattedLabel,
    datasets: [
      {
        data: chatsAccepted,
        backgroundColor: '#149CFF',
        fill: true,
        borderColor: '#144CFF',
        borderWidth: 1,
        pointBackgroundColor: '#149CFF',
        pointBorderColor: '#149CFF',
        pointStyle: 'circle',
        pointRadius: 2,
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
        ticks: { stepSize: 10, callback: (value) => `${value}` ,
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
        text: '',
        position: 'left',
      },
      legend: {
        display: false, 
      },
    },
  };
 
  const isNoData = Object.values(values).every(value => value === null || value === 0);

  return (
    <div className={`${classes.cards}`}>
      {isNoData ?
        <p className={`${classes.pStyle}`}><strong>No Data Available</strong></p>
        : (
          <Line 
            data={data} 
            options={options}
            style={{ height: '230px' }} />
        )}
    </div>
  );
};

export default LineChart;