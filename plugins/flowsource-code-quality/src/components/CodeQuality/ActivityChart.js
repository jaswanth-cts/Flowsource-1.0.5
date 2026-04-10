import { Chart as ChartJS } from 'chart.js/auto'
import { Chart } from 'react-chartjs-2'

import { Line } from "react-chartjs-2";

const ActivityChart = ({chartData , showUpdatedLabels }) => {

    const data = {
        //labels: ['Aug 2023', 'Sep 2023', 'Oct 2023', 'Nov 2023', 'Dec 2023', 'Jan 2023'],
        labels: chartData.map(value => value.date),
        datasets: [
            {
                label: showUpdatedLabels ? ['Reliability'] : ['Bugs'] ,
                backgroundColor: '#613BF8',
                borderColor: '#613BF8',
                data: chartData.map(value => value.bugsData),
            },
            {
                label: showUpdatedLabels ? ['Maintainability'] :['Code Smells'],
                backgroundColor: '#149CFF',
                borderColor: '#149CFF',
                data: chartData.map(value => value.codeSmellData),
            },
            {
                label: showUpdatedLabels ? ['Security'] :['Vulnerabilities'],
                backgroundColor: '#DC42E9',
                borderColor: '#DC42E9',
                data: chartData.map(value => value.vulnerabilityData),
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
                    stepSize: 10,
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
        },
    };

    return (
        <div>
            {/* <Line data= {data} options={options} style={{ height: '18rem', width: '26rem', padding: '1rem 0rem 0.2rem 1rem'}}></Line> */}
             <Line data= {data} options={options} style={{ height: '18rem', padding: '1rem 0.7rem 0.5rem 1rem'}}></Line>
        </div>
    );
};

export default ActivityChart;