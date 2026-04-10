import React, { useState, useEffect, useRef } from 'react';


import { fetchApiRef, useApi, configApiRef } from '@backstage/core-plugin-api';
import DELETE_ICON from '../../Icons/Delete_icon.png';
import CREATE_ICON from '../../Icons/Create_plus_icon.png';

import cssClasses from './ApplicationPageCss';

import { BsSearch, BsX } from 'react-icons/bs';
import { FormControl, InputGroup } from 'react-bootstrap';

import log from 'loglevel';

const ApplicationPage = (props) => {
    const classes = cssClasses();
    const { fetch } = useApi(fetchApiRef);
    const config = useApi(configApiRef);
    const backendBaseApiUrl = config.getString('backend.baseUrl') + '/api/flowsource-cctp/';

    const [isLoading, setLoading] = useState(true);
    //USED TO SHOW HTTP ERROR MESSAGE ON MAIN PAGE.
    const [httpError, setHttpError] = useState(null);
    const [searchText, setSearchText] = useState('');
    const [filteredTableData, setFilteredTableData] = useState([]);

    /* START OF TABLE PAGINATION LOGIC. */

    const [applicationsTableData, setApplicationsTableData] = useState([]);

    const [currentPage, setCurrentPage] = useState(1);
    const previousPageRef = useRef(1); // Use useRef to store the previous page
    const ITEMS_PER_PAGE = 10;

    const handlePageChange = (pageNumber) => {
        setCurrentPage(pageNumber);
    };

    /* END OF TABLE PAGINATION LOGIC. */

    /* START OF DELETE application LOGIC. */

    const [deleteLoading, setDeleteLoading] = useState(false);
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);

    async function handleDeleteApplication(id) {
        try {
            setShowDeleteDialog(false);
            setDeleteLoading(true);

            const response = await fetch(`${backendBaseApiUrl}cctp-proxy/workbench/applications/${id}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                 log.info(`Application with ID ${id} has been deleted successfully.`);

                // Refresh application Data in the main page.
                await handleRefreshApplication();

                // Navigate to the first page
                setCurrentPage(1);
            }
            else {

                // Navigate to the first page
                setCurrentPage(1);

                const apiErrorText = await response.text();
                log.info('Error: API returned: ' + response.status + ' - ' + apiErrorText);

                const formattedError = `HTTP Error: Status: ${response.status}, Message: Error Deleting Application.`;
                setErrorMessage(formattedError);
                setIsApiError(true);
            }


        } catch (error) {
            log.info('Error in handleDeleteApplication function: ', error);

            // Navigate to the first page
            setCurrentPage(1);

            setErrorMessage('Application Error: Error Deleting Application.');
            setIsApiError(true);
        } finally {
            setDeleteLoading(false);
        }
    };

    /* END OF DELETE application LOGIC. */

    /* START OF REFRESH application LOGIC. */

    async function handleRefreshApplication() {
        try {
            setLoading(true);

            await getAllApplicationsDataFromBackend();

        } catch (error) {
            log.info('Error in handleRefreshApplication function: ', error);
        }
    }

    /* END OF REFRESH application LOGIC. */

    /* START OF CREATE application LOGIC. */

    async function handleCreateApplication() {
        props.setActiveTab('createNewApplication');
    }

    /* END OF CREATE application LOGIC. */

    const [isApiError, setIsApiError] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');

    /* START OF POPULATE application TABLE LOGIC IN MAIN PAGE. */

    async function getAllApplicationsDataFromBackend() {
        try {
            const response = await fetch(`${backendBaseApiUrl}cctp-proxy/workbench/applications/`);

            if (response.ok) {
                const data = await response.json();

                if (data !== null && data !== undefined && data.length > 0) {
                    let applicationsData = data.map((application) => {
                        return {
                            id: application.id,
                            name: application.name,
                            description: application.description,
                        };
                    });

                    // Sort the data based on the modifiedOn date. List the latest created application first.
                    let sortedApplicationData = applicationsData.sort((a, b) => {
                        return new Date(b.lastModifiedDate) - new Date(a.lastModifiedDate);
                    });

                    setApplicationsTableData(sortedApplicationData);
                } else {
                    log.info('Error: Data returned is null or undefined. API returned: ' + response.status);
                }
            } else {
                log.info('Error: API returned: ' + response.status + ' - ' + response.statusText);
                // Set the error state with the formatted error message
                const formattedError = await response.text();
                setHttpError(formattedError);
            }

        } catch (error) {
            log.info('Exception occured in getAllApplicationsDataFromBackend function: ', error);
        } finally {
            setLoading(false);
        }
    }

    /* END OF POPULATE application TABLE LOGIC IN MAIN PAGE. */

    const [deleteId, setDeleteId] = useState(null);

    const confirmDeleteApplication = (id) => {
        setDeleteId(id);
        setShowDeleteDialog(true);
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

    useEffect(async () => {
        getAllApplicationsDataFromBackend();
    }, []);

    useEffect(() => {
        const filteredData = applicationsTableData.filter(app => {
            const searchTextLower = searchText.toLowerCase();
            return (
                app.name.toLowerCase().includes(searchTextLower) ||
                app.description.toLowerCase().includes(searchTextLower)
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
    }, [searchText, applicationsTableData]);
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

    function renderTableBody() {
        if(deleteLoading) {
            return (
                <tr>
                    <td colSpan="3" className="text-center">
                        Deleting...
                    </td>
                </tr>
            );
        } else if (currentTableData.length !== 0) {
            return currentTableData.map((row) => (
                <tr key={row.name}>
                    <td className={`${classes.colStyleNameRow}`}>
                        {row.name}
                    </td>
                    <td className={`${classes.colStyle}`}>{row.description}</td>
                    <td className='colStyleDelete'> <img
                        src={DELETE_ICON}
                        alt="Delete"
                        title='Click to delete Application'
                        onClick={(e) => {
                            e.stopPropagation();
                            confirmDeleteApplication(row.id); // Pass the row ID
                        }}
                        className={`${classes.deleteCreateIcon}`}
                    /></td>

                </tr>
            ));
        } else {
            return (
                <tr style={{ height: 'auto' }}>
                    <td colSpan="3" className="text-center" style={{ padding: '0', border: 'none' ,paddingTop:'0.8rem'}}>
                        No Data Found
                    </td>
                </tr>
            );
        }  
    };

    return (
        <div>
            {isApiError && <PopErrorBox errorMessage={errorMessage} setIsApiError={setIsApiError} />}
            { /* STRART OF DELETE CONFIRMATION DIALOGUE BOX. */}
            {showDeleteDialog && (
                <div className={`${classes.dialogOverlay}`}>
                    <div className={`${classes.dialogBox}`}>
                        <p>Do you want to delete the selected Application?</p>
                        <button
                            className={`${classes.dialogBoxYesButton}`}
                            onClick={() => handleDeleteApplication(deleteId)}
                        >
                            Yes
                        </button>
                        <button
                            className={`${classes.dialogBoxNoButton}`}
                            onClick={() => setShowDeleteDialog(false)}
                        >
                            No
                        </button>
                    </div>
                </div>
            )}
            { /* END OF DELETE CONFIRMATION DIALOGUE BOX. */}
            { /* START OF application CRUD BUTTONS SECTION. */}

            <div
                className={`${classes.buttonOptionsSection}`}
                style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    margin: '0rem 1rem 0.5rem 0rem',
                }}
            >
                <div style={{ flex: 1, maxWidth: '280px', paddingLeft: '0.5rem', paddingBottom: '0.5rem' }}>
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
                <div>
                    <a
                        href="#"
                        onClick={() => handleCreateApplication()}
                        className={`d-inline-flex`}
                    >
                        <img
                            src={CREATE_ICON}
                            alt="Create Application"
                            title="Click to create Application"
                            onClick={() => handleCreateApplication()}
                            className={`${classes.deleteCreateIcon}`}
                        />
                        <span className={`ms-2 ${classes.deleteCreateIconText}`}>
                            NEW APPLICATION
                        </span>
                    </a>
                </div>
            </div>
            { /* END OF application CRUD BUTTONS SECTION. */}
            { /* START OF application TABLE SECTION. */}
            <div className="table-responsive" >
                <table className={`table ${classes.tableBorders} `}>
                    <thead>
                        <tr className={`${classes.tableHead}`}>
                            <th scope="col" className='nameColumn'>APPLICATION NAME</th>
                            <th scope="col">DESCRIPTION</th>
                            <th></th>
                        </tr>
                    </thead>
                    <tbody>
                        { renderTableBody() }
                    </tbody>
                </table>
                { /* END OF application TABLE SECTION. */}

                { /* START OF application TABLE PAGINATION SECTION. */}
                {currentTableData.length !== 0 &&
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
                { /* END OF application TABLE PAGINATION SECTION. */}
            </div>
        </div>
    );
};

const PopErrorBox = ({ errorMessage, setIsApiError }) => {

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


export default ApplicationPage;