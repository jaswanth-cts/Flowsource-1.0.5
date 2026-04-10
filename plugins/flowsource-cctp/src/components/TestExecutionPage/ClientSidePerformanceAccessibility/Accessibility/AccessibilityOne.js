import React, { useState, useEffect, useRef } from 'react';

import { fetchApiRef, useApi, configApiRef } from '@backstage/core-plugin-api';

import cssClasses from './AccessibilityCSS.js';
import arrow from '../../../Icons/arrow.png';
import 'bootstrap/dist/css/bootstrap.min.css';
import AccessibilityBarGraph from './AccessibilityBarGraph.js';
import { BsSearch, BsX } from 'react-icons/bs';
import { FormControl, InputGroup } from 'react-bootstrap';

import log from 'loglevel';

const AccessibilityOne = (props) => {
    const classes = cssClasses();
    const { fetch } = useApi(fetchApiRef);
    const config = useApi(configApiRef);
    const backendBaseApiUrl = config.getString('backend.baseUrl') + '/api/flowsource-cctp/';
    
    const [isLoading, setLoading] = useState(true);
    const [barChartData, setBarChartData] = useState([]);
    const [tableData, setTableData] = useState([]);
    const [error, setError] = useState(null);
    const [searchText, setSearchText] = useState('');
    const [filteredTableData, setFilteredTableData] = useState([]);
    const previousPageRef = useRef(1); // Use useRef to store the previous page

    async function getAccessibilityData() {
        try {
            const testCaseId = props.testCaseId;
            const response = await fetch(`${backendBaseApiUrl}cctp-proxy/flowsource/accessibility/${testCaseId}`);
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
            // Update the state with the fetched data
            setBarChartData(data.hotspotgraph);
            setTableData(data.violationDetail);

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

    const barColor = '#06c7cc';
    const yAxisStepSize = 10;
    const xAxisName = '';
    const yAxisName = '';

    //pagination logic
    const [currentPage, setCurrentPage] = useState(1);
    const ITEMS_PER_PAGE = 5;

    const handlePageChange = (pageNumber) => {
        setCurrentPage(pageNumber);
    };
    const handleAccessibilityTabChange = (testSuiteName, testCaseName) => {
        props.setActiveTab('accessibilitytwo');
        props.setHistoryTestExecution(3);
        const tabJsonTestCase = {
            "tab1": 'Accessibility',
            "tab2": props.tabDetails.tab2,
            "tab3": testSuiteName
        }
        props.setTabDetails(tabJsonTestCase);
        props.setTestCaseName(testCaseName);
        props.setTestSuiteName(testSuiteName);
    };
    
    const handleSearchChange = (event) => {
        const text = event.target.value;
        setSearchText(text);
        if (text === '') {
            setCurrentPage(previousPageRef.current); // Restore the previous page when search text is cleared
        } else {
            if (searchText === '') {
                previousPageRef.current = currentPage; // Save the current page before changing it
            }
            setCurrentPage(1); // Go to the first page when a search is performed
        }
    };
    
    const handleCancelSearch = () => {
        setSearchText('');
        setCurrentPage(previousPageRef.current); // Restore the previous page when search text is cleared
    };
    
    useEffect(() => {
        const filteredData = tableData.filter(accessibility => {
            const searchTextLower = searchText.toLowerCase();
            return (
                accessibility.testStepName.toLowerCase().includes(searchTextLower)
            );
        });
        setFilteredTableData(filteredData);
    
        // Adjust current page if it exceeds the total pages of filtered data
        const totalPages = Math.ceil(filteredData.length / ITEMS_PER_PAGE);
        if (currentPage > totalPages && totalPages > 0) {
            setCurrentPage(totalPages);
        } else if (totalPages === 0) {
            setCurrentPage(1);
        }
    }, [searchText, tableData]);
     
    const totalPages = Math.ceil(filteredTableData.length / ITEMS_PER_PAGE);
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    const currentTableData = filteredTableData.slice(startIndex, endIndex);
    const pagesToShow = 3;
    const pagesArray = [...Array(totalPages).keys()];
    
    let startPage = 1;
    let endPage = Math.min(pagesToShow, totalPages);
    
    startPage = currentPage > pagesToShow - 2 ? currentPage - Math.floor(pagesToShow / 2) : startPage;
    endPage = currentPage > pagesToShow - 2 ? Math.min(currentPage + Math.floor(pagesToShow / 2), totalPages) : endPage;
    const isPreviousDisabled = currentPage === 1;
    const isNextDisabled = currentPage === totalPages;
    if (isLoading) {
        return (
            <div className={`App p-3 ${classes.loading1}`}>
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

    return (
        <div>
            <div className={`${classes.headingDiv}`}>
                <p className={`${classes.headingP}`}>Accessibility Testcase Hotspot</p>
            </div>

            <div className={`${classes.barDiv}`}>
                <AccessibilityBarGraph barGraphData={barChartData} barColor={barColor} yAxisStepSize={yAxisStepSize} yAxisName={yAxisName} xAxisName={xAxisName} />
            </div>
            <div>
                <div className={`${classes.headingDiv}`}>
                    <p className={`${classes.headingP}`}>Total Violations</p>
                </div>
                <div className={`${classes.searchDiv1}`}>
                    <div className={`${classes.searchDiv2}`}>
                        <InputGroup>
                            <InputGroup.Text className={`${classes.inputGroupCss}`}>
                                <BsSearch className={`${classes.bsSearch}`} />
                            </InputGroup.Text>
                            <FormControl
                                placeholder="Search"
                                value={searchText}
                                onChange={handleSearchChange}
                                className={`${classes.searchStyle}`}
                            />
                            {searchText && (
                                <InputGroup.Text
                                    onClick={handleCancelSearch}
                                    className={`${classes.inputGroupText}`}
                                >
                                    <BsX className={`${classes.bsxCss}`} />
                                </InputGroup.Text>
                            )}
                        </InputGroup>
                    </div>
                </div>
                <div className={`mt-2 table-responsive`}>
                    <table className={`table ${classes.tableBorders}`}>
                        <thead>
                            <tr className={`w-100 ${classes.tableHead}`}>
                                <th scope="col">NAME</th>
                                <th scope="col">ISSUES</th>
                                <th scope="col"></th>
                            </tr>
                        </thead>
                        <tbody>
                            {currentTableData && currentTableData.length > 0 ? (
                                currentTableData.map((row) => (
                                    <tr key={row.id}>
                                        <td className={`${classes.colStyle1}`}>{row.testStepName}</td>
                                        <td className={`${classes.colStyle1}`}>{row.issueCount}</td>
                                        <td className={`${classes.colStyle3}`}>
                                            <a href="#">
                                                <img
                                                    src={arrow}
                                                    alt="Arrow Icon"
                                                    className={`float-end`}
                                                    onClick={() => handleAccessibilityTabChange(row.testStepName, row.testCaseName)}
                                                />
                                            </a>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr className={`${classes.noDataTr}`}>
                                    <td colSpan="3" className={`text-center ${classes.noDataTd}`}>
                                        No Data Found
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                    {currentTableData && currentTableData.length > 0 && (
                        <nav className={` ${classes.paginationBoxStlye}`} aria-label="Page navigation example">
                            <ul className={`pagination justify-content-end ${classes.ulCss} ${classes.customPagination}`}>
                                <li className={`page-item ${isPreviousDisabled ? 'disabled' : ''}`}>
                                    <a aria-label="Previous" className="page-link" href="#" tabIndex="-1" onClick={() => handlePageChange(currentPage - 1)}>
                                        <span aria-hidden="true">«</span>
                                    </a>
                                </li>
                                {startPage > 1 && (
                                    <li className="page-item disabled">
                                        <span className="page-link">...</span>
                                    </li>
                                )}
                                {pagesArray.slice(startPage - 1, endPage).map((index) => (
                                    <li key={index} className={`page-item ${classes.numCss}`}>
                                        <a className={`page-link ${index + 1 === currentPage ? 'Mui-selected' : ''}`} href="#" onClick={() => handlePageChange(index + 1)}>
                                            {index + 1}
                                        </a>
                                    </li>
                                ))}
                                {endPage < totalPages && (
                                    <li className="page-item disabled">
                                        <span className="page-link">...</span>
                                    </li>
                                )}
                                <li className={`page-item ${isNextDisabled ? 'disabled' : ''}`}>
                                    <a href="#" className="page-link" onClick={() => handlePageChange(currentPage + 1)} aria-label="Next">
                                        <span aria-hidden="true">»</span>
                                    </a>
                                </li>
                            </ul>
                        </nav>
                    )}
                </div>

            </div>
        </div>
    );
};

export default AccessibilityOne;
