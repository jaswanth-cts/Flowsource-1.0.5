import { Chart as ChartJS } from 'chart.js/auto';
import { Chart } from 'react-chartjs-2';

import { Bar } from "react-chartjs-2";

const RequestByPriorityBarChart = ({ values }) => {
    const generateRandomColor = () => {
        const letters = '0123456789ABCDEF';
        let color = '#';
        for (let i = 0; i < 6; i++) {
            color += letters[Math.floor(Math.random() * 16)];
        }
        return color;
    };

    const data = {
        labels: values.chartLabels.map(value => value),
        datasets: Object.keys(values).filter(key => key !== 'chartLabels').map(issueType => ({
            label: [issueType],
            backgroundColor: generateRandomColor(),
            data: values[issueType].map(value => value)
        }))
    };

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
                    padding: 10,
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
                ticks: {
                    font: {
                        weight: 'bold',
                        color: 'black',
                    },
                },
            },
            y: {
                stacked: true,
                ticks: {
                    font: {
                        weight: 'bold',
                        color: 'black',
                    },
                },
            },
        }
    };

    return (
        <div style={{ height: '17rem', padding: '1rem 1rem 0.5rem 1rem', }}>
            <Bar data={data} options={options}></Bar>
        </div>
    );
};

export default RequestByPriorityBarChart;