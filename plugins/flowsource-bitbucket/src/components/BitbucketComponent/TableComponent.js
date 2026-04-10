import React, { useState, useEffect } from 'react';
import { Table, Container, Row, FormControl, Col, InputGroup } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import { BsSearch, BsX } from 'react-icons/bs';
import cssClasses from './css/BitbucketRepoMainCss';
import { useEntity } from '@backstage/plugin-catalog-react';
import {  Dialog, DialogTitle, DialogContent, TableCell, TableBody, TableRow } from '@material-ui/core';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import CloseIcon from '@mui/icons-material/Close';


const TableComponent = ({ values, fetchAllData, isLoadingData, additionalData, fetchDataOnClick, additionalDataLoading }) => {

  // Filter the data based on the selected filter
  const classes = cssClasses();
  const [searchText, setSearchText] = useState('');
  const [selectedButton, setSelectedButton] = useState('open');
  const [activeButton, setActiveButton] = useState('open');
  const [stateCounts, setStateCounts] = useState({ open: 0, merged: 0, declined:0,  all: 0 });
  const [displayedData, setDisplayedData] = useState([]);
  const entity = useEntity();
  const repoOwner =entity.entity.metadata.annotations['flowsource/bitbucket-repo-owner'];
  const repoName =entity.entity.metadata.annotations['flowsource/bitbucket-repo-name'];

  const [currentPage, setCurrentPage] = useState(1);
  const [previousPage, setPreviousPage] = useState(1);
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
      open: data ? data.filter(item => item.state === 'OPEN').length : 0,
      merged: data ? data.filter(item => item.state === 'MERGED').length : 0,
      declined: data ? data.filter(item => item.state === 'DECLINED').length : 0,
      all: data ? data.length : 0,
    };
    setStateCounts(counts);
  };

  const updateDisplayedData = () => {
    let filteredData = values || [];
  
    if (searchText.trim() !== '') {
      const searchTextLower = searchText.toLowerCase();
      filteredData = filteredData.filter(
        item =>
          item.number.toString().includes(searchText) ||
          item.title.toLowerCase().includes(searchTextLower) ||
          item.creator.toLowerCase().includes(searchTextLower) ||
          item.createdAt.toLowerCase().includes(searchTextLower) ||
          item.state.toLowerCase().includes(searchTextLower)
      );
      setCurrentPage(1)
    }

    switch (selectedButton) {
      case 'open':
        filteredData = filteredData.filter(item => item.state === 'OPEN');
        break;
      case 'merged':
        filteredData = filteredData.filter(item => item.state === 'MERGED');
        break;
      case 'declined':
        filteredData = filteredData.filter(item => item.state === 'DECLINED');
        break;
      case 'all':
        break;
      default:
        break;
    }
    filteredData.sort((a, b) => {
      return new Date(b.createdAtDate) - new Date(a.createdAtDate);
    });
    setDisplayedData(filteredData);
  };

  const handleButtonClick = (state) => {
      setSelectedButton(state);
      setActiveButton(state);
      setCurrentPage(1);
      setSearchText('');
      fetchAllData(state);
    };

  const start = (currentPage - 1) * itemsPerPage + 1;
  const end = Math.min(currentPage * itemsPerPage, displayedData.length);
  const currentRange = { start, end };

  const formatState = (state) => {
    if (!state) {
      return '';
    } else {
      return state.charAt(0).toUpperCase() + state.slice(1).toLowerCase();
    }    
  };
  
    const paginationData = displayedData.slice(currentRange.start - 1, currentRange.end);
    const isPreviousDisabled = currentPage === 1;
    const isNextDisabled = currentPage * itemsPerPage >= displayedData.length;
  
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
    updateDisplayedData();
  }, [values, selectedButton]);

  useEffect(() => {
    updateStateCounts(values); 
    updateDisplayedData();   
  }, [searchText, activeButton, selectedButton, currentPage, previousPage]);

  function setBackgroundColor(state) {
    if(state === 'OPEN') {
      return '#fb6868';
    } else if(state === 'DECLINED') {
      return '#afafaf';
    } else if(state === 'MERGED') {
      return '#11bf6a';
    } else {
      return '';
    }
  }

  function renderTableData() {
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
        <DialogTitle style={{ color: '#2e308e' }}>
          Additional Details
          <CloseIcon
            onClick={handleClose}
            style={{ float: 'right', cursor: 'pointer', color: '#2e308e' }}
          />
        </DialogTitle>
        <DialogContent className={classes.ContentBox}>
          <Table style={{ border: '1px solid grey', minWidth: "400px", minHeight: "100px" }}>
            {additionalDataLoading ? (
              <tr>
                <td className={`${classes.displayMsg}`}>Loading...</td>
              </tr>
            ) : (
              <TableBody>
                <TableRow>
                  <TableCell
                    style={{
                      backgroundColor: '#2e308e',
                      color: 'white',
                      width: '30%',
                      borderBlockColor: 'rgb(122 124 226)',
                    }}
                  >
                    Last Updated
                  </TableCell>
                  <TableCell style={{ width: '70%' }}>
                    {additionalData.updatedAtDate
                      ? (() => {
                          const date = new Date(additionalData.updatedAtDate);
                          const formattedDate = date.toLocaleDateString(
                            'en-GB',
                            { dateStyle: 'short', timeZone: 'UTC' },
                          );
                          const formattedTime = date.toLocaleTimeString(
                            'en-GB',
                            { timeStyle: 'short', timeZone: 'UTC' },
                          );
                          return `${formattedDate} at ${formattedTime}`;
                        })()
                      : ''}
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell
                    style={{
                      backgroundColor: '#2e308e',
                      color: 'white',
                      width: '30%',
                      borderBlockColor: 'rgb(122 124 226)',
                    }}
                  >
                    Assignee
                  </TableCell>
                  <TableCell
                    style={{
                      width: '70%',
                      wordWrap: 'break-word',
                      whiteSpace: 'pre-wrap',
                    }}
                  >
                    {paginationData.find(
                      row => row.number === openDialog.rowNumber,
                    )?.creator || ''}
                  </TableCell>
                </TableRow>

                <TableRow>
                  <TableCell
                    style={{
                      backgroundColor: '#2e308e',
                      color: 'white',
                      width: '30%',
                      borderBlockColor: 'rgb(122 124 226)',
                    }}
                  >
                    Reviewers
                  </TableCell>
                  <TableCell
                    style={{
                      width: '70%',
                      wordWrap: 'break-word',
                      whiteSpace: 'pre-wrap',
                    }}
                  >
                    {additionalData.reviewers}
                  </TableCell>
                </TableRow>

                <TableRow>
                  <TableCell
                    style={{
                      backgroundColor: '#2e308e',
                      color: 'white',
                      width: '30%',
                    }}
                  >
                    Review Decision
                  </TableCell>
                  <TableCell style={{ width: '70%' }}>
                    {additionalData.reviewDecision ? additionalData.reviewDecision.replace(/_/g, ' ') : ''}
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell
                    style={{
                      backgroundColor: '#2e308e',
                      color: 'white',
                      width: '30%',
                      borderBlockColor: 'rgb(122 124 226)',
                    }}
                  >
                    Comments
                  </TableCell>
                  <TableCell
                    style={{
                      width: '70%',
                      wordWrap: 'break-word',
                      whiteSpace: 'pre-wrap',
                    }}
                  >
                    {additionalData.openCommentCount}/{additionalData.totalComment}
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
                style={getButtonStyles('declined', activeButton)}
                onClick={() => handleButtonClick('declined')}
              >
                DECLINED
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
              {activeButton === 'open' && (
                <span className={classes.darkBlueBox}>{stateCounts.open}</span>
              )}
              {activeButton === 'merged' && (
                <span className={classes.darkBlueBox}>
                  {stateCounts.merged}
                </span>
              )}
              {activeButton === 'declined' && (
                <span className={classes.darkBlueBox}>
                  {stateCounts.declined}
                </span>
              )}
              {activeButton === 'all' && (
                <span className={classes.darkBlueBox}>{stateCounts.all}</span>
              )}
            </h2>
          </Col>
          <Col
            className={`col-4.3 ${classes.checkboxs} d-flex justify-content-end align-items-center`}
          >
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
                    width: '35px',
                  }}
                >
                  ID
                </th>
                <th
                  style={{
                    color: 'white',
                    backgroundColor: '#2e308e'
                  }}
                >
                  TITLE
                </th>
                <th
                  style={{
                    color: 'white',
                    backgroundColor: '#2e308e',
                    width: '200px',
                  }}
                >
                  CREATOR
                </th>
                <th
                  style={{
                    color: 'white',
                    backgroundColor: '#2e308e',
                    width: '150px',
                  }}
                >
                  CREATED
                </th>
                <th
                  style={{
                    color: 'white',
                    backgroundColor: '#2e308e',
                    width: '100px',
                  }}
                >
                  STATUS
                </th>
                <th
                  style={{
                    color: 'white',
                    backgroundColor: '#2e308e',
                    width: '25px',
                  }}
                >
                  {' '}
                </th>
              </tr>
            </thead>
            <tbody>{renderTableData()}</tbody>
          </Table>
          {!isLoadingData && displayedData.length > 0 && (
            <Row className={`${classes.lastRow}`}>
              <div className={`${classes.paginations}`}>
                <nav aria-label="Page navigation example">
                  <ul
                    className={`pagination justify-content-end ${classes.ulCss} ${classes.customPagination}`}
                  >
                    <li
                      className={`${isPreviousDisabled ? 'disabled' : ''} ${
                        classes.liCss
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
                          color: 'black',
                        }}
                      >
                        {currentPage}
                      </span>
                    </li>
                    <li
                      className={`${isNextDisabled ? 'disabled' : ''} ${
                        classes.liCss
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
                            border: 'none',
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
                        color: 'black',
                      }}
                    >
                      {currentRange.start} - {currentRange.end} of{' '}
                      {displayedData.length} requests
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
