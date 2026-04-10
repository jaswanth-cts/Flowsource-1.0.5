import { Chart as ChartJS } from 'chart.js/auto';
import { Chart } from 'react-chartjs-2';

import { Pie } from "react-chartjs-2";

import ChartDataLabels from "chartjs-plugin-datalabels";

import cssClasses from './VeracodeCss';

 
const PieChart = ({ data }) => {
    const classes = cssClasses();
    const pieChart1 = {
        labels: data.flaws_by_severity ? Object.keys(data.flaws_by_severity) : [],
        datasets: [
            {
                data: data.flaws_by_severity ? Object.values(data.flaws_by_severity) : [],
                backgroundColor: ["#ee2400", "#ffbf00", "#238823", "#00aaff", "#aa00ff", "#ff00aa"],
                borderWidth: 0, // remove white space between partition of pie chart
                datalabels: {
                    color: "#ffffff",
                    formatter: function (value, context) {
                        const total = data.flaws_by_severity ?
                            Number(context.dataset.data[0]) + Number(context.dataset.data[1]) +Number(context.dataset.data[2])+Number(context.dataset.data[3]) + Number(context.dataset.data[4]) + Number(context.dataset.data[5]) : 0;
                        return ((value * 100) / total) >0 ? ((value * 100) / total).toFixed(0)+"%":"";
                    },
                },
            },
        ],
    };
 
    const pieChart2 = {
        labels: data.flaw_status ? Object.keys(data.flaw_status) : [],
        datasets: [
            {
                data: data.flaw_status ? Object.values(data.flaw_status) : [],
                backgroundColor: ["#ee2400", "#ffbf00", "#238823", "#00aaff", "#aa00ff", "#ff00aa"],
                borderWidth: 0, // remove white space between partition of pie chart
                datalabels: {
                    color: "#ffffff",
                    formatter: function (value, context) {
                        const total = data.flaw_status ?
                            Number(context.dataset.data[0]) + Number(context.dataset.data[1]) +Number(context.dataset.data[2])+Number(context.dataset.data[3]) : 0;
                        return ((value * 100) / total) >0 ? ((value * 100) / total).toFixed(0)+"%":"";
                    },
                },
            },
        ],
    };
 
    const options = {
        responsive: true,
        maintainAspectRatio: false,
        layout: {
            padding: {
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
            datalabels: {
                precision: 6,
            },
        },
    };
 
    return (
        <div className={`row`}>
            <div className={`col-6 `}>
                <p className={`${classes.pHeading1} ms-4`}>Flaws by severity</p>
                <div className={`${classes.pieChart} ms-4`}>
                    {!data.flaws_by_severity || Object.values(data.flaws_by_severity).every(value=> value === null || value === 0) ?
                        <p className={`${classes.pStyle}`}><strong>No Vulnerabilities Available</strong></p>
                        :
                        <Pie data={pieChart1} options={options} />
                    }
                </div>
            </div>
 
            <div className={`col-6 ${classes.pieChart2}`}>
                <p className={classes.pHeading2}>Flaws by status</p>
                <div className={classes.pieChart}>
                    {!data.flaw_status || Object.values(data.flaw_status).every(value => value === null || value === 0) ?
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