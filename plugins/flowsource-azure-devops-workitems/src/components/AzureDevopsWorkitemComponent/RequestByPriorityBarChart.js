import { Chart as ChartJS } from 'chart.js/auto'
import { Chart } from 'react-chartjs-2'

import { Bar } from "react-chartjs-2";

import cssClasses from './AzureDevopsWoorkitemPageCss';

const RequestByPriorityBarChart = ({values}) => {

    const classes = cssClasses();

    const data = {
        labels: ['1', '2', '3', '4'],
        datasets: values.map(value => (
                {
                        label: [value.type],
                        backgroundColor: [value.color],
                        data: value.typeValues,
                }
            ))    
    }

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        barThickness: 40,
        layout: {
            padding: {
              top: 22,
            },
        },
        plugins: {
            legend: {
              display: true,
              position: 'right',
              labels: {
                    boxWidth: 13,
                    padding: 5, 
              },
            },
            datalabels: {
                anchor: 'end',
                align: 'top',
                font: {
                    weight: 'bold',
                },
                formatter: (value, ctx) => {
                    const stackedValues = ctx.chart.data.datasets.map(
                        (ds) => ds.data[ctx.dataIndex]
                      );
                      const dsIdxLastVisibleNonZeroValue = stackedValues.reduce(
                        (prev, curr, i) =>
                          !!curr && !ctx.chart.getDatasetMeta(i).hidden
                            ? Math.max(prev, i)
                            : prev,
                        0
                      );
                      if (!!value && ctx.datasetIndex === dsIdxLastVisibleNonZeroValue) {
                        return stackedValues
                          .filter((ds, i) => !ctx.chart.getDatasetMeta(i).hidden)
                          .reduce((sum, v) => sum + v, 0);
                      } else {
                        return '';
                      }
                },
            },
        },
        scales: {
            x: {
                stacked: true,
                grid: {
                    drawBorder: false,
                    display: false,
                },
                ticks:{
                    font:{
                        weight:'bold',
                        color:'black',
                    },
                },
            },
            y: {
                stacked: true,
                ticks:{
                    font:{
                        weight:'bold',
                        color:'black',
                    },
                },
            },
        }
        
    };
    
    return (
        <div className={`${classes.reqByPriorityChart}`}>
            <Bar data={data} options={options}></Bar>
        </div>
    );
};

export default RequestByPriorityBarChart;
