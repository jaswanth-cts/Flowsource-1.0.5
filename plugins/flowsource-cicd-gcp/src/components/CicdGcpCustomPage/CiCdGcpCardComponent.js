import React, { useState, useEffect, useRef } from 'react';
import { Row, OverlayTrigger, Popover  } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import cssClasses from './CicdGcpCustomPageCss';

import ErrorIcon from '@mui/icons-material/Error';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import clock from '../icons/clock.png';
import { configApiRef, useApi, fetchApiRef } from '@backstage/core-plugin-api';
import { useEntity } from '@backstage/plugin-catalog-react';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';

import log from 'loglevel';

const CiCdCardComponent = ({ currentWorkFlowData }) => {
  const classes = cssClasses();
  const { fetch } = useApi(fetchApiRef);

  const [, setRunDetailsError] = useState(null);

  const tooltipRef = useRef(null);
  const textRef = useRef(null);

  const config = useApi(configApiRef);
  const backendBaseApiUrl =
    config.getString('backend.baseUrl') + '/api/flowsource-cicd-gcp/';
  const entity = useEntity();
  const gcpRegion = entity.entity.metadata.annotations['flowsource/gcp-region'];
  const durationDaysCatalog =
    entity.entity.metadata.annotations['flowsource/durationInDays'];
  const region = gcpRegion ? gcpRegion.toString() : '';

  const itemsPerPage = 6; // 2 rows * 3 cards per row

  const [cardLoading, setCardLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [pipelineData, setPipelineData] = useState([]);
  const [, setCount] = useState(1);

  const start = (currentPage - 1) * itemsPerPage;
  const end = Math.min(currentPage * itemsPerPage, pipelineData.length);
  const currentRange = { start: start + 1, end };
  const paginationData = pipelineData.slice(start, end);

  const isPreviousDisabled = currentPage === 1;
  const isNextDisabled = currentPage * itemsPerPage >= pipelineData.length;

  async function getWorkflowRunDetails(workflowId, pageNumber, itemsPerPage) {
    try {
      const workflowRunsRes = await fetch(
        `${backendBaseApiUrl}pipline-details?pipelineId=${currentWorkFlowData.id}&durationDaysCatalog=${durationDaysCatalog}&region=${region}`,
      );
      if (workflowRunsRes.ok) {
        const workflowRunDetails = await workflowRunsRes.json();
        setPipelineData(workflowRunDetails.latestBuild); // Ensure all builds are included
        setCount(workflowRunDetails.workflowRunCount);
      } else {
        setRunDetailsError(
          `Error fetching GCP workflow run details, with status code ${workflowRunsRes.status}`,
        );
      }
      setCardLoading(false);
    } catch (error) {
      log.error('Error:', error);
      setRunDetailsError(error.message);
      setCardLoading(false);
    }
  }

  const getStatusColor = state => {
    switch (state) {
      case 'Success':
        return '#44b98c'; // Green
      case 'In Progress':
        return '#F29F58'; // Orange
      case 'Cancelled':
      case 'Queued':
      case 'Awaiting Approval':
        return '#9e9e9e'; // Grey
      default:
        return '#e76c71'; // Red for state Failure, Timeout, Expired
    }
  };

  const handlePageChange = page => {
    setCurrentPage(page);
  };

  const truncateText = (text, maxLength) => {
    if (!text) {
      return '';
    }
    if (text.length > maxLength) {
      return text.slice(0, maxLength) + '...';
    }
    return text;
  };

  useEffect(() => {
    getWorkflowRunDetails(currentWorkFlowData.id, 1, itemsPerPage);
  }, []);

  if (cardLoading) {
    return (
      <div
        className="App p-3"
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'flex-start',
          height: '100vh',
          paddingTop: '30%',
        }}
      >
        Loading...
      </div>
    );
  }

  return (
    <div>
      <div className={`row ${classes.cardcontent}`}>
        {[...Array(Math.ceil(paginationData.length / 3))].map((_, rowIndex) => {
          const uniqueKey = paginationData
            .slice(rowIndex * 3, (rowIndex + 1) * 3)
            .map(item => item.id)
            .join('-');
          return (
            <div key={uniqueKey} className="row mt-2">
              {paginationData
                .slice(rowIndex * 3, (rowIndex + 1) * 3)
                .map((item, index) => (
                  <div key={item.id} className="col-md-4 mb-3">
                    <div
                      className={`card ${classes.card1}`}
                      style={{
                        backgroundColor: 'white',
                        borderColor: getStatusColor(item.conclusion),
                        borderWidth: 'thin',
                        borderStyle: 'solid',
                      }}
                    >
                      <div
                        className={`card-body ${classes.cardBody} d-flex flex-column pb-2`}
                        ref={tooltipRef}
                        data-bs-toggle="tooltip"
                        data-bs-placement="top"
                        title={item.name}
                      >
                        <div className="d-flex justify-content-between ">
                          <h6
                            ref={textRef}
                            className={`${classes.customText}`}
                            style={{ maxWidth: '70%', wordWrap: 'break-word' }}
                          >
                            <a href={item.url} target="_blank" rel="noopener noreferrer" className={`${classes.hoverUnderline}`}
                              style={{ color: getStatusColor(item.conclusion) }}>
                              {truncateText(item.name, 30)}
                            </a>
                          </h6>
                          <span
                            className={`position-absolute top-0 end-0 m-2 ${classes.statusCss}`}
                            style={{
                              color: getStatusColor(item.conclusion),
                              padding: '3px',
                            }}
                          >
                            {item.conclusion === 'Failure' &&
                              item.failureDetails && (
                                <OverlayTrigger
                                  trigger="click"
                                  placement="top"
                                  rootClose
                                  overlay={
                                    <Popover id={`popover-${item.id}`}>
                                      <Popover.Header as="h3">
                                        Failure Details
                                      </Popover.Header>
                                      <Popover.Body>
                                        <div>
                                          <b>Message: </b>
                                          {item.failureDetails.failureMessage ||
                                            'No details available'}
                                        </div>
                                        <div>
                                          <b>Step id/name: </b>
                                          {item.failureDetails.stageName ||
                                            'null'}
                                        </div>
                                        <div>
                                          <b>Build URL: </b>
                                          <a
                                            href={item.failureDetails.buildUrl}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            style={{ color: '#3f51b5' }}
                                          >
                                            Link{' '}
                                            <OpenInNewIcon fontSize="small" />
                                          </a>
                                        </div>
                                      </Popover.Body>
                                    </Popover>
                                  }
                                >
                                  <span
                                    className={`${classes.idCss}`}
                                    style={{
                                      cursor: 'pointer',
                                      marginLeft: '10px',
                                    }}
                                  >
                                    <ErrorIcon style={{ fontSize: '1rem', marginTop: '-.3rem' }} />
                                  </span>
                                </OverlayTrigger>
                              )}
                            {item.conclusion}
                          </span>
                        </div>
                        <div className='d-flex justify-content-start mt-auto'>
                          <span style={{ fontSize: '11px', margin: '0.5rem' }}>ID: {item.id}</span>
                        </div>
                      </div>
                      <div
                        className="shadow p-2 mb-0 text-white"
                        style={{
                          backgroundColor: getStatusColor(item.conclusion),
                        }}
                      >
                        <CalendarMonthIcon style={{ fontSize: '1.1rem', marginRight: '2px' }} />
                        <span style={{ fontSize: '0.8rem', marginRight: '90px' }}>
                          {new Date(item.startTime).toLocaleString(undefined, { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit', hourCycle: 'h23' })}
                        </span>
                        <img
                          src={clock}
                          alt="Clock Icon"
                          style={{ fontSize: '1rem' }}
                        />
                        <span style={{ fontSize: '0.7rem', marginLeft: '3px' }}>
                          {item.duration}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          );
        })}
      </div>
      {paginationData.length > 0 && (
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
                      color: 'black',
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
                  {pipelineData.length}
                </li>
              </ul>
            </nav>
          </div>
        </Row>
      )}
    </div>
  );
};

export default CiCdCardComponent;
