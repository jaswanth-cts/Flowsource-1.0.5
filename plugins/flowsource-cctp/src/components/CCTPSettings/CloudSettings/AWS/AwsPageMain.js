
import React, { useState, useEffect } from 'react';

import 'bootstrap/dist/css/bootstrap.min.css';
import { Link } from 'react-router-dom';
import { fetchApiRef, useApi, configApiRef } from '@backstage/core-plugin-api';
import cssClasses from '../CloudSettingsCssPage.js';
import Create_plus_icon from '../../../Icons/Create_plus_icon.png';
import Delete_icon from '../../../Icons/Delete_icon.png';
import Refresh_icon from '../../../Icons/refresh_icon.png'; 
import dateUtils from '../../../TestExecutionPage/DateUtil.js';
import xss from 'xss';
import { BsSearch, BsX } from 'react-icons/bs';
import { FormControl, InputGroup } from 'react-bootstrap';

import log from 'loglevel';

import RobotServiceCard from './RobotServiceCard.js'; // Import the RobotServiceCard component
const AwsPageMain = (props) => {

  const classes = cssClasses();
  const [serviceTableData, setServiceTableData] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setLoading] = useState(true);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [selectAll, setSelectAll] = useState(false);
  const [selectedRows, setSelectedRows] = useState([]);
  const [isDeleteDisabled, setIsDeleteDisabled] = useState(true);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false); 
  const [deleteConfirmed, setDeleteConfirmed] = useState(false);
  const [selectedDeleteButton, setSelectedDeleteButton] = useState('yes');
  const [error, setError] = useState(null);
  const [deleteError, setDeleteError] = useState(null);
  const [showErrorDialog, setShowErrorDialog] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [selectedType, setSelectedType] = useState("All");
  const [uniqueTypes, setUniqueTypes] = useState(["All"]);
  const [staticRobotCount, setStaticRobotCount] = useState(0);
  const [staticTasksCount, setStaticTasksCount] = useState(0); // State to store the total tasks count for STATIC rows
  const { fetch } = useApi(fetchApiRef);
  const config = useApi(configApiRef);
  const baseUrl = config.getOptionalString('backend.baseUrl');
  const backendBaseApiUrl = baseUrl.endsWith('/')
                            ? `${baseUrl}api/flowsource-cctp/`
                            : `${baseUrl}/api/flowsource-cctp/`;

  const ITEMS_PER_PAGE = 5;
   
  const totalPages = Math.ceil(serviceTableData.length / ITEMS_PER_PAGE);
  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const currentServiceTableData = serviceTableData.slice(startIndex, endIndex);
  const pagesToShow = 3;
  const pagesArray = [...Array(totalPages).keys()];

  let startPage = 1;
  let endPage = Math.min(pagesToShow, totalPages);

  startPage = currentPage > pagesToShow - 2 ? currentPage - Math.floor(pagesToShow / 2) : startPage;
  endPage = currentPage > pagesToShow - 2 ? Math.min(currentPage + Math.floor(pagesToShow / 2), totalPages) : endPage;
  const isPreviousDisabled = currentPage === 1;
  const isNextDisabled = currentPage === totalPages;

  const handleSelectAll = () => { 
    let newSelectedRows = [...selectedRows];
        
    if (!selectAll) {
        newSelectedRows = [...new Set([...newSelectedRows, ...currentServiceTableData.map(row => row.id)])];
    }else {
        newSelectedRows = newSelectedRows.filter(id => !currentServiceTableData.map(row => row.id).includes(id));
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
    setSelectAll(currentServiceTableData.every(row => newSelectedRows.includes(row.id)));
    setIsDeleteDisabled(newSelectedRows.length === 0); 
  };

  useEffect(() => {
    setSelectAll(currentServiceTableData.length > 0 && currentServiceTableData.every(row => selectedRows.includes(row.id)));
  }, [selectedRows, currentPage, serviceTableData]);

  useEffect(() => {
    const selectedRowsInCurrentPage = selectedRows.filter(id => currentServiceTableData.map(row => row.id).includes(id));
    setIsDeleteDisabled(selectedRowsInCurrentPage.length === 0);
  }, [currentPage, currentServiceTableData, selectedRows]);

  const confirmDelete = () => {
    setSelectedDeleteButton('yes');
    setShowDeleteDialog(true);
  };

  const handleTabChange = () => {
    props.setActiveAWSComponent('awsPageNew');
    props.setAwsServiceId(null);
  };

  const handleDeleteConfirm = async () => {
    try {
      setSelectedDeleteButton('yes');
      setShowDeleteDialog(false);  // Hide the dialog before starting the delete
      setDeleteLoading(true);
      if (selectedRows.length > 0) {
        const test = JSON.stringify({ ids: selectedRows });
        const sanitizedSelectedRows = xss(JSON.stringify({ ids: selectedRows }));
        const response = await fetch(`${backendBaseApiUrl}cctp-proxy/flowsource/cloud/aws/robots`, {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json'
          },
          body: sanitizedSelectedRows
        });

        if (!response.ok) {
          // Read the error message from the response 
          const errorText = await response.text(); 
          // Format the error message 
          const formattedError = `HTTP error: status: ${response.status}, message: Error deleting service/s: ${errorText}`; 
          // Set the error state with the formatted error message 
          setDeleteError(formattedError); 
          // Set the error dialog to true to display the error message
          setShowErrorDialog(true);
          log.error('Error deleting services: API returned: ', response.status);
        } else {
          log.info(`Services with IDs ${selectedRows.join(', ')} have been deleted successfully.`);

          // Refresh data
          const updatedData = serviceTableData.filter(item => !selectedRows.includes(item.id));
          setServiceTableData(updatedData);
      
          // Clear selected rows
          setSelectedRows([]);
          setSelectAll(false);
      
          // Navigate to the first page
          setCurrentPage(1);
        }
      }
    } catch (error) {
      log.error('Error deleting service:', error);
      setDeleteError(`Error deleting service/s: ${error.message}`); 
      setShowErrorDialog(true); 
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleDeleteCancel = () => {
    setSelectedDeleteButton('no');
    setShowDeleteDialog(false);
  }; 

  const refreshData = () => {
    setLoading(true);
    getAwsData();
  };

  const handleTypeChange = (event) => {
    setSelectedType(event.target.value);
  };

  const handleSearchChange = (event) => {
    setSearchText(event.target.value);
  };

  const handleCancelSearch = () => {
    setSearchText("");
  };

  async function getAwsData() {
    try {
      const response = await fetch(`${backendBaseApiUrl}cctp-proxy/execution/cloud/aws/robots/`);
      log.info("Response:", response);
      if (response.ok) {
        const data = await response.json();
        const formattedData = data.map(item => ({
          id: item.id,
          name: item.name,
          type: item.type,
          zone: item.zone,
          cluster: item.cluster,
          tasks: item.tasks,
          lastUpdatedOn: dateUtils.formatDate(item.lastUpdatedOn),
          expiryDate:item.expiryDate
        }));
       formattedData.sort((a, b) => a < b ? 1 : -1);
        setServiceTableData(formattedData);
	      
        // Extract unique types for the dropdown
        const types = ["All", ...new Set(data.map(item => item.type))];
        setUniqueTypes(types);
	      
      } else {
        log.error('Failed to fetch data:', response.status, response.statusText);
        setError('Failed to fetch data');
      }
    } catch (error) {
      log.error('Error fetching data:', error);
      setError('Error fetching data');
    } finally {
      setLoading(false);
    }
  }
  async function getRobotCount() {
    try {
      const response = await fetch(`${backendBaseApiUrl}cctp-config`);
      if (response.ok) {
        const data = await response.json();
        setStaticRobotCount(data.staticMaxRobotCount);
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
    getAwsData();
    setIsDeleteDisabled(true);
    getRobotCount();
  }, []);

  const updateService = (serviceId) => { //service id will get from backend data 
    props.setActiveAWSComponent('awsPageNew'); 
    props.setAwsServiceId(serviceId);
  }; 

	const filteredData = serviceTableData.filter(item => {
    const matchesType = selectedType === "All" || item.type === selectedType;
    const matchesSearch = searchText === "" || item.name.toLowerCase().includes(searchText.toLowerCase()) || item.cluster.toLowerCase().includes(searchText.toLowerCase()) || item.zone.toLowerCase().includes(searchText.toLowerCase());
    return matchesType && matchesSearch;
  });
  // Calculate total tasks count for STATIC rows
  useEffect(() => {
    const totalStaticTasks = filteredData
      .filter(item => item.type === "STATIC") // Filter rows with type STATIC
      .reduce((total, item) => total + (item.tasks || 0), 0); // Sum up the tasks count
    setStaticTasksCount(totalStaticTasks); // Update the state
  }, [filteredData]); // Recalculate whenever filteredData changes
  return (
    <div>
       {error ? (
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
      ) : (
      <div className={`w-80 mt-2 ${classes.parentDivFramework}`} >
          <div className={`${classes.divcss3}`}>
            <div className={`${classes.divcss4}`}>
              <label htmlFor="type" className={`${classes.labelcss1}`}>Type</label>
              <select id="type" name="type" className={`${classes.selectcss1}`}
                value={selectedType} onChange={handleTypeChange}
              >
                {uniqueTypes.map((type) => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
              <div>
                <InputGroup>
                  <InputGroup.Text
                    className={`${classes.inputgroup1}`}
                  >
                    <BsSearch className={`${classes.bssearch1}`} />
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
                      className={`${classes.inputgroup2}`}
                    >
                      <BsX
                        className={`${classes.bsx}`}
                      />
                    </InputGroup.Text>
                  )}
                </InputGroup>
              </div>
            </div>


            <div className={`${classes.buttonOptionsSection} ${classes.divcss5}`} >
              <div>
                <a href="#" onClick={(e) => { e.preventDefault(); confirmDelete(); }}
                  className={`d-inline-flex  ${classes.marginright1} ${isDeleteDisabled ? classes.cursorNotAllowed : classes.cursorPointer}`} >
                  <img
                    src={Delete_icon}
                    alt="Delete"
                    title='Click to delete Service'
                    onClick={(e) => {
                      e.stopPropagation();
                      if (!isDeleteDisabled) {
                        confirmDelete();
                      }
                    }}
                    className={`${classes.deleteCreateIcon} ${isDeleteDisabled ? classes.disabledLink : ''} ${isDeleteDisabled ? classes.cursorNotAllowed : classes.cursorPointer}`}
                  />
                  <span className={`ms-2 ${classes.deleteCreateIconText} ${isDeleteDisabled ? classes.disabledLink : ''} ${isDeleteDisabled ? classes.cursorNotAllowed : classes.cursorPointer}`} >DELETE</span>
                </a>
              </div>
              <div>
                <a href="#" onClick={(e) => { e.preventDefault(); refreshData(); }}
                  className={`d-inline-flex  ${classes.marginright1}`} >
                  <img
                    src={Refresh_icon}
                    alt="Refresh"
                    title='Click to refresh data'
                    className={`${classes.deleteCreateIcon}`}
                  />
                  <span className={`ms-2 ${classes.deleteCreateIconText}`} >REFRESH</span>
                </a>
              </div>
              <div>
                {showDeleteDialog && (
                  <div className={`${classes.dialogOverlay}`}>
                    <div className={`${classes.dialogBox}`}>
                      <p>Do you want to delete the selected service?</p>
                      <button
                        style={{ backgroundColor: selectedDeleteButton === 'yes' ? '#000048' : 'grey' }}
                        className={`${classes.dialogBoxYesButton}`}
                        onClick={handleDeleteConfirm}
                      >
                        Yes
                      </button>
                      <button
                        style={{ backgroundColor: selectedDeleteButton === 'no' ? '#000048' : 'grey' }}
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
                  className={`d-inline-flex align-items-center ${classes.marginright1}`}>
                  <img
                    src={Create_plus_icon}
                    alt="Create Service"
                    title='Click to create Service'
                    onClick={() => handleTabChange()}
                    className={`${classes.deleteCreateIcon}`}
                  />
                  <span className={`ms-2 ${classes.deleteCreateIconText}`} >NEW SERVICE</span>
                </a>
              </div>
            </div>
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
                      <th scope="col" className={`checkboxColumn ${classes.leftAlign}`}>
                        <input type="checkbox" className={`${classes.checkbox}`} checked={selectAll} onChange={handleSelectAll} />
                      </th>
                      <th scope="col" className='nameColumn'>SERVICE NAME</th>
                      <th scope="col">SERVICE TYPE</th>
                      <th scope="col">REGION</th>
                      <th scope="col">CLUSTER NAME</th>
                      <th scope="col">TASKS/ROBOTS</th>
                      <th scope="col">LAST UPDATED</th>
                    </tr>
                  </thead>
                
                   <tbody>
                     {deleteLoading ? (
                      <tr>
                        <td colSpan="7" className={`${classes.tdcss1}`}>
                          Deleting...
                        </td>
                      </tr>
                    ) : (
                      filteredData.length !== 0 ? (
                        filteredData.slice(startIndex, endIndex).map((row) => (
                          <tr key={row.id} className={`${classes.trcss1}`}>
                            <td className={`${classes.tdcss2}`}>
                              <input
                                type="checkbox"
                                className={`${classes.inputcss1}`}
                                checked={selectedRows.includes(row.id)}
                                onChange={(e) => { handleCheckboxChange(e, row.id); }}
                              />
                            </td>
                            <td className={`${classes.tdcss3}`} >
                              <div className={`${classes.divcss6}`}>
                                {row.type === 'STATIC' && (
                                  <RobotServiceCard robot={row} staticTasksCount={staticTasksCount} staticRobotCount={staticRobotCount}/>
                                )}
                                <Link
                                  to="#"
                                  onClick={() => updateService(row.id)}
                                  className={`${classes.linkcss}`}
                                  style={{ marginLeft: row.type === 'STATIC' ? '-4px' : '8px' }}
                                >
                                  {row.name}
                                </Link>
                              </div>
                            </td>
                            <td className={`${classes.tdcss4}`}>{row.type}</td>
                            <td className={`${classes.tdcss4}`}>{row.zone}</td>
                            <td className={`${classes.tdcss4}`}>{row.cluster}</td>
                            <td className={`${classes.tdcss4}`}>{row.tasks}</td>
                            <td className={`${classes.tdcss4}`}>{row.lastUpdatedOn}</td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="7" className={`${classes.tdcss1}`}>
                            <div className={`${classes.divcss7}`}>
                              <b>No Match Found</b>
                            </div>
                          </td>
                        </tr>
                      )
                    )}
                  </tbody>
                </table>

                {filteredData.length > 0 && (
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
                )}
              </div>
            )}
          </div>
      </div>
      )}
    </div>
  );
};

export default AwsPageMain;
