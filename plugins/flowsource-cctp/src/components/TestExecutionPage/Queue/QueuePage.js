import React, { useState, useEffect, useRef } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import cssClasses from './QueuePageCss';
import Delete_icon from '../../Icons/Delete_icon.png';
import Refresh_icon from '../../Icons/refresh_icon.png';
import { fetchApiRef, useApi, configApiRef } from '@backstage/core-plugin-api';
import { useEntity } from '@backstage/plugin-catalog-react';
import dateUtils from '../DateUtil';
import xss from 'xss';
import {
    EntitySwitch,
} from '@backstage/plugin-catalog';
import { EmptyState } from '@backstage/core-components';
import { BsSearch, BsX } from 'react-icons/bs';
import { FormControl, InputGroup } from 'react-bootstrap';

import log from 'loglevel';

const QueuePage = () => {
    const classes = cssClasses();
    const { fetch } = useApi(fetchApiRef);

    const [tableData, setTableData] = useState([]);
    const config = useApi(configApiRef);
    const { entity } = useEntity();

    const backendBaseApiUrl = config.getString('backend.baseUrl') + '/api/flowsource-cctp/';
    const [currentPage, setCurrentPage] = useState(1);
    const [allChecked, setAllChecked] = useState(false);
    const [checkedItems, setCheckedItems] = useState([]);
    const [showPopup, setShowPopup] = useState(false);
    const [selectedButton, setSelectedButton] = useState('yes');
    const [isLoading, setLoading] = useState(true);
    const [deleteLoading, setDeleteLoading] = useState(false);
    const [error, setError] = useState(null);
    const [showErrorDialog, setShowErrorDialog] = useState(false);
    const [deleteError, setDeleteError] = useState(null);
    const [isDeleteDisabled, setIsDeleteDisabled] = useState(true);
    const [searchText, setSearchText] = useState('');
    const [filteredTableData, setFilteredTableData] = useState([]);
    const previousPageRef = useRef(1); // Use useRef to store the previous page

    const annotations = entity.metadata.annotations;
    // Check if the specific annotation for CCTP exists
    function checkAnnotation() {
        return !!annotations && 'flowsource/CCTP-project-name' in annotations 
            && annotations['flowsource/CCTP-project-name'].trim().length > 0;
    }
    const isAnnotationAvailable = checkAnnotation();

    const ITEMS_PER_PAGE = 10;
    const handlePageChange = (pageNumber) => {
        setCurrentPage(pageNumber);
    };

    const handleHeaderCheckboxChange = () => {
        let newSelectedRows = [];
        if (!allChecked) {
            newSelectedRows = currentTableData.map(row => row.id);
        }
        setCheckedItems(newSelectedRows);
        setAllChecked(!allChecked);
        setIsDeleteDisabled(newSelectedRows.length === 0);
    };

    const handleRowCheckboxChange = (e, rowId) => {
        let newCheckedItems;

        if (e.target.checked) {
            newCheckedItems = [...checkedItems, rowId];
        } else {
            newCheckedItems = checkedItems.filter(id => id !== rowId);
        }

        setCheckedItems(newCheckedItems);
        setAllChecked(newCheckedItems.length === currentTableData.length);

        setIsDeleteDisabled(newCheckedItems.length === 0);
    };
    const handleDeleteClick = () => {
        setSelectedButton('yes');
        setShowPopup(true);
        setIsDeleteDisabled(true);
    };

    const handleYesClick = () => {
        setSelectedButton('yes');
        const idsToDelete = tableData
            .filter((row, index) => checkedItems[index])
            .map(row => row.id);

        idsToDelete.forEach(id => deleteRow(id));
        setShowPopup(false);
        setIsDeleteDisabled(true);
    };

    const handleNoClick = () => {
        setSelectedButton('no');
        setShowPopup(false);
        setIsDeleteDisabled(false);
    };
    async function getQueueData() {
        try {
            const response = await fetch(`${backendBaseApiUrl}cctp-proxy/execution/jobs/queue`);
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
            else {
                // Parse the JSON data from the response
                const data = await response.json();
                // Sort the data based on the modifiedOn date. List the latest created queue first.
                let sortedQueueData = data.sort((a, b) => {
                    return new Date(b.createdOn) - new Date(a.createdOn);
                });
                // Update the state with the fetched data
                setTableData(sortedQueueData);
            }
        } catch (error) {
            // Log the error to the log level
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
    const deleteRow = async (id) => {
        try {
            setDeleteLoading(true);
            // Sanitize the payload
            const sanitizedPayload = {
                ids: checkedItems.map(item => xss(item))
            };

            const response = await fetch(`${backendBaseApiUrl}cctp-proxy/flowsource/jobs`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(sanitizedPayload)
            });

            if (!response.ok) {
                // Format the error message
                const formattedError = `HTTP error: status: ${response.status}, message: Error deleting queue/s`;
                // Set the error state with the formatted error message
                setDeleteError(formattedError);
                setShowErrorDialog(true);
                log.error('Error deleting queues: API returned: ', response.status);
            }
            else {
                log.info(`Queue with IDs ${checkedItems.join(', ')} have been deleted successfully.`);
                // Refresh data after deletion
                getQueueData();
                // Clear selected rows
                setAllChecked(false);
                setCheckedItems([]);
                // Navigate to the first page
                setCurrentPage(1);
            }
        } catch (error) {
            log.error('Error deleting queues:', error);
            setDeleteError(`Error deleting queue/s`);
            setShowErrorDialog(true);
        }
        finally {
            setDeleteLoading(false);
        }
    };
    //refreshing the queue data from backend
    async function handleRefreshQueue() {
        try {
            setLoading(true);

            await getQueueData();

        } catch (error) {
            log.info('Error in handleRefreshQueue function: ', error);
        }
    }
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

    //Fetching Data on page load
    useEffect(async () => {
        if(isAnnotationAvailable) {
            getQueueData();
        } else {
            setLoading(false);
        }

    }, []);

    useEffect(() => {
        // Reset checkboxes when the component mounts or selectedType changes 
        setAllChecked(false);
        setCheckedItems([]);
        setIsDeleteDisabled(true);
    }, [currentPage]);
    //Resetting States When Table Data is Empty 
    useEffect(() => {
        if (tableData.length === 0) {
            setAllChecked(false);
            setCheckedItems([]);
        }
    }, [tableData]);

    useEffect(() => {
        // Filter the table data based on the search text
        const filteredData = tableData.filter(queue => {
            // Convert the search text to lowercase for case-insensitive comparison
            const searchTextLower = searchText.toLowerCase();
            // Check if the queue's name, any of its robots, or its execution field includes the search text
            return (
                // Check if the queue's name includes the search text
                (queue.name && queue.name.toLowerCase().includes(searchTextLower)) ||
                // Check if any of the queue's robots include the search text
                (queue.robots && queue.robots.some(robot => robot.toLowerCase().includes(searchTextLower))) ||
                // Check if the queue's execution field includes the search text
                (queue.execution && queue.execution.toLowerCase().includes(searchTextLower))
            );
        });

        // Update the state with the filtered data
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

    function checkisPreviousDisabled() {
        if(isPreviousDisabled) {
            return 'disabled';
        } else {
            return '';
        }
    };

    function checkisNextDisabled() {
        if(isNextDisabled) {
            return 'disabled';
        } else {
            return '';
        }
    };
    
    function setDeleteIconStyleImg() {
        if(isDeleteDisabled) {
            return {
                cursor: 'not-allowed',
                filter: 'grayscale(100%)',
                opacity: 0.5
            }
        } else {
            return {
                cursor: 'pointer',
                filter: 'none',
                opacity: 1
            }
        }
    };

    function setDeleteIconStyleSpan() {
        if(isDeleteDisabled) {
            return {
                cursor: 'not-allowed',
                color: 'gray'
            }
        } else {
            return {
                cursor: 'pointer',
                color: 'inherit'
            }
        }
    };

    function setDeletePopUpYesButtonColor() {
        if(selectedButton === 'yes') {
            return '#000048';
        } else {
            return 'grey';
        }
    };

    function setDeletePopUpNoButtonColor() {
        if(selectedButton === 'no') {
            return '#000048';
        } else {
            return 'grey';
        }
    };

    function checkDeleteClick() {
        if(!isDeleteDisabled)
        {
            handleDeleteClick();
        }
    }

    function renderTableBody() {
        if(tableData.length === 0) {
            return (
                <tr>
                    <td colSpan="6">No data available</td>
                </tr>
            );
        }
        else if(deleteLoading) {
            return (
                <tr>
                    <td colSpan="6" className="text-center">
                        Deleting...
                    </td>
                </tr>
            );
        }
        else if (currentTableData.length !== 0) {
            return currentTableData.map((row, index) => {
                return (
                    <tr key={row.id}>
                        <td className={`${classes.colStyleCheckbox1}`}>
                            <input
                                type="checkbox"

                                checked={checkedItems.includes(row.id)}
                                onChange={(e) => { handleRowCheckboxChange(e, row.id) }}
                            />
                        </td>
                        <td className={`${classes.colStyleName1}`}> {row.name}</td>
                        <td className={`${classes.colStyleButton}`}>
                            {row.robots.map((robot, index) => (
                                <div key={robot}>{robot}</div>
                            ))}
                        </td>
                        <td className={`${classes.colStyle1}`}>{row.priority}</td>
                        <td className={`${classes.colStyle1}`}>
                            {row.name.split('#')[0].trim()}
                        </td>
                        <td className={`${classes.colStyle1}`}>{dateUtils.formatDate(row.createdOn).replace(' GMT', '')}</td>
                    </tr>
                );
            });
        } else {
            return (
                <tr>
                    <td colSpan="6" className="text-center">
                        No Data Found
                    </td>
                </tr>
            );
        }
    };

    function renderQueuePage() {
        if (isLoading) {
            return (
                <div className={`App p-3 ${classes.loading1}`}>
                    Loading...
                </div>
            );
        }
        else if (error) {
            log.error('only Error:', error);
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
        else if (!isAnnotationAvailable) {
            return (
                <div className='mt-3 ms-3 me-3 mb-4'>
                    <EntitySwitch>
                        <EntitySwitch.Case>
                            <EmptyState
                                title="No Queue page is available for this entity."
                                missing="info"
                                description="You need to add an annotation to your component if you want to see CCTP Queue page for it."
                            />
                        </EntitySwitch.Case>
                    </EntitySwitch>
                </div>
            );
        } 
        else {
            return (
                <div>
                    <div className={`w-100 ${classes.div1}`}>
                        <div className={`mb-2 me-4 ${classes.div2}`} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div style={{ display: 'flex', alignItems: 'center', paddingLeft: '0.5rem', paddingBottom: '0.5rem' }}>
                                <InputGroup>
                                    <InputGroup.Text
                                        style={{
                                            border: 'none',
                                            borderBottom: '1px solid white',
                                            backgroundColor: 'white',
                                            borderRadius: '0',
                                        }}
                                    >
                                        <BsSearch style={{ color: 'rgb(186 186 190)' }} />
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
                                            style={{
                                                border: 'none',
                                                borderBottom: '1px solid white',
                                                backgroundColor: 'white',
                                                borderRadius: '0',
                                            }}
                                        >
                                            <BsX
                                                style={{
                                                    color: 'rgb(186 186 190)',
                                                    fontSize: '23px',
                                                    marginTop: '-7px',
                                                }}
                                            />
                                        </InputGroup.Text>
                                    )}
                                </InputGroup>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center' }}>
                                <img
                                    src={Delete_icon}
                                    alt="Delete Icon"
                                    className={`${classes.accessibilityIconImg}`}
                                    onClick={() => { checkDeleteClick() }}
                                    style={setDeleteIconStyleImg()}
                                />
                                <span
                                    onClick={() => { checkDeleteClick() }}
                                    className={`${classes.accessibilityIconText}`}
                                    style={setDeleteIconStyleSpan()}
                                >
                                    DELETE
                                </span>
                                <img
                                    src={Refresh_icon}
                                    alt="Refresh Icon"
                                    className={`${classes.performanceIconImg}`}
                                    onClick={() => handleRefreshQueue()}
                                />
                                <span onClick={() => handleRefreshQueue()} className={`${classes.performanceIconText}`}>REFRESH</span>
                                {isLoading && <p>Loading...</p>}
                            </div>
                        </div>
                        <table className={`table ${classes.tableBorders}`}>
                            <thead>
                                <tr className={`${classes.tableHead}`}>
                                    <th className={`${classes.colStyleCheckbox}`} scope="col">
                                        <input
                                            type="checkbox"
                                            checked={allChecked}
                                            onChange={handleHeaderCheckboxChange}
                                        />
                                    </th>
                                    <th className={`${classes.colStyleName}`} scope="col">NAME</th>
                                    <th className={`${classes.colStyle}`} scope="col">ROBOTS</th>
                                    <th className={`${classes.colStyle}`} scope="col">PRIORITY</th>
                                    <th className={`${classes.colStyle}`} scope="col">EXECUTION</th>
                                    <th className={`${classes.colStyle}`} scope="col">CREATED ON</th>
                                </tr>
                            </thead>
                            <tbody className={`${classes.tbody}`} style={{ textAlign: '-webkit-center' }}>
                                { renderTableBody() }
                            </tbody>
                        </table>
                        {currentTableData.length > 0 && (
                            <nav aria-label="Page navigation example" className={`me-0 pt-4`}>
                                <ul className={`pagination justify-content-end ${classes.ulCss} ${classes.customPagination}`}>
                                    <li className={`page-item ${checkisPreviousDisabled()}`}>
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
                                    <li className={`page-item ${checkisNextDisabled()}`}>
                                        <a href="#" className="page-link" onClick={() => handlePageChange(currentPage + 1)} aria-label="Next">
                                            <span aria-hidden="true">»</span>
                                        </a>
                                    </li>
                                </ul>
                            </nav>
                        )}
                    </div>
                    {/* Delete Popup */}
                    {showPopup && (
                        <div className={`${classes.deletePopupDiv1}`}>
                            <div className={`${classes.deletePopupDiv2}`}>
                                <p>Do you want to delete the selected item?</p>
                                <button
                                    style={{
                                        backgroundColor: setDeletePopUpYesButtonColor(),
                                    }}
                                    className={`${classes.deletePopupYesButton}`}
                                    onClick={handleYesClick}
                                >
                                    Yes
                                </button>
                                <button
                                    style={{
                                        backgroundColor: setDeletePopUpNoButtonColor(),
                                    }}
                                    className={`${classes.deletePopupNoButton}`}
                                    onClick={handleNoClick}
                                >
                                    No
                                </button>
                            </div>
                        </div>
                    )}
                    {/* Error Popup */}
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
                </div>
            );
        }
    };

    return (
        <>
            { renderQueuePage() }
        </>
    );
};
export default QueuePage;