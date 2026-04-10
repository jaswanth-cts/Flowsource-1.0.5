import React from 'react';

import { Chart as ChartJS } from 'chart.js/auto';
import { Chart } from 'react-chartjs-2';

import { Line } from 'react-chartjs-2';

import 'chartjs-plugin-annotation';
import cssClasses from './CopilotPageCss';

const UserChart = ({ values, trendDays }) => {
  const classes = cssClasses();

  let labels = [];
  let activeUsers = [];
  let activeChatUsers = [];
  Object.keys(values).forEach((key) => {
    labels.push(values[key].trendDate);
    activeUsers.push(values[key].totalActiveUsers);
    activeChatUsers.push(values[key].totalActiveChatUsers);
  });

  labels.reverse();
  activeUsers.reverse();
  activeChatUsers.reverse();
  
  labels = labels.slice(0, trendDays);
  activeUsers = activeUsers.slice(0, trendDays);
  activeChatUsers = activeChatUsers.slice(0, trendDays);

  labels.reverse();
  activeUsers.reverse();
  activeChatUsers.reverse();
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
        data: activeUsers,
        label: 'Active users',
        backgroundColor: '#7DBE3D',
        fill: false,
        borderColor: '#7DBE3D',
        borderWidth: 2,
        pointBackgroundColor: '#7DBE3D',
        pointBorderColor: '#7DBE3D',
        pointStyle: 'circle',
        pointRadius: 2,
        yAxisID: 'y',
        datalabels: {
          align: 'bottom',
          font: {
            size: 10
          }
        }
      },
      {
        data: activeChatUsers,
        label: 'Active chat users',
        backgroundColor: '#DB3E3E',
        fill: false,
        borderColor: '#DB3E3E',
        borderWidth: 2,
        pointBackgroundColor: '#DB3E3E',
        pointBorderColor: '#DB3E3E',
        pointStyle: 'circle',
        pointRadius: 2,
        yAxisID: 'y1',
        datalabels: {
          align: 'bottom',
          font: {
            size: 10
          }
        }
      }
    ]
  };

  const options = {
    responsive: true,
    interaction: {
      mode: 'index',
      intersect: false,
    },
    stacked: false,
    plugins: {
      title: {
        display: true,
        text: '',
      },
      legend: {
        display: true,
        align: "end",
        position: "top",
        labels: {
          usePointStyle: true
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        type: 'linear',
        display: true,
        position: 'left',
        ticks: {
          stepSize: 2
        }
      },
      y1: {
        beginAtZero: true,
        type: 'linear',
        display: false,
        position: 'right',
        grid: {
          drawOnChartArea: true,
        },
        ticks: {
          stepSize: 2
        }
      },
    }
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

export default UserChart;