import React, { useState, useEffect } from 'react';

import 'bootstrap/dist/css/bootstrap.min.css';
import { fetchApiRef, useApi, configApiRef } from '@backstage/core-plugin-api';

import cssClasses from './ClientSidePerformanceAccessibilityCSS.js';
import { Alert} from '@mui/material';
import { useEntity } from '@backstage/plugin-catalog-react';
import accessibility_icon from '../../Icons/accessibility_icon.png';
import performance_icon from '../../Icons/performance_icon.png';

import log from 'loglevel';

const ClientSidePerformanceAccessibilityPage = (props) => {

  const classes = cssClasses();
  const [tableData, setTableData] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setLoading] = useState(true);
  const ITEMS_PER_PAGE = 5;
  const totalPages = Math.ceil(tableData.length / ITEMS_PER_PAGE);
  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const currentTableData = tableData.slice(startIndex, endIndex);
  const pagesToShow = 3;
  const sortedTableData = tableData.sort((a, b) => new Date(b.LastExecutedDate) - new Date(a.LastExecutedDate));
  const sortedTableDataPaginate = sortedTableData.slice(startIndex, endIndex);
  const pagesArray = [...Array(totalPages).keys()];

  let startPage = 1;
  let endPage = Math.min(pagesToShow, totalPages);

  startPage = currentPage > pagesToShow - 2 ? currentPage - Math.floor(pagesToShow / 2) : startPage;
  endPage = currentPage > pagesToShow - 2 ? Math.min(currentPage + Math.floor(pagesToShow / 2), totalPages) : endPage;
  const isPreviousDisabled = currentPage === 1;
  const isNextDisabled = currentPage === totalPages;

  const { fetch } = useApi(fetchApiRef);
  const config = useApi(configApiRef);
  const { entity } = useEntity();
  const projectName = entity.metadata.annotations['flowsource/CCTP-project-name'];
  const backendBaseApiUrl = config.getString('backend.baseUrl') + '/api/flowsource-cctp/';

  //Incase of error we need to make it true.
  const [isError, setIsError] = useState(false);
  const [errorDetail, setErrorDetail] = useState('');

  const handleAccessibilityTabChange = (executionName, testCaseId) => {

    props.setActiveTab('accessibilityone');
    props.setHistoryTestExecution(2);

    const tabJsonTestCase = {
      "tab1": 'Accessibility',
      "tab2": executionName,
    }

    props.setTabDetails(tabJsonTestCase);
    props.setTestCaseId(testCaseId);
  };

  const handlePerformanceTabChange = (executionName, testCaseId) => {

    props.setActiveTab('CSPPageOne');
    props.setHistoryTestExecution(2);

    const tabJsonTestCase = {
      "tab1": 'Client Side Performance',
      "tab2": executionName,
    }

    props.setTabDetails(tabJsonTestCase);
    props.setTestCaseId(testCaseId);
  };

  async function getTestSuite() {
    try 
    {
      let allExecutions = false;
      if (props.activeButton === 'AllExecution') {
        allExecutions = true;
      }
      
      const response = await fetch(`${backendBaseApiUrl}cctp-proxy/flowsource/testResults?projectName=${projectName}&allExecutions=${allExecutions}`);

      if (response.ok) 
      {
        const data = await response.json();

        //Load TestSuite table data
        let testSuiteArray = new Array();
        const executetestsuite = data.executionResultDTO;
        if (data !== null && data !== undefined && data.executionResultDTO !== null && data.executionResultDTO !== undefined) 
        {
          executetestsuite.forEach(function (item, index) {
            const entry = { Id: item.id, Name: item.suiteName, ExecutionName: item.name, LastExecutedDate: item.endTime, Duration: formatTime(item.duration), Skipped: item.skipped, Status: item.status, hyperlink: item.redirectionURL, NoofPass: item.passed, Noofailed: item.failed };
            testSuiteArray.push(entry);
          })
        };

        //Set the table data
        setTableData(testSuiteArray);
      }
      else if (response.status === 503) {
        setIsError(true);
        setErrorDetail(`This plugin has not been configured with the required credentials. Please ask your administrator to configure it.`);
      }
      else {
        setIsError(true);

        const errorText = await response.text();
        const formattedError = `HTTP error! status: ${response.status}, message: ${errorText}`;
        setErrorDetail(formattedError);
      }

      setLoading(false);

    } catch(error) {
      log.info('error: ' + error);

    } finally {
      setLoading(false);
    }
  }

  function formatTime(milliseconds) {
    let seconds = Math.floor(milliseconds / 1000);
    let minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    seconds = seconds % 60;
    minutes = minutes % 60;

    let formattedTime = "";
    if (hours > 0) {
      formattedTime += `${hours}h `;
    }
    if (minutes > 0) {
      formattedTime += `${minutes}m `;
    }
    formattedTime += `${seconds}s`;

    return formattedTime.trim();
  }

  useEffect(async () => {
    getTestSuite();
  }, []);

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

  if(isLoading) {
    return (
      <div className={`App p-3 ${classes.isLoadingStyle}`}>
        Loading...
      </div>
    );
  }

  if (isError) 
  {
    let displayError = errorDetail;
    try 
    {
      if (errorDetail.includes('HTTP error!')) 
      {
        const errorObj = JSON.parse(errorDetail.split('message: ')[1]);
        const statusCode = errorObj.response.statusCode;
        displayError = 'HTTP Error: Status Code: ' + statusCode + ', message: Application error occured.';
      }
    } catch (e) {
      log.error('Error parsing error message:', e);
    }

    return (
      <div>
        <div className="card ms-2 me-2 mb-2 mt-2">
          <div className="card-header">
            <h6>Error</h6>
          </div>
          <div className="card-body">
            <Alert severity="error">
              {displayError}
            </Alert>
          </div>
        </div>
        <div className="mb-4" />
      </div>
    );
  }

  return (
    <div>
      <div className={`w-80 mt-2 ${classes.mainDiv}`}>
        <div className={`row justify-content-start pb-2`}>
          <div>
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
                    </tr>
                  </thead>
                  <tbody className={`${classes.tBody}`}>
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
                          <td className={`${classes.colStyleText}`}>{row.ExecutionName}</td>
                          <td className={`${classes.colStyleText}`}>
                            {row.Name}
                          </td>
                          <td className={`${classes.colStyleText}`}>{gmtDateTime}</td> {/* Display the formatted GMT date and time here */}
                          <td className={`${classes.colStyleText}`}>{row.Duration}</td>
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
                            <button type="button" class="btn" style={{ cursor: 'default', borderRadius: '6rem', fontSize: '0.7rem', backgroundColor: getStatusColor(row.Status), color: '#FFFFFF' }}
                            >{row.Status}</button>
                          </td>

                          <td>
                            <a href="#">
                              <img
                                src={performance_icon}
                                alt="Performance Icon"
                                className={`float-end`}
                                onClick={() => handlePerformanceTabChange(row.ExecutionName, row.Id)}
                                title="Client Side Performance"
                              />
                            </a>
                          </td>
                          <td>
                            <a href="#">
                              <img
                                src={accessibility_icon}
                                alt="Accessibility Icon"
                                className={`float-end`}
                                onClick={() => handleAccessibilityTabChange(row.ExecutionName, row.Id)}
                                title="Accessibility"
                              />
                            </a>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
                {tableData.length === 0 ?
                  (<p className={`${classes.dataUnavailable}`}>
                    <b>No Data Available</b>
                  </p>) :
                  <div className='d-flex justify-content-between align-items-center mt-2'>
                    <div className='d-flex align-items-center'>
                      <img
                        src={performance_icon}
                        alt="Performance Icon"
                        className={`${classes.performanceIconImg}`}
                      />
                      <span className={`${classes.performanceIconText}`}>Client Side Performance</span>
                      <img
                        src={accessibility_icon}
                        alt="Accessibility Icon"
                        className={`${classes.accessibilityIconImg}`}
                      />
                      <span className={`${classes.accessibilityIconText}`}>Accessibility</span>
                    </div>
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
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClientSidePerformanceAccessibilityPage;
