import React, { useState, useEffect } from 'react';


import cssClasses from './AccessibilityCSS.js';
import 'bootstrap/dist/css/bootstrap.min.css';
import AccessibilityBarGraph from './AccessibilityBarGraph.js';

import { fetchApiRef, useApi, configApiRef } from '@backstage/core-plugin-api';

import log from 'loglevel';

const AccessibilityTwo = (props) => {
    const classes = cssClasses();
    const { fetch } = useApi(fetchApiRef);
    const config = useApi(configApiRef);
    const backendBaseApiUrl = config.getString('backend.baseUrl') + '/api/flowsource-cctp/';
    const [isLoading, setLoading] = useState(true);
    const [barChartData, setBarChartData] = useState([]);
    const [tableData, setTableData] = useState([]);
    const [error, setError] = useState(null);
    const [issueCount, setIssueCount] = useState({ high: 0, medium: 0, low: 0 });
    const [isPopupOpen, setIsPopupOpen] = useState(false);
    const [popupContent, setPopupContent] = useState('');
   
    async function getAccessibilityData() {
        try {
            const testCaseId = props.testCaseId;
            const testCaseName = props.testCaseName;
            const testSuiteName = props.testSuiteName;
            const response = await fetch(`${backendBaseApiUrl}cctp-proxy/flowsource/accessibility/violation-detail/${testCaseId}?testCasesName=${testCaseName}&testStepName=${testSuiteName}`);
           
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

            // Parse the JSON data from the response
            const data = await response.json();
            log.info("data",JSON.stringify(data));
            // Update the state with the fetched data
            setIssueCount({
                high: data.summary?.high ?? 0,
                medium: data.summary?.medium ?? 0,
                low: data.summary?.low ?? 0
            });
            setBarChartData(data.summary.impactedDisabilityMetrics);
            setTableData(data.detailedAnalysis);

        } catch (error) {
            // Log the error to the logger
            log.error('Error fetching data from backend:', error);
            // Set a generic error message if the error is not an HTTP error
            if (!error.message.includes('HTTP error!')) {
                setError(`Error fetching data: ${error.message}`);
            }
        } finally {
            // Set loading to false after the fetch operation is complete
            setLoading(false);
        }
    };

    useEffect(() => {
        getAccessibilityData();
    }, []);
    const barColor = ['#5aa454', '#a10a28', '#c7b42c', '#aaaaaa'];
    const yAxisStepSize = 5;
    const xAxisName = 'Impacted Disability Types'
    const yAxisName = 'Defects Count';
    const [selectedItem, setSelectedItem] = useState(null);

    useEffect(() => {
        if (tableData && tableData.length > 0) {
            setSelectedItem(tableData[0]);
        }
    }, [tableData]);

    const handleItemClick = (item) => {
        setSelectedItem(item);
    };

    let issueKeyCount = 0;
    const handleViewSourceClick = () => {
        const combinedSources = selectedItem.sources
            ? selectedItem.sources.map((source, index) => (
                <div key={'Issue' + issueKeyCount++} className={`mb-4`}>
                    <div className={`fw-bold`}>Issue {index +1}:</div>
                   
                    {source}
                   
                </div>
            ))
            : 'N/A';
        setPopupContent(combinedSources);
        setIsPopupOpen(true);
    };

    const handleClosePopup = () => {
        setIsPopupOpen(false);
        setPopupContent('');
    };
    if (isLoading) {
        return (
            <div className={`App p-3 ${classes.loading2}`}>
                Loading...
            </div>
        );
    }

    if (error) {
        let displayError = error;
        try {
            const errorObj = JSON.parse(error.split('message: ')[1]);
            const statusCode = errorObj.response.statusCode;
            displayError = `HTTP error! status: ${statusCode}, message: Application error occured.`;
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

    function checkIfDetailAnalysisNA(value) {
        if(value) {
            return value;
        } else {
            return "N/A";
        }
    }

    function checkIfSourcesAvailable(sources) {
        if(sources && sources.length > 0) {
            return (
                <span className={`${classes.link}`}
                    onClick={handleViewSourceClick}
                >
                    View Sources
                </span>
            );
        } else {
            return "N/A";
        }
    }

    let detailAnalysisCounter = 0;
    return (
        <div>
            <div className={`${classes.atDiv1}`}>
                <p className={`${classes.atP1}`}>Summary</p>
            </div>
            <div>
                <div className="row">
                    <div className={`col-3 ms-0 ${classes.atDiv2}`}>
                        <div className={`row ${classes.atDiv3}`}>
                            <div className="col">
                                <div className={`card mb-2 ${classes.atDiv4}`}>

                                    <p className={`${classes.atP2}`}>
                                        <span className={`${classes.atSpan1}`}>{issueCount.high}</span>
                                        <span className={`${classes.atSpan2}`}>High Issues</span>
                                    </p>
                                </div>
                            </div>
                        </div>
                        <div className={`row ${classes.atDiv5}`}>
                            <div className="col">
                                <div className={`card mb-2 ${classes.atDiv6}`}>
                                    <p className={`${classes.atP3}`}>
                                        <span className={`${classes.atSpan3}`}>{issueCount.medium}</span>
                                        <span className={`${classes.atSpan4}`}>Medium Issues</span>
                                    </p>
                                </div>
                            </div>
                        </div>
                        <div className={`row ${classes.atDiv7}`}>
                            <div className="col mb-2">
                                <div className={`card ${classes.atDiv8}`}>

                                    <p className={`${classes.atP4}`}>
                                        <span className={`${classes.atSpan5}`}>{issueCount.low}</span>
                                        <span className={`${classes.atSpan6}`}>Low Issues</span>
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className={`col-9 ${classes.barDiv2}`}>
                        <AccessibilityBarGraph barGraphData={barChartData} barColor={barColor} yAxisStepSize={yAxisStepSize} yAxisName={yAxisName} xAxisName={xAxisName} />
                    </div>
                </div>
            </div>
            <div className={`${classes.atDiv9}`}>
                <p className={`${classes.atP5}`}>Detailed Analysis</p>
            </div>
            <div className="ms-3">
                <div className="row w-100 mb-3 mt-4">
                    <div className="col-6">
                        <div className={`${classes.atDiv10}`}>
                            <table className={`table ${classes.atTable}`}>
                                <tbody className={`${classes.atTBody}`}>
                                    {tableData && tableData.length > 0 ? (
                                        tableData.map((item, index) => (
                                            <tr key={"DetailedAnalysis" + detailAnalysisCounter++} onClick={() => handleItemClick(item)}>
                                                <td>
                                                    <span className={selectedItem === item ? 'selected' : ''}>
                                                        {item.issueName}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td>No Data Available</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    <div className="col-6">
                        <div className={`${classes.atDiv11}`}>
                            <table className={`table ms-0 me-3 w-100 ${classes.atTable1}`}>
                                <thead className={`${classes.atTHead2}`}>
                                    <tr>
                                        <th className="violation">Violation</th>
                                        <th className="description">Description</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {selectedItem ? (
                                        <>
                                            <tr>
                                                <td>Impact</td>
                                                <td>{ checkIfDetailAnalysisNA(selectedItem.impact) }</td>
                                            </tr>
                                            <tr>
                                                <td>Violation</td>
                                                <td>{ checkIfDetailAnalysisNA(selectedItem.violation) }</td>
                                            </tr>
                                            <tr>
                                                <td>Suggestion</td>
                                                <td>{ checkIfDetailAnalysisNA(selectedItem.suggestion) }</td>
                                            </tr>
                                            <tr>
                                                <td>Description</td>
                                                <td>{ checkIfDetailAnalysisNA(selectedItem.issueDescription) }</td>
                                            </tr>
                                            <tr>
                                                <td>Affected Users</td>
                                                <td>{ checkIfDetailAnalysisNA(selectedItem.affectedUsers) }</td>
                                            </tr>
                                            <tr>
                                                <td>Standard</td>
                                                <td>{ checkIfDetailAnalysisNA(selectedItem.standard) }</td>
                                            </tr>
                                            <tr>
                                                <td>Sources</td>
                                                <td>
                                                    { checkIfSourcesAvailable(selectedItem.sources) }
                                                </td>
                                            </tr>
                                        </>
                                    ) : (
                                        <tr className="no-data">
                                            <td>No Data Available</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                            {isPopupOpen && (
                                <>
                                    <div className={`${classes.overlay}`} ></div>
                                    <div className={`${classes.popup} overflow-auto`} >
                                        <span className={`${classes.closeButton}`} onClick={handleClosePopup}>×</span>
                                        <div>{popupContent}</div>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
export default AccessibilityTwo;
