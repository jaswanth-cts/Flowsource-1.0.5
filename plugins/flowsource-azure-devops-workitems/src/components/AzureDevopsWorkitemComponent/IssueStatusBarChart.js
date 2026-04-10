import { Chart as ChartJS } from 'chart.js/auto'
import { Chart } from 'react-chartjs-2'

import { Bar } from "react-chartjs-2";

import cssClasses from './AzureDevopsWoorkitemPageCss';

const IssueStatusBarChart = ({ values }) => {

    const classes = cssClasses();

    const data = {
        labels: values.map(value => value.statusName),
        datasets: [
            {
              backgroundColor: ['#FFC531', '#7DBE3D', '#FF6F31', '#D85309', '#DDD405'],
              data: values.map(value => value.count)
            }]
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
                    text: 'Workitems',
                    weight:'bold',
                    color:'black',
                }
            },
        }
        
    };
    
    return (
        <div className={`${classes.issueStatusBarChart}`}>
            <Bar data={data} options={options}></Bar>
        </div>
    );
};

export default IssueStatusBarChart;
