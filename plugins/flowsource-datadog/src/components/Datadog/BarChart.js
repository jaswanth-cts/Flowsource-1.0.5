import { useState, useEffect, React } from 'react';

import { Chart as ChartJS } from 'chart.js/auto';
import { Chart } from 'react-chartjs-2';

import { Bar } from 'react-chartjs-2';

import cssClasses from './DatadogCss.js';

const BarChart = ({ values }) => {
  const classes = cssClasses();
  const [isLoading, setLoading] = useState(true);
  const [chartData, setChartData] = useState(null);

  useEffect(() => {
    if (values) {
      setChartData(values);
      setLoading(false);
    }
  }, [values]);
  
  if (!values) {
    return null;
  }


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

  const { stepSize, max } = calculateStepSizeAndMax(
    chartData?.totalRecordsCount,
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

  if (isLoading) {
    return <div className={`App p-3`}>Loading...</div>;
  }
  return (
    <div className={`${classes.cards} `}>
      <h2 className={classes.chartHeading}></h2> {/* Add heading element */}
      {chartData && chartData?.totalRecordsCount > 0 ? (
        <Bar
          data={chartData}
          options={options}
          style={{ height: '250px', width: '400px' }}
        />
      ) : (
        <h6>Loading...</h6>
      )}
    </div>
  );
};

export default BarChart;
