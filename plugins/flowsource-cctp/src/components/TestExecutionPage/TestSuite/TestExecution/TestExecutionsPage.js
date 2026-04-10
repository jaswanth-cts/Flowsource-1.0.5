import React, { useState, useEffect } from 'react';

import 'bootstrap/dist/css/bootstrap.min.css';
import { fetchApiRef, useApi, configApiRef } from '@backstage/core-plugin-api';
import cssClasses from './ExectionPageCss.js';
import arrow from '../../../Icons/arrow.png';
import Delete_icon from '../../../Icons/Delete_icon.png';
import dateUtils from '../../DateUtil.js';

import log from 'loglevel';

const TestExecutionsPage = (props) => {

  const classes = cssClasses();
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
  const [showErrorDialog, setShowErrorDialog] = useState(false);

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

  const handleBackButtonClick = () => {
    props.setbackIconClicked(!props.backIconClicked);
  }

  const handleTabChange = (testSuiteExecutionId, testSuiteExecutionName) => {
    props.setActiveTab('executiondetails');
    props.setHistoryTestExecution(2);
    const tabJsonTestCase = {
      "tab1": props.tabDetails.tab1,
      "tab2": testSuiteExecutionName,
    }
    props.setTabDetails(tabJsonTestCase);
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
        const response = await fetch(`${backendBaseApiUrl}cctp-proxy/flowsource/executions`, {
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
          setShowErrorDialog(true);
          log.error('Error deleting executions: API returned: ', errorText);
        } else {
          log.info(`Executions with IDs ${selectedRows.join(', ')} have been deleted successfully.`);

          // Refresh data
          getExecutions();
    
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
      setShowErrorDialog(true); 
    } finally {
      setDeleteLoading(false);
    }
  };
  
  const handleDeleteCancel = () => {
    setSelectedDeleteButton('no');
    setShowDeleteDialog(false);
  }; 


  async function getExecutions() {
    try {
      const response = await fetch(`${backendBaseApiUrl}cctp-proxy/execution/suites/${props.testSuiteId}/executions`);
      if (response.ok) {
        const data = await response.json();
        
        //Load executions table data
        let executionsArray = new Array();
        if (data !== null && data !== undefined) {
          data.forEach(function (item, index) {
            const entry = { 
              Id: item.id, 
              Name: item.name, 
              Priority: item.priority, 
              Type: item.task.type, 
              Status: item.status, 
              CompletedOn: new Date(item.completedOn), // Parse to Date object
            };
            executionsArray.push(entry);
          });

          // Sort the executionsArray based on CompletedOn field
          executionsArray.sort((a, b) => b.CompletedOn - a.CompletedOn);

          // Update CompletedOn field to display relative time
          executionsArray = executionsArray.map(entry => ({
            ...entry,
            CompletedOn: dateUtils.timeAgo(entry.CompletedOn.toISOString()),
          }));
        }

        //Set the table data
        setTableData(executionsArray);

        setLoading(false);
      } else {
        // Read the error message from the response 
        const errorText = await response.text(); 
        // Format the error message 
        const formattedError = `HTTP error: status: ${response.status}, message: Error fetching executions.`; 
        // Set the error state with the formatted error message 
        setError(formattedError); 
        log.error('Error fetching executions: API returned: ', errorText);
      }
    } catch (error) {
      // Log the error to the log level
      log.error('Error fetching executions:', error);
      setError(`Error fetching executions.`);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    getExecutions();
  }, []);

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

  function renderTestExecutionPage() {
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
      return(
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
                <th scope="col">PRIORITY</th>
                <th scope="col">TYPE</th>
                <th scope="col">STATUS</th>
                <th scope="col"></th>
              </tr>
            </thead>
            <tbody >
              {deleteLoading ? (
                <tr>
                  <td colSpan="6" className="text-center">
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
                    <td className={`${classes.colStyle1}`}>{row.Priority}</td>
                    <td className={`${classes.colStyle1}`}>{row.Type}</td>
                    <td className={`${classes.colStyle1}`}>
                      <button type="button"
                        // className={`btn ${classes.btnstatus} ${row.Status === 'PASSED' ? classes.statuspassed : row.Status === 'FAILED' ? classes.statusfailed : classes.statusdefault}`}>
                        className='btn ${classes.btnstatus} ${classes.statuspassed}'
                        style={{
                          cursor: 'none', width: 'fit-content', borderRadius: '6rem', fontSize: '0.7rem',
                          backgroundColor: '#11BF6A', color: '#FFFFFF',
                        }}
                      >
                        {row.Status}
                      </button>
                      <span style={{ marginTop: '0.8rem', color: 'gray', marginLeft: '0.7rem' }}>{row.CompletedOn}</span>
                    </td>
                    {/* <td className={`${classes.colStyle1}`}>{row.Status}</td> */}
                    <td>
                      <a href="#">
                        <img
                          src={arrow}
                          alt="Arrow Icon"
                          className={`float-end px-1`}
                          onClick={() => handleTabChange(row.Id, row.Name)}
                        />
                      </a>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
          { tableData.length === 0 ?
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
            <div className={`d-flex align-items-center ${classes.tabNames} ${classes.marginleft10}`}>
              {props.tabDetails.tab1}
            </div>
            <div className={`d-flex align-items-center`}>
              <a href="#" onClick={() => handleBackButtonClick()} className={`d-inline-flex align-items-center ${classes.marginright1}`}>
                <span className={`ms-2 ${classes.deleteCreateIconText} ${classes.backbutton}`}><b>&lt;</b> BACK</span>
              </a>
              <a href="#" onClick={(e) => { e.preventDefault(); confirmDelete(); }}
               className={`d-inline-flex align-items-center ${classes.marginright1} ${ getDeleteIconHoverCssStlye() }`}>
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
                        style={{backgroundColor: setDeleteButtonColorForYes() }}
                        className={`${classes.dialogBoxYesButtonDelete}`}
                        onClick={handleDeleteConfirm}
                    >
                        Yes
                    </button>
                    <button
                        style={{backgroundColor: setDeleteButtonColorForNo() }}
                        className={`${classes.dialogBoxNoButtonDelete}`}
                        onClick={handleDeleteCancel}
                    >
                        No
                    </button>
                  </div>
                </div>
              )}
              {/* Error Dialog */} 
              {showErrorDialog && ( 
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
                      onClick={() => setShowErrorDialog(false)} 
                    > 
                      Close 
                    </button> 
                  </div> 
                </div> 
              )}
            </div>
          </div>
          <div>
            { renderTestExecutionPage() }
          </div>
        </div>
      </div>
    </div>
  );
};

export default TestExecutionsPage;