import { Chart as ChartJS } from 'chart.js/auto';
import { Chart } from 'react-chartjs-2';

import { Bar } from "react-chartjs-2";

import cssClasses from './CSPDetailsOneCss.js';

const CSPDetailsOneBarGraph = ({ performaceBarChartData }) => {

    const classes = cssClasses();

    const data = {
        labels: performaceBarChartData.map(value => value.barName),
        datasets: [
            {
              data: performaceBarChartData.map(value => value.barValue),
              backgroundColor: '#20b2aa',
            }]
    }

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        barThickness: 80,
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
                        color:'black'
                    },
                },
            },
        }
        
    };
    
    return (
        <div className={`${classes.barGraph}`}>
            <Bar data={data} options={options}></Bar>
        </div>
    );
};

export default CSPDetailsOneBarGraph;