import React, { useState, useEffect } from 'react';
import { Table, Container, Row, FormControl, Col, InputGroup } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import { BsSearch, BsX } from 'react-icons/bs';
import cssClasses from './css/GitHubRepoMainCss';
import { useEntity } from '@backstage/plugin-catalog-react';
import {  Dialog, DialogTitle, DialogContent, TableCell, TableBody, TableRow } from '@material-ui/core';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import CloseIcon from '@mui/icons-material/Close';
import Tooltip from '@mui/material/Tooltip';

import approvedIcon from './Icon/Approved_icon.png';
import draftIcon from './Icon/draft_icon.png';
import readyIcon from './Icon/ready_icon.png';
import reviewRequiredIcon from './Icon/Review_Required_icon.png';
import requestChangeIcon from './Icon/Request_Changes_icon.png';

const TableComponent = ({ values, fetchAllPRDetails, isLoadingAll }) => {
  // Filter the data based on the selected filter
  const classes = cssClasses();
  const [searchText, setSearchText] = useState('');
  const [selectedButton, setSelectedButton] = useState('open');
  const [activeButton, setActiveButton] = useState('open');
  const [stateCounts, setStateCounts] = useState({ open: 0, closed: 0, all: 0, merged: 0 });
  const [displayedData, setDisplayedData] = useState([]);
  const entity = useEntity();
  const repoOwner = entity.entity.metadata.annotations['flowsource/github-repo-owner'];
  const repoName = entity.entity.metadata.annotations['flowsource/github-repo-name'];
  const [currentPage, setCurrentPage] = useState(1);
  const [previousPage, setPreviousPage] = useState(1);
  const itemsPerPage = 8;

  const [openDialog, setOpenDialog] = useState({ open: false, rowNumber: null });
  const handleClickOpen = (rowNumber) => {
    setOpenDialog({ open: true, rowNumber });
  };
  const handleClose = () => {
    setOpenDialog({ open: false, rowNumber: null });
  };
  const getUniqueReviewers = (reviews) => {
    const uniqueReviewers = Array.from(new Set(reviews.map(review => review.author)));
    return uniqueReviewers.join(', ');
  };
  const updateStateCounts = (data) => {
    const counts = {
      open: data ? data.filter(item => item.state === 'OPEN').length : 0,
      closed: data ? data.filter(item => item.state === 'CLOSED').length : 0,
      merged: data ? data.filter(item => item.state === 'MERGED').length : 0,
      all: data ? data.length : 0,
    };
    setStateCounts(counts);
  };

  const updateDisplayedData = () => {
    let filteredData = values || [];
    if (searchText.trim() !== '') {
      const searchTextLower = searchText.toLowerCase();
      filteredData = filteredData ?.filter(
        item =>
          item.number.toString().includes(searchText) ||
          item.title.toLowerCase().includes(searchTextLower) ||
          item.creator.toLowerCase().includes(searchTextLower) ||
          item.createdAt.toLowerCase().includes(searchTextLower) ||
          item.state.toLowerCase().includes(searchTextLower),
      );
    }
    switch (selectedButton) {
      case 'open':
        filteredData = filteredData?.filter(item => item.state === 'OPEN');
        break;
      case 'closed':
        filteredData = filteredData?.filter(item => item.state === 'CLOSED');
        break;
      case 'all':
        break;
      case 'merged':
        filteredData = filteredData?.filter(item => item.state === 'MERGED');
        break;
      default:
        break;
    }
    setDisplayedData(filteredData);
  };
  const handleButtonClick = (state) => {
    setSelectedButton(state);
    switch (state) {
      case 'open':
        fetchAllPRDetails("open");
        setActiveButton('open');
        setCurrentPage(1);
        break;
      case 'closed':
        fetchAllPRDetails("close");
        setActiveButton('closed');
        setCurrentPage(1);
        break;
      case 'all':
        fetchAllPRDetails("all");
        setActiveButton('all');
        setCurrentPage(1);
        break;
      case 'merged':
        fetchAllPRDetails("merge");
        setActiveButton('merged');
        setCurrentPage(1);
        break;
      default:
        break;
    }
  };
  const start = (currentPage - 1) * itemsPerPage + 1;
  const end = Math.min(currentPage * itemsPerPage, displayedData.length);
  const currentRange = { start, end };

  const formatState = (state) => {
    if (!state) return '';
    return state.charAt(0).toUpperCase() + state.slice(1).toLowerCase();
  };
  const paginationData = displayedData.slice(currentRange.start - 1, currentRange.end);
  const isPreviousDisabled = currentPage === 1;
  const isNextDisabled = currentPage * itemsPerPage >= displayedData.length;
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
    updateStateCounts(values); // Initial counts based on values

    if (selectedButton === 'open') {
      setDisplayedData(values?.filter(item => item.state === 'OPEN')); // Initial data based on values
    } else if (selectedButton === 'closed') {
      setDisplayedData(values?.filter(item => item.state === 'CLOSED')); // Initial data based on values
    } else if (selectedButton === 'merged') {
      setDisplayedData(values?.filter(item => item.state === 'MERGED')); // Initial data based on values
    } else {
      setDisplayedData(values); // Initial data for all PRs
    }
  }, [values, selectedButton]);

  useEffect(() => {
    updateStateCounts(values);
    updateDisplayedData();
  }, [searchText, activeButton, selectedButton, currentPage, previousPage]);

  const getButtonStyles = (buttonState, activeButton) => ({
    backgroundColor: activeButton === buttonState ? '#2e308e' : 'transparent',
    color: activeButton === buttonState ? 'white' : '#2e308e',
    border: `1px solid #000048`,
  });


  function getBackgroundColorForStatus(status) {
    if(status  === 'OPEN') {
      return '#fb6868';
    } else if(status === 'CLOSED') {
      return '#afafaf';
    } else if(status === 'MERGED') {
      return '#11bf6a';
    } else {
      return '';
    }
  };

  function setToolTipDraftTitle(isDraft) {
    if(isDraft) {
      return 'Draft';
    } else {
      return 'Ready for Review';
    }
  };
  
  function setToolTipDraftImg(isDraft) {
    if(isDraft) {
      return draftIcon;
    } else {
      return readyIcon;
    }
  };

  function setToolTipDraftAlt(isDraft) {
    if(isDraft) {
      return 'Draft Icon';
    } else {
      return 'Ready Icon';
    }
  };


  function setReviewDesicionTitle(reviewDecision) {
    if(reviewDecision === 'REVIEW_REQUIRED') {
      return 'Review Decision: Review Required';
    } else if(reviewDecision === 'CHANGES_REQUESTED') {
      return 'Review Decision: Request Changes';
    } else if(reviewDecision === 'APPROVED') {
      return 'Review Decision: Approved';
    } else {
      return '';
    }
  };

  function setReviewDesicionImg(reviewDecision) {
    if(reviewDecision === 'REVIEW_REQUIRED') {
      return reviewRequiredIcon;
    } else if(reviewDecision === 'CHANGES_REQUESTED') {
      return requestChangeIcon;
    } else if(reviewDecision === 'APPROVED') {
      return approvedIcon;
    } else {
      return '';
    }
  };

  function setReviewDesicionAlt(reviewDecision) {
    if(reviewDecision === 'REVIEW_REQUIRED') {
      return 'Review Required Icon';
    } else if(reviewDecision === 'CHANGES_REQUESTED') {
      return 'Request Change Icon';
    } else if(reviewDecision === 'APPROVED') {
      return 'Approved Icon';
    } else {
      return '';
    }
  };

  // Extracted ternary operation into an independent statement
  function renderTableContent() {

    if ((selectedButton === 'closed' && isLoadingAll) || (selectedButton === 'all' && isLoadingAll) ||
      (selectedButton === 'open' && isLoadingAll) || (selectedButton === 'merged' && isLoadingAll)) 
    {
      return (
        <tr>
          <td colSpan="7" className={`${classes.displayMsg}`}>
            Loading...
          </td>
        </tr>
      );
    } else if (paginationData.length === 0) {
      return (
        <tr>
          <td colSpan="7" className={`${classes.displayMsg}`}>
            No data found.
          </td>
        </tr>
      );
    } 
    else {
      return paginationData.map(
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
              <td>{row.creator}</td>
              <td>{row.createdAt}</td>
              <td>
                <span
                  style={{
                    color: 'white',
                    backgroundColor: getBackgroundColorForStatus(row.state),
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
                  width: '150px',
                }}>
                  <div style={{ width: '50px', textAlign: 'center' }}>
                    <Tooltip title="Comments:Open / Total">
                      <span
                        style={{
                          backgroundColor: '#b3b3b3',
                          color: "white",
                          padding: '1px 5px',
                          borderRadius: '10px',
                        }}

                      >{row.unresolvedReviewThreadsCount}/{row.totalCommentsCount}</span>
                    </Tooltip>
                  </div>
                  <div style={{ width: '50px', textAlign: 'center' }}>
                    <Tooltip
                      title={
                        setToolTipDraftTitle(row.isDraft)
                      }
                    >
                      <img style={{ paddingRight: '5px', paddingLeft: '5px' }}
                        src={setToolTipDraftImg(row.isDraft)}
                        alt={setToolTipDraftAlt(row.isdraft)}
                      />
                    </Tooltip>
                  </div>
                  <div style={{ width: '50px', textAlign: 'center' }}>
                    <Tooltip
                      title={setReviewDesicionTitle(row.reviewDecision)}
                    >
                      <img
                        src={setReviewDesicionImg(row.reviewDecision)}
                        alt={setReviewDesicionAlt(row.reviewDecision)}
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
          ),
      )
    }
  };

  return (
    <>
      <Dialog open={openDialog.open} onClose={handleClose}>
        <DialogTitle style={{ color: '#2e308e' }}>Additional Details
          <CloseIcon onClick={handleClose} style={{ float: 'right', cursor: 'pointer', color: '#2e308e' }} />
        </DialogTitle>
        <DialogContent className={classes.ContentBox}>
          <Table style={{ border: '1px solid grey' }}>
            <TableBody>
              <TableRow style={{}}>
                <TableCell style={{ backgroundColor: '#2e308e', color: 'white', width: '30%', borderBlockColor: 'rgb(122 124 226)' }}>Last Updated</TableCell>
                <TableCell style={{ width: '70%' }}>
                  {paginationData.find(
                    row => row.number === openDialog.rowNumber,
                  )?.updatedAt ? (() => { const date = new Date(paginationData.find(
                          row => row.number === openDialog.rowNumber,
                        ).updatedAtDate,
                      );
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
                  {paginationData.find(row => row.number === openDialog.rowNumber)?.assignees || ''}
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell style={{ backgroundColor: '#2e308e', color: 'white', width: '30%', borderBlockColor: 'rgb(122 124 226)' }}>Review Requested</TableCell>
                <TableCell style={{ width: '70%' }}>
                  {(() => {
                    const row = paginationData.find(row => row.number === openDialog.rowNumber);
                    if (row) {
                      return row.reviewRequests?.join(', ') || '';
                    }
                    return '';
                  })()}
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell style={{ backgroundColor: '#2e308e', color: 'white' }}>Reviewers</TableCell>
                <TableCell>
                  {paginationData.find(row => row.number === openDialog.rowNumber)?.reviews
                    ? getUniqueReviewers(paginationData.find(row => row.number === openDialog.rowNumber).reviews)
                    : ''}
                </TableCell>
              </TableRow>

              <TableRow>
                <TableCell style={{ backgroundColor: '#2e308e', color: 'white', width: '30%' }}>Labels</TableCell>
                <TableCell style={{ width: '70%' }}>
                  {paginationData.find(row => row.number === openDialog.rowNumber)?.labels?.map(label => (
                    <span
                      key={label}
                      style={{
                        backgroundColor: '#2F78C4',
                        color: 'white',
                        padding: '2px 5px',
                        borderRadius: '5px',
                        marginRight: '5px',
                      }}
                    >{label}</span>
                  )) || ''}

                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </DialogContent>
      </Dialog>
      <Container>
        <div className={`d-flex justify-content-end`}>
          <div className={`col-4 mb-3 m-0 p-0 d-flex justify-content-end`}>
            <div>
              <button
                className={`${classes.buttonStyle}`}

                style={getButtonStyles('open', activeButton)}

                onClick={() => handleButtonClick('open')}
              >
                OPEN
              </button>
              <button
                className={`${classes.buttonStyle}`}
                style={getButtonStyles('merged', activeButton)}

                onClick={() => handleButtonClick('merged')}
              >
                MERGED
              </button>
              <button
                className={`${classes.buttonStyle}`}
                style={getButtonStyles('closed', activeButton)}

                onClick={() => handleButtonClick('closed')}
              >
                CLOSED
              </button>
              <button
                className={`${classes.buttonStyle}`}
                style={getButtonStyles('all', activeButton)}

                onClick={() => handleButtonClick('all')}
              >
                ALL
              </button>
            </div>
          </div>
        </div>
        <Row className={`${classes.firstRow}`}>
          <Col className={`col-4.7 mt-3`}>
            <h2 style={{ margin: 0, color: '#000048', fontSize: '18px' }}>
              {repoOwner}/{repoName}
              {activeButton === 'open' && <span className={classes.darkBlueBox}>{stateCounts.open}</span>}
              {activeButton === 'closed' && <span className={classes.darkBlueBox}>{stateCounts.closed}</span>}
              {activeButton === 'all' && <span className={classes.darkBlueBox}>{stateCounts.all}</span>}
              {activeButton === 'merged' && <span className={classes.darkBlueBox}>{stateCounts.merged}</span>}
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
                    width: "500px"
                  }}
                >
                  TITLE
                </th>
                <th
                  style={{
                    color: 'white',
                    backgroundColor: '#2e308e',
                  }}
                >
                  CREATOR
                </th>
                <th
                  style={{
                    color: 'white',
                    backgroundColor: '#2e308e',
                  }}
                >
                  CREATED
                </th>
                <th
                  style={{
                    color: 'white',
                    backgroundColor: '#2e308e',
                  }}
                >
                  STATUS
                </th>
                <th
                  style={{
                    color: 'white',
                    backgroundColor: '#2e308e',
                    width: '150px'
                  }}> </th>
                <th
                  style={{
                    color: 'white',
                    backgroundColor: '#2e308e',
                    rightmargin:'30px'
                  }}>
                </th>
              </tr>
            </thead>
            <tbody>
              { renderTableContent() }
            </tbody>
          </Table>
          { !isLoadingAll && displayedData.length > 0 && (
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
                      {currentRange.start} - {currentRange.end} of {displayedData.length} requests
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
