import React, { useState } from 'react';

import { Chart as ChartJS } from 'chart.js/auto';
import { Chart } from 'react-chartjs-2';

import { Line } from "react-chartjs-2";

import cssClasses from '../TestingMainPageCSS.js';

const LineChart = ({ values, dropdownOptionsTrendByDate, dropdownOptionsTrendByExecution, handleDropdownChangeTrendByDate, handleDropdownChangeTrendByExecution, isLoadingTrendByDate, isLoadingTrendByExecution }) => {
    const classes = cssClasses();
    const [dropdownValueDays, setDropdownValueDays] = useState('All'); // Default to 'All'
    const [dropdownValueExecution, setDropdownValueExecution] = useState('All'); // Default to 'All'

    // Handle dropdown change for Days
    const handleDropdownChangeDays = (event) => {
        setDropdownValueDays(event.target.value);
        handleDropdownChangeTrendByDate(event);
    };

    // Handle dropdown change for Execution
    const handleDropdownChangeExecution = (event) => {
        setDropdownValueExecution(event.target.value);
        handleDropdownChangeTrendByExecution(event);
    };

    const filteredValuesDays = Array.isArray(values.trendByDateData) ? values.trendByDateData : [];
    const filteredValuesExecution = Array.isArray(values.trendByExecutionData) ? values.trendByExecutionData : [];

    // Define a color palette
    const colors = ['#4CAF50', '#2196F3', '#FFEB3B', '#FF9800', '#9C27B0', '#00BCD4'];

    // Create a shared color assignment function
    const assignColors = (data) => {
        const colorMap = {};
        let colorIndex = 0;

        data.forEach(item => {
            if (!colorMap[item.name]) {
                colorMap[item.name] = colors[colorIndex % colors.length];
                colorIndex++;
            }
        });

        return colorMap;
    };

    // Combine both datasets to ensure consistent color mapping
    const combinedData = [...filteredValuesDays, ...filteredValuesExecution];
    const colorMap = assignColors(combinedData);
    const sortDatasets = (datasets) => {
        return datasets.sort((a, b) => a.label.localeCompare(b.label));
    };
    const dataDays = {
        labels: filteredValuesDays.length > 0 ? filteredValuesDays[0].series.map(item => item.name) : [],
        datasets: sortDatasets(filteredValuesDays.map((item) => ({
            pointRadius: 2,
            label: item.name,
            data: item.series.map(seriesItem => seriesItem.value),
            borderColor: colorMap[item.name],
            backgroundColor: colorMap[item.name],
            fill: false,
            borderWidth: 2,
        }))),
    };

    const dataExecution = {
        labels: filteredValuesExecution.length > 0 ? filteredValuesExecution[0].series.map(item => item.name) : [],
        datasets: sortDatasets(filteredValuesExecution.map((item) => ({
            pointRadius: 2,
            label: item.name,
            data: item.series.map(seriesItem => seriesItem.value),
            borderColor: colorMap[item.name],
            backgroundColor: colorMap[item.name],
            fill: false,
            borderWidth: 2,
        }))),
    };

    const options = {
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
                    padding: 15,
                    generateLabels: (chart) => {
                        const datasets = chart.data.datasets;
                        return datasets.map((dataset, i) => ({
                            text: dataset.label,
                            fillStyle: dataset.backgroundColor,
                            strokeStyle: dataset.backgroundColor,
                            lineWidth: 0,
                            hidden: !chart.isDatasetVisible(i),
                            index: i,
                        })).sort((a, b) => a.text.localeCompare(b.text));
                    },
                },
            },
            datalabels: {
                display: false, // Disable datalabels
            },
        },
        scales: {
            x: {
                grid: {
                    drawBorder: false,
                    display: false,
                },
                ticks: {
                    font: {
                        weight: 'bold',
                        color: 'black',
                        size: 10,
                    },
                },
            },
            y: {
                ticks: {
                    font: {
                        weight: 'bold',
                        color: 'black',
                    },
                },
                title: {
                    display: true,
                    weight: 'bold',
                    color: 'black',
                },
            },
        },
    };

    function renderLineChartForDate() {
        if (isLoadingTrendByDate) {
            return <div className={`${classes.loadingNoData}`}>Loading...</div>;
        } else if (dataDays.labels.length === 0) {
            return <div className={`${classes.loadingNoData}`}>No data available</div>;
        } else {
            return <Line data={dataDays} options={options} className='mt-2 w-100 h-80' />;
        }
    };

    function renderLineChartForExecution() {
        if(isLoadingTrendByExecution) {
            return <div className={`${classes.loadingNoData}`}>Loading...</div>;
        } else if (dataExecution.labels.length === 0) {
            return <div className={`${classes.loadingNoData}`}>No data available</div>;
        } else {
            return <Line data={dataExecution} options={options} className='mt-2 w-100 h-80 ms-2' />;
        }
    };

    return (
        <div>
            <div className='row'>
                <div className='col-6'>
                    <div className={`${classes.fta}`}>
                        <div className={`${classes.blueBoxContainer}`}>
                            <div className={`${classes.blueBoxWithDropdown}`}>
                                <span style={{ color: '#FFFFFF', marginRight: '48.8%', marginLeft: '6%' }}>Trend Analysis By Date</span>
                                <select
                                    className={`${classes.mrDropdown}`}
                                    value={dropdownValueDays}
                                    onChange={handleDropdownChangeDays}
                                >
                                    {dropdownOptionsTrendByDate.map(option => (
                                        <option key={option.value} value={option.value}>
                                            {option.label}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>
                        { renderLineChartForDate() }
                    </div>
                </div>
                <div className='col-6'>
                    <div className={`${classes.fta}`}>
                        <div className={`${classes.blueBoxContainer1}`}>
                            <div className={`${classes.blueBoxWithDropdown}`}>
                                <span style={{ color: '#FFFFFF', marginRight: '38%', marginLeft: '4%' }}>Trend Analysis By Execution</span>
                                <select
                                    className={`${classes.mrDropdown}`}
                                    value={dropdownValueExecution}
                                    onChange={handleDropdownChangeExecution}
                                >
                                    {dropdownOptionsTrendByExecution.map(option => (
                                        <option key={option.value} value={option.value}>
                                            {option.label}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>
                        { renderLineChartForExecution() }
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LineChart;