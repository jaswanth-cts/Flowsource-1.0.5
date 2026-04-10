import { Chart as ChartJS } from 'chart.js/auto'
import { Chart } from 'react-chartjs-2'

import { Pie } from "react-chartjs-2";
import ChartDataLabels from "chartjs-plugin-datalabels";

import cssClasses from './CheckmarxCss';

import log from 'loglevel';

const PieChart = ({data}) => {
    const classes = cssClasses();
    const pieChart1 = {
        // labels: ['High', 'Medium', 'Low'],
        labels: data.newIssuesSummary ? Object.keys(data.newIssuesSummary) : [],
        datasets: [
            {
                // data: [40,30,30],
                data: data.newIssuesSummary ? Object.values(data.newIssuesSummary) : [],
                backgroundColor: ["#ee2400","#ffbf00","#238823"],
                borderWidth:0,//remove white space between partition of pie chart
                datalabels: {
                    color: "#ffffff",
                    formatter: function (value, context) {
                        const total = data.newIssuesSummary ?
                            Number(context.dataset.data[0]) + Number(context.dataset.data[1]) +Number(context.dataset.data[2]) : 0;
                        return ((value * 100) / total) >0 ? ((value * 100) / total).toFixed(0)+"%":"";
                    },
                },
            },
        ],
    
    };
    log.info("piechart "+JSON.stringify(data.overallIssuesSummary));
    const pieChart2 = {
        // labels: ['High', 'Medium', 'Low'],
        labels: data.overallIssuesSummary ? Object.keys(data.overallIssuesSummary) : [],
        datasets: [
            {
                // data: [20,50,30],
                data: data.overallIssuesSummary ? Object.values(data.overallIssuesSummary) : [],
                backgroundColor: ["#ee2400","#ffbf00","#238823"],
                borderWidth:0,//remove white space between partition of pie chart
                datalabels: {
                    color: "#ffffff",
                    formatter: function (value, context) {
                        const total = data.overallIssuesSummary ?
                            Number(context.dataset.data[0]) + Number(context.dataset.data[1])+Number(context.dataset.data[2]) : 0;
                        return ((value * 100) / total) >0 ? ((value * 100) / total).toFixed(0)+"%":"";
                    },
                },
            },
        ],
    
    };
    const options = {
        responsive: true,
        maintainAspectRatio: false,
        layout:{
            padding:{
                left: 5,
            },
        },
        plugins: {
            legend: {
                display: true,
                position: 'right', // Position of the legend (you can use 'top', 'bottom', 'left', 'right')
                labels: {
                    boxWidth: 20, // Width of each legend box
                    padding: 10, // Padding between each legend item
                    font: {
                        size: 11, // Font size of the legend text
                        weight: 'bold', // Font weight of the legend text
                    },
                },
            },
            datalabels:{
                precision:6,
            },
        },

    };


    return (
        
        <div className={`row`}>
        <div className={`col-6 `}>
            <p className={`${classes.pHeading1} ms-4`}>New Issues</p>
            <div className={`${classes.pieChart} ms-4`}>
                {!data.newIssuesSummary || Object.values(data.newIssuesSummary).every(value => value === null || value === 0) ?
                    <p className={`${classes.pStyle}`}><strong>No Vulnerabilities Available</strong></p>
                    :
                    <Pie data={pieChart1} options={options} />
                }
            </div>
        </div>


        <div className={`col-6 ${classes.pieChart2}`}>
            <p className={classes.pHeading2}>Overall Issues</p>
            <div className={classes.pieChart}>
                {!data.overallIssuesSummary || Object.values(data.overallIssuesSummary).every(value => value === null || value === 0) ?
                    <p className={`${classes.pStyle}`}><strong>No Vulnerabilities Available</strong></p>
                    :
                    <Pie data={pieChart2} options={options} />
                }
            </div>
        </div>
    </div>
           
    );
}

export default PieChart;
