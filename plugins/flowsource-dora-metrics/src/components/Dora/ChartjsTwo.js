import { React, useState, useEffect } from 'react'

import cssClasses from './DoraMetricsCss.js'

import { Chart as ChartJS } from 'chart.js/auto';
import { Chart } from 'react-chartjs-2';
import { Line } from 'react-chartjs-2';

import { useApi, configApiRef, fetchApiRef } from '@backstage/core-plugin-api';

import { useEntity } from '@backstage/plugin-catalog-react';
import { fetchAndUpdateChangeFailureTrend, fetchAndUpdateDeploymentTrend, fetchAndUpdateLeadTimeTrend, fetchAndUpdateMeanTimeTrend } from './DoraMetricsHelper.js';

import log from 'loglevel';

const ChartjsTwo = (props) => {

  const classes = cssClasses();

  const { fetch } = useApi(fetchApiRef);

  const config = useApi(configApiRef);
  const backendUrl = config.getString('backend.baseUrl');

  const entity = useEntity();
  const appid = entity.entity.metadata.appid;

  const [labels, setLabels] = useState([]);
  const [chartData, setChartData] = useState([]);
  const [chartBgColor, setChartBgColor] = useState([]);
  const [chartYscaleTitle, setChartYscaleTitle] = useState([]);
  const [chartYscaleTicks, setChartYscaleTicks] = useState({});
  

  const chartConfig = { setLabels, setChartData, appid, title: props.title, setChartBgColor, setChartYscaleTitle, setChartYscaleTicks };

  useFetchAndUpdateData(fetch, backendUrl, chartConfig);
  
  log.info(labels);

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
        title: chartYscaleTitle,
        ticks: chartYscaleTicks
      },
      x: {
        offset: true,
        grid: {
          display: false
        },
        ticks: {
          padding: 10
        }
      }
    }
  }
  const data = {
    labels,
    datasets: [
      {
        fill: true,
        label: props.title,
        data: chartData,
        borderColor: '#121205',
        borderWidth: 1,
        backgroundColor: chartBgColor,
        datalabels: {
          align: 'bottom',
          font: {
            size: 10
          }
        }
      }
    ]
  }

  return (
    <div className=
      {`card ${classes.cardBorderRadius} ${classes.chartCardHeight}
            ${chartData.length === 0 ? `${classes.cardDisabled}` : `${classes.cardEnabled}`}
        `}>
      <div className={`${classes.chart} p-3`}>
        <p>{props.title} - Trend</p>
        <Line options={options} data={data} />
      </div>
    </div>
  )
}

export default ChartjsTwo;

/**
 * Fetch and update data for the charts
 * 
 * Example:
 *
 *  Labels: ['Aug-2023', 'Sep-2023', 'Oct-2023', 'Nov-2023', 'Dec-2023', 'Jan-2024']
 * 
 *  Deployment Frequency Chart Data: [7, 5, 6, 7, 6, 5]
 *  Lead Time Chart Data:            [100.18, 92.8, 83.26, 109.7, 113.78, 73.2]
 *  Mean Time Chart Data:            [4, 7, 5, 6, 5, 3]
 *  Change Failure Rate Chart Data:  [19, 17, 25, 27, 21, 10]
 * 
 */
function useFetchAndUpdateData(fetch, backendUrl, chartConfig) {

  const { setLabels, setChartData, appid, title, setChartBgColor, setChartYscaleTitle, setChartYscaleTicks } = chartConfig;
  
  useEffect(() => {
    const fetchData = async () => {
      switch (title) {
        case 'Deployment Frequency':
          fetchAndUpdateDeploymentTrend(fetch, backendUrl, setLabels, setChartData, appid);
          setChartYscaleTitle({display: true,text: "Deployments"})
          return setChartBgColor('#CDEAFF');
        case 'Lead Time For Changes':
          fetchAndUpdateLeadTimeTrend(fetch, backendUrl, setLabels, setChartData, appid);
          setChartYscaleTitle({display: true,text: "Days"})
          return setChartBgColor('#D7CDFF');
        case 'Mean Time To Recover':
          fetchAndUpdateMeanTimeTrend(fetch, backendUrl, setLabels, setChartData, appid);
          setChartYscaleTitle({display: true,text: "Hours"})
          return setChartBgColor('#E0FFEC');
        case 'Change Failure Rate':
          fetchAndUpdateChangeFailureTrend(fetch, backendUrl, setLabels, setChartData, appid);
          setChartYscaleTitle({display: true,text: "Percentage"})
          setChartYscaleTicks({min: 0,max: 100,callback: function(value){return value+ "%"}})
          return setChartBgColor('#FFE5E5');
        default:
          return setChartBgColor('#CDEAFF');
      }
    }

    fetchData();
  }, [fetch, backendUrl, setLabels, setChartData, appid, title, setChartBgColor, setChartYscaleTitle, setChartYscaleTicks]);
  
}
