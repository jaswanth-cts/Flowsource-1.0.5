import React, { useState, useEffect } from 'react';

import 'bootstrap/dist/css/bootstrap.min.css';
import cssClasses from './TestSuiteProjectCSS';
import Play_icon from '../../Icons/Play_icon.png';
import Delete_icon from '../../Icons/Delete_icon.png';
import settings_icon from '../../Icons/settings_icon.png';
import create_icon from '../../Icons/create_icon.png';
import arrow from '../../Icons/arrow.png';
import { fetchApiRef, useApi, configApiRef } from '@backstage/core-plugin-api';
import { useEntity } from '@backstage/plugin-catalog-react';
import {
    EntitySwitch,
} from '@backstage/plugin-catalog';
import { EmptyState } from '@backstage/core-components';
import log from 'loglevel';
import ReportClientConfigurationCard from './ReportClientConfigurationCard';


const TestSuiteProject = (props) => {
    const classes = cssClasses();
    const [projectId, setProjectId] = useState('');
    const [testSuiteData, setTestSuiteData] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [isLoading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [runningRows, setRunningRows] = useState({});
    const [selectAll, setSelectAll] = useState(false);
    const [selectedRows, setSelectedRows] = useState([]);
    const [isDeleteDisabled, setIsDeleteDisabled] = useState(true);
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    const [slectedDeleteButton, setSelectedDeleteButton] = useState('yes');
    const [deleteError, setDeleteError] = useState(null);
    const [showDeleteErrorDialog, setShowDeleteErrorDialog] = useState(false);
    const [deleteLoading, setDeleteLoading] = useState(false);
    const [showExecuteErrorDialog, setShowExecuteErrorDialog] = useState(false);
    const [executeError, setExecuteError] = useState('');
    const [isAnnotationAvailable, setIsAnnotationAvailable] = useState(true);
    const [dynamicRobotCount, setDynamicRobotCount] = useState(0); // State for dynamic robot count
    const [showValidationDialog, setShowValidationDialog] = useState(false); // State for validation popup
    const [validationMessage, setValidationMessage] = useState(''); // State for validation message
    const [isPopupVisible, setPopupVisible] = useState(false);

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
    const ITEMS_PER_PAGE = 10;
    const totalPages = Math.ceil(testSuiteData.length / ITEMS_PER_PAGE);
    const handlePageChange = (pageNumber) => {
        setCurrentPage(pageNumber);
    };
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    const currentTestSuiteData = testSuiteData.slice(startIndex, endIndex);
    const pagesToShow = 3;
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
    const openPopup = () => {
        setPopupVisible(true); // Show the popup
    };

    const closePopup = () => {
        setPopupVisible(false); // Hide the popup
    };

    const handleTabChange = (testSuiteId, testSuiteName) => {
        props.setProjectId(projectId);
        props.setTestSuiteId(testSuiteId);
        props.setActiveTab('testsuiteexecution');
        props.setHistoryTestExecution(2);
        const tabJsonTestCase = {
            "tab1": testSuiteName,
          }
        props.setTabDetails(tabJsonTestCase);
    }

    const handleTestSuiteExecute = async (rowId, runPayload, taskCount) => {
        if (taskCount > dynamicRobotCount) {
            setValidationMessage('Dynamic robot count exceeded');
            setShowValidationDialog(true);
            return; // Stop execution if validation fails
        }
        try {
            setRunningRows(prevState => ({ ...prevState, [rowId]: true }));
            const response = await fetch(`${backendBaseApiUrl}cctp-proxy/execution/executions`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(runPayload),
            });

            if (!response.ok) {
                const errorText = await response.text();
                log.error(`Error executing test suite "${runPayload.name}": API returned: ${errorText}`);
                const formattedError = `HTTP error: status: ${response.status}, message: Error executing test suite "${runPayload.name}".`;
                setExecuteError(formattedError);
                setShowExecuteErrorDialog(true);
                setRunningRows(prevState => ({ ...prevState, [rowId]: false }));
            } else {
                const data = await response.json();
                log.info('Test suite executed successfully:', data);
            }
        } catch (error) {
            log.error(`Error executing test suite "${runPayload.name}": ${error}`);
            setExecuteError(`Error executing test suite "${runPayload.name}".`);
            setShowExecuteErrorDialog(true);
            setRunningRows(prevState => ({ ...prevState, [rowId]: false }));
        }
    };
    const closeValidationDialog = () => {
        setShowValidationDialog(false);
        setValidationMessage('');
    };
    const checkExecutionStatus = async () => {
        try {
            const response = await fetch(`${backendBaseApiUrl}cctp-proxy/execution/executions/status`);
            if (!response.ok) {
                const errorText = await response.text();
                log.error('Error fetching execution status: API returned:', errorText);
            } else {
                const statusData = await response.json();
                statusData.forEach(item => {
                    if (item.status === 'completed') {
                        setRunningRows(prevState => ({ ...prevState, [item.suiteId]: false }));
                    } else {
                        setRunningRows(prevState => ({ ...prevState, [item.suiteId]: true }));
                    }
                });
            }
        } catch (error) {
            log.error('Error fetching execution status:', error);
        }
    };

    useEffect(() => {
        const intervalId = setInterval(checkExecutionStatus, 10000); // Check every 10 seconds

        // Clear interval on component unmount
        return () => clearInterval(intervalId);
    }, []);

    async function getTestSuite() {

        let projectId = '';
        try {
            const projectIDresponse = await fetch(`${backendBaseApiUrl}cctp-proxy/workbench/projects?projectName=${projectName}`);
            if (!projectIDresponse.ok) {
                // Read the error message from the response
                const errorText = await projectIDresponse.text();
                // Format the error message
                const formattedError = `HTTP error: status: ${projectIDresponse.status}, message: Error fetching Project ID.`;
                // Set the error state with the formatted error message
                setError(formattedError);
                log.error('Error fetching Project ID: API returned: ', errorText);
            } else {
                const projectIDData = await projectIDresponse.json();
                projectId = projectIDData[0].id;
                setProjectId(projectId);
            }

        } catch (error) {
            // Log the error to the log level
            log.error('Error fetching Project ID:', error);
            // Set a generic error message
            setError(`Error fetching Project ID.`);
        }
        try {
            const response = await fetch(`${backendBaseApiUrl}cctp-proxy/execution/execution/projects/${projectId}/test-suites`);
            // Check if the response is not OK
            if (!response.ok) {
                // Read the error message from the response
                const errorText = await response.text();
                // Format the error message
                const formattedError = `HTTP error: status: ${response.status}, message: Error fetching Test Suites.`;
                // Set the error state with the formatted error message
                setError(formattedError);
                log.error('Error fetching Test Suites: API returned: ', errorText);
            } else {
                const data = await response.json();

                //Load TestSuite table data
                let testSuiteArray = new Array();
                const testSuiteList = data;
                if (testSuiteList !== null && testSuiteList !== undefined) {
                    testSuiteList.forEach(function (item, index) {
                        const { id, ...rest } = item; // Destructure the id from the item object
                        const entry = { 
                            Id: item.id, 
                            Name: item.name, 
                            Priority: item.priority, 
                            Type: item.allocationType, 
                            Task: item.task.tasks.length, 
                            ExecutionStatus: item.result, 
                            runPayload: { ...rest, suiteId: id } // Include all details in runPayload, assign suiteId, and remove id
                        };
                        testSuiteArray.push(entry);
                    })
                };

                // Sort the data based on the NAME(alphabatical order)
                testSuiteArray.sort((a, b) => a.Name.localeCompare(b.Name));

                //Set the table data for testsuite
                setTestSuiteData(testSuiteArray);
            }

        } catch (error) {
            // Log the error to the log level
            log.error('Error fetching Test Suites:', error);
            // Set a generic error message
            setError(`Error fetching Test Suites.`);
        }
        finally {
            // Set loading to false after the fetch operation is complete
            setLoading(false);
        }
    }

    const handleSelectAll = () => { 
        let newSelectedRows = [...selectedRows];

        if (!selectAll) {
            newSelectedRows = [...new Set([...newSelectedRows, ...currentTestSuiteData.map(row => row.Id)])];
        }else {
            newSelectedRows = newSelectedRows.filter(id => !currentTestSuiteData.map(row => row.Id).includes(id));
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
        setSelectAll(currentTestSuiteData.every(row => newSelectedRows.includes(row.Id)));
        setIsDeleteDisabled(newSelectedRows.length === 0);
    };

    useEffect(() => {
        setSelectAll(currentTestSuiteData.length > 0 && currentTestSuiteData.every(row => selectedRows.includes(row.Id)));
    }, [selectedRows, currentPage, testSuiteData]);

    useEffect(() => {
        const selectedRowsInCurrentPage = selectedRows.filter(id => currentTestSuiteData.map(row => row.Id).includes(id));
        setIsDeleteDisabled(selectedRowsInCurrentPage.length === 0);
    }, [currentPage, currentTestSuiteData, selectedRows]);
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
            const response = await fetch(`${backendBaseApiUrl}cctp-proxy/flowsource/suites`, {
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
              const formattedError = `HTTP error: status: ${response.status}, message: Error deleting test suite/s` ;
              // Set the error state with the formatted error message
              setDeleteError(formattedError);
              // Set the error dialog to true to display the error message
              setShowDeleteErrorDialog(true);
              log.error('Error deleting test test suite/s: API returned: ', errorText);
            } else {
              log.info(`Test suites with IDs ${selectedRows.join(', ')} have been deleted successfully.`);

              // Refresh data
              getTestSuite();

              // Clear selected rows
              setSelectedRows([]);
              setSelectAll(false);

              // Navigate to the first page
              setCurrentPage(1);
            }
          }
        } catch (error) {
          log.error('Error deleting test suite/s:', error);
          setDeleteError(`Error deleting test suite/s.`);
          setShowDeleteErrorDialog(true);
        } finally {
          setDeleteLoading(false);
        }
      };

      const handleDeleteCancel = () => {
        setSelectedDeleteButton('no');
        setShowDeleteDialog(false);
      };
        async function getRobotCount() {
        try {
          const response = await fetch(`${backendBaseApiUrl}cctp-config`);
          if (response.ok) {
            const data = await response.json();
            setDynamicRobotCount(data.dynamicMaxRobotCount);
          } else {
            log.error('Failed to fetch robot counts:', response.status, response.statusText);
            setError('Failed to fetch robot counts');
          }
        } catch (error) {
          log.error('Error fetching robot counts:', error);
          setError('Error fetching robot counts');
        }
      }
      useEffect(() => {
        const annotations = entity.metadata.annotations;
        // Check if the specific annotation for CCTP exists
        const isAnnotation =
          !!annotations &&
          'flowsource/CCTP-project-name' in annotations &&
          annotations['flowsource/CCTP-project-name'].trim().length > 0;

        if (!isAnnotation) {
          setIsAnnotationAvailable(false);
          setLoading(false);
        } else {
          getTestSuite();

          // Check status on component mount
          const checkInitialStatus = async () => {
            try 
            {
              const response = await fetch(
                `${backendBaseApiUrl}cctp-proxy/execution/executions/status`,
              );
              
              if (!response.ok) {
                const errorText = await response.text();
                log.error(
                  'Error fetching initial execution status: API returned:',
                  errorText,
                );
                const formattedError = `HTTP error: status: ${response.status}, message: Error fetching initial execution status.`;
                setError(formattedError);
              } else {
                const statusData = await response.json();
                statusData.forEach(item => {
                  if (item.status !== 'completed') {
                    setRunningRows(prevState => ({
                      ...prevState,
                      [item.suiteId]: true,
                    }));
                  }
                });
              }
            } catch (error) {
              log.error('Error fetching initial execution status:', error);
              setError(`Error fetching initial execution status.`);
            }
          };

          checkInitialStatus();
          getRobotCount();
        }
      }, []);

    const onClickCreateTestSuite = () => {
        props.setActiveTab('testSuiteCreate');
        props.setTestSuiteId(null);
    }

    const handleTestSuiteClick = (testSuiteId) => {
        props.setActiveTab('testSuiteCreate');
        props.setTestSuiteId(testSuiteId);
    }

    if (isLoading) {
        return (
            <div className={`App p-3 ${classes.loadingText}`}>
                Loading...
            </div>
        );
    }

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

    return (
        <>
            {isAnnotationAvailable ? (
        <div>
            {/* Validation Dialog */}
            {showValidationDialog && (
                <div className={`${classes.dialogOverlayDeleteError}`}>
                    <div className={`${classes.dialogBoxDeleteError}`}>
                        <div className="card ms-2 me-2 mb-2 mt-2 w">
                            <div className="card-header">
                                <h6>Validation Error</h6>
                            </div>
                            <div className="card-body">
                                <div className="alert alert-danger" role="alert">
                                    {validationMessage}
                                </div>
                            </div>
                        </div>
                        <button
                            className={`${classes.deleteErrorDialogBoxButton}`}
                            onClick={closeValidationDialog}
                        >
                            Close
                        </button>
                    </div>
                </div>
            )}
            <div className={`w-80 mt-2 ${classes.parentDivFramework}`}>
                <div className={`mb-2 ${classes.secondDiv}`}>
                    <a href="#" onClick={onClickCreateTestSuite}
                     className={`d-inline-flex align-items-center ${classes.marginright1}`}>
                        <img
                            src={create_icon}
                            alt="Create Icon"
                            className={`${classes.accessibilityIconImg}`}
                        />
                        <span className={`${classes.accessibilityIconText}`}>CREATE TEST SUITE</span>
                    </a>
                    <a href="#" onClick={(e) => { e.preventDefault(); confirmDelete(); }}
                     className={`d-inline-flex align-items-center ${ getDeleteIconHoverCssStlye() } ${classes.marginright1}`}>
                        <img
                        src={Delete_icon}
                        alt="Delete"
                        title='Click to delete'
                        className={`${classes.deleteIcon} ${ getDisabledLinkCssStlye() } ${ getDeleteIconHoverCssStlye() }`}
                        />
                        <span className={`ms-2 ${classes.deleteCreateIconText} ${ getDisabledLinkCssStlye() } ${ getDeleteIconHoverCssStlye() }`}>DELETE</span>
                    </a>
                    <a href="#" onClick={(e) => { e.preventDefault(); openPopup(); }}
                     className={`d-inline-flex align-items-center`}>
                        <img
                        src={settings_icon}
                        alt="Report Client Configuration"
                        title='Click to report client configuration'
                        className={`${classes.reportClientConfig} }`}
                        />
                        <span className={`ms-2 ${classes.deleteCreateIconText}`}>REPORT CLIENT CONFIGURATION</span>
                    </a>
                    {/* Trigger to open the popup */}


                    {/* Render the ReportClientConfigurationCard component */}
                    {isPopupVisible && (
                        <ReportClientConfigurationCard
                            projectName={projectName} // Pass the execution name
                            setIsDisplayReportConfig={setPopupVisible} // Pass the state setter to close the popup
                        />
                    )}
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
                    {/* Error Dialog for Delete */}
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
                </div>
                <table className={`table ${classes.tableBorders}`}>
                    <thead>
                        <tr className={`${classes.tableHead}`}>
                            <th className={`${classes.colStyle}`} scope="col">
                                <input
                                    type="checkbox"
                                    checked={selectAll} onChange={handleSelectAll}
                                />
                            </th>
                            <th className={`${classes.colStyle}`} scope="col">NAME</th>
                            <th className={`${classes.colStyle}`} scope="col">PRIORITY</th>
                            <th className={`${classes.colStyle}`} scope="col">TYPE</th>
                            <th className={`${classes.colStyle}`} scope="col">TASK</th>
                            <th className={`${classes.colStyle}`} scope="col">EXECUTION STATUS</th>
                            <th className={`${classes.colStyle}`} scope="col"></th>
                        </tr>
                    </thead>
                    <tbody style={{ textAlign: '-webkit-center' }}>
                        {deleteLoading ? (
                            <tr>
                                <td colSpan="10" className="text-center">
                                    Deleting...
                                </td>
                            </tr> ) : (
                            currentTestSuiteData.map((row, index) => (
                                <tr key={row.Id}>
                                    <td className={`${classes.colStyle1}`}>
                                        <input
                                            type="checkbox"
                                            checked={selectedRows.includes(row.Id)}
                                            onChange={(e) => { handleCheckboxChange(e, row.Id) }}
                                        />
                                    </td>
                                    <td className={`${classes.colStyle1} ${classes.clickTestSuite}`}
                                     onClick={() => handleTestSuiteClick(row.Id)} >
                                        {row.Name}
                                    </td>
                                    <td className={`${classes.colStyle1}`}>{row.Priority}</td>
                                    <td className={`${classes.colStyle1}`}>{row.Type}</td>
                                    <td className={`${classes.colStyleButton}`}>
                                        <div className={classes.priorityCircle}>
                                            {row.Task}
                                        </div>
                                    </td>
                                    <td className={`${classes.colStyle1}`}>
                                        <a href="#">
                                            {runningRows[row.Id] ? (
                                                <div className={`spinner-border text-primary ${classes.loaderSpinner}`} role="status">
                                                </div>
                                            ) : (
                                                <img
                                                    src={Play_icon}
                                                    alt="Execute"
                                                    title="Execute Test Suite"
                                                    className={`float-center pt-1`}
                                                    onClick={() => handleTestSuiteExecute(row.Id, row.runPayload, row.Task)}
                                                />
                                            )}
                                        </a>
                                    </td>
                                    <td>
                                        <a href="#">
                                        <img
                                            src={arrow}
                                            tooltip="View Executions"
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
                {/* Error Dialog for Test Suite execute */}
                {showExecuteErrorDialog && (
                    <div className={`${classes.dialogOverlayDeleteError}`}>
                    <div className={`${classes.dialogBoxDeleteError}`}>
                        <div className="card ms-2 me-2 mb-2 mt-2 w">
                        <div className="card-header">
                            <h6>Error Occured</h6>
                        </div>
                        <div className="card-body">
                            <div className="alert alert-danger" role="alert">
                            {executeError}
                            </div>
                        </div>
                        </div>
                        <button
                        className={`${classes.deleteErrorDialogBoxButton}`}
                        onClick={() => setShowExecuteErrorDialog(false)}
                        >
                        Close
                        </button>
                    </div>
                    </div>
                )}
                {testSuiteData.length === 0 ? '' :
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
        </div>
            ) : (
                <div className='mt-3 ms-3 me-3 mb-4'>
                    <EntitySwitch>
                        <EntitySwitch.Case>
                            <EmptyState
                                title="No Test Suites page is available for this entity."
                                missing="info"
                                description="You need to add an annotation to your component if you want to see CCTP Test Suites page for it."
                            />
                        </EntitySwitch.Case>
                    </EntitySwitch>
                </div>
            )}
        </>
    );
};

export default TestSuiteProject;