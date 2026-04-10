import React from 'react';

import { Chart as ChartJS } from 'chart.js/auto';
import { Chart } from 'react-chartjs-2';
import { Bar } from 'react-chartjs-2';

import cssClasses from './CopilotPageCss';

const BarChart = ({values, chartType}) => {
  const classes = cssClasses();
  const labels = [];
  const suggestionsCount = [];
  const linesSuggested = [];
  const acceptancesCount = [];
  const linesAccepted = [];
  Object.keys(values).forEach((key) => {
    if (chartType === 'language') {
      labels.push(values[key].language);
    } else {
      labels.push(values[key].editor);
    }
    suggestionsCount.push(values[key].suggestionsCount);
    linesSuggested.push(values[key].linesSuggested);
    acceptancesCount.push(values[key].acceptancesCount);
    linesAccepted.push(values[key].linesAccepted);
  });
  const data = {
    labels: labels,
    suggestionsCount: {
      label: "Suggestions count",
      dataSet: suggestionsCount
    },
    linesSuggested: {
      label: "Lines suggested",
      dataSet: linesSuggested
    },
    acceptancesCount: {
      label: "Acceptances count",
      dataSet: acceptancesCount
    },
    linesAccepted: { 
      label: "Lines accepted",
      dataSet: linesAccepted
    } 
  };
const isNoData = Object.values(values).every(value => value === null || value === 0);

  return (
    <div className={`${classes.cards}`}>
     {isNoData?
        <p className={`${classes.pStyle}`}><strong>No Data Available</strong></p>
        : (
          <Bar
            pointStyle="star"  
            data={{
            labels: data.labels,
            responsive: true,
            offset: true,
            datasets: [
              {
                label: "Suggestions count",
                pointStyle: "rectRounded",
                backgroundColor: "#FE5D26",
                barThickness: 25,
                stack: 1,
                categoryPercentage: 1,
                data: data.suggestionsCount.dataSet 
              },
              {
                label: "Lines suggested",
                backgroundColor: "#F3B61F",
                barThickness: 25,
                stack: 1,
                categoryPercentage: 1,
                pointStyle: "rectRounded",
                data: data.linesSuggested.dataSet,
              },
              {
                label: "Acceptances count",
                pointStyle: "rectRounded",
                backgroundColor: "#710085",
                barThickness: 25,
                stack: 2,
                categoryPercentage: 1,
                data: data.acceptancesCount.dataSet 
              },
              {
                label: "Lines accepted",
                backgroundColor: "#32BBCD",
                barThickness: 25,
                stack: 2,
                categoryPercentage: 1,
                pointStyle: "rectRounded",
                data: data.linesAccepted.dataSet 
              }
            ]
          }} 
          options={ {
            offsetGridLines: false,
            // drawTicks: true,
            layout: {
              padding: {
                top: 30,
                right: 40
              }
            },
            responsive: true,
            maintainAspectRatio: false,
            scales: {
              x: {
                  stacked: true,
                  ticks: {
                    padding: 5,
                  },
                  gridLines: {
                    display: false
                  }
                },
              y: {
                  stacked: true,
                  gridLines: {
                    drawBorder: false
                  },
                  ticks: {
                    stepSize: 250,
                    beginAtZero: true,
                    padding: 20
                  }
                }
              },
            plugins: {
              legend: {
                display: true,
                align: "center",
                position: "bottom",
                labels: {
                  usePointStyle: true
                }
              }
            }
          } }
          style={{ height: '500px' }} />
          
          
        )}
    </div>
   
  );
};

export default BarChart;