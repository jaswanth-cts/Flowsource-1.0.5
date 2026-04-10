import { Chart as ChartJS } from 'chart.js/auto';
import { Chart } from 'react-chartjs-2';

import { Bar } from "react-chartjs-2";

import cssClasses from './CSPDetailsTwoCss.js';

const CSPDetailsTwoStackedBarGraph = ({respTimeAnalysisBarChartData}) => {

    const classes = cssClasses();

    const customOrder = [
        "Time to First Byte",
        "Dom loading to complete",
        "Initial connection",
        "DOM loading to loaded"
    ];

    const calculateMax = () => {
        let maxValue = 0;
        respTimeAnalysisBarChartData.forEach((item) => {
            if(item.barValue > maxValue) {
                maxValue = item.barValue;
            }
        });
        return maxValue;
    }

    const data = {
        labels: [''],
        datasets: respTimeAnalysisBarChartData.map((value) => {
            return {
                label: value.barName,
                data: [value.barValue],
                backgroundColor: value.barColor,
            };
        })
    }

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        interaction: {
            mode: 'dataset'
        },
        barThickness: 80,
        indexAxis: 'y', // This makes the chart horizontal
        plugins: {
            legend: {
                display: true,
                position: 'right',
                labels: {
                    boxWidth: 14,
                    sort: (a, b) => {
                        return customOrder.indexOf(a.text) - customOrder.indexOf(b.text);
                    }
                },
                font: {
                    size: 10
                },
            },
            datalabels: {
                display: false,
            },
        },
        scales: {
            x: {
                min: 0,
                max: calculateMax(),
                grid: {
                   //drawBorder: false,
                    display: true,
                },
                border: {
                    display: false,
                },
                ticks: {
                    font: {
                        weight: 'bolder',
                        color: 'black',
                        size: 10
                    },
                },
                title: {
                    display: true,
                    text: 'Page Loading Time (ms)',
                    font: {
                        weight: 'bolder',
                        size: 10
                    }
                },
            },
            y: {
                stacked: true,
                beginAtZero: true,
                grid: {
                    //drawBorder: false,
                    display: false,
                },
                border: {
                    display: false,
                },
            }
        },
    }

    return (
        <div className={`${classes.stackedBarGraph}`}>
            <Bar data={data} options={options}></Bar>
        </div>
    );
};

export default CSPDetailsTwoStackedBarGraph;