import React, { useState, useEffect } from "react";

import { Chart as ChartJS } from 'chart.js/auto';
import { Chart } from 'react-chartjs-2';

import { Doughnut } from "react-chartjs-2";

import { fetchApiRef, useApi, configApiRef } from '@backstage/core-plugin-api';
import cssClasses from './FailureCausePageCss.js';

import log from 'loglevel';

const FailureCauseAnalysisPage = (props) => {

    const [activeTab, setActiveTab] = useState("logs");
    const [summaryData, setSummaryData] = useState({});
    const [failureSummary, setFailureSummary] = useState([]);
    const [chipData, setChipData] = useState([]);
    const [chartData, setChartData] = useState([]);
    const [testCaseTableData, setTestCaseTableData] = useState([]);
    const [selectedTestCase, setSelectedTestCase] = useState({}); // Default to the first test case
    const [attachmentDetails, setAttachmentDetails] = useState(null);
    const [expandedImage, setExpandedImage] = useState(null);
    const [isScreenshotLoading, setScreenshotLoading] = useState(true);
    const [error, setError] = useState(null);
    const classes = cssClasses();
    const [isLoading, setLoading] = useState(true);

    const { fetch } = useApi(fetchApiRef);
    const config = useApi(configApiRef);
    const backendBaseApiUrl = config.getString('backend.baseUrl') + '/api/flowsource-cctp/';

    const handleTestCaseClick = (testCase) => {
        setSelectedTestCase({ ...testCase });
        fetchTestCaseDetails(testCase.logs);
    };

    const handleChipClick = (chip, failureID) => {
        let tagName = chip.name;
        if (chip.name === "ALL") {
            tagName = chip.name.toLowerCase();
        }
        // Add your logic here (e.g., filtering data, navigating, etc.)
        props.setActiveTab('failurePrediction');
        props.setFailureId(failureID);
        props.setTagName(tagName);
        const tabJsonTestCase = {
            "tab1": props.tabDetails.tab1,
            "tab2": props.tabDetails.tab2,
            "tab3": "Failure Prediction",
        }
        props.setTabDetails(tabJsonTestCase);
        props.setHistoryTestExecution(3);
    };

    const formatDuration = (duration) => {
        const hours = Math.floor(duration / 3600000);
        const minutes = Math.floor((duration % 3600000) / 60000);
        const seconds = Math.floor((duration % 60000) / 1000);
        return `${hours > 0 ? hours + "h " : ""}${minutes}m ${seconds}s`;
    };

    async function getFailureCauseAnalysisData() {
        try {
            const response = await fetch(`${backendBaseApiUrl}cctp-proxy/flowsource/failureCauseAnalysis/${props.testExecutionId}`);
            // Check if the response is not OK
            if (!response.ok) {
                // Read the error message from the response
                const errorText = await response.text();
                // Format the error message
                const formattedError = `HTTP error! status: ${response.status}, message: ${errorText}`;
                // Set the error state with the formatted error message
                setError(formattedError);
                // Throw an error to exit the try block
                throw new Error(formattedError);
            }
            const data = await response.json();
            setSummaryData(data);

            // Extract the Failure summary
            if (data.failureSummary.failureDescription) {
                const descriptions = data.failureSummary.failureDescription.split(","); // Split by commas
                setFailureSummary(descriptions.map((desc) => desc.trim())); // Trim whitespace
            }

            // Extract the Failure prediction data
            if (data.failurePrediction) {
                const transformedChipData = Object.entries(data.failurePrediction).map(([key, value]) => ({
                    name: key,
                    count: value,
                    id: data.id,
                }));
                setChartData(transformedChipData);
                const totalCount = transformedChipData.reduce((sum, chip) => sum + chip.count, 0);
                const updatedChipData = [
                    { name: "ALL", count: totalCount, id: data.id },
                    ...transformedChipData,
                ];
                setChipData(updatedChipData);
            }
            // Prepare the table data from failedTests
            const tableData = data.failedTests.map((test) => ({
                stepName: test.stepName,
                testcaseName: test.testcaseName,
                column2: formatDuration(test.duration),
                stackTrace: test.exceptionStacktrace || {},
                logs: test.logs,
            }));
            setTestCaseTableData(tableData);

            if (tableData.length > 0) {
                setSelectedTestCase(tableData[0]);
                fetchTestCaseDetails(tableData[0].logs);
            }
        } catch (error) {
            log.error("Error fetching failure cause analysis data:", error);
            if (!error.message.includes('HTTP error!')) {
                setError(`Error fetching data: ${error.message}`);
            }
        } finally {
            // Set loading to false after the fetch operation is complete
            setLoading(false);
        }
    }

    async function fetchTestCaseDetails(logs) {
        try {
            // Extract all attachments from logs
            if (logs === null || logs === undefined) {
                setAttachmentDetails([]);
                setScreenshotLoading(false);
                return;
            } else {
                // Map through all attachments and fetch their details
                const attachments = logs.flatMap((log) => log.attachments || []);
                const attachmentDetailsPromises = attachments.map(async (attachment) => {
                    const response = await fetchAttachmentDetails(attachment.name);
                    return { name: attachment.name, details: response };
                });

                // Wait for all promises to resolve
                const attachmentDetailsList = await Promise.all(attachmentDetailsPromises);

                setAttachmentDetails(attachmentDetailsList); // Store all attachment details
                setScreenshotLoading(false);
            }
        } catch (error) {
            log.error("Error processing logs:", error);
        }
    }

    async function fetchAttachmentDetails(attachmentName) {
        try {
            const response = await fetch(`${backendBaseApiUrl}cctp-proxy/flowsource/attachments?name=${attachmentName}`);
            const data = await response.json();
            return data; // Return the data to be used in the main function
        } catch (error) {
            log.error(`Error fetching details for attachment ${attachmentName}:`, error);
            return null; // Return null on error
        }
    }

    // Transform the data into the desired chart format
    const chartPlotData = {
        labels: chartData.map(item => item.name), // Extract labels
        datasets: [
            {
                data: chartData.map(item => item.count),
            },
        ],
    };

    // Chart options
    const options = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                display: true, position: 'right',
                labels: {
                    generateLabels: (chart) => {
                        const data = chart.data;
                        return data.labels.map((label, i) => {
                            const value = data.datasets[0].data[i];
                            const total = data.datasets[0].data.reduce((sum, currentValue) => sum + currentValue, 0);
                            const percentage = ((value / total) * 100).toFixed(2); // Calculate percentage
                            return {
                                text: `${label} - ${percentage}%`, // Append percentage to the label
                                fillStyle: data.datasets[0].backgroundColor[i], // Set the color for the legend
                            };
                        });
                    },
                },
            },
        },
    };

    useEffect(async () => {
        getFailureCauseAnalysisData();
    }, []);

    if (isLoading) {
        return (
            <div className={`App p-3 ${classes.loadingContainer}`}>
                Loading...
            </div>
        );
    }

    if (error) {
        let displayError = error + `Application error occured`
        try {
            const errorObj = JSON.parse(error.split('message: ')[1]);
            const statusCode = errorObj.response.statusCode;
            const message = errorObj.error.message;
            displayError = `HTTP error! status: ${statusCode}, message: ${message}.`;
        } catch (e) {
            log.error('Error parsing error message:', e);
        }
        return (
            <div className="card ms-2 me-2 mb-2 mt-2">
                <div className="card-header">
                    <h6>Error</h6>
                </div>
                <div className="card-body">
                    <div className="alert alert-danger" role="alert">
                        {displayError}
                    </div>
                </div>
            </div>
        );
    }

    function setActiveForTestCaseTable(currentTestCaseName) {
        if(selectedTestCase.testcaseName.trim() === currentTestCaseName) {
            return "active";
        } else {
            return "";
        }
    }

    function setFaliureSummaryHeading(noOfIssues) {
        if(noOfIssues === 1) {
            return "Issue";
        } else {
            return "Issues";
        }
    }

    function renderTestCaseScreenshot() {
        if(isScreenshotLoading) {
            return (
                <div className="text-center">
                    Loading screenshot...
                </div>
            );
        } else if (attachmentDetails && attachmentDetails.length > 0) {
            return (
                <div className={`thumbnail-container ${classes.screenshotContainer}`}>
                    {attachmentDetails.map((attachment, idx) => (
                        <div key={attachment.details.id} className={`${classes.cursor}`}>
                            <img
                                src={`data:${attachment.details.type};base64,${attachment.details.data}`}
                                alt={attachment.details.name}
                                className={`${classes.thumbnailImage}`}
                                onClick={() => setExpandedImage(`data:${attachment.details.type};base64,${attachment.details.data}`)} // Set expanded image on click
                            />
                        </div>
                    ))}
                </div>
            );
        } else {
            return (
                <div className="text-center">
                    <p>No screenshots available</p>
                </div>
            );
        }
    };

    let failureDescCounter = 0;
    let testCastCounter = 0;

    return (
        <div>
            <div>
                <div className="container">
                    <div className="row">
                        <div className="col-12">
                            <div className="card">
                                {/* Card Header */}
                                <div
                                    className={`card-header ${classes.failureCauseCardHeader}`}
                                >
                                    FAILURE SUMMARY
                                </div>

                                {/* Card Body */}
                                <div className={`card-body ${classes.tableDiv}`}>
                                    <div className="row p-3">
                                        {/* Box 1: Failure Count */}
                                        <div className="col-md-4 d-flex justify-content-center align-items-center mb-5 pb-2">
                                            <div className={`${classes.failureCountDiv}`}>
                                                {summaryData.failureSummary.noOfFailures}{" "}
                                                <span className={`${classes.failureCountSpan}`}>
                                                    Failed
                                                </span>
                                            </div>
                                        </div>

                                        {/* Box 2: Failure Table */}
                                        <div className={`col-md-4 ${classes.tableDiv}`}>
                                            <div className={`${classes.failureDescriptionDiv}`}>
                                                <table className={`table table-bordered table-hover ${classes.failureDescriptionTable}`}>
                                                    <thead>
                                                        <tr>
                                                            <th className={`${classes.failureDescriptionTableTh}`}>
                                                                Failure Description
                                                            </th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {failureSummary.map((description, index) => (
                                                            <tr key={"FailureDesc" + failureDescCounter++} 
                                                                className={`${classes.failureDescriptionTableRow}`}
                                                            >
                                                                <td>{description}</td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            </div>
                                        </div>

                                        {/* Box 3: Circular Display */}
                                        <div className="col-md-4 d-flex justify-content-center align-items-center">
                                            <div className={`${classes.issueCircle}`}>
                                                <svg width="200" height="200">
                                                    <circle
                                                        cx="100"
                                                        cy="100"
                                                        r="60"
                                                        fill="none"
                                                        stroke="#dd6a6a"
                                                        strokeWidth="15"
                                                    />
                                                </svg>
                                                <div className={`${classes.issueCircleInnerDiv}`}>
                                                    <div className={`${classes.issueCircleText1}`}>{summaryData.failureSummary.noOfIssues}</div>
                                                    <div className={`${classes.issueCircleText2}`}>
                                                        {setFaliureSummaryHeading(summaryData.failureSummary.noOfIssues)}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="container pt-2">
                    <div className="row">
                        <div className="col-12">
                            <div className="card">
                                <div className={`card-header ${classes.failureCauseCardHeader}`}>
                                    FAILURE PREDICTION
                                </div>
                                {/* Top Chips */}
                                <div className="pt-2 ps-3">
                                    <div
                                        className="mb-3 d-flex flex-wrap gap-2 fs-6">
                                        {chipData.map((chip, index) => (
                                            <span
                                                key={chip.id}
                                                className={`badge ${classes.chipDiv}`}
                                                onClick={() => handleChipClick(chip, chip.id)}
                                            >
                                                {chip.name}&nbsp; &nbsp;{chip.count}
                                                &nbsp;&gt;
                                            </span>
                                        ))}
                                    </div>
                                </div>

                                <div className={`card mb-2 ${classes.chartContainer}`}>
                                    <div className="card-body">
                                        {/* Donut Chart */}
                                        <div className="row align-items-center">
                                            <div className={`col-12 col-sm-6 ${classes.chartDiv}`}>
                                                <Doughnut data={chartPlotData} options={options} />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="container pt-4">
                                    <div className="row mb-3">
                                        {/* Left Column */}
                                        <div className="col-lg-6">
                                            <div className={`${classes.testCaseDiv}`}>
                                                <table className="table mb-0">
                                                    <thead className={`table-secondary ${classes.testCaseTableTh}`}>
                                                        <tr>
                                                            <th>Test Cases</th>
                                                            <th>Duration</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {testCaseTableData.map((item, index) => (
                                                            <tr key={"TestCase" + testCastCounter++}
                                                                className={`${classes.testCaseTableBody1}`}
                                                                onClick={() => handleTestCaseClick(item)}
                                                            >
                                                                <td className={ setActiveForTestCaseTable(item.testcaseName.trim()) }
                                                                >
                                                                    <strong>{item.stepName}</strong> <br />
                                                                    <span>{item.testcaseName}</span>
                                                                </td>
                                                                <td className={ setActiveForTestCaseTable(item.testcaseName.trim()) }>
                                                                    {item.column2}
                                                                </td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            </div>
                                        </div>

                                        {/* Right Column */}
                                        <div className="col-lg-6">
                                            <div className={`card ${classes.logsDiv}`}>
                                                <div className="card-header">
                                                    <ul className="nav nav-tabs card-header-tabs">
                                                        <li className="nav-item">
                                                            <button
                                                                className={`nav-link ${classes.navLink} ${activeTab === 'logs' ? classes.activeNavLink : ''}`}
                                                                onClick={() => setActiveTab("logs")}>
                                                                Logs
                                                            </button>
                                                        </li>
                                                        <li className="nav-item">
                                                            <button
                                                                className={`nav-link ${classes.navLink} ${activeTab === 'screenshots' ? classes.activeNavLink : ''}`}
                                                                onClick={() => setActiveTab("screenshots")}>
                                                                Screenshots
                                                            </button>
                                                        </li>
                                                    </ul>
                                                </div>
                                                <div className={`card-body ${classes.navCardBody}`}>
                                                    {activeTab === "logs" ? (
                                                        <pre className={`${classes.navCardContent}`}>
                                                            {selectedTestCase && selectedTestCase.stackTrace
                                                                ? JSON.stringify(selectedTestCase.stackTrace)
                                                                : "No logs available for this test case."}
                                                        </pre>
                                                    ) : (
                                                        <div>
                                                            { renderTestCaseScreenshot() }
                                                        </div>
                                                    )}

                                                    {/* Modal for expanded image */}
                                                    {expandedImage && (
                                                        <div>
                                                        <div
                                                          className={`${classes.modalBackdrop}`}
                                                          onClick={() => setExpandedImage(null)} // Close modal on backdrop click
                                                        ></div>
                                                        <div className={`${classes.modalContainer}`}>
                                                          <div className={`${classes.modalContent}`}>
                                                            <img
                                                              src={expandedImage}
                                                              alt="Expanded Screenshot"
                                                              className={`${classes.modalImage}`}
                                                            />
                                                            <div className={`${classes.modalFooter}`}>
                                                              <button
                                                                onClick={() => setExpandedImage(null)}
                                                                className={`${classes.closeButton}`}
                                                              >
                                                                Close
                                                              </button>
                                                            </div>
                                                          </div>
                                                        </div>
                                                      </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
export default FailureCauseAnalysisPage;