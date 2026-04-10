import React, { useState, useEffect } from 'react';

import 'bootstrap/dist/css/bootstrap.min.css';
import { fetchApiRef, useApi, configApiRef } from '@backstage/core-plugin-api';
import {  Link } from 'react-router-dom';

import cssClasses from './FrameworkPageCss.js';
import Create_plus_icon from '../../Icons/Create_plus_icon.png';
import Delete_icon from '../../Icons/Delete_icon.png';

import log from 'loglevel';

const FrameworksPage = (props) => {

  const classes = cssClasses();
  const [allFrameworks, setAllFrameworks] = useState([]);
  const [frameworkTableData, setFrameworkTableData] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setLoading] = useState(true);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [selectAll, setSelectAll] = useState(false);
  const [selectedRows, setSelectedRows] = useState([]);
  const [isDeleteDisabled, setIsDeleteDisabled] = useState(true);
  const [selectedOsButton, setSelectedOsButton] = useState('Unix');
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [error, setError] = useState(null);
  const [deleteError, setDeleteError] = useState(null);
  const [showErrorDialog, setShowErrorDialog] = useState(false);

  const getButtonStyles = (buttonState, selectedOsButton) => ({
    backgroundColor: selectedOsButton === buttonState ? '#000048' : 'transparent',
    color: selectedOsButton === buttonState ? 'white' : '#000048',
    border: `1px solid #000048`,
    height: '28px',
    borderRadius: '0', 
  });

  const ITEMS_PER_PAGE = 10;
  const totalPages = Math.ceil(frameworkTableData.length / ITEMS_PER_PAGE);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };
  
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const currentframeworkTableData = frameworkTableData.slice(startIndex, endIndex);
  const pagesToShow = 3;
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

  const { fetch } = useApi(fetchApiRef);
  const config = useApi(configApiRef);
  const baseUrl = config.getOptionalString('backend.baseUrl');
  const backendBaseApiUrl = setBaseUrlVal();
  
  function setBaseUrlVal() {
      if(baseUrl.endsWith('/')) {
        return `${baseUrl}api/flowsource-cctp/`;
      } else {
        return `${baseUrl}/api/flowsource-cctp/`
      } 
  };

  const handleTabChange = () => {
    props.setActiveTab('newframework');
    props.setFrameworkId(null);
  };

  const handleOsButtonClick = (os) => {
    setCurrentPage(1);
    setSelectedOsButton(os);
    const filteredData = allFrameworks.filter(item => item.OS === os);
    setFrameworkTableData(filteredData);
  };

  const handleSelectAll = () => { 
    let newSelectedRows = [...selectedRows];
        
    if (!selectAll) {
        newSelectedRows = [...new Set([...newSelectedRows, ...currentframeworkTableData.map(row => row.Id)])];
    }else {
        newSelectedRows = newSelectedRows.filter(id => !currentframeworkTableData.map(row => row.Id).includes(id));
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
    setSelectAll(currentframeworkTableData.every(row => newSelectedRows.includes(row.Id)));
    setIsDeleteDisabled(newSelectedRows.length === 0); 
  };

  useEffect(() => {
    setSelectAll(currentframeworkTableData.length > 0 && currentframeworkTableData.every(row => selectedRows.includes(row.Id)));
  }, [selectedRows, currentPage, frameworkTableData]);

  useEffect(() => {
    const selectedRowsInCurrentPage = selectedRows.filter(id => currentframeworkTableData.map(row => row.Id).includes(id));
    setIsDeleteDisabled(selectedRowsInCurrentPage.length === 0);
  }, [currentPage, currentframeworkTableData, selectedRows]);
 
  const confirmDelete = () => {
    setShowDeleteDialog(true);
  };
  
  const handleDeleteConfirm = async () => {
    try {
      setShowDeleteDialog(false);  // Hide the dialog before starting the delete
      setDeleteLoading(true);
      if (selectedRows.length > 0) {
        const response = await fetch(`${backendBaseApiUrl}cctp-proxy/flowsource/toolconfig`, {
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
          const formattedError = `HTTP error: status: ${response.status}, message: Error deleting framework/s` ; 
          // Set the error state with the formatted error message 
          setDeleteError(formattedError); 
          // Set the error dialog to true to display the error message
          setShowErrorDialog(true);
          log.error('Error deleting frameworks: API returned: ', errorText);
        } else {
          log.info(`Frameworks with IDs ${selectedRows.join(', ')} have been deleted successfully.`);
  
          // Refresh data
          await getAllFrameworks(selectedOsButton);
    
          // Clear selected rows
          setSelectedRows([]);
          setSelectAll(false);
    
          // Navigate to the first page
          setCurrentPage(1);
        }
  
        
      }
    } catch (error) {
      log.error('Error deleting frameworks:', error);
      setDeleteError(`Error deleting framework/s`); 
      setShowErrorDialog(true); 
    } finally {
      setDeleteLoading(false);
    }
  };
  
  const handleDeleteCancel = () => {
    setShowDeleteDialog(false);
  }; 

  function checkAnyUnixStepsExist(item) {
    return item.buildStepsDetails.unix.some(step => step.trim() !== '') || item.executionStepsDetails.unix.some(step => step.trim() !== ''); 
  };

  function createUnixEntry(item) {
    try
    {
      const unixBuildSteps = item.buildStepsDetails.unix.filter(step => step.trim() !== '');
      const unixExecutionSteps = item.executionStepsDetails.unix.filter(step => step.trim() !== '');
      const separator = item.separator || ',';

      const entryUnix = {
        Id: item.id,
        Name: item.name,
        BuildSteps: unixBuildSteps.join(` ${separator} `),
        ExecutionSteps: unixExecutionSteps.join(` ${separator} `),
        Pattern: item.pattern,
        Separator: item.separator,
        Properties: item.properties,
        OS: 'Unix'
      };

      return entryUnix;

    } catch(error) {
      log.error("Error: Error Creating Unix Entry.");
    }
  };

  function checkAnyWindowsStepsExist(item) {
    return item.buildStepsDetails.windows.some(step => step.trim() !== '') || item.executionStepsDetails.windows.some(step => step.trim() !== '');
  };

  function createWindowsEntry(item) {
    try
    {
      const windowsBuildSteps = item.buildStepsDetails.windows.filter(step => step.trim() !== '');
      const windowsExecutionSteps = item.executionStepsDetails.windows.filter(step => step.trim() !== '');
      const separator = item.separator || ',';

      const entryWindows = {
        Id: item.id,
        Name: item.name,
        BuildSteps: windowsBuildSteps.join(` ${separator} `),
        ExecutionSteps: windowsExecutionSteps.join(` ${separator} `),
        Pattern: item.pattern,
        Separator: item.separator,
        Properties: item.properties,
        OS: 'Windows'
      };

      return entryWindows;
      
    } catch(error) {
      log.error("Error: Error Creating Windows Entry.");
    }
  };


  async function getAllFrameworks(os) {
    try {
      const response = await fetch(`${backendBaseApiUrl}cctp-proxy/execution/tool-config/`);

      if (!response.ok) { 
        // Read the error message from the response 
        const errorText = await response.text(); 
        // Format the error message 
        const formattedError = `HTTP error: status: ${response.status}, message: Error fetching frameworks`; 
        // Set the error state with the formatted error message 
        setError(formattedError); 
        log.error('Error fetching frameworks: API returned: ', errorText);
      } else {
        const data = await response.json();
      
        let allFrameworksArray = new Array();
        const allFrameworks = data;
        if (data !== null && data !== undefined) {
          allFrameworks.forEach(function (item, index) {
            const hasUnixSteps = checkAnyUnixStepsExist(item); 
            const hasWindowsSteps = checkAnyWindowsStepsExist(item);

            if (hasUnixSteps) { 
              const entryUnix = createUnixEntry(item);
              allFrameworksArray.push(entryUnix); 
            } 
            
            if (hasWindowsSteps) {
              const entryWindows = createWindowsEntry(item);
              allFrameworksArray.push(entryWindows); 
            }
          })
        };
        
        // Sort the frameworks by name
        allFrameworksArray.sort((a, b) => a.Name.localeCompare(b.Name));

        setAllFrameworks(allFrameworksArray);

        //Filter Unix data
        const filteredData = allFrameworksArray.filter(item => item.OS === os);

        //Set the table data
        setFrameworkTableData(filteredData);

        setSelectedOsButton(os);
      }

      } catch (error) {
        // Log the error to the logger
        log.error('Error fetching frameworks:', error);
        setError(`Error fetching frameworks.`);

      } finally {
        setLoading(false);
      }
  }

  useEffect(async () => {
    setSelectedRows([]);
    getAllFrameworks('Unix');
  }, []);

  useEffect(() => { 
    // Reset checkboxes when the component mounts or OS type changes 
    setSelectAll(false); 
    setSelectedRows([]); 
    setIsDeleteDisabled(true);
  }, [selectedOsButton]);

  const updateFramework = (frameworkId) => { 
    props.setActiveTab('newframework'); 
    props.setFrameworkId(frameworkId); 
  }; 

  if (error) {
    return (
      <div className="card ms-2 me-2 mb-2 mt-2">
        <div className="card-header">
          <h6>Error Occured</h6>
        </div>
        <div className="card-body">
          <div className="alert alert-danger" role="alert">
            {error}
          </div>
        </div>
      </div>
    );
  }

  function getCursorStyleBasedOnDelete() {
    if(isDeleteDisabled) {
      return classes.cursorNotAllowed;
    } else {
      return classes.cursorPointer;
    }
  }

  function setDisableLinkStyleBasedOnDelete() {
    if(isDeleteDisabled) {
      return classes.disabledLink;
    } else {
      return '';
    }
  }

  return (
    <div>
      <div className={`w-80 mt-2 ${classes.parentDivFramework}`} >
        <div className={`row justify-content-between pb-2`}>
          <div className={`col-auto ${classes.marginbottom1}  ${classes.marginleft}`}>
            <button 
              className={`${classes.buttonStyle}`}
              style={getButtonStyles('Unix', selectedOsButton)}
              onClick={() => handleOsButtonClick('Unix')}>
              Unix
            </button>
            <button 
              className={`${classes.buttonStyle}`}
              style={getButtonStyles('Windows', selectedOsButton)}
              onClick={() => handleOsButtonClick('Windows')}>
              Windows
            </button>
          </div>
          <div className={`col-auto ${classes.iconRight}`}>
            <a href="#" onClick={(e) => { e.preventDefault(); confirmDelete(); }}
              className={`d-inline-flex  ${classes.marginright1} ${getCursorStyleBasedOnDelete()}`} >
                <img
                    src={Delete_icon}
                    alt="Delete"
                    title='Click to delete Framework'
                    className={`${classes.deleteCreateIcon} ${setDisableLinkStyleBasedOnDelete()} ${getCursorStyleBasedOnDelete()}`}
                />
                <span className={`ms-2 ${classes.deleteCreateIconText} ${setDisableLinkStyleBasedOnDelete()} ${getCursorStyleBasedOnDelete()}`} >DELETE</span>
            </a>
            {/* Confirmation Dialog */} 
            {showDeleteDialog && ( 
              <div className={`${classes.dialogOverlay}`}>
                <div className={`${classes.dialogBox}`}>
                  <p>Do you want to delete the selected item/s?</p>
                  <button
                      className={`${classes.dialogBoxYesButton}`}
                      onClick={handleDeleteConfirm}
                  >
                      Yes
                  </button>
                  <button
                      className={`${classes.dialogBoxNoButton}`}
                      onClick={handleDeleteCancel}
                  >
                      No
                  </button>
                </div>
            </div>
            )}
            {/* Error Dialog */} 
            {showErrorDialog && ( 
              <div className={`${classes.dialogOverlayError}`}> 
                <div className={`${classes.dialogBoxError}`}> 
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
                    className={`${classes.errorDialogBoxButton}`}
                    onClick={() => setShowErrorDialog(false)} 
                  > 
                    Close 
                  </button> 
                </div> 
              </div> 
            )}
            <a href="#" onClick={() => handleTabChange()} 
              className={`d-inline-flex align-items-center ${classes.marginright1} ${classes.newFrameworkBorder}`}>
                <img
                    src={Create_plus_icon}
                    alt="Create Framework"
                    title='Click to create Framework'
                    onClick={() => handleTabChange()}
                    className={`${classes.deleteCreateIcon}`}
                />
                <span className={`ms-2 ${classes.deleteCreateIconText}`} >NEW FRAMEWORK</span>
            </a>
          </div>
          <div>
            {isLoading ? (
              <div className={`App p-3 ${classes.loading}`}>
                Loading...
              </div>
            ) : (
              <div className="table-responsive" >
                <table className={`table ${classes.tableBorders} `}>
                  <thead>
                    <tr className={`${classes.tableHead}`}>
                      <th scope="col" className='checkboxColumn'>
                        <input type="checkbox" className={`${classes.checkbox}`} checked={selectAll} onChange={handleSelectAll} />
                      </th>
                      <th scope="col" className='nameColumn'>NAME</th>
                      <th scope="col">BUILD STEPS</th>
                      <th scope="col">EXECUTION STEPS</th>
                    </tr>
                  </thead>
                  <tbody >
                  {deleteLoading ? ( 
                    <tr> 
                      <td colSpan="4" className="text-center"> 
                        Deleting... 
                      </td> 
                    </tr> ) : (
                    currentframeworkTableData.length !== 0 && currentframeworkTableData.map((row) => (
                      <tr key={row.Name}>
                        <td className={`${classes.colStyle1}`}>
                          <input type="checkbox" className={`${classes.checkbox}`}
                            checked={selectedRows.includes(row.Id)}
                            onChange={(e) => { handleCheckboxChange(e, row.Id) }} />
                        </td>
                        <td className={`${classes.colStyle1}`}>
                          <Link to="#" onClick={() => updateFramework(row.Id)} className={classes.tablefont}>
                            {row.Name}
                          </Link>
                        </td>
                        <td className={`${classes.colStyle1}`}>{row.BuildSteps}</td> 
                        <td className={`${classes.colStyle1}`}>{row.ExecutionSteps}</td>
                      </tr>
                      ))
                    )}
                  </tbody>
                </table>
                {frameworkTableData.length === 0 ?  
                  (<p className={`${classes.dataUnavailable}`}>
                    <b>No Data Available</b>
                  </p>) :
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
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FrameworksPage;
