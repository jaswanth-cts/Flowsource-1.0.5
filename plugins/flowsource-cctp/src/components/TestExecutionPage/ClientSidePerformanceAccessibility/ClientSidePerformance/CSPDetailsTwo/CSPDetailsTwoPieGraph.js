import { Chart as ChartJS } from 'chart.js/auto';
import { Chart } from 'react-chartjs-2';

import { Pie } from "react-chartjs-2";

import cssClasses from './CSPDetailsTwoCss.js';

const CSPDetailsTwoPieGraph = ({ pageProfilingPieChartData }) => {

    const classes = cssClasses();

    const colors = ['#ff9f40', '#4bc0c0', '#ff6384', '#ffcd56', '#9966ff', '#c9cbcf', '#36a2eb', '#90d2e6', '#e4b4e0'];
    
    const data = {
        labels: pageProfilingPieChartData.map(value => value.pieName),
        datasets: [
            {
                data: pageProfilingPieChartData.map(value => value.pieValue),
                //Modules will help to get the color for the pie chart in case i exceds size of colors.
                backgroundColor: pageProfilingPieChartData.map((value, i) => colors[i % colors.length]),
            }
        ]
    };

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        layout: {
            padding: {
              top: 20,
              bottom: 30,
            },
        },
        plugins: {
            legend: {
                display: true,
                position: 'right',
                labels: {
                    boxWidth: 14,
                    padding: 15,
                },
                font: {
                    weight: 'bolder',
                }
            },
            datalabels: {
                position: 'outside',
                color: '#000',
                align: 'end',
                anchor: 'end',
                clamp: true,
                font: {
                    weight: 'bold',
                    size: 10,
                },
                formatter: (value, context) => {
                  return context.chart.data.labels[context.dataIndex];
                },
            },
        },
    };

    return (
        <div className={`${classes.pieChartGraph}`}>
            <Pie data={data} options={options}></Pie>
        </div>
    );
};

export default CSPDetailsTwoPieGraph;