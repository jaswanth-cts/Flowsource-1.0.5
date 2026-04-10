import React, { useState, useEffect, useRef } from 'react';


import { fetchApiRef, useApi, configApiRef } from '@backstage/core-plugin-api';

import DELETE_ICON from '../../Icons/Delete_icon.png';
import CREATE_ICON from '../../Icons/Create_plus_icon.png';
import REFRESH_ICON from '../../Icons/refresh_icon.png';
import { BsSearch, BsX } from 'react-icons/bs';
import { FormControl, InputGroup } from 'react-bootstrap';

import cssClasses from './EnvironmentsPageCss';

import dateUtils from '../../TestExecutionPage/DateUtil.js';

import log from 'loglevel';

const EnvironmentsPage = (props) => {
    const classes = cssClasses();

    const { fetch } = useApi(fetchApiRef);
    const config = useApi(configApiRef);
    const backendBaseApiUrl = config.getString('backend.baseUrl') + '/api/flowsource-cctp/';

    const [isLoading, setLoading] = useState(true);
    const [httpError, setHttpError] = useState(null);
    const [environmentsTableData, setEnvironmentsTableData] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [selectedType, setSelectedType] = useState('All');
    const [deleteLoading, setDeleteLoading] = useState(false);
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    const [selectAll, setSelectAll] = useState(false);
    const [selectedRows, setSelectedRows] = useState([]);
    const [isDeleteDisabled, setIsDeleteDisabled] = useState(true);
    const [isApiError, setIsApiError] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [searchText, setSearchText] = useState('');
    const [filteredTableData, setFilteredTableData] = useState([]);
    const previousPageRef = useRef(1); // Use useRef to store the previous page

    const ITEMS_PER_PAGE = 10;

    const totalPages = Math.ceil(filteredTableData.length / ITEMS_PER_PAGE);
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    const currentTableData = filteredTableData.slice(startIndex, endIndex);
    const uniqueTypes = ['All', ...new Set(environmentsTableData.map(env => env.type))];
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


    const handlePageChange = (pageNumber) => {
        setCurrentPage(pageNumber);
    };

    const handleTypeChange = (e) => {
        const newType = e.target.value;
        setSelectedType(newType);
        setCurrentPage(1); // Reset to the first page when type changes
        // handleRefreshEnvironment(); // Refresh the data when type changes
    };


    async function handleClickOnDeleteButton() {
        if (selectedRows.length > 0) {
            setShowDeleteDialog(true);
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


    async function handleDeleteEnvironment() {
        try {
            setShowDeleteDialog(false);
            setDeleteLoading(true);

            if (selectedRows.length > 0) {
                const response = await fetch(`${backendBaseApiUrl}cctp-proxy/flowsource/infra`, {
                    method: 'DELETE',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ ids: selectedRows })
                });

                if (response.ok) {
                    log.info(`Environments with IDs ${selectedRows.join(', ')} have been deleted successfully.`);
                    await handleRefreshEnvironment();
                    setSelectedRows([]);
                    setSelectAll(false);
                    setIsDeleteDisabled(true);
                    setCurrentPage(1);
                    setSelectedType('All'); // Reset type to "All" after deletion
                } else {
                    setSelectedRows([]);
                    setSelectAll(false);
                    setIsDeleteDisabled(true);
                    setCurrentPage(1);
                    const apiErrorText = await response.text();
                    log.info('Error: API returned: ' + response.status + ' - ' + apiErrorText);
                    const formattedError = `HTTP Error: Status: ${response.status}, Message: Error Deleting Environment/s.`;
                    setErrorMessage(formattedError);
                    setIsApiError(true);
                }
            }
        } catch (error) {
            log.error('Error in handleDeleteEnvironment function: ', error);
            setSelectedRows([]);
            setSelectAll(false);
            setIsDeleteDisabled(true);
            setCurrentPage(1);
            setErrorMessage('Application Error: Error Deleting Environment/s.');
            setIsApiError(true);
        } finally {
            setDeleteLoading(false);
        }
    }

    const handleCheckboxChange = (e, environmentId) => {
        let newSelectedRows;

        if (e.target.checked) {
            newSelectedRows = [...selectedRows, environmentId];
        } else {
            newSelectedRows = selectedRows.filter(id => id !== environmentId);
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
    }, [selectedRows, currentPage, environmentsTableData]);

    useEffect(() => {
        const selectedRowsInCurrentPage = selectedRows.filter(id => currentTableData.map(row => row.id).includes(id));
        setIsDeleteDisabled(selectedRowsInCurrentPage.length === 0);
    }, [currentPage, currentTableData, selectedRows]);

    /* END OF DELETE environment LOGIC. */

    useEffect(() => {
        setCurrentPage(1);
        // Reset checkboxes when the component mounts or filter type changes
        setSelectAll(false);
        setSelectedRows([]);
        setIsDeleteDisabled(true);
      }, [selectedType]);

    /* START OF REFRESH environment LOGIC. */

    async function handleRefreshEnvironment() {
        try {
            setLoading(true);
            await getAllEnvironmentsDataFromBackend();
        } catch (error) {
            log.error('Error in handleRefreshEnvironment function: ', error);
        }
    }

    async function handleCreateEnvironment() {
        props.setActiveTab('createNewEnvironment');
    }

    async function handleEnvironmentUpdate(environmentId) {
        props.setActiveTab('updateEnvironment');
        props.setEnvironmentId(environmentId);
    }

    async function getAllEnvironmentsDataFromBackend() {
        try {
            const response = await fetch(`${backendBaseApiUrl}cctp-proxy/execution/infra/`);
            if (response.ok) {
                const data = await response.json();
                if (data !== null && data !== undefined && data.length > 0) {
                    let environmentsData = data.map((environment) => {
                        return {
                            id: environment.id,
                            name: environment.name,
                            description: environment.description,
                            type: environment.type,
                            lastModifiedDate: environment.lastModifiedDate,
                        };
                    });
                    let sortedEnvironmentData = environmentsData.sort((a, b) => {
                        return new Date(b.lastModifiedDate) - new Date(a.lastModifiedDate);
                    });
                    sortedEnvironmentData = sortedEnvironmentData.map((environment) => {
                        return {
                            ...environment,
                            lastModifiedDate: environment.lastModifiedDate === null ? '' : dateUtils.formatDate(environment.lastModifiedDate),
                        };
                    });
                    setEnvironmentsTableData(sortedEnvironmentData);
                } else {
                    log.info('Error: Data returned is null or undefined. API returned: ' + response.status);
                }
            } else {
                log.info('Error: API returned: ' + response.status + ' - ' + response.statusText);
                const formattedError = await response.text();
                setHttpError(formattedError);
            }
        } catch (error) {
            log.error('Exception occurred in getAllEnvironmentsDataFromBackend function: ', error);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        getAllEnvironmentsDataFromBackend();
    }, []);


    useEffect(() => {
        const filteredData = environmentsTableData.filter(env => {
            const searchTextLower = searchText.toLowerCase();
            return (
                (selectedType === 'All' || env.type === selectedType) &&
                (env.name.toLowerCase().includes(searchTextLower) || env.description.toLowerCase().includes(searchTextLower))
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
    }, [searchText, selectedType, environmentsTableData]);

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
            displayError = `HTTP error: status: ${statusCode}, message: Application error occurred.`;
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
                    <td colSpan="8" className="text-center">
                        Deleting...
                    </td>
                </tr>
            );
        } else if(currentTableData.length !== 0) {
            return currentTableData.map((row) => (
                <tr key={row.id}>
                    <td className={`${classes.colStyle}`}>
                        <input type="checkbox" className={`${classes.checkBox}`} checked={selectedRows.includes(row.id)} onChange={(e) => { handleCheckboxChange(e, row.id) }} />
                    </td>
                    <td className={`${classes.colStyleNameRow}`}>
                        <div>
                            <a href="#" onClick={() => handleEnvironmentUpdate(row.id)}>
                                <span>{row.name}</span>
                            </a>
                        </div>
                    </td>
                    <td className={`${classes.colStyle}`}>{row.description}</td>
                    <td className={`${classes.colStyle}`}>{row.type}</td>
                    <td className={`${classes.colStyle}`}>{row.lastModifiedDate}</td>
                </tr>
            ));
        } else {
            return (
                <tr style={{ height: 'auto' }}>
                    <td colSpan="8" className="text-center" style={{ padding: '0', border: 'none', paddingTop: '0.8rem' }}>
                        No Data Found
                    </td>
                </tr>
            );
        }
    };

    return (
        <div>
            {isApiError && <PopErrorBox errorMessage={errorMessage} setIsApiError={setIsApiError} />}
            {showDeleteDialog &&
                <div className={`${classes.dialogOverlay}`}>
                    <div className={`${classes.dialogBox}`}>
                        <p>Do you want to delete the selected item/s?</p>
                        <button
                            className={`${classes.dialogBoxYesButton}`}
                            onClick={handleDeleteEnvironment}
                        >
                            Yes
                        </button>
                        <button
                            className={`${classes.dialogBoxNoButton}`}
                            onClick={() =>
                                setShowDeleteDialog(false)
                            }
                        >
                            No
                        </button>
                    </div>
                </div>
            }

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', paddingLeft: '1rem', paddingBottom: '1rem' }}>
                    <label htmlFor="type" style={{ marginRight: '10px' }}>Type</label>
                    <select id="type" name="type" style={{ padding: '5px' }} value={selectedType} onChange={handleTypeChange}>
                        {uniqueTypes.map((type) => (
                            <option key={type} value={type}>{type}</option>
                        ))}
                    </select>
                    <div>
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
                </div>


                <div className={`${classes.buttonOptionsSection}`} style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', margin: '0rem 1rem 0.5rem 0rem' }}>
                    <div>
                        <a href="#" onClick={() => handleClickOnDeleteButton()} className={`d-inline-flex`}>
                            <img
                                src={DELETE_ICON}
                                alt="Delete"
                                title='Click to delete Environment'
                                onClick={(e) => {
                                    e.stopPropagation();
                                    if (!isDeleteDisabled) {
                                        handleClickOnDeleteButton();
                                    }
                                }}
                                className={`${classes.deleteCreateIcon} ${isDeleteDisabled ? classes.disabledLink : ''}`}
                                style={{ cursor: isDeleteDisabled ? 'not-allowed' : 'pointer' }}
                            />
                            <span className={`ms-2 ${classes.deleteCreateIconText} ${isDeleteDisabled ? classes.disabledLink : ''}`}>DELETE</span>
                        </a>
                    </div>
                    <div>
                        <a href="#" onClick={() => handleRefreshEnvironment()} className={`d-inline-flex`}>
                            <img
                                src={REFRESH_ICON}
                                alt="Refresh"
                                title='Click to refresh Environments data'
                                onClick={() => handleRefreshEnvironment()}
                                className={`${classes.deleteCreateIcon}`}
                            />
                            <span className={`ms-2 ${classes.deleteCreateIconText}`}>REFRESH</span>
                        </a>
                    </div>
                    <div>
                        <a href="#" onClick={() => handleCreateEnvironment()} className={`d-inline-flex`}>
                            <img
                                src={CREATE_ICON}
                                alt="Create Environment"
                                title='Click to create Environment'
                                onClick={() => handleCreateEnvironment()}
                                className={`${classes.deleteCreateIcon}`}
                            />
                            <span className={`ms-2 ${classes.deleteCreateIconText}`}>NEW ENVIRONMENT</span>
                        </a>
                    </div>
                </div>
            </div>
            <div className="table-responsive">
                <table className={`table ${classes.tableBorders}`}>
                    <thead>
                        <tr className={`${classes.tableHead}`}>
                            <th scope="col" className='checkboxColumn'>
                                <input type="checkbox" className={`${classes.checkBox}`} checked={selectAll} onChange={handleSelectAllCheckBox} />
                            </th>
                            <th scope="col" className='nameColumn'>NAME</th>
                            <th scope="col">DESCRIPTION</th>
                            <th scope="col">TYPE</th>
                            <th scope="col">LAST ASSIGNED</th>
                        </tr>
                    </thead>
                    <tbody>
                        { renderTableBody() }
                    </tbody>
                </table>
            </div>

            { /* START OF environment TABLE PAGINATION SECTION. */}
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
            { /* END OF environment TABLE PAGINATION SECTION. */}
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


export default EnvironmentsPage;