import { Chart as ChartJS } from 'chart.js/auto';
import { Chart } from 'react-chartjs-2';

import { Bar } from "react-chartjs-2";

const IssueStatusBarChart = ({ values }) => {
    const filteredValues = values.filter(value => value.statusName !== 'All');

    const data = {
        labels: filteredValues.map(value => value.statusName),
        datasets: [
            {
              backgroundColor:"#4db3fe",
              data: filteredValues.map(value => value.statusValue)
            }]
    }

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        barThickness: 25,
        layout: {
            padding: {
              top: 22,
            },
        },
        plugins: {
            legend: {
              display: false,
            },
            datalabels: {
                anchor: 'end',
                align: 'top',
                formatter: Math.round,
                font: {
                    weight: 'bold',
                }
            }
        },
        scales: {
            x: {
                grid: {
                    drawBorder: false,
                    display: false,
                },
                ticks:{
                    font:{
                        weight:'bold',
                        color:'black',
                        size:10
                    },
                },
            },
            y: {
                ticks:{
                    font:{
                        weight:'bold',
                        color:'black',
                    },
                },
                title: {
                    display: true,
                    text: 'Issues',
                    weight:'bold',
                    color:'black',
                }
            },
        }
        
    };
    
    return (
        <div style={{ height: '17rem', padding: '0rem 1.5rem 0rem 0.7rem'}}>
            <Bar data={data} options={options}></Bar>
        </div>
    );
};

export default IssueStatusBarChart;