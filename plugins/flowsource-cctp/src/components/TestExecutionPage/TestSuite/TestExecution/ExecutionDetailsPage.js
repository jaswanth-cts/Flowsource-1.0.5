import React, { useState, useEffect } from 'react';

import 'bootstrap/dist/css/bootstrap.min.css';
import { fetchApiRef, useApi, configApiRef } from '@backstage/core-plugin-api';

import cssClasses from './ExectionPageCss.js';

import dateUtils from '../../DateUtil.js';
import arrow from '../../../Icons/arrow.png';
import errorInfo from '../../../Icons/error_info.png';
import Delete_icon from '../../../Icons/Delete_icon.png';
import refresh_icon from '../../../Icons/refresh_icon.png';
import rerun_icon from '../../../Icons/rerun_icon.png';

import log from 'loglevel';

const ExecutionDetailsPage = (props) => {

  const [tableData, setTableData] = useState([]);
  //pagination
  const [currentPage, setCurrentPage] = useState(1);
  const pagesToShow = 3;
  const ITEMS_PER_PAGE = 5;
  const totalPages = Math.ceil(tableData.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const currentTableData = tableData.slice(startIndex, endIndex);
  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };
  const pagesArray = [...Array(totalPages).keys()];
  let startPage = 1;
  let endPage = Math.min(pagesToShow, totalPages);
  startPage = setStartPage();
  endPage = setEndPage();

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

  const isPreviousDisabled = currentPage === 1;
  const isNextDisabled = currentPage === totalPages;
  const [isLoading, setLoading] = useState(true);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [selectAll, setSelectAll] = useState(false);
  const [selectedRows, setSelectedRows] = useState([]);
  const [isDeleteDisabled, setIsDeleteDisabled] = useState(true);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [slectedDeleteButton, setSelectedDeleteButton] = useState('yes');
  const [deleteError, setDeleteError] = useState(null);
  const [showDeleteErrorDialog, setShowDeleteErrorDialog] = useState(false);
  const [showErrorDialog, setShowErrorDialog] = useState(false);
  const [errorLog, setErrorLog] = useState('');
  const [isErrorLoading, setErrorLoading] = useState(false);
  const [showRerunDialog, setShowRerunDialog] = useState(false); 
  const [showRerunStatusDialog, setShowRerunStatusDialog] = useState(false); 
  const [rerunDialogMessage, setRerunDialogMessage] = useState('');
  const [robots, setRobots] = useState([]);
  const [selectedRobot, setSelectedRobot] = useState('');
  const [rerunRow, setRerunRow] = useState(null);
  const [rerunStatus, setRerunStatus] = useState('');


  const { fetch } = useApi(fetchApiRef);
  const config = useApi(configApiRef);
  const baseUrl = config.getOptionalString('backend.baseUrl');
  const backendBaseApiUrl = setBaseUrlVal();

  function setBaseUrlVal() {
    if (baseUrl.endsWith('/')) {
      return `${baseUrl}api/flowsource-cctp/`;
    } else {
      return `${baseUrl}/api/flowsource-cctp/`
    }
  };

  const [error, setError] = useState(null);

  const classes = cssClasses({ 
    hasErrorLog: errorLog.length > 0, 
    isErrorLoading: isErrorLoading,
  });

  const handleBackButtonClick = () => {
    props.setbackIconClicked(!props.backIconClicked);
  }

  const handleSelectAll = () => { 
    let newSelectedRows = [...selectedRows];
    
    if (!selectAll) {
        newSelectedRows = [...new Set([...newSelectedRows, ...currentTableData.map(row => row.Id)])];
    }else {
        newSelectedRows = newSelectedRows.filter(id => !currentTableData.map(row => row.Id).includes(id));
    }
    setSelectedRows(newSelectedRows);
    setSelectAll(!selectAll);
    setIsDeleteDisabled(newSelectedRows.length === 0);  
  };

  const handleCheckboxChange = (e, rowId) => { 
    let newSelectedRows; 

    if (e.target.checked) { 
        newSelectedRows = [...selectedRows, rowId]; 
    } else { 
        newSelectedRows = selectedRows.filter(id => id !== rowId); 
    } 
    
    setSelectedRows(newSelectedRows); 
    setSelectAll(currentTableData.every(row => newSelectedRows.includes(row.Id)));
    setIsDeleteDisabled(newSelectedRows.length === 0);  
  };

  useEffect(() => {
    setSelectAll(currentTableData.length > 0 && currentTableData.every(row => selectedRows.includes(row.Id)));
  }, [selectedRows, currentPage, tableData]);

  useEffect(() => {
    const selectedRowsInCurrentPage = selectedRows.filter(id => currentTableData.map(row => row.Id).includes(id));
    setIsDeleteDisabled(selectedRowsInCurrentPage.length === 0);
  }, [currentPage, currentTableData, selectedRows]);

  const confirmDelete = () => {
    setSelectedDeleteButton('yes');
    setShowDeleteDialog(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      setSelectedDeleteButton('yes');
      setShowDeleteDialog(false);  // Hide the dialog before starting the delete
      setDeleteLoading(true);
      if (selectedRows.length > 0) {
        const response = await fetch(`${backendBaseApiUrl}cctp-proxy/flowsource/jobs`, {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ ids: selectedRows })
        });
  
        if (!response.ok) {
          // Read the error message from the response 
          const errorText = await response.text(); 
          // Format the error message 
          const formattedError = `HTTP error: status: ${response.status}, message: Error deleting execution/s` ; 
          // Set the error state with the formatted error message 
          setDeleteError(formattedError); 
          // Set the error dialog to true to display the error message
          setShowDeleteErrorDialog(true);
          log.error('Error deleting executions: API returned: ', errorText);
        } else {
          log.info(`Executions with IDs ${selectedRows.join(', ')} have been deleted successfully.`);

          // Refresh data
          getExecutionDetails();
    
          // Clear selected rows
          setSelectedRows([]);
          setSelectAll(false);
    
          // Navigate to the first page
          setCurrentPage(1);
        }
  
        
      }
    } catch (error) {
      log.error('Error deleting executions:', error);
      setDeleteError(`Error deleting execution/s`); 
      setShowDeleteErrorDialog(true); 
    } finally {
      setDeleteLoading(false);
    }
  };
  
  const handleDeleteCancel = () => {
    setSelectedDeleteButton('no');
    setShowDeleteDialog(false);
  }; 

  const handleRefresh = () => {
    setError(null);
    setLoading(true);
    getExecutionDetails();
  }

  async function getExecutionDetails() {
    try {
      const response = await fetch(`${backendBaseApiUrl}cctp-proxy/execution/execution/projects/${props.projectId}/jobs/`);
      if (response.ok) {
        const data = await response.json();
        
        //Load executions table data
        let executionDetailsArray = new Array();
        if (data !== null && data !== undefined) {
          data.forEach(function (item, index) {
            const entry = { 
              Id: item.id, 
              Name: item.name, 
              Priority: item.priority, 
              Status: item.status, 
              Assigned: new Date(item.assignedOn), // Parse to Date object
              Robot: item.robots.join(', '),
              Duration: dateUtils.formatTime(item.duration),
              Execution: item.name.split('#')[0].trim(),
            };
            executionDetailsArray.push(entry);
          })

          // Sort the executionDetailsArray based on Assigned field
          executionDetailsArray.sort((a, b) => b.Assigned - a.Assigned);

          // Update Assigned field to display relative time
          executionDetailsArray = executionDetailsArray.map(entry => ({
            ...entry,
            Assigned: dateUtils.timeAgo(entry.Assigned.toISOString()),
          }));
        };

        //Set the table data
        setTableData(executionDetailsArray);

        setLoading(false);
      } else {
        // Read the error message from the response 
        const errorText = await response.text(); 
        // Format the error message 
        const formattedError = `HTTP error: status: ${response.status}, message: Error fetching execution details.`; 
        // Set the error state with the formatted error message 
        setError(formattedError); 
        log.error('Error fetching execution details: API returned: ', errorText);
      }
    } catch (error) {
      // Log the error to the log
      log.error('Error fetching execution details:', error);
      setError(`Error fetching execution details.`);
    } finally {
      setLoading(false);
    }
  }

  async function getErrorInfo(jobId) {
    try {
      setErrorLoading(true);
      setShowErrorDialog(true);
      const response = await fetch(`${backendBaseApiUrl}cctp-proxy/execution/jobs/logs/search?jobId=${jobId}`);
      if (response.ok) {
        const data = await response.json();

        if(data !== null && data !== undefined) {
          if(data[0] && data[0].errorLog) {
            setErrorLog(data[0].errorLog);
          } else {
            setErrorLog('No error log found');
          }
        }

      } else {
        // Read the error message from the response 
        const errorText = await response.text(); 
        // Format the error message 
        const formattedError = `HTTP error: status: ${response.status}, message: Error fetching execution error log.`; 
        // Set the error state with the formatted error message 
        setError(formattedError); 
        log.error('Error fetching execution error log: API returned: ', errorText);
      }
    } catch (error) {
      // Log the error to the log level
      log.error('Error fetching execution error log:', error);
      setError(`Error fetching execution error log.`);
    } finally {
      setErrorLoading(false);
    }
  }

  async function handleExecutionRerun(jobName, jobId, robot) {
    try {
      // Extract the first robot name from the comma-separated string 
      const robotName = robot.split(',')[0].trim();

      const response = await fetch(`${backendBaseApiUrl}cctp-proxy/execution/jobs/${jobId}/rerun?robot=${robotName}`, {
        method: 'POST',
      });
      if (response.ok) {
        const data = await response.json();

        if(data !== null && data !== undefined) {
          setRerunDialogMessage(`Started rerun task - ${data.name}`); 
          setShowRerunStatusDialog(true);
          setRerunStatus("success");
        }

      } else {
        // Read the error message from the response 
        const errorText = await response.text();  

        // Set the error state with the formatted error message 
        setRerunDialogMessage(`Failed to rerun task - ${jobName}`); 
        setShowRerunStatusDialog(true);
        setRerunStatus("error");
        log.error('Failed to rerun task: API returned: ', errorText);
      }
    } catch (error) {
      // Log the error to the log level
      log.error('Failed to rerun task:', error);
      setRerunDialogMessage(`Failed to rerun task - ${jobName}`); 
      setShowRerunStatusDialog(true);
      setRerunStatus("error");
    } finally {
      setLoading(false);
    }
  }

  async function getAllRobots() {
    try {
      const response = await fetch(`${backendBaseApiUrl}cctp-proxy/execution/robots`);
      if (response.ok) {
        const data = await response.json();
        
        //Load robots' data
        let allRobotsArray = new Array();
        if (data !== null && data !== undefined) {
          data.forEach(function (item, index) {
            const entry = { 
              Id: item.id, 
              Name: item.name, 
            };
            allRobotsArray.push(entry);
          })
        };

        //Set default dropdown option
        setSelectedRobot(allRobotsArray[0].Name);

        //Set the dropdown data
        setRobots(allRobotsArray);
      } else {
        // Read the error message from the response 
        const errorText = await response.text(); 
        // Format the error message 
        const formattedError = `HTTP error: status: ${response.status}, message: Error fetching robots.`; 
        // Set the error state with the formatted error message 
        setError(formattedError); 
        log.error('Error fetching robots: API returned: ', errorText);
      }
    } catch (error) {
      // Log the error to the log level
      log.error('Error fetching robots:', error);
      setError(`Error fetching robots.`);
    } 
  }

  const handleRerunClick = (row) => {
    setRerunRow(row);
    setShowRerunDialog(true);
  };

  const handleRerun = () => {
    handleExecutionRerun(rerunRow.Name, rerunRow.Id, selectedRobot);
    setShowRerunDialog(false);
  };

  useEffect(() => {
    props.setHistoryTestExecution(3);
    getExecutionDetails();
    getAllRobots();
  }, []);

  function setExecutionStatusColor(status) {
    if(status === 'started') {
      return '#CC5500';
    } else if(status === 'finished') {
      return '#11BF6A';
    } else if(status === 'failed') {
      return '#d66d6d';
    } else {
      return 'inherit';
    }
  }

  function getDeleteIconHoverCssStlye() {
    if(isDeleteDisabled) {
      return classes.cursorNotAllowed;
    } else {
      return classes.cursorPointer;
    }
  }

  function getDisabledLinkCssStlye() {
    if(isDeleteDisabled) {
      return classes.disabledLink;
    } else {
      return '';
    }
  }

  function setDeleteButtonColorForYes() {
    if(slectedDeleteButton === 'yes') {
      return '#000048';
    } else {
      return 'grey';
    }
  }

  function setDeleteButtonColorForNo() {
    if(slectedDeleteButton === 'no') {
      return '#000048';
    } else {
      return 'grey';
    }
  }

  function getErrorDialogboxCssStlye() {
    if(isErrorLoading) {
      return classes.dialogBoxLoading;
    } else {
      return classes.dialogBoxContent;
    }
  }

  function renderErrorLogDialogBoxContent() {
    if(isErrorLoading) {
      return <p>Loading...</p>;
    } else {
      return <pre className={`${classes.textWrap}`}>{errorLog}</pre>;
    }
  }

  function checkIfPreviousDisabled() {
    if(isPreviousDisabled) {
        return 'disabled';
    } else {
        return '';
    }
  }

  function checkIfNextDisabled() {
      if(isNextDisabled) {
          return 'disabled';
      } else {
          return '';
      }
  }

  function renderExcutionDetailsTable() {
    if(error) {
      return (
        <div className="card ms-2 me-2 mb-2 mt-2">
          <div className="card-header">
            <h6>Error Occurred</h6>
          </div>
          <div className="card-body">
            <div className="alert alert-danger" role="alert">
              {error}
            </div>
          </div>
        </div>
      );
    }
    else if(isLoading)
    {
      return (
        <div className={`App p-3 ${classes.loading}`}>
          Loading...
        </div>
      );
    }
    else
    {
      return (
        <div className="table-responsive" >
          <table className={`table ${classes.tableBorders} `}>
            <thead>
              <tr className={`${classes.tableHead}`}>
                <th scope="col" className='checkboxColumn'>
                  <input type="checkbox" className={`${classes.checkbox}`} checked={selectAll} onChange={handleSelectAll} />
                </th>
                <th scope="col" className='nameColumn'>NAME</th>
                <th scope="col">JOB STATUS</th>
                <th scope="col">PRIORITY</th>
                <th scope="col">ASSIGNED</th>
                <th scope="col" className='robotColumn'>ROBOT</th>
                <th scope="col">DURATION</th>
                <th scope="col" className='executionColumn'>EXECUTION</th>
                <th scope="col" className='iconColumn'></th>
                <th scope="col" className='iconColumn'></th>
              </tr>
            </thead>
            <tbody >
              {deleteLoading ? (
                <tr>
                  <td colSpan="10" className="text-center">
                    Deleting...
                  </td>
                </tr>) : (
                currentTableData.length !== 0 && currentTableData.map((row) => (
                  <tr key={row.Id}>
                    <td className={`${classes.colStyle1}`}>
                      <input type="checkbox" className={`${classes.checkbox}`}
                        checked={selectedRows.includes(row.Id)}
                        onChange={(e) => { handleCheckboxChange(e, row.Id) }} />
                    </td>
                    <td className={`${classes.colStyle1}`}>{row.Name}</td>
                    <td className={`${classes.colStyle1}`}
                      style={{ color: setExecutionStatusColor(row.Status) }}>{row.Status}</td>
                    <td className={`${classes.colStyle1}`}>{row.Priority}</td>
                    <td className={`${classes.colStyle1}`}>{row.Assigned}</td>
                    <td className={`${classes.colStyle1}`}>{row.Robot}</td>
                    <td className={`${classes.colStyle1}`}>{row.Duration}</td>
                    <td className={`${classes.colStyle1}`}>{row.Execution}</td>
                    <td>
                      <a href="#">
                        <img
                          src={rerun_icon}
                          alt="Re-run Icon"
                          title='Click to re-run'
                          className={`float-end px-1`}
                          onClick={() => handleRerunClick(row)}
                        />
                      </a>
                    </td>
                    <td>
                      {row.Status === 'failed' && (
                        <>
                          <a href="#">
                            <img
                              src={errorInfo}
                              alt="Error info Icon"
                              title="Click to view error log"
                              className={`float-end px-1`}
                              onClick={() => getErrorInfo(row.Id)}
                              style={{ height: '20px' }}
                            />
                          </a>
                          {showErrorDialog && (
                            <div className={`${classes.dialogOverlay}`}>
                              <div className={`${classes.dialogBox}`}>
                                <div className={`${classes.dialogHeader}`}>
                                  <h2 className={`${classes.dialogHeaderText}`}>Error</h2>
                                  <button className={`${classes.closeButtonDialogBox}`}
                                    onClick={() => { setShowErrorDialog(false); setErrorLog(''); }}>×</button>
                                </div>
                                <div className={`${ getErrorDialogboxCssStlye() }`} >
                                  { renderErrorLogDialogBoxContent() }
                                </div>
                              </div>
                            </div>
                          )}
                        </>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
          {tableData.length === 0 ?
            (<p className={`${classes.dataUnavailable}`}>
              <b>No Data Available</b>
            </p>) :
            <nav aria-label="Page navigation example">
              <ul className={`pagination justify-content-end ${classes.ulCss} ${classes.customPagination}`}>
                <li className={`page-item ${ checkIfPreviousDisabled() }`}>
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
                <li className={`page-item ${ checkIfNextDisabled() }`}>
                  <a href="#" className="page-link" onClick={() => handlePageChange(currentPage + 1)} aria-label="Next">
                    <span aria-hidden="true">»</span>
                  </a>
                </li>
              </ul>
            </nav>
          }
        </div>
      );
    }
  };

  return (
    <div>
      <div className={`w-80 mt-2 ${classes.parentDivFramework}`} >
        <div className={`row justify-content-between pb-2`}>
          <div className={`d-flex justify-content-between align-items-center mb-2`}>
            <div className={`d-flex align-items-center`}>
              <div className={`${classes.tabNames} ${classes.marginleft10}`}>
                {props.tabDetails.tab1}
              </div>
              <div className={`${classes.tabArrow}`} >
                <div className={`col-auto`} >
                  <div>
                    <img
                      src={arrow}
                      alt="Arrow Icon"
                      className={`float-end ${classes.tabArrowIcon}`}
                    />
                  </div>
                </div>
              </div>
              <div className={`${classes.tabNames}`}>
                {props.tabDetails.tab2}
              </div>
            </div>
            <div className={`d-flex align-items-center`}>
              <a href="#" onClick={() => handleBackButtonClick()} className={`d-inline-flex align-items-center ${classes.marginright1}`}>
                <span className={`ms-2 ${classes.deleteCreateIconText} ${classes.backbutton}`}><b>&lt;</b> BACK</span>
              </a>
              <a href="#" onClick={(e) => { e.preventDefault(); confirmDelete(); }}
               className={`d-inline-flex align-items-center ${classes.marginright1} ${classes.marginright1} ${ getDeleteIconHoverCssStlye() }`}>
                <img
                  src={Delete_icon}
                  alt="Delete"
                  title='Click to delete'
                  className={`${classes.deleteIcon} ${ getDisabledLinkCssStlye() } ${ getDeleteIconHoverCssStlye() }`}
                />
                <span className={`ms-2 ${classes.deleteCreateIconText} ${ getDisabledLinkCssStlye() } ${ getDeleteIconHoverCssStlye() }`}>DELETE</span>
              </a>
              {/* Confirmation Dialog */}
              {showDeleteDialog && (
                <div className={`${classes.dialogOverlayDelete}`}>
                  <div className={`${classes.dialogBoxDelete}`}>
                    <p>Do you want to delete the selected item/s?</p>
                    <button
                        style={{ backgroundColor: setDeleteButtonColorForYes() }}
                        className={`${classes.dialogBoxYesButtonDelete}`}
                        onClick={handleDeleteConfirm}
                    >
                        Yes
                    </button>
                    <button
                        style={{ backgroundColor: setDeleteButtonColorForNo() }}
                        className={`${classes.dialogBoxNoButtonDelete}`}
                        onClick={handleDeleteCancel}
                    >
                        No
                    </button>
                  </div>
                </div>
              )}
              {/* Error Dialog */}
              {showDeleteErrorDialog && (
                <div className={`${classes.dialogOverlayDeleteError}`}>
                  <div className={`${classes.dialogBoxDeleteError}`}>
                    <div className="card ms-2 me-2 mb-2 mt-2 w">
                      <div className="card-header">
                        <h6>Error Occured</h6>
                      </div>
                      <div className="card-body">
                        <div className="alert alert-danger" role="alert">
                          {deleteError}
                        </div>
                      </div>
                    </div>
                    <button
                      className={`${classes.deleteErrorDialogBoxButton}`}
                      onClick={() => setShowDeleteErrorDialog(false)}
                    >
                      Close
                    </button>
                  </div>
                </div>
              )}
              <a href="#" onClick={(e) => { e.preventDefault(); handleRefresh(); }} className={`d-inline-flex align-items-center ${classes.marginright1}`}>
                <img
                  src={refresh_icon}
                  alt="Refresh"
                  title='Click to refresh'
                  onClick={() => handleRefresh()}
                  className={`${classes.deleteIcon}`}
                />
                <span className={`ms-2 ${classes.deleteCreateIconText}`}>REFRESH</span>
              </a>
            </div>
          </div>
          <div>
            { renderExcutionDetailsTable() }
          </div>
        </div>
      </div>
      {showRerunDialog && (
        <div className={`${classes.dialogOverlayRerun}`}>
          <div className={`${classes.dialogBoxRerun}`}>
            <div className={`${classes.dialogHeaderRerun}`}>
              <h2 className={`${classes.dialogHeaderRerunText}`}>Rerun {rerunRow.Name}</h2>
              <button className={`${classes.closeButtonRerunDialogBox}`}
                onClick={() => setShowRerunDialog(false)}>×</button>
            </div>
            <div className={`${classes.dialogBoxContentRerun}`}>
              <label htmlFor="robotSelect" className={`${classes.rerunDropdownLabel}`}>Select robot to run</label>
              <select id="robotSelect" value={selectedRobot} onChange={(e) => setSelectedRobot(e.target.value)}
                className={`${classes.robotSelect}`}>
                {robots.map(robot => (
                  <option className={`${classes.rerunDropdownOption}`} key={robot.Id} value={robot.Name}>{robot.Name}</option>
                ))}
              </select>
            </div>
            <div className={`${classes.dialogBoxFooterRerun}`}>
              <button onClick={handleRerun} className={`${classes.rerunDialogBoxButton}`}>Run</button>
            </div>
          </div>
        </div>
      )}
      {showRerunStatusDialog && ( 
        <div className={`${classes.dialogOverlayRerunStatus}`}>
          <div className={`${classes.dialogBoxRerunStatus}`}>
            <p className={`${rerunStatus === 'success' ? classes.rerunsuccess : classes.rerunerror}`}>{rerunDialogMessage}</p>
            <button
                className={`${classes.dialogBoxOkButton}`}
                onClick={() => { setShowRerunStatusDialog(false); setRerunDialogMessage(''); }}
            >
                Ok
            </button>
          </div>
      </div>
      )}
    </div>
  );
};

export default ExecutionDetailsPage;