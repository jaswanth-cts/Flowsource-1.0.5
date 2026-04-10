import { React, useState } from 'react'

import cssClasses from './DoraMetricsCss.js'

import { Chart as ChartJS } from 'chart.js/auto';
import { Chart } from 'react-chartjs-2';
import { Line } from 'react-chartjs-2';

import { useApi, configApiRef } from '@backstage/core-plugin-api';
import { useEntity } from '@backstage/plugin-catalog-react';

import { fetchAndUpdateDeploymentTrend } from './DoraMetricsHelper.js';


function ChartjsOne() {
    
  const classes = cssClasses();

  const config = useApi(configApiRef);
  const backendUrl = config.getString('backend.baseUrl');

  const entity = useEntity();
  const appid = entity.entity.metadata.appid;

  const [labels, setLabels] = useState([]);
  const [chartData, setChartData] = useState([]);

  fetchAndUpdateDeploymentTrend(backendUrl, setLabels, setChartData, appid);

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: false
    },
    scales: {
      y: {
        beginAtZero: true,
        offset: false,
        ticks: {
          stepSize: 1
        }
      },
      x: {
        offset: true,
        grid: {
          display: false
        }
      }
  }
  }
  const data = {
    labels,
    datasets: [
      {
        fill: true,
        label: 'Dataset 1',
        data: chartData,
        borderColor: '#121205',
        borderWidth:1,
        backgroundColor: '#CDEAFF',
      }
    ]
  }

  return (
    <div className=
        {`card ${classes.chartCardHeight}
            ${chartData.length === 0 ? `${classes.cardDisabled}` : `${classes.cardEnabled}`}
        `}>
      <div className={`${classes.chart} p-3`}>
        <p>Deployment Frequency Trend</p>
        <Line options={options} data={data} />
      </div>
    </div>
  )
}
export default ChartjsOne
