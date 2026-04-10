import React, { useState, useEffect, useRef } from 'react';

import 'bootstrap/dist/css/bootstrap.min.css';
import {
  fetchApiRef,
  useApi,
  configApiRef,
} from '@backstage/core-plugin-api';

import cssClasses from './MaintenanceReportCss.js';

import log from 'loglevel';



import { useEntity } from '@backstage/plugin-catalog-react';
import arrow from '../../Icons/arrow.png';
import { Alert } from '@mui/material';
import { BsSearch, BsX } from 'react-icons/bs';
import { FormControl, InputGroup } from 'react-bootstrap';


const MaintenanceReport = props => {
  const classes = cssClasses();
  const [tableData, setTableData] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setLoading] = useState(true);
  const [summaryData, setSummaryData] = useState({});
  const [isError, setIsError] = useState(false);
  const [errorDetail, setErrorDetail] = useState('');
  const [searchText, setSearchText] = useState('');
  const [filteredTableData, setFilteredTableData] = useState([]);
  const previousPageRef = useRef(1); // Use useRef to store the previous page

  const ITEMS_PER_PAGE = 5;
  const handlePageChange = pageNumber => {
    setCurrentPage(pageNumber);
  };
  const { fetch } = useApi(fetchApiRef);
  const config = useApi(configApiRef);
  const { entity } = useEntity();
  const projectName =
    entity.metadata.annotations['flowsource/CCTP-project-name'];
  const backendBaseApiUrl =
    config.getString('backend.baseUrl') + '/api/flowsource-cctp/';

  const handleTabChange = (maintenanceReportName) => {
    props.setActiveTab('maintenancestatus');
    props.setHistoryMaintenanceReport(2);
    const tabJsonTestCase = {
      tab1: props.tabDetails.tab1,
      tab2: maintenanceReportName,
    };
    props.setTabDetails(tabJsonTestCase);
  };

  async function getMaintenanceReport() {
    try {
      const response = await fetch(
        `${backendBaseApiUrl}cctp-proxy/flowsource/maintenanceReport?projectName=${projectName}`,
      );

      if (response.ok) {
        const data = await response.json();

        let metrics;
        if (
          data !== null &&
          data !== undefined &&
          data.summaryLevelInfo !== null &&
          data.summaryLevelInfo !== undefined
        ) {
          const summaryLevelInfo = data.summaryLevelInfo;
          //load metrics
          metrics = {
            TotalLocatorsImpacted: summaryLevelInfo.totalLocatorsImpacted ? summaryLevelInfo.totalLocatorsImpacted : null,
            TotalHealed: summaryLevelInfo.totalHealed,
            TotalUnhealed: summaryLevelInfo.totalUnhealed,
            HealedPercentage: summaryLevelInfo.healedPercentage,
          };
        }
        setSummaryData(metrics);

        //Load MaintenanceReport table data
        let maintenanceReportArray = new Array();
        if (
          data !== null &&
          data !== undefined &&
          data.detailSection !== null &&
          data.detailSection !== undefined
        ) {
          const detailSection = data.detailSection;
          detailSection.forEach(function (item, index) {
            const entry = {
              UId: item.uid,
              Name: item.name,
              Time: formatDate(item.time),
              FailedLocatorsCount: item.failedLocatorsCount,
              HealedLocatorsCount: item.healedLocatorsCount,
              UnhealedLocatorsCount: item.unhealedLocatorsCount,
            };
            maintenanceReportArray.push(entry);
          });
        }

        //Set the table data
        setTableData(maintenanceReportArray);
      }
      else if (response.status === 503) {
        setIsError(true);
        setErrorDetail(`This plugin has not been configured with the required credentials. Please ask your administrator to configure it.`);
      }
      else {
        setIsError(true);

        const errorText = await response.text();
        const formattedError = `HTTP error! status: ${response.status}, message: ${errorText}`;
        setErrorDetail(formattedError);
      }
      setLoading(false);
    } catch (error) {
      // Log the error to the log level
      log.error('Error fetching data from backend:', error);
      // Set a generic error message if the error is not an HTTP error
      if (!error.message.includes('HTTP error!')) {
        log.error(`Error fetching data: ${error.message}`);
      }
    } finally {
      // Set loading to false after the fetch operation is complete
      setLoading(false);
    }
  }

  //Format date
  function formatDate(dateValue) {
    // Convert LastExecutedDate to a Date object
    const date = new Date(dateValue);
    // Format the date part
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are zero-based
    const year = date.getFullYear();
    const datePart = `${day}/${month}/${year}`;
    // Format the time part
    const timePart = date.toUTCString().split(' ')[4]; // Extracts the time part
    // Combine date and time with GMT
    const gmtDateTime = `${datePart} ${timePart}`;
    return gmtDateTime;
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
  useEffect(async () => {
    getMaintenanceReport();
  }, []);
  useEffect(() => {
    const filteredData = tableData.filter(report => {
      const searchTextLower = searchText.toLowerCase();
      return (
        report.Name.toLowerCase().includes(searchTextLower)
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
  }, [searchText, tableData]);
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
      <div className={`App p-3 ${classes.loading1}`} >
        Loading...
      </div>
    );
  }

  if (isError) {
    let displayError = errorDetail;
    try {
      if (errorDetail.includes('HTTP error!')) {
        const errorObj = JSON.parse(errorDetail.split('message: ')[1]);
        const statusCode = errorObj.response.statusCode;
        displayError = 'HTTP Error: Status Code: ' + statusCode + ', message: Application error occured.';
      }
    } catch (e) {
      log.error('Error parsing error message:', e);
    }

    return (
      <div>
        <div className="card ms-2 me-2 mb-2 mt-3">
          <div className="card-header">
            <h6>Error</h6>
          </div>
          <div className="card-body">
            <Alert severity="error">
              {displayError}
            </Alert>
          </div>
        </div>
        <div className="mb-4" />
      </div>
    );
  }
  return (
    <div>
      <div className="container mt-4">
        {/* Row for the cards */}
        <div className={`row ${classes.mrRow}`}>
          {/* Empty Space Before First Card */}
          <div className="col-1"></div>

          {/* Card 1 */}
          <div className={`col-3 ${classes.mrCol}`}>
            <div className={`card text-center ${classes.card1}`}>
              <div
                className={`card-body d-flex flex-column align-items-center justify-content-center ${classes.cardBody1}`}
              >
                <h5 className={`card-title mb-0 ${classes.cardTitle1}`}>
                  Total Locators Impacted
                </h5>
                <p className={`card-text ${classes.cardP1}`}>
                  {summaryData ? summaryData.TotalLocatorsImpacted : 0}
                </p>
              </div>
            </div>
          </div>

          {/* Card 2 */}
          <div className={`col-3 ${classes.mrCol}`}>
            <div className={`card text-center ${classes.card2}`}>
              <div className={`${classes.card2Div}`}>
                <div className="d-flex justify-content-between">
                  <h5
                    className={`card-title text-center mb-0 ${classes.cardTitle2}`}
                  >
                    Total Healed
                  </h5>
                  <h5 className={`text-center mb-0 ${classes.cardTitleSecond}`}>
                    Total Unhealed
                  </h5>
                </div>

                <div className={`d-flex justify-content-between`}>
                  <div className={`${classes.card2PDiv}`}>
                    <p className={`mb-0 ${classes.card2P}`}>
                      {summaryData ? summaryData.TotalHealed : 0}
                    </p>
                  </div>
                  <div className={`${classes.card2PDiv}`}>
                    <p className={`mb-0 ${classes.card2P}`}>
                      {summaryData ? summaryData.TotalUnhealed : 0}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Card 3 */}
          <div className={`col-3 ${classes.mrCol}`}>
            <div className={`card text-center ${classes.card3}`}>
              <div
                className={`card-body d-flex flex-column align-items-center justify-content-center ${classes.card3Div}`}
              >
                <p className={`${classes.card3P1}`}>Healed</p>
                <p className={`${classes.card3P2}`}>
                  {summaryData ? summaryData.HealedPercentage : 0}%
                </p>
              </div>
            </div>
          </div>

          {/* Empty Space After Last Card */}
          <div className="col-1"></div>
        </div>
      </div>
      <div
        className={`${classes.buttonOptionsSection}`}
        style={{
          display: 'flex',
          justifyContent: 'end',
          alignItems: 'center',
          marginTop: '1.5rem',
          marginBottom: '-0.5rem',

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
      </div>

      <div className={`mt-3 ${classes.tableDiv1}`}>
        <div className={`row justify-content-start pb-2`}>
          <div>
            <div className="table-responsive">
              <table className={`table ${classes.tableBorders}`}>
                <thead>
                  <tr className={`${classes.tableHead}`}>
                    <th scope="col">NAME</th>
                    <th scope="col">TIME</th>
                    <th scope="col">FAILED LOCATORS</th>
                    <th scope="col">HEALED LOCATORS</th>
                    <th scope="col">UNHEALED LOCATORS</th>
                    <th scope="col"></th>
                  </tr>
                </thead>
                <tbody className={`${classes.mrTBody}`}>
                  {currentTableData.length !== 0 ?
                    (currentTableData.map((row, index) => (
                      <tr key={row.id} className={`${classes.mrTableRow}`}>
                        <td className={`${classes.mrColStyle1}`}>{row.Name}</td>
                        <td className={`${classes.mrColStyle1}`}>{row.Time}</td>
                        <td className={`${classes.mrColStyle1}`}>
                          {row.FailedLocatorsCount}
                        </td>
                        <td className={`${classes.mrColStyle1}`}>
                          {row.HealedLocatorsCount}
                        </td>
                        <td className={`${classes.mrColStyle1}`}>
                          {row.UnhealedLocatorsCount}
                        </td>
                        <td>
                          <a href="#">
                            <img
                              src={arrow}
                              alt="Arrow Icon"
                              className="float-end"
                              onClick={() => handleTabChange(row.Name)}
                            />
                          </a>
                        </td>
                      </tr>
                    ))) :
                    (
                      <tr style={{ height: 'auto' }}>
                        <td colSpan="8" className="text-center" style={{ padding: '0', border: 'none', paddingTop: '0.8rem' }}>
                          No Data Found
                        </td>
                      </tr>
                    )
                  }
                </tbody>
              </table>
              {currentTableData.length !== 0 &&
                <nav aria-label="Page navigation example">
                  <ul
                    className={`pagination justify-content-end ${classes.ulCss} ${classes.customPagination}`}
                  >
                    <li
                      className={`page-item ${isPreviousDisabled ? 'disabled' : ''
                        }`}
                    >
                      <a
                        aria-label="Previous"
                        className="page-link"
                        href="#"
                        tabIndex="-1"
                        onClick={() => handlePageChange(currentPage - 1)}
                      >
                        <span aria-hidden="true">«</span>
                      </a>
                    </li>
                    {startPage > 1 && (
                      <li className="page-item disabled">
                        <span className="page-link">...</span>
                      </li>
                    )}
                    {pagesArray.slice(startPage - 1, endPage).map(index => (
                      <li
                        key={index}
                        className={`page-item ${classes.numCss}`}
                      >
                        <a
                          className={`page-link ${index + 1 === currentPage ? 'Mui-selected' : ''
                            }`}
                          href="#"
                          onClick={() => handlePageChange(index + 1)}
                        >
                          {index + 1}
                        </a>
                      </li>
                    ))}
                    {endPage < totalPages && (
                      <li className="page-item disabled">
                        <span className="page-link">...</span>
                      </li>
                    )}
                    <li
                      className={`page-item ${isNextDisabled ? 'disabled' : ''
                        }`}
                    >
                      <a
                        href="#"
                        className="page-link"
                        onClick={() => handlePageChange(currentPage + 1)}
                        aria-label="Next"
                      >
                        <span aria-hidden="true">»</span>
                      </a>
                    </li>
                  </ul>
                </nav>
              }
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MaintenanceReport;
