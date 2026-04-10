import { Chart as ChartJS } from 'chart.js/auto';
import { Chart } from 'react-chartjs-2';

import { Pie } from "react-chartjs-2";

import ChartDataLabels from "chartjs-plugin-datalabels";

import cssClasses from './PrismaCloudCss';

const PieChart = ({ value }) => {
    const classes = cssClasses();
    const data = Object.values(value.results);
    const labels = Object.keys(value.results);
    const pieChart = {
        //labels: ['Critical', 'High', 'Medium', 'Low'],
        labels: labels,
        datasets: [
            {
                // data: [30, 35, 20, 15],
                data: data,
                backgroundColor: ["#238823", "#ee2400", "#ffbf00", "#D16002"],
                borderWidth: 0,//remove white space between partition of pie chart
                datalabels: {
                    color: "#ffffff",
                    formatter: function (value, context) {
                        const total = context.dataset.data.reduce((acc, curr) => acc + curr, 0);
                        return ((value * 100) / total) > 0 ? ((value * 100) / total).toFixed(0) + "%" : "";
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
                right: 40,
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
                        size: 12, // Font size of the legend text
                        weight: 'bold', // Font weight of the legend text
                    },
                },
            },
        },

    };


    return (
        <div>
                <div className={classes.pieChart}>
                {((value === null) && (value.results === null || value.results === undefined) && ((value.results.HIGH === null) || (value.results.HIGH === 0)) && ((value.results.MEDIUM === null) || (value.results.MEDIUM === 0)) && ((value.results.LOW === null) || (value.results.LOW === 0)) && ((value.results.CRITICAL === null) || (value.results.CRITICAL === 0))) ?
                    <p className={`${classes.pStyle}`}><strong>No Data Available</strong></p>
                    : (
                        <Pie data={pieChart} options={options} />
                    )}
            </div>
        </div>


    );
}

export default PieChart;
