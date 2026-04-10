
import React, { useState, useEffect } from 'react';
import { Table, Container, Row, FormControl, Col, InputGroup } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import { BsSearch, BsX } from 'react-icons/bs';
import cssClasses from './css/AzureRepoMainCss';
import { useEntity } from '@backstage/plugin-catalog-react';
import {  Dialog, DialogTitle, DialogContent, TableCell, TableBody, TableRow } from '@material-ui/core';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import CloseIcon from '@mui/icons-material/Close';
import Tooltip from '@mui/material/Tooltip';

import approvedIcon from './Icons/Approved_icon.png';
import draftIcon from './Icons/draft_icon.png';
import readyIcon from './Icons/ready_icon.png';
import rejectIcon from './Icons/Reject_icon.png';
import approvewithsuggestionsIcon from './Icons/ApprovedwithSuggestion_icon.png';
import waitforauthorIcon from './Icons/WaitforAuthor_icon.png';

const TableComponent = ({values, fetchAllData, isLoadingData, additionalData, fetchDataOnClick, additionalDataLoading}) => {
  const classes = cssClasses();
  const [searchText, setSearchText] = useState('');
  const [selectedButton, setSelectedButton] = useState('active');  
  const [activeButton, setActiveButton] = useState('active');
  const [stateCounts, setStateCounts] = useState({ active: 0, completed: 0, abandoned: 0, all: 0 });
  const [filteredData, setFilteredData] = useState([]);
  const entity = useEntity();
  const projectName = entity.entity.metadata.annotations['flowsource/azure-project-name'];
  const repositoryName = entity.entity.metadata.annotations['flowsource/azure-repo-name']; 
  const [currentPage, setCurrentPage] = useState(1);
  const [previousPage,setPreviousPage] = useState(1);
  const itemsPerPage = 8;
  const [openDialog, setOpenDialog] = useState({ open: false, rowNumber: null });
  
  const handleClickOpen = (rowNumber) => {
    fetchDataOnClick(rowNumber);
    setOpenDialog({ open: true, rowNumber });
  };

  const handleClose = () => {
    setOpenDialog({ open: false, rowNumber: null });
  };

  const updateStateCounts = (data) => {
    const counts = {
      active: data ? data.filter(item => item.state === 'active').length : 0,
      completed: data ? data.filter(item => item.state === 'completed').length : 0,      
      abandoned: data ? data.filter(item => item.state === 'abandoned').length : 0,
      all: data ? data.length : 0,
    };
    setStateCounts(counts);
  };
 
  const updateFilteredData = () => {
    let data = values || [];
    if (searchText.trim() !== '') {
      const searchTextLower = searchText.toLowerCase();
      data = data.filter(
        item =>
          item.number.toString().includes(searchText) ||
          item.title.toLowerCase().includes(searchTextLower) ||
          item.creator.toLowerCase().includes(searchTextLower) ||
          item.createdAt.toLowerCase().includes(searchTextLower) ||
          item.state.toLowerCase().includes(searchTextLower),
      );
    }
 
    switch (selectedButton){
      case 'active':
        data = data.filter(item => item.state === 'active');
        break;      
      case 'completed':
        data = data.filter(item => item.state === 'completed');
        break;
      case 'abandoned':
        data = data.filter(item => item.state === 'abandoned');
        break;
      case 'all':
        break;
      default:
        break;
    }   
    data.sort((a, b) => {
      return new Date(b.createdAt) - new Date(a.createdAt);
    });    
    setFilteredData(data);
  };
  
  const handleButtonClick = (state) => {
    setSelectedButton(state);
    fetchAllData(state); 
    setActiveButton(state);
    setCurrentPage(1);
    setSearchText('');
  }; 

  const start = (currentPage - 1) * itemsPerPage + 1;
  const end = Math.min(currentPage * itemsPerPage, filteredData.length);
  const currentRange = { start, end };

  const formatState = (state) => {
    if (!state) return '';    
    return state.charAt(0).toUpperCase() + state.slice(1).toLowerCase();
  };

  const paginationData = filteredData.slice(currentRange.start - 1, currentRange.end);
  const isPreviousDisabled = currentPage === 1;
  const isNextDisabled = currentPage * itemsPerPage >= filteredData.length;

  const getButtonStyles = (buttonState, activeButton) => ({
    backgroundColor: activeButton === buttonState ? '#2e308e' : 'transparent',
    color: activeButton === buttonState ? 'white' : '#2e308e',
    border: `1px solid #000048`,
  });

  const handleSearchChange = (event) => {
    const text = event.target.value;
    setSearchText(text);
    if (!searchText) {
      setPreviousPage(currentPage);
    }
  };
 
  const handleCancelSearch = () => {
    setSearchText('');
    setCurrentPage(previousPage);
  };
 
  const handlePageChange = (page) => {
    setCurrentPage(page);
  };
  
  useEffect(() => {
    updateStateCounts(values); 

    if (selectedButton === 'active') {
      setFilteredData(values.filter(item => item.state === 'active'));
    } else if (selectedButton === 'abandoned') {
      setFilteredData(values.filter(item => item.state === 'abandoned'));
    } else if (selectedButton === 'completed') {
      setFilteredData(values.filter(item => item.state === 'completed')); 
    } else {
      setFilteredData(values); 
    }

    updateFilteredData();
  }, [values, selectedButton, searchText, activeButton, currentPage, previousPage]);
  
  

  function setBackgroundColor(state) {
    if(state === 'active') {
      return '#fb6868';
    } else if(state === 'abandoned') {
      return '#afafaf';
    } else if(state === 'completed') {
      return '#11bf6a';
    } else {
      return '';
    }
  }

  function setReviewDecision(reviewDecision) {
    if(reviewDecision === -10) {
      return 'Review Decision: Reject';
    } else if(reviewDecision === -5) {
      return 'Review Decision: Wait for Author';
    } else if(reviewDecision === 5) {
      return 'Review Decision: Approve with Suggestions';
    } else if(reviewDecision === 10) {
      return 'Review Decision: Approve';
    } else {
      return '';
    }
  }

  function setReviewImgSrc(reviewDecision) {
    if(reviewDecision === -10) {
      return rejectIcon;
    } else if(reviewDecision === -5) {
      return waitforauthorIcon;
    } else if(reviewDecision === 5) {
      return approvewithsuggestionsIcon;
    } else if(reviewDecision === 10) {
      return approvedIcon;
    } else {
      return '';
    }
  }

  function setReviewImgAlt(reviewDecision) {
    if(reviewDecision === -10) {
      return 'Reject Icon';
    } else if(reviewDecision === -5) {
      return 'Wait for Author Icon';
    } else if(reviewDecision === 5) {
      return 'Approve with Suggestions Icon';
    } else if(reviewDecision === 10) {
      return 'Approve Icon';
    } else {
      return '';
    }
  }

  function renderTableContent() {
    if(isLoadingData) {
      return (
        <tr>
          <td colSpan="7" className={`${classes.displayMsg}`}>
            Loading...
          </td>
        </tr>
      );
    } 
    else if(paginationData.length === 0) {
      return (
        <tr>
          <td colSpan="7" className={`${classes.displayMsg}`}>
            No data found.
          </td>
        </tr>
      );
    }
    else {
      return (
        paginationData.map(
          (row, index) =>
            (row.number.toString().includes(searchText) ||
              row.title.toLowerCase().includes(searchText.toLowerCase()) ||
              row.creator.toLowerCase().includes(searchText.toLowerCase()) ||
              row.createdAt.toLowerCase().includes(searchText.toLowerCase()) ||
              row.state.toLowerCase().includes(searchText.toLowerCase())
            )
            && (
              <tr key={row.number}>
                <td>{row.number}</td>
                <td>
                  <a
                    href={row.url}
                    target="_blank"
                    style={{
                      color: '#3373b2',
                      textDecoration: 'none',
                    }}
                  >
                    {row.title}
                  </a>
                </td>
                <td>{row.creator.replace('(Cognizant)', '')}</td>
                <td>{row.createdAt}</td>
                <td>
                  <span
                    style={{
                      color: 'white',
                      backgroundColor: setBackgroundColor(row.state),
                      padding: '1px 8px',
                      borderRadius: '12px',
                    }}
                  >
                    {formatState(row.state)}
                  </span></td>
                <td>
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    width: '80px',
                  }}>
                    <div style={{ width: '50px', textAlign: 'right' }}>
                      <Tooltip
                        title={
                          row.isDraft ? 'Draft' : 'Ready for Review'
                        }
                      >
                        <img style={{ paddingLeft: '5px', height: '20px' }}
                          src={row.isDraft ? draftIcon : readyIcon}
                          alt={row.isdraft ? 'Draft Icon' : 'Ready Icon'}
                        />
                      </Tooltip>
                    </div>
                    <div style={{ width: '50px', textAlign: 'right' }}>
                      <Tooltip
                        title={setReviewDecision(row.reviewDecision)}
                      >
                        <img
                          style={{ height: '20px' }}
                          src={setReviewImgSrc(row.reviewDecision)}
                          alt={setReviewImgAlt(row.reviewDecision)}
                        />
                      </Tooltip>
                    </div>
                  </div>
                </td>
                <td><MoreVertIcon
                  className={classes.moreVertIcon}
                  onClick={() => handleClickOpen(row.number)}
                />
                </td>
              </tr>
            )
        )
      );
    }
  }

  return (
    <>
      <Dialog open={openDialog.open} onClose={handleClose}>
      <DialogTitle style={{ color: '#2e308e' }}>Additional Details
        <CloseIcon onClick={handleClose} style={{ float: 'right', cursor: 'pointer', color: '#2e308e' }} />
      </DialogTitle>
      <DialogContent className={classes.ContentBox}>
        <Table style={{ border: '1px solid grey', minWidth: "400px", minHeight: "150px" }}>
        {additionalDataLoading ? (
              <tr>
                <td className={`${classes.displayMsg}`}>Loading...</td>
              </tr>
            ) : (  
        <TableBody>
          <TableRow style={{}}>
          <TableCell style={{ backgroundColor: '#2e308e', color: 'white', width: '30%', borderBlockColor: 'rgb(122 124 226)' }}>Last Updated</TableCell>
          <TableCell style={{ width: '70%' }}>
          {additionalData.updatedAtDate ? (() => {
              const date = new Date(additionalData.updatedAtDate);
              const formattedDate = date.toLocaleDateString('en-GB', { dateStyle: 'short', timeZone: 'UTC' });
              const formattedTime = date.toLocaleTimeString('en-GB', { timeStyle: 'short', timeZone: 'UTC' });
              return `${formattedDate} at ${formattedTime}`;
            })()
            : ''}
          </TableCell>
          </TableRow>
          <TableRow>
          <TableCell style={{ backgroundColor: '#2e308e', color: 'white', width: '30%', borderBlockColor: 'rgb(122 124 226)' }}>Assignee</TableCell>
          <TableCell style={{ width: '70%', wordWrap: 'break-word', whiteSpace: 'pre-wrap' }}>
            {additionalData.assignee|| ''}
          </TableCell>
          </TableRow>             
          <TableRow>
          <TableCell style={{ backgroundColor: '#2e308e', color: 'white', width: '30%', borderBlockColor: 'rgb(122 124 226)' }}>Review Requested</TableCell>
          <TableCell style={{ width: '70%' }}>
            {additionalData.reviewRequests?.join(', ') || ''}
          </TableCell>
          </TableRow>
          <TableRow>
          <TableCell style={{ backgroundColor: '#2e308e', color: 'white', width: '30%', borderBlockColor: 'rgb(122 124 226)' }}>Reviewers</TableCell>
          <TableCell style={{ width: '70%', wordWrap: 'break-word', whiteSpace: 'pre-wrap' }}>
            {additionalData.requiredReviewerName || ''}
          </TableCell>
          </TableRow> 

          <TableRow>
          <TableCell style={{ backgroundColor: '#2e308e', color: 'white', width: '30%' }}>Labels</TableCell>
          <TableCell style={{ width: '70%' }}>
            {additionalData.lables && additionalData.lables.length > 0 ? (<span
              style={{
              backgroundColor: '#2F78C4',
              color: 'white',
              padding: '2px 5px',
              borderRadius: '5px',
              marginRight: '5px',
              }}
            >{additionalData.lables.join(' ')}</span>): ''}
          </TableCell>
          </TableRow>
          <TableRow>
          <TableCell style={{ backgroundColor: '#2e308e', color: 'white', width: '30%', borderBlockColor: 'rgb(122 124 226)' }}>Comments</TableCell>
          <TableCell style={{ width: '70%', wordWrap: 'break-word', whiteSpace: 'pre-wrap' }}>
            {additionalData.openCommentCount}/{additionalData.totalcomment}
          </TableCell>
          </TableRow>
        </TableBody>
        )}
        </Table>
      </DialogContent>
      </Dialog>
    <Container>
      <div className={`d-flex justify-content-end`}>
      <div className={`col-6 mb-3 m-0 p-0 d-flex justify-content-end`}>
        <div>
        <button
          className={`${classes.buttonStyle}`}
          style={getButtonStyles('active',activeButton)}
          onClick={() => handleButtonClick('active')}
        >
          ACTIVE 
        </button>
        <button
          className={`${classes.buttonStyle}`}
          style={getButtonStyles('completed',activeButton)}
          onClick={() => handleButtonClick('completed')}
        >
          COMPLETED 
        </button>
        <button
          className={`${classes.buttonStyle}`}
          style={getButtonStyles('abandoned',activeButton)}
          onClick={() => handleButtonClick('abandoned')}
        >
          ABANDONED 
        </button>
        <button
          className={`${classes.buttonStyle}`}
          style={getButtonStyles('all',activeButton)}
          onClick={() => handleButtonClick('all')}
        >
          ALL 
        </button>
        </div>
      </div>
      </div>
      <Row className={`${classes.firstRow}`}>
      <Col className={`col-4.7 mt-3`}>
        <h2 style={{ margin: 0, color: '#2e308e', fontSize: '18px' }}>
        {projectName}/{repositoryName} 
        {activeButton === 'active' && <span className={classes.darkBlueBox}>{stateCounts.active}</span>}
        {activeButton === 'abandoned' && <span className={classes.darkBlueBox}>{stateCounts.abandoned}</span>}
        {activeButton === 'all' && <span className={classes.darkBlueBox}>{stateCounts.all}</span>}
        {activeButton === 'completed' && <span className={classes.darkBlueBox}>{stateCounts.completed}</span>}
        </h2>
        </Col>
        <Col className={`col-4.3 ${classes.checkboxs} d-flex justify-content-end align-items-center`}>
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
        </Col>
      </Row>
      <Row>      
      <Table className={`table ${classes.tableBorders} `}>
  <thead>
    <tr className={`${classes.tableHead}`}>
    <th
      style={{
      color: 'white',
      backgroundColor: '#2e308e',
      width: "35px"
      }}
    >
      ID
    </th>
      <th
      style={{
      color: 'white',
      backgroundColor: '#2e308e',
      }}
    >
      TITLE
    </th>
    <th
      style={{
      color: 'white',
      backgroundColor: '#2e308e',
       width: '200px'
      }}
    >
      CREATOR
    </th>
    <th
      style={{
      color: 'white',
      backgroundColor: '#2e308e',
      width: '115px'
      }}
    >
      CREATED
        </th>
    <th
      style={{
      color: 'white',
      backgroundColor: '#2e308e',
      width: '100px'
      }}
    >
      STATUS
    </th>
    <th
        style={{
          color: 'white',
          backgroundColor: '#2e308e',
          width: '50px'
        }}> </th>
      <th
        style={{
          color: 'white',
          backgroundColor: '#2e308e', 
          width: '50px'
        }}>
      </th>
    </tr>
  </thead>
  <tbody>
    {renderTableContent()}
  </tbody>
  </Table>
      {!isLoadingData && filteredData.length > 0 && (
        <Row className={`${classes.lastRow}`}>
        <div className={`${classes.paginations}`}>
          <nav aria-label="Page navigation example">
          <ul
            className={`pagination justify-content-end ${classes.ulCss} ${classes.customPagination}`}
          >                  
            <li
            className={`${isPreviousDisabled ? 'disabled' : ''} ${classes.liCss
              } ${classes.numCss}`}
            >
            <button
              aria-label="Previous"
              tabIndex={-1}
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={isPreviousDisabled}
              className={`${classes.liCss} ${classes.btnCss}`}
              style={{ backgroundColor: '#232f8e' }}
            >
              <span
              aria-hidden="true"
              style={{
                color: 'white',
                fontWeight: 'lighter',
                fontSize: '20px',
                position: 'relative',
                top: '-1px',

              }}
              >
              &lsaquo;
              </span>
            </button>
            </li>
            <li className={`${classes.liCss} ${classes.numCss}`}>
            <span
              style={{
              backgroundColor: 'white',
              padding: '0px 3px',
              borderRadius: '3px',
              color: 'black'
              }}
            >
              {currentPage}
            </span>
            </li>
            <li
            className={`${isNextDisabled ? 'disabled' : ''} ${classes.liCss
              } ${classes.numCss}`}
            >
            <button
              aria-label="Next"
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={isNextDisabled}
              className={`${classes.liCss} ${classes.btnCss}`}
              style={{ backgroundColor: '#232f8e' }}
            >
              <span
              aria-hidden="true"
              style={{
                color: 'white',
                fontWeight: 'lighter',
                fontSize: '20px',
                position: 'relative',
                top: '-1px',
                border: 'none'
              }}
              >
              &rsaquo;
              </span>
            </button>
            </li>                
            <li
            className={`${classes.liCss}`}
            style={{
              border: '1px solid gray',
              borderLeft: 'none',
              padding: '2px 8px 2px 3px',
              color: 'black'
            }}
            >
            {currentRange.start} - {currentRange.end} of {filteredData.length} requests
            </li>
          </ul>
          </nav>
        </div>
        </Row>
      )}        
      </Row>
    </Container>
    </>
    );
  };
export default TableComponent;
