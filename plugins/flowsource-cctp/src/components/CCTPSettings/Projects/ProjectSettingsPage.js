import React, { useState, useEffect } from 'react';

import 'bootstrap/dist/css/bootstrap.min.css';
import { fetchApiRef, useApi, configApiRef } from '@backstage/core-plugin-api';

import cssClasses from './ProjectSettingsPageCSS.js';
import Create_plus_icon from '../../Icons/Create_plus_icon.png';
import Delete_icon from '../../Icons/Delete_icon.png';
import { FormControl, InputGroup } from 'react-bootstrap';
import { BsSearch, BsX } from 'react-icons/bs';

import log from 'loglevel';

const ProjectSettingPage = (props) => {

  const classes = cssClasses();
  const [allProjects, setAllProjects] = useState([]);
  const [tableData, setTableData] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setLoading] = useState(true);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [selectAll, setSelectAll] = useState(false);
  const [selectedRows, setSelectedRows] = useState([]);
  const [isDeleteDisabled, setIsDeleteDisabled] = useState(true);
  const [slectedDeleteButton, setSelectedDeleteButton] = useState('yes');
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [filterType, setFilterType] = useState('ALL');
  const [infoText, setInfoText] = useState('No Data Available');

  const ITEMS_PER_PAGE = 10;
  const totalPages = Math.ceil(tableData.length / ITEMS_PER_PAGE);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };
  
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const currentTableData = tableData.slice(startIndex, endIndex);
  const pagesToShow = 3;
  const pagesArray = [...Array(totalPages).keys()];

  let startPage = 1;
  let endPage = Math.min(pagesToShow, totalPages);

  startPage = setStartPage();
  endPage = setEndPage();

  const isPreviousDisabled = currentPage === 1;
  const isNextDisabled = currentPage === totalPages;

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

  const { fetch } = useApi(fetchApiRef);
  const config = useApi(configApiRef);
  const backendBaseApiUrl = config.getString('backend.baseUrl') + '/api/flowsource-cctp/';

  const handleTabChange = () => {
    const data = {
      requestType: 'POST',
      id: '',
      title: 'Create project',
      buttonTitle: 'CREATE',
      projectName: '',
      applicationName: '',
      archeType: '',
    }
    props.setPropValues(data);
    props.setActiveTab('addproject');
  };

  const handleTypeChange = (e) => {
    const selectedType = e.target.value;
    setFilterType(selectedType);
    setSearchText('');
    if(selectedType === "ALL"){
      setTableData(allProjects);
    }else{
      const filterProjectsByType = allProjects.filter(item => item.archeType === selectedType );
      setTableData(filterProjectsByType);
    }

  };

  const handleSearchChange = async (e) => {
    const searchStr = e.target.value;
    updateSearchList(searchStr);
  };

  const handleCancelSearch = ()=>{
    updateSearchList('');
  }

  function updateSearchList(searchTxt){
    setSearchText(searchTxt);
    let searchList = [];
    if(filterType === "ALL"){
      searchList = allProjects.filter(searchString=>
        ((searchString.applicationName.toLocaleLowerCase().includes(searchTxt.toLocaleLowerCase())
          || searchString.projectName.toLocaleLowerCase().includes(searchTxt.toLocaleLowerCase()))
          ));
    }else{

      searchList = allProjects.filter(searchString=>
        ((searchString.applicationName.toLocaleLowerCase().includes(searchTxt.toLocaleLowerCase())
          || searchString.projectName.toLocaleLowerCase().includes(searchTxt.toLocaleLowerCase()))
          && searchString.archeType.toLocaleLowerCase().includes(filterType.toLocaleLowerCase())
          ));

    }
      if(searchList.length === 0){
        setInfoText("No match found");
      }else{
        setInfoText("No Data Available");
      }
    setTableData(searchList);
  }

  const handleCheckboxChange = (e, rowId) => {
    let newSelectedRows; 

    if (e.target.checked) { 
        newSelectedRows = [...selectedRows, rowId];
    } else { 
        newSelectedRows = selectedRows.filter(id => id !== rowId);
    }

    setSelectedRows(newSelectedRows);
    setSelectAll(currentTableData.every(row => newSelectedRows.includes(row.id)));
    setIsDeleteDisabled(newSelectedRows.length === 0);
  };

  const handleSelectAllCheckboxChange = (e)=>{
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
  }, [selectedRows, currentPage, tableData]);

  useEffect(() => {
    const selectedRowsInCurrentPage = selectedRows.filter(id => currentTableData.map(row => row.id).includes(id));
    setIsDeleteDisabled(selectedRowsInCurrentPage.length === 0);
  }, [currentPage, currentTableData, selectedRows]);

  useEffect(() => {
    setCurrentPage(1);
    // Reset checkboxes when the component mounts or fliter type changes
    setSelectAll(false);
    setSelectedRows([]);
    setIsDeleteDisabled(true);
  }, [filterType]);

  const confirmDelete = () => {
    setSelectedDeleteButton('yes');
    setShowDeleteDialog(true);
  };

  const handleDeleteCancel = () => {
    setSelectedDeleteButton('no');
    setShowDeleteDialog(false);
  };

  async function handleDeleteConfirm() {  
    try { 
      setSelectedDeleteButton('yes');
      setShowDeleteDialog(false);  // Hide the dialog before starting the delete
      setDeleteLoading(true);
      if (selectedRows.length > 0) { 

        const response = await fetch(`${backendBaseApiUrl}cctp-proxy/workbench/projects`, {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ ids: selectedRows })
        });
        if (!response.ok) { 
          throw new Error('Network response was not ok'); 
        } 
        
        log.info(`Property with ID ${selectedRows} has been deleted successfully.`);

        // Refresh data
        await getAllProjects();
        
        // Clear selected row 
        setSelectedRows([]); 

        // Navigate to the first page 
        setCurrentPage(1);

      }
    } catch (error) { 
      log.error('Error deleting property:', error);
    } finally {
      setDeleteLoading(false);
    }
  };

  async function getAllProjects() {
    try {
      const response = await fetch(`${backendBaseApiUrl}cctp-proxy/workbench/projects`);
      const data = await response.json();
      const allProjects  = data.map((item) => {
        return {
            id: item.id,
            projectName: item.name,
            applicationName: item.applicationName,
            archeType: item.archetype
        }
    });
    // Sort the projects by name
    allProjects.sort((a, b) => a.projectName.localeCompare(b.projectName));
    setLoading(false);
    setTableData(allProjects);
    const checkedValue = new Array(allProjects.length).fill(false);
    setAllProjects(allProjects);
      } catch (error) {
        log.error('Error fetching projects:', error);
      }
  }

  useEffect(async () => {
    setSelectedRows([]);
    getAllProjects();
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


  return (
    <div>
      <div className={`w-80 mt-2`} >
        <div className={`row justify-content-between pb-2`}>
        <div className={`col-auto ${classes.filterItems}`}>
          <label htmlFor="name" className={`${classes.filterType} `} >ARCHETYPE </label>
            <select id="type" name="type" className={`col-auto`} onChange={(e) => handleTypeChange(e)}>
                <option value='ALL'>ALL</option>
                <option value='Generic'>Generic</option>
                <option value='SFDC'>SFDC</option>
                <option value='Guidewire'>Guidewire</option>
                <option value='SAP'>SAP</option>
            </select>
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
          <div className={`col-auto ${classes.iconRight}`}>
            <a href="#" onClick={(e) => { e.preventDefault(); confirmDelete(); }}
              className={`d-inline-flex  ${classes.marginright} ${ getDeleteIconHoverCssStlye() }`} >
                <img
                    src={Delete_icon}
                    alt="Delete"
                    title='Click to delete Projects'
                    className={`${classes.deleteCreateIcon} ${ getDisabledLinkCssStlye() } ${ getDeleteIconHoverCssStlye() }`}
                />
                <span className={`ms-2 ${classes.deleteCreateIconText} ${ getDisabledLinkCssStlye() } ${ getDeleteIconHoverCssStlye() }`} >DELETE</span>
            </a>
             {/* Confirmation Dialog */} 
             {showDeleteDialog && ( 
              <div className={`${classes.dialogOverlay}`}>
                <div className={`${classes.dialogBox}`}>
                  <p>Do you want to delete the selected item/s?</p>
                  <button
                      style={{backgroundColor: slectedDeleteButton === 'yes' ? '#000048' : 'grey'}}
                      className={`${classes.dialogBoxYesButton}`}
                      onClick={handleDeleteConfirm}
                  >
                      Yes
                  </button>
                  <button
                      style={{backgroundColor: slectedDeleteButton === 'no' ? '#000048' : 'grey'}}
                      className={`${classes.dialogBoxNoButton}`}
                      onClick={handleDeleteCancel}
                  >
                      No
                  </button>
                </div>
            </div>
            )}
            <a href="#" onClick={() => handleTabChange()} 
              className={`d-inline-flex align-items-center ${classes.marginright} ${classes.newFrameworkBorder}`}>
                <img
                    src={Create_plus_icon}
                    alt="Add new property"
                    title='Click to add new Property'
                    onClick={() => handleTabChange()}
                    className={`${classes.deleteCreateIcon}`}
                />
                <span className={`ms-2 ${classes.deleteCreateIconText}`} >NEW PROJECT</span>
            </a>
          </div>
          <div>
            {isLoading ? (
              <div className={`App p-3 ${classes.loading}`}>
                Loading...
              </div>
            ) : (
              <div className="table-responsive"  >
                <table className={`table ${classes.tableBorders} `}>
                  <thead>
                    <tr className={`${classes.tableHead}`}>
                      <th scope="col" className='checkboxColumn'>
                        <input type="checkbox" className={`${classes.checkbox}`} checked={selectAll}
                        onChange={(e) => {handleSelectAllCheckboxChange(e)}} />
                      </th>
                      <th scope="col" className='nameColumn'>NAME</th>
                      <th scope="col">APPLICATION</th>
                      <th scope="col">ARCHETYPE</th>

                    </tr>
                  </thead>
                  <tbody >
                  {deleteLoading ? ( 
                    <tr> 
                      <td colSpan="4" className="text-center"> 
                        Deleting... 
                      </td> 
                    </tr> ) : (
                    currentTableData.length !== 0 && currentTableData.map((row, index) => (
                      <tr key={row.name}>
                        <td className={`${classes.colStyle1}`}>
                          <input type="checkbox" className={`${classes.checkbox}`}
                            checked={selectedRows.includes(row.id)}
                            onChange={(e) => {handleCheckboxChange(e, row.id)}} />
                        </td>
                        <td className={`${classes.colStyle1} ${classes.alignLeft}` } >
                        {row.projectName}
                        </td>
                        <td className={`${classes.colStyle1}`}>{row.applicationName}</td>
                        <td className={`${classes.colStyle1}`}>{row.archeType}</td>
                      </tr>
                      ))
                    )}
                  </tbody>
                </table>
                {tableData.length === 0 ?  
                  (<p className={`${classes.dataUnavailable}`}>
                    <b>{infoText}</b>
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

export default ProjectSettingPage;
