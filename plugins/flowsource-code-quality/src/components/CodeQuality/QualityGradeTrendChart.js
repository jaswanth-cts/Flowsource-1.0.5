import { Chart as ChartJS } from 'chart.js/auto'
import { Chart } from 'react-chartjs-2'

import { Line } from "react-chartjs-2";


const QualityGradeTrendChart = ({ chartData }) => {

    const data = {
    
        // labels: ['Aug 2023', 'Sep 2023', 'Oct 2023', 'Nov 2023', 'Dec 2023', 'Jan 2024'],
        labels: chartData.map(value => value.date),
        datasets: [
            {
                label: ['Passed'],
                backgroundColor: '#42C023',
                borderColor: '#42C023',
                //data: [18, 20, 24, 24, 26, 30]
                data: chartData.map(value => value.passedData),
            },
            {
                label: ['Failed'],
                backgroundColor: '#F85D5D',
                borderColor: '#F85D5D',
                //data: [18, 16, 15, 10, 8, 5]
                data: chartData.map(value => value.failedData),
            }
        ]
    };

    const options = {
        responsive: true,
        maintainAspectRatio: false,
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
                beginAtZero: true,
                ticks:{
                    font:{
                        weight:'bold',
                        color:'black',
                    },
                },
            }
        },
        plugins: {
            legend: {
                display: true,
                position: 'bottom',
                labels: {
                    boxHeight: 1,
                    padding: 25, 
                },
            },
            datalabels: {
                display: false
            }
        }

    };

    return (
        <div >
            <Line data= {data} options={options} style={{ height: '18rem', padding: '1rem 0.7rem 0.5rem 1rem'}}></Line>
        </div>
    );

};

export default QualityGradeTrendChart;