import React, { useState, useEffect } from 'react';

import { Chart as ChartJS } from 'chart.js/auto';
import { Chart } from 'react-chartjs-2';

import { Bar } from "react-chartjs-2";

import cssClasses from '../TestingMainPageCSS.js';

const BarChart = ({ values, dropdownOptionsFailedTest, dropdownOptionsExceptions, handleDropdownChangeFailedTest, handleDropdownChangeExceptions, isLoadingTopFailTestcases, isLoadingTopExceptions }) => {
    const classes = cssClasses();
    const [dropdownValueFailedTest, setDropdownValueFailedTest] = useState('All'); // Default to 'All'
    const [dropdownValueExceptions, setDropdownValueExceptions] = useState('All'); // Default to 'All'
    const [chartData, setChartData] = useState({ labels: [], datasets: [] });
    const [exceptionData, setExceptionData] = useState({ labels: [], datasets: [] });

    useEffect(() => {
        if (values.topFailTestcasesData) {
            const dataValues = values.topFailTestcasesData; // Use topFailTestcasesData from values
            const filteredValues = Object.entries(dataValues)
                .map(([statusName, statusValue]) => ({ statusName, statusValue }))
                .slice(0, 15); // Only take the first 15 datasets

            const data = {
                labels: filteredValues.map(value => value.statusName),
                datasets: [
                    {
                        data: filteredValues.map(value => value.statusValue),
                        backgroundColor: new Array(filteredValues.length).fill('#FB7472'),  // Set the same color for all bars
                    },
                ],
            };

            setChartData(data);
        }
    }, [dropdownValueFailedTest, values]);

    useEffect(() => {
        if (values.topExceptionsData) {
            const exceptionValues = values.topExceptionsData; // Use topExceptionsData from values
            const filteredExceptionValues = Object.entries(exceptionValues)
                .map(([statusName, statusValue]) => ({ statusName, statusValue }))
                .slice(0, 15); // Only take the first 15 datasets

            const exceptionData = {
                labels: filteredExceptionValues.map(value => value.statusName),
                datasets: [
                    {
                        pointRadius: 0,
                        data: filteredExceptionValues.map(value => value.statusValue),
                        backgroundColor: new Array(filteredExceptionValues.length).fill('#FB7472'), // All bars with the same color
                    },
                ],
            };

            setExceptionData(exceptionData);
        }
    }, [dropdownValueExceptions, values]);

    const options = {
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
                display: false,
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
                min: 0,
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

    function rendBarDataForTopFailTestCases() {
        if(isLoadingTopFailTestcases) {
            return (
                <div className={`${classes.loadingNoData}`}>Loading...</div>
            );
        } else if(chartData.labels.length === 0) {
            return (
                <div className={`${classes.loadingNoData}`}>No data available</div>
            );
        } else {
           return (
                <Bar data={chartData} options={options} className='mt-2 w-100 h-80' />
           ); 
        }
    };

    function renderBarDataForTopExceptions() {
        if(isLoadingTopExceptions) {
            return (
                <div className={`${classes.loadingNoData}`}>Loading...</div>
            );
        } else if(exceptionData.labels.length === 0) {
            return (
                <div className={`${classes.loadingNoData}`}>No data available</div>
            );
        } else {
            return (
                <Bar data={exceptionData} options={options} className='mt-2 w-100 h-80' />
            );
        }
    };

    return (
        <div>
            <div className='row mt-2'>
                <div className='col-6'>
                    <div className={`${classes.fta}`}>
                        <div className={`${classes.blueBoxContainerBar}`}>
                            {/* Blue Box with Dropdown for Top Failed Test */}
                            <div className={`${classes.blueBoxWithDropdownBar}`}>
                                <span style={{ color: '#FFFFFF', marginLeft: '5%' }}>Top Failed Test</span>
                                <select
                                    className={`${classes.mrDropdownBar}`}
                                    value={dropdownValueFailedTest}
                                    onChange={(event) => {
                                        setDropdownValueFailedTest(event.target.value);
                                        handleDropdownChangeFailedTest(event);
                                    }}
                                >
                                    {dropdownOptionsFailedTest.map(option => (
                                        <option key={option.value} value={option.value}>
                                            {option.label}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>
                        { rendBarDataForTopFailTestCases() }
                    </div>
                </div>

                <div className='col-6'>
                    <div className={`${classes.fta}`}>
                        <div className={`${classes.blueBoxContainerBar1}`}>
                            {/* Blue Box with Dropdown for Top Exceptions */}
                            <div className={`${classes.blueBoxWithDropdownBar1}`}>
                                <span style={{ color: '#FFFFFF', marginRight: '38%', marginLeft: '4%' }}>Top Exceptions</span>
                                <select
                                    className={`${classes.mrDropdownBar1}`} 
                                    value={dropdownValueExceptions}
                                    onChange={(event) => {
                                        setDropdownValueExceptions(event.target.value);
                                        handleDropdownChangeExceptions(event);
                                    }}
                                >
                                    {dropdownOptionsExceptions.map(option => (
                                        <option key={option.value} value={option.value}>
                                            {option.label}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>
                        { renderBarDataForTopExceptions() }
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BarChart;
