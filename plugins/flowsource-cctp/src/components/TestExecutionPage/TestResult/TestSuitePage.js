import React, { useState, useEffect } from 'react';

import 'bootstrap/dist/css/bootstrap.min.css';
import { fetchApiRef, useApi, configApiRef } from '@backstage/core-plugin-api';
import {  Link } from 'react-router-dom';

import cssClasses from '../TestingMainPageCSS.js';
import { Paper, Card, CardHeader, Typography, Divider, CardContent, Alert } from '@mui/material';
import { useEntity } from '@backstage/plugin-catalog-react';
import arrow from '../../Icons/arrow.png';
import dateUtils from '../DateUtil.js';
import errorInfo from '../../Icons/error_info.png';

import log from 'loglevel';

const TestSuitePage = (props) => {

  const classes = cssClasses();
  const [tableData, setTableData] = useState([]);
  //pagination
  const [currentPage, setCurrentPage] = useState(1);
  const pagesToShow = 3;
  const ITEMS_PER_PAGE = 5;
  const totalPages = Math.ceil(tableData.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };
  const sortedTableData = tableData.sort((a, b) => new Date(b.LastExecutedDate) - new Date(a.LastExecutedDate));
  const sortedTableDataPaginate = sortedTableData.slice(startIndex, endIndex);
  const pagesArray = [...Array(totalPages).keys()];
  let startPage = 1;
  let endPage = Math.min(pagesToShow, totalPages);
  
  function setStartPage() {
    if(currentPage > pagesToShow - 2) {
        return currentPage - Math.floor(pagesToShow / 2);
    } else {
        return startPage;
    }
  };

  function setEndPage() {
      if(currentPage > pagesToShow - 2) {
          return Math.min(currentPage + Math.floor(pagesToShow / 2), totalPages);
      } else {
          return endPage;
      }
  };

  startPage = setStartPage();
  endPage = setEndPage();

  const isPreviousDisabled = currentPage === 1;
  const isNextDisabled = currentPage === totalPages;
  const [isLoading, setLoading] = useState(true);
  const { fetch } = useApi(fetchApiRef);
  const config = useApi(configApiRef);
  const { entity } = useEntity();
  const projectName = entity.metadata.annotations['flowsource/CCTP-project-name'];
  const baseUrl = config.getOptionalString('backend.baseUrl');
  const backendBaseApiUrl = setBaseUrlVal();
  function setBaseUrlVal() {
    if(baseUrl.endsWith('/')) {
      return `${baseUrl}api/flowsource-cctp/`;
    } else {
      return `${baseUrl}/api/flowsource-cctp/`
    } 
  };

  const [error, setError] = useState(null);

  const handleTabChange = (testSuiteName, testCaseId) => {
    props.setActiveTab('testcase');
    props.setHistoryTestExecution(2);
    const tabJsonTestCase = {
      "tab1": props.tabDetails.tab1,
      "tab2": testSuiteName,
    }
    props.setTabDetails(tabJsonTestCase);
    props.setTestCaseId(testCaseId);
    props.setIconClicked('buttonForTestExecution'); // To let the back button know arrow icon was clicked
  };

  const handleErrorClick = (testSuiteName, testExecutionId) => {
    props.setActiveTab('failureCauseAnalysis');
    props.setTestExecutionId(testExecutionId);
    props.setHistoryTestExecution(2);
    const tabJsonTestCase = {
      "tab1": props.tabDetails.tab1,
      "tab2": testSuiteName,
    }
    props.setTabDetails(tabJsonTestCase);
    props.setActiveTabDetails('Failure Cause Analysis');
    props.setIconClicked('buttonForFailureCauseAnalysis'); // To let the back button know Error icon was clicked
  };

  async function getTestSuite() {
    try {
      let allExecutions = false;
      if (props.activeButton === 'AllExecution') {
        allExecutions = true;
      }
      const response = await fetch(`${backendBaseApiUrl}cctp-proxy/flowsource/testResults?projectName=${projectName}&allExecutions=${allExecutions}`);
    if (response.ok) {
      const data = await response.json();
      //Load TestSuite table data
      let testSuiteArray = new Array();
      const executetestsuite = data.executionResultDTO;
      if (data !== null && data !== undefined && data.executionResultDTO !== null && data.executionResultDTO !== undefined) {
        executetestsuite.forEach(function (item, index) {
          const entry = { Id: item.id, Name: item.suiteName, ExecutionName: item.name, LastExecutedDate: item.endTime, Duration: dateUtils.formatTime(item.duration), Skipped: item.skipped, Status: item.status, hyperlink: item.redirectionURL, NoofPass: item.passed, Noofailed: item.failed, PredictionStatus: item.isPredictionDone };
          testSuiteArray.push(entry);
        })
      };

      //Set the table data
      setTableData(testSuiteArray);

      setLoading(false);
    } else {
      setError(`Application error occured with status code: ${response.status})`);
      setLoading(false);
    }
  } catch (error) {
    setError(error.message);
    log.error("Error in fetching data ", error.message);
    setLoading(false);
  }
}

useEffect(() => {
  getTestSuite();
}, [props.activeButton]);

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
    {!error ? (
      <div className={`w-80 mt-2`} style={{ width: '100%', border: 'none' }}>
        <div className={`row justify-content-start pb-2`}>
          <div>
            {isLoading ? (
              <div className={`App p-3 ${classes.loading1}`}>
                Loading...
              </div>
            ) : (
              <div className="table-responsive" >
                <table className={`table ${classes.tableBorders} `}>
                  <thead>
                    <tr className={`${classes.tableHead}`}>
                      <th className={`${classes.colStyle}`} scope="col">EXECUTION NAME</th>
                      <th className={`${classes.colStyle}`} scope="col">TEST SUITE</th>
                      <th className={`${classes.colStyle}`} scope="col">LAST EXECUTED DATE (GMT)</th>
                      <th className={`${classes.colStyle}`} scope="col">DURATION</th>
                      <th className={`${classes.colStyle}`} scope="col">NO OF PASS</th>
                      <th className={`${classes.colStyle}`} scope="col">NO OF FAILURE</th>
                      <th className={`${classes.colStyle}`} scope="col">NO OF SKIPPED</th>
                      <th className={`${classes.colStyle}`} scope="col">STATUS</th>
                      <th className={`${classes.colStyle}`} scope="col"></th>
                      <th className={`${classes.colStyle}`} scope="col"></th>
                      <th className={`${classes.colStyle}`} scope="col"></th>
                    </tr>
                  </thead>
                  <tbody style={{ textAlign: '-webkit-center' }}>
                    {sortedTableDataPaginate.map((row) => {
                      // Convert LastExecutedDate to a Date object
                      const date = new Date(row.LastExecutedDate);
                      // Format the date part
                      const day = String(date.getDate()).padStart(2, '0');
                      const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are zero-based
                      const year = date.getFullYear();
                      const datePart = `${day}/${month}/${year}`;
                      // Format the time part
                      const timePart = date.toUTCString().split(' ')[4]; // Extracts the time part
                      // Combine date and time with GMT
                      const gmtDateTime = `${datePart} ${timePart}`;

                      return (
                        <tr key={row.Id}>
                          <td className={`${classes.colStyle1}`}>{row.ExecutionName}</td>
                          <td className={`${classes.colStyle1}`}>
                            <Link to={`${row.hyperlink}`} target="_blank" className={classes.tablefont}>
                              {row.Name}
                            </Link>
                          </td>
                          <td className={`${classes.colStyle1}`}>{gmtDateTime}</td> {/* Display the formatted GMT date and time here */}
                          <td className={`${classes.colStyle1}`}>{row.Duration}</td>
                          <td className={`${classes.colStyle1}`}>
                            <div className={classes.priorityCircle1}>
                              {row.NoofPass}
                            </div>
                          </td>
                          <td className={`${classes.colStyle1}`}>
                            <div className={classes.priorityCircle2}>
                              {row.Noofailed}
                            </div>
                          </td>
                          <td className={`${classes.colStyle1}`}>
                            <div className={classes.priorityCircle3}>{row.Skipped}
                            </div>
                          </td>
                          <td className={`${classes.colStyle1}`}>
                            <button type="button" class="btn" style={{cursor: 'default', borderRadius: '6rem', fontSize: '0.7rem', backgroundColor: getStatusColor(row.Status), color: '#FFFFFF' }}
                            >{row.Status}</button>
                          </td>
                          {row.PredictionStatus === true && row.Status === 'FAILED' ? (
                            <td className={`${classes.colStyle1}`}>
                              <a href="#">
                                <img
                                  src={errorInfo}
                                  alt="Error Icon"
                                  title='Click to view FailureCauseAnalysis'
                                  className={`float-end pt-1`}
                                  onClick={() => handleErrorClick(row.Name, row.Id)}
                                />
                              </a>
                            </td>
                          ) : (
                            <td className={`${classes.colStyle1}`}></td>
                          )}
                          <td>
                            <a href="#">
                              <img
                                src={arrow}
                                alt="Arrow Icon"
                                className={`float-end px-1`}
                                onClick={() => handleTabChange(row.Name, row.Id)}
                              />
                            </a>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
                {tableData.length === 0 ? (<p className={`${classes.dataUnavailable}`}>
                    <b>No Data Available</b>
                  </p>) :
                  <div className='d-flex align-items-center mt-2 justify-content-end'>
                      {tableData.some(
                        (item) => item.PredictionStatus === true
                      ) && (
                          <div className='d-flex align-items-center position-absolute start-0'>
                            <img
                              src={errorInfo}
                              alt="Error Icon"
                              style={{ width: '15px', height: '15px', marginRight: '10px', marginLeft: '15px' }}
                            />
                            <span style={{ fontSize: '0.7rem' }}>To View Failure Cause Analysis report</span>
                          </div>
                        )}
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
                  </div>
                }
              </div>
            )}
          </div>
        </div>
      </div>
    ) : (
      <ErrorCard error={error} />
    )}
  </div>
);
};

const ErrorCard = ({ error }) => (
  <Card sx={{ width: '100%' }}>
    <CardHeader title={<Typography variant="h6">Error</Typography>} />
    <Divider />
    <CardContent>
      <Paper role="alert" elevation={0}>
        <Alert severity="error">{error}</Alert>
      </Paper>
    </CardContent>
  </Card>
);

export default TestSuitePage;
