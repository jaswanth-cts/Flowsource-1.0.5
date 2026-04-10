import React, { useState, useEffect } from 'react';


import { fetchApiRef, useApi, configApiRef } from '@backstage/core-plugin-api';

import DELETE_ICON from '../../Icons/Delete_icon.png';
import CREATE_ICON from '../../Icons/Create_plus_icon.png';
import REFRESH_ICON from '../../Icons/refresh_icon.png';
import SETTINGS_ICON from '../../Icons/settings_icon.png';

import cssClasses from './RobotsMainPageCss';

import dateUtils from '../../TestExecutionPage/DateUtil.js';


import DownloadRobot from './DownloadRobot';
import RobotPropertiesCard from './RobotPropertiesCard';

import log from 'loglevel';

const RobotsMainPage = (props) => {

    const classes = cssClasses();
    
    const { fetch } = useApi(fetchApiRef);
    const config = useApi(configApiRef);
    const backendBaseApiUrl = config.getString('backend.baseUrl') + '/api/flowsource-cctp/';

    const [isLoading, setLoading] = useState(true);

    //USED TO SHOW HTTP ERROR MESSAGE ON MAIN PAGE.
    const [httpError, setHttpError] = useState(null);
    const [noDataAvailable, setNoDataAvailable] = useState(false);

    /* START OF TABLE PAGINATION LOGIC. */
    
    const [robotsTableData, setRobotsTableData] = useState([]);

    const [currentPage, setCurrentPage] = useState(1);

    const ITEMS_PER_PAGE = 10;
    const totalPages = Math.ceil(robotsTableData.length / ITEMS_PER_PAGE);
  
    const handlePageChange = (pageNumber) => {
      setCurrentPage(pageNumber);
    };
    
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    const currentTableData = robotsTableData.slice(startIndex, endIndex);
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
    
    /* END OF TABLE PAGINATION LOGIC. */
    
    const [enableDownloadPopUp, setEnableDownloadPopUp] = useState(false);

    /* START OF DELETE ROBOT LOGIC. */
    const [isApiError, setIsApiError] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');

    const [deleteLoading, setDeleteLoading] = useState(false);
    const [showDeleteDialog, setShowDeleteDialog] = useState(false); 
    
    async function handleClickOnDeleteButton() {
        setShowDeleteDialog(true);
    }
    
    async function handleDeleteRobot() { 
        try
        {
            setShowDeleteDialog(false);
            setDeleteLoading(true);
            
            if (selectedRows.length > 0) 
            {
                const response = await fetch(`${backendBaseApiUrl}cctp-proxy/flowsource/robots`, {
                    method: 'DELETE',
                    headers: {
                      'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ ids: selectedRows })
                });

                if(response.ok)
                {
                    log.info(`Robots with IDs ${selectedRows.join(', ')} have been deleted successfully.`);

                    // Refresh Robot Data in the main page.
                    await handleRefreshRobot();

                    // Clear the selected rows of robot that are deleted. Disable delete button.
                    setSelectedRows([]);
                    setSelectAll(false);
                    setIsDeleteDisabled(true);

                    // Navigate to the first page
                    setCurrentPage(1);
                }
                else
                {
                    // Clear the selected rows of robot that need to be deleted.  Disable delete button.
                    setSelectedRows([]);
                    setSelectAll(false);
                    setIsDeleteDisabled(true);

                    // Navigate to the first page
                    setCurrentPage(1);

                    const apiErrorText = await response.text();
                    log.info('Error: API returned: ' + response.status + ' - ' + apiErrorText);

                    const formattedError = `HTTP Error: Status: ${response.status}, Message: Error Deleting Robot/s.`;
                    setErrorMessage(formattedError);
                    setIsApiError(true);
                }
            }
            
        } catch(error) {
            log.info('Error in handleDeleteRobot function: ', error);

            // Clear the selected rows of robot that need to be deleted.  Disable delete button.
            setSelectedRows([]);
            setSelectAll(false);
            setIsDeleteDisabled(true);
            
            // Navigate to the first page
            setCurrentPage(1);

            setErrorMessage('Application Error: Error Deleting Robot/s.');
            setIsApiError(true);
        } finally {
            setDeleteLoading(false);
        }
    };

    const [selectAll, setSelectAll] = useState(false);
    const [selectedRows, setSelectedRows] = useState([]);
    const [isDeleteDisabled, setIsDeleteDisabled] = useState(true);

    const handleCheckboxChange = (e, robotId) => {
        let newSelectedRows; 

        if (e.target.checked) { 
            newSelectedRows = [...selectedRows, robotId]; 
        } else { 
            newSelectedRows = selectedRows.filter(id => id !== robotId); 
        } 
        
        setSelectedRows(newSelectedRows); 
        setSelectAll(currentTableData.every(row => newSelectedRows.includes(row.id)));
        setIsDeleteDisabled(newSelectedRows.length === 0); 
    }; 
    
    async function handleSelectAllCheckBox() {
        let newSelectedRows = [...selectedRows];
        
        if (!selectAll) {
            newSelectedRows = [...new Set([...newSelectedRows, ...currentTableData.map(row => row.id)])];
        }else {
            newSelectedRows = newSelectedRows.filter(id => !currentTableData.map(row => row.id).includes(id));
        }
        setSelectedRows(newSelectedRows);
        setSelectAll(!selectAll);
        setIsDeleteDisabled(newSelectedRows.length === 0);
    }

    useEffect(() => {
        setSelectAll(currentTableData.length > 0 && currentTableData.every(row => selectedRows.includes(row.id)));
    }, [selectedRows, currentPage, robotsTableData]);

    useEffect(() => {
        const selectedRowsInCurrentPage = selectedRows.filter(id => currentTableData.map(row => row.id).includes(id));
        setIsDeleteDisabled(selectedRowsInCurrentPage.length === 0);
      }, [currentPage, currentTableData, selectedRows]);

    /* END OF DELETE ROBOT LOGIC. */

    /* START OF REFRESH ROBOT LOGIC. */

    async function handleRefreshRobot() {
        try
        {
            setLoading(true);

            await getAllRobotsDataFromBackend();
        
        } catch(error) {
            log.info('Error in handleRefreshRobot function: ', error);
        }
    }

    /* END OF REFRESH ROBOT LOGIC. */

    /* START OF CREATE ROBOT LOGIC. */

    async function handleCreateRobot() {
        props.setActiveTab('createNewRobot');
    }
    
    /* END OF CREATE ROBOT LOGIC. */
    
    /* START OF UPDATE ROBOT LOGIC. */

    async function handleRobotUpdate(robotId) {
        props.setActiveTab('updateRobot');
        props.setRobotId(robotId);
    }

    /* END OF UPDATE ROBOT LOGIC. */

    /* START OF GET ROBOT PROPERTIES LOGIC. */

    const [isDisplayRobotProperties, setIsDisplayRobotProperties] = useState(false);
    const [displayRobotPropsForId, setDisplayRobotPropsForId] = useState('');
    
    async function displayRobotPropertiesOnClick(robotId) {
        setIsDisplayRobotProperties(true);
        setDisplayRobotPropsForId(robotId);
    }

    /* END OF GET ROBOT PROPERTIES LOGIC. */

    /* START OF POPULATE ROBOT TABLE LOGIC IN MAIN PAGE. */
    
    async function getAllRobotsDataFromBackend() {
        try
        {
            const response = await fetch(`${backendBaseApiUrl}cctp-proxy/execution/robots/`);

            if (response.ok) 
            {
                const data = await response.json();

                if(data !== null && data !== undefined && data.length > 0) 
                {
                    let robotsData = data.map((robot) => {
                        return {
                            id: robot.id,
                            name: robot.name,
                            status: robot.status,
                            task: robot.jobName,
                            modifiedOn: robot.modifiedOn === null ? '' : robot.modifiedOn,
                            lastAssigned: robot.lastAssignedOn === null ? '' : dateUtils.formatDate(robot.lastAssignedOn),
                            expiryDate: robot.expiryDate === null ? '' : robot.expiryDate,
                        };
                    });

                    // Sort the data based on the modifiedOn date. List the latest created robot first.
                    let sortedRobotData = robotsData.sort((a, b) => {
                        return new Date(b.modifiedOn) - new Date(a.modifiedOn);
                    });

                    setRobotsTableData(sortedRobotData);
                } else {
                    log.info('Error: Data returned is null or undefined. API returned: ' + response.status);
                    setNoDataAvailable(true);
                }
            } else {
                log.info('Error: API returned: ' + response.status + ' - ' + response.statusText);
                // Set the error state with the formatted error message
                const formattedError = await response.text();
                setHttpError(formattedError);
            }
            
        } catch(error) {
            log.info('Exception occured in getAllRobotsDataFromBackend function: ', error);
            setNoDataAvailable(true);
        } finally {
            setLoading(false);
        }
    }
    /*START OF Extend Expiry Logic. */
    const extendExpiry = async (robot) => {
        try {
            const updatedExpiryDate = new Date(robot.expiryDate);
            updatedExpiryDate.setDate(updatedExpiryDate.getDate() + 15);

            const payload = {
                ...robot,
                expiryDate: updatedExpiryDate.toISOString(),
                daysExtended: 15,
                isExpiryDateExtended: true
            }; 
            const response = await fetch(`${backendBaseApiUrl}cctp-proxy/execution/robots/`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload),
            });

            if (response.ok) {
                const updatedRobot = await response.json();
                // Optionally refresh data or update state
                getAllRobotsDataFromBackend();
            } else {
                console.error('Failed to extend expiry:', response.statusText);
            }
        } catch (error) {
            console.error('Error extending expiry:', error);
        }
    };
