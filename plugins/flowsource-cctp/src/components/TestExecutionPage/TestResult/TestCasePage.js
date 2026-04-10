import React, { useState, useEffect } from 'react';

import 'bootstrap/dist/css/bootstrap.min.css';
import { fetchApiRef, useApi, configApiRef } from '@backstage/core-plugin-api';

import cssClasses from '../TestingMainPageCSS.js';
import arrow from '../../Icons/arrow.png';
import { Typography, Card, } from '@mui/material';
import dateUtils from '../DateUtil.js';

import log from 'loglevel';

const TestCasePage = (props) => {
  const classes = cssClasses();
  const [summaryData, setSummaryData] = useState({});
  const [tableData, setTableData] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setLoading] = useState(true);
  const ITEMS_PER_PAGE = 5;
  const totalPages = Math.ceil(tableData.length / ITEMS_PER_PAGE);
  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const handleTabChange = (testCaseName) => {
    props.setActiveTab('teststeps');
    const tabJsonTestCase = {
      "tab1": props.tabDetails.tab1,
      "tab2": props.tabDetails.tab2,
      "tab3": testCaseName
    }
    props.setTabDetails(tabJsonTestCase);
    props.setHistoryTestExecution(3);
    props.setTestCaseName(testCaseName);
  };
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const currentTableData = tableData.slice(startIndex, endIndex);
  const pagesToShow = 3;
  const pagesArray = [...Array(totalPages).keys()];
  let startPage = 1;
  let endPage = Math.min(pagesToShow, totalPages);
  startPage = currentPage > pagesToShow - 2 ? currentPage - Math.floor(pagesToShow / 2) : startPage;
  endPage = currentPage > pagesToShow - 2 ? Math.min(currentPage + Math.floor(pagesToShow / 2), totalPages) : endPage;
  const isPreviousDisabled = currentPage === 1;
  const isNextDisabled = currentPage === totalPages;
  const { fetch } = useApi(fetchApiRef);
  const config = useApi(configApiRef);
  const baseUrl = config.getOptionalString('backend.baseUrl');
  const backendBaseApiUrl = baseUrl.endsWith('/')
                            ? `${baseUrl}api/flowsource-cctp/`
                            : `${baseUrl}/api/flowsource-cctp/`;
  const [error, setError] = useState(null);

  async function getTestCase() {
    try {
      const response = await fetch(`${backendBaseApiUrl}cctp-proxy/flowsource/testResults/testCases/${props.testCaseId}`);

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

      //load metrics
      const metrics = {
        testCaseCount: data.testCaseCount,
        failed: data.failed,
        passed: data.passed,
        skipped: data.skipped,
        maxDuration: dateUtils.formatTime(data.durationMetrics.maxDuration),
        minDuration: dateUtils.formatTime(data.durationMetrics.minDuration),
        avgDuration: dateUtils.formatTime(data.durationMetrics.avgDuration),
        duration: dateUtils.formatTime(data.duration)
      }
      setSummaryData(metrics);

      //Load TestSuite table data
      let testSuiteArray = new Array();
      const testCaseList = data.testCases;
      if (testCaseList !== null && testCaseList !== undefined) {
        testCaseList.forEach(function (item, index) {
          const entry = { TestCaseName: item.name, Duration: dateUtils.formatTime(item.duration), Time: dateUtils.formatDate(item.startTime), EndTime: dateUtils.formatDate(item.endTime), Status: item.result, ExceptionStacktrace: item.exceptionStacktrace };
          testSuiteArray.push(entry);
        })
      };

      //Set the table data for testcase
      setTableData(testSuiteArray);
    } catch (error) {
      // Log the error to the log level
      log.error('Error fetching data from backend:', error);
      // Set a generic error message if the error is not an HTTP error
      if (!error.message.includes('HTTP error!')) {
        setError(`Error fetching data: ${error.message}`);
      }
    }
    finally {
      // Set loading to false after the fetch operation is complete
      setLoading(false);
    }
  }
  useEffect(async () => {
    getTestCase();
  }, []);

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

  const getStatusColor = (status) => {
    if (status === 'PASSED') {
      return '#11BF6A';
    } else if (status === 'FAILED') {
      return '#FB6868';
    } else {
      return 'transparent';
    }
  };

  return (
    <div>
      <div className={`w-80 card ${classes.testborder} ms-4 me-4 mb-4`}>
        <div className={`row justify-content-start pb-2`}>
            <div>
              <div className={`col-12 ms-3`} >
                <div className={`${classes.infoContPrjItems}`}>
                  <Card variant="outlined" className={`${classes.infoContPrjItemsCard}`}>
                    <div className={`${classes.infoContPrjIcon}`}>
                      <Typography className={`${classes.cctpIconName}`}>Total</Typography>
                    </div>
                    <p className={`${classes.cctpIconIconValue}`}>{summaryData.testCaseCount}</p>
                  </Card>
                  <Card variant="outlined" className={`${classes.infoContPrjItemsCard1}`}>
                    <div className={`${classes.infoContPrjIcon}`}>
                      <Typography className={`${classes.cctpIconName}`}>Time</Typography>
                    </div>
                    <p className={`${classes.cctpIconIconValue}`}>{summaryData.duration}</p>
                  </Card>
                  <Card variant="outlined" className={`${classes.infoContPrjItemsCard}`}>
                    <div className={`${classes.infoContPrjIcon}`}>
                      <Typography className={`${classes.cctpIconName}`}>Min</Typography>
                    </div>
                    <p className={`${classes.cctpIconIconValue}`}>{summaryData.minDuration}</p>
                  </Card>
                  <Card variant="outlined" className={`${classes.infoContPrjItemsCard1}`}>
                    <div className={`${classes.infoContPrjIcon}`}>
                      <Typography className={`${classes.cctpIconName}`}>Avg</Typography>
                    </div>
                    <p className={`${classes.cctpIconIconValue}`}>{summaryData.avgDuration}</p>
                  </Card>
                  <Card variant="outlined" className={`${classes.infoContPrjItemsCard}`}>
                    <div className={`${classes.infoContPrjIcon}`}>
                      <Typography className={`${classes.cctpIconName}`}>Max</Typography>
                    </div>
                    <p className={`${classes.cctpIconIconValue}`}>{summaryData.maxDuration}</p>
                  </Card>
                  <Card variant="outlined" className={`${classes.infoContPrjItemsCard1}`}>
                    <div className={`${classes.infoContPrjIcon}`}>
                      <Typography className={`${classes.cctpIconName}`}>Passed</Typography>
                    </div>
                    <p className={`${classes.cctpIconIconValue}`}>{summaryData.passed}</p>
                  </Card>
                  <Card variant="outlined" className={`${classes.infoContPrjItemsCard}`}>
                    <div className={`${classes.infoContPrjIcon}`}>
                      <Typography className={`${classes.cctpIconName}`}>Failed</Typography>
                    </div>
                    <p className={`${classes.cctpIconIconValue}`}>{summaryData.failed}</p>
                  </Card>
                </div>
              </div>
              <div>
                <div className={`table-responsive ${classes.table2}`}  >
                  <table className={`table ${classes.tableBorders} `}>
                    <thead>
                      <tr className={`${classes.tableHead}`}>
                        <th className={`${classes.colStyle}`} scope="col">TEST CASE</th>
                        <th className={`${classes.colStyle}`} scope="col">TIME</th>
                        <th className={`${classes.colStyle}`} scope="col">DURATION</th>
                        <th className={`${classes.colStyle}`} scope="col">STATUS</th>
                        <th className={`${classes.colStyle}`} scope="col"></th>
                      </tr>
                    </thead>
                    <tbody style={{ textAlign: '-webkit-center' }}>
                      {currentTableData.map((row) => {
                        return (
                          <tr key={row.TestPlanName}>
                            <td className={`${classes.colStyle1}`}>
                              <div className={classes.tablefont}>
                                {row.TestCaseName}
                              </div>
                            </td>
                            <td className={`${classes.colStyle1}`}>{row.Time}</td>
                            <td className={`${classes.colStyle1}`}>{row.Duration}</td>
                            <td className={`${classes.colStyle1}`}>
                            <button type="button" class="btn" style={{cursor: 'default', borderRadius: '6rem', fontSize: '0.7rem', backgroundColor: getStatusColor(row.Status), color: '#FFFFFF' }}
                              >{row.Status}</button>
                            </td>
                            <td>
                              <a href="#">
                                <img
                                  src={arrow}
                                  alt="Arrow Icon"
                                  className={`float-end`}
                                  onClick={() => handleTabChange(row.TestCaseName)}
                                />
                              </a>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                  {tableData.length === 0 ? '' :
                    <nav aria-label="Page navigation example">
                      <ul className={`pagination justify-content-end ${classes.ulCss} ${classes.customPagination}`}>
                        <li className={`page-item ${isPreviousDisabled ? 'disabled' : ''}`}>
                          <a aria-label="Previous" className="page-link"
                            href="#"
                            tabIndex="-1"
                            onClick={() => handlePageChange(currentPage - 1)}>
                            <span aria-hidden="true">«</span>
                          </a>
                        </li>
                        {startPage > 1 && (
                          <li className="page-item disabled">
                            <span className="page-link">...</span>
                          </li>
                        )}
                        {pagesArray.slice(startPage - 1, endPage).map((index) => (
                          <li
                            key={index}
                            className={`page-item ${classes.numCss}`}>
                            <a className={`page-link  ${index + 1 === currentPage ? 'Mui-selected' : ''}`} href="#" onClick={() => handlePageChange(index + 1)}>
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
                  }
                </div>
              </div>
            </div>
        </div>
      </div>
    </div>
  );
};

export default TestCasePage;