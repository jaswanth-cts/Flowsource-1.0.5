import { Chart as ChartJS } from 'chart.js/auto';
import { Chart } from 'react-chartjs-2';

import { Bar } from "react-chartjs-2";

import cssClasses from './AccessibilityCSS.js';
// Define the processData constant
const processData = (input) => {
    let barGraphData = [];
    if (!input || input === 0) {
        return barGraphData; // Return an empty array if input is null, undefined, or 0
    }
    if (Array.isArray(input)) {
        // If input is an array of objects
        barGraphData = input;
    } else {
        // If input is a plain object
        barGraphData = Object.keys(input).map(key => ({
            [key]: input[key]
        }));
    }

    return barGraphData;
};
const AccessibilityBarGraph = ({ barGraphData, barColor, yAxisStepSize, yAxisName, xAxisName }) => {
    const classes = cssClasses();
    // Process the barGraphData
    const processedData = processData(barGraphData);
    const data = {
        labels: processedData ? processedData.map(item => Object.keys(item)[0]) : [],
        datasets: [
            {
                data: processedData ? processedData.map(item => Object.values(item)[0]) : [],
                backgroundColor: barColor,

            }
        ]
    };

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        layout: {
            padding: {
                top: 10,
                left: 20,
                right: 10
            },
        },
        plugins: {
            legend: {
                display: false,
            },
            datalabels: {
                display: false,
            }
        },
        scales: {
            x: {
                grid: {
                    drawBorder: false,
                    display: false,
                },
                title: {
                    display: true,
                    text: xAxisName,
                    font: {
                        weight: 'bold',
                        color: 'black',
                        size: 10
                    },
                },
                ticks: {
                    font: {
                        weight: 'bold',
                        color: 'black',
                        size: 10
                    },

                },
            },
            y: {
                title: {
                    display: true,
                    text: yAxisName,
                    font: {
                        weight: 'bold',
                        color: 'black',
                        size: 10
                    },
                },
                ticks: {
                    stepSize: yAxisStepSize,
                    font: {
                        weight: 'bold',
                        color: 'black'
                    },
                },
            },
        }
    };

    const isNoData = !processedData || data.datasets[0].data.every(value => value === null || value === 0 || value === undefined);

    return (
        <div className={`${classes.barGraphDiv}`}>
            {isNoData ? (
                <div className={`${classes.barGraphDiv1}`}>
                <div className={`card ${classes.barGraphDiv2}`}>
                    
                        <h5 className="card-title">No Data Available</h5>
                    </div>
                
                </div>
            ) : (
                <Bar data={data} options={options} style={{ height: '230px' }} />
            )}
        </div>
    );
};

export default AccessibilityBarGraph;