/* END OF Extend Expiry Logic. */ 

    function getColorForRobotStatus(status) {
        try
        {
            if(status.trim().toLowerCase() === 'assigned') {
                return '#d66d6d';
            } else {
                return 'black';
            }
        } catch (error) {
            log.info('Error in getColorForRobotStatus function: ', error);
            return 'black';
        }
    }

    /* END OF POPULATE ROBOT TABLE LOGIC IN MAIN PAGE. */

    useEffect(async () => {
        getAllRobotsDataFromBackend();
    }, []);

    if (isLoading) {
        return(
          <div className={`App p-3 ${classes.isLoadingStyle}`}>
            Loading...
          </div>
        );
    }

    if (httpError) {
        let displayError = '';
        try {
            const errorObj = JSON.parse(httpError);
            const statusCode = errorObj.response.statusCode;
            displayError = `HTTP error: status: ${statusCode}, message: Application error occured.`;
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
            { isApiError && <PopErrorBox errorMessage={errorMessage} setIsApiError={setIsApiError} /> }
            { enableDownloadPopUp && <DownloadingPopUp setEnableDownloadPopUp={setEnableDownloadPopUp}/>}
            { /* STRART OF DELETE CONFIRMATION DIALOGUE BOX. */}
            { showDeleteDialog && 
                <div className={`${classes.dialogOverlay}`}>
                    <div className={`${classes.dialogBox}`}>
                        <p>Do you want to delete the selected item/s?</p>
                        <button
                            className={`${classes.dialogBoxYesButton}`}
                            onClick={handleDeleteRobot}
                        >
                            Yes
                        </button>
                        <button
                            className={`${classes.dialogBoxNoButton}`}
                            onClick={() => 
                                setShowDeleteDialog(false) //Just closing the dialog box.
                            }
                        >
                            No
                        </button>
                    </div>
                </div>
            }
            { /* END OF DELETE CONFIRMATION DIALOGUE BOX. */}
            { /* START OF ROBOT CRUD BUTTONS SECTION. */}
            <div className={`${classes.buttonOptionsSection}`}>
                <div>
                    <a href="#" onClick={() => handleClickOnDeleteButton()}
                    className={`d-inline-flex`} >
                        <img
                            src={DELETE_ICON}
                            alt="Delete"
                            title='Click to delete Robot'
                            onClick={(e) => { 
                                e.stopPropagation(); 
                                if (!isDeleteDisabled) { 
                                    handleClickOnDeleteButton(); 
                                } 
                            }}
                            className={`${classes.deleteCreateIcon} ${isDeleteDisabled ? classes.disabledLink : ''}`}
                            style={{ cursor: isDeleteDisabled ? 'not-allowed' : 'pointer' }}
                        />
                        <span className={`ms-2 ${classes.deleteCreateIconText} ${isDeleteDisabled ? classes.disabledLink : ''}`} >DELETE</span>
                    </a>
                </div>
                <div>
                    <a href="#" onClick={() => handleRefreshRobot()}
                    className={`d-inline-flex`} >
                        <img
                            src={REFRESH_ICON}
                            alt="Refresh"
                            title='Click to refresh Robots data'
                            onClick={() => handleRefreshRobot()}
                            className={`${classes.deleteCreateIcon}`}
                            
                        />
                        <span className={`ms-2 ${classes.deleteCreateIconText}`}>REFRESH</span>
                    </a>
                </div>
                <div>
                    <a href="#" onClick={() => handleCreateRobot()}
                        className={`d-inline-flex`}>
                        <img
                            src={CREATE_ICON}
                            alt="Create Robot"
                            title='Click to create Robot'
                            onClick={() => handleCreateRobot()}
                            className={`${classes.deleteCreateIcon}`}
                        />
                        <span className={`ms-2 ${classes.deleteCreateIconText}`}>NEW ROBOT</span>
                    </a>
                </div>
            </div>
            { /* END OF ROBOT CRUD BUTTONS SECTION. */}
            { /* START OF ROBOT TABLE SECTION. */}
            <div className="table-responsive" >
                <table className={`table ${classes.tableBorders} `}>
                  <thead>
                    <tr className={`${classes.tableHead}`}>
                      <th scope="col" className='checkboxColumn'>
                        <input type="checkbox" className={`${classes.checkBox}`} 
                            checked={selectAll} onChange={handleSelectAllCheckBox}/>
                      </th>
                      <th scope="col" className='nameColumn'>NAME</th>
                      <th scope="col">STATUS</th>
                      <th scope="col">TASK</th>
                      <th scope="col">LAST ASSIGNED</th>
                      <th scope="col">EXPIRY DATE</th>
                      <th scope="col" className={`${classes.thWithImg}`}></th>
                    </tr>
                  </thead>
                    <tbody>
                        {deleteLoading ? (
                            <tr>
                                <td colSpan="6" className="text-center">
                                    Deleting...
                                </td>
                            </tr>) : (
                            currentTableData.length !== 0 && currentTableData.map((row) => (
                                <tr key={row.id}>
                                    <td className={`${classes.colStyle}`}>
                                        <input type="checkbox" className={`${classes.checkBox}`}
                                            checked={selectedRows.includes(row.id)}
                                            onChange={(e) => { handleCheckboxChange(e, row.id) }} />
                                    </td>
                                    <td className={`${classes.colStyleNameRow}`}>
                                        <DownloadRobot
                                            id={row.id}
                                            setEnableDownloadPopUp={setEnableDownloadPopUp}
                                            setErrorMessage={setErrorMessage}
                                            setIsApiError={setIsApiError} 
                                        />
                                        <div>
                                            <a href="#"
                                             onClick={() => handleRobotUpdate(row.id)}>
                                                <span>{row.name}</span>
                                            </a>
                                        </div>
                                    </td>
                                    <td style={{color: getColorForRobotStatus(row.status)}} className={`${classes.colStyle}`}>
                                        {row.status}
                                    </td>
                                    <td className={`${classes.colStyle}`}>{row.task}</td>
                                    <td className={`${classes.colStyle}`}>{row.lastAssigned}</td>
                                    <td className={`${classes.colStyle}`}>{row.expiryDate}</td>
                                    <td className={`${classes.colStyle}`}>
                                        {(() => {
                                            const expiryDate = new Date(row.expiryDate);
                                            const currentDate = new Date();
                                            const diffInDays = Math.ceil((expiryDate - currentDate) / (1000 * 60 * 60 * 24));
                                            console.log("diffInDays: ", diffInDays);
                                            if (diffInDays <= 3) {

                                                return (
                                                    <button
                                                        className={`${classes.extendButton}`}
                                                        onClick={() => extendExpiry(row)}
                                                    >
                                                        Extend
                                                    </button>
                                                );
                                            }
                                            return (
                                                <div></div>
                                            );
                                        })()}
                                    </td>
                                    <td className={`${classes.colStyle}`}>
                                        <a href="#">
                                            <img
                                                src={SETTINGS_ICON}
                                                alt="Robot Properties Icon"
                                                className={`${classes.deleteCreateIcon}`}
                                                onClick={() => displayRobotPropertiesOnClick(row.id)}
                                            />
                                        </a>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
                { /* END OF ROBOT TABLE SECTION. */}
                
                { /* START OF ROBOT PROPERTIES POPUP CARD SECTION. */}
                { isDisplayRobotProperties && <RobotPropertiesCard 
                    robotId={displayRobotPropsForId} 
                    setIsDisplayRobotProperties={setIsDisplayRobotProperties}/> }
                { /* END OF ROBOT PROPERTIES POPUP CARD SECTION. */}
                
                { /* START OF ROBOT TABLE PAGINATION SECTION. */}
                { noDataAvailable === true ?
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
                { /* END OF ROBOT TABLE PAGINATION SECTION. */}
            </div>
        </div>
    );
};


const DownloadingPopUp = ({setEnableDownloadPopUp}) => {

    const classes = cssClasses();

      return (
          <div className={`${classes.popUpDownloadBox}`}>
              <div className={`${classes.popUpDownloadBoxCard}`}>
                  <div className={`card ms-2 me-2 mb-2 mt-2 w`}>
                      <div className={`card-body`}>
                        Downloading...
                      </div>
                  </div>
                  <button className={`${classes.popUpDownloadBoxButton}`}
                      onClick={() => {
                        setEnableDownloadPopUp(false);
                      }} >
                      Close
                  </button>
              </div>
          </div>
      )
  };

  const PopErrorBox = ({errorMessage, setIsApiError}) => {

    const classes = cssClasses();

      return (
          <div className={`${classes.popUpErrorBox}`}>
              <div className={`${classes.popUpErrorBoxCard}`}>
                  <div className={`card ms-2 me-2 mb-2 mt-2 w`}>
                      <div className={`card-header`}>
                          <h6>Error Occured</h6>
                      </div>
                      <div className={`card-body`}>
                          <div className={`alert alert-danger`} role="alert">
                              {errorMessage}
                          </div>
                      </div>
                  </div>
                  <button className={`${classes.popUpErrorBoxButton}`}
                      onClick={() => {
                          setIsApiError(false);
                      }} >
                      Close
                  </button>
              </div>
          </div>
      )
  }
  

export default RobotsMainPage;
