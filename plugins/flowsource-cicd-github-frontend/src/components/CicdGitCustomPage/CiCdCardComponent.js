import React, { useState, useEffect, useRef } from 'react';
import { OverlayTrigger, Popover  } from 'react-bootstrap';

import 'bootstrap/dist/css/bootstrap.min.css';
import cssClasses from './CicdGitCustomPageCss';

import clock from '../icons/clock.png';
import ErrorIcon from '@mui/icons-material/Error';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import Tooltip from '@mui/material/Tooltip';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';

import { configApiRef, useApi, fetchApiRef } from '@backstage/core-plugin-api';
import { useEntity } from '@backstage/plugin-catalog-react';

import log from 'loglevel';

const CiCdCardComponent = ({ currentWorkFlowData }) => {
  const classes = cssClasses();
  const { fetch } = useApi(fetchApiRef);
  const [, setRunDetailsError] = useState(null);
  const [failureDetails, setFailureDetails] = useState({});
  const [failureDetailsLoading, setFailureDetailsLoading] = useState(false);

  const tooltipRef = useRef(null);
  const textRef = useRef(null);

  const config = useApi(configApiRef);
  const backendBaseApiUrl =
    config.getString('backend.baseUrl') + '/api/flowsource-cicd/';
  const entity = useEntity();
  const gitOwner =
    entity.entity.metadata.annotations['flowsource/github-repo-owner'];
  const gitRepo =
    entity.entity.metadata.annotations['flowsource/github-repo-name'];
  const durationDaysCatalog =
    entity.entity.metadata.annotations['flowsource/durationInDays'];

  const itemsPerPage = 8; // 3 rows * 4 cards per row

  const [cardLoading, setCardLoading] = useState(true);

  const [currentPage, setCurrentPage] = useState(1);
  const [paginationData, setpaginationData] = useState([]);

  const totalPages = Math.ceil(
    currentWorkFlowData.workflowRunCount / itemsPerPage,
  );

  const isPreviousDisabled = currentPage === 1;
  const isNextDisabled = currentPage === totalPages;

  async function getWorkflowRunDetails(workflowId, pageNumber, itemsPerPage) {
    try {
      // Fetch workflow run details
      const workflowRunsRes = await fetch(
        backendBaseApiUrl +
          'workflow-runs?gitOwner=' +
          gitOwner +
          '&gitRepo=' +
          gitRepo +
          '&workflowId=' +
          workflowId +
          '&durationDaysCatalog=' +
          durationDaysCatalog +
          '&pageNumber=' +
          pageNumber +
          '&pageSize=' +
          itemsPerPage,
      );

      if (workflowRunsRes.ok) {
        const workflowRunDetails = await workflowRunsRes.json();
        setpaginationData(workflowRunDetails);
      } else {
        setRunDetailsError(
          `Error fetching github workflow run details, with status code ${workflowRunsRes.status} `,
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
      case 'success':
        return '#44b98c';
      case 'in_progress':
        return '#F29F58';
      case 'queued':
        return '#9e9e9e';
      case 'completed':
        return '#44b98c';
      case 'failure':
        return '#e76c71';
      case 'cancelled':
        return '#9e9e9e';
      case 'timed_out':
        return '#e76c71';
      case 'action_required':
        return '#9e9e9e';
      default:
        return '#e76c71';
    }
  };

  const handlePageChange = page => {
    setCurrentPage(page);
    getWorkflowRunDetails(currentWorkFlowData.id, page, itemsPerPage);
  };
  const fetchFailureDetails = async runId => {
    setFailureDetailsLoading(true);
    try {
      const response = await fetch(
        `${backendBaseApiUrl}failure-details?gitOwner=${gitOwner}&gitRepo=${gitRepo}&runId=${runId}`,
      );
      if (response.ok) {
        const failureDetails = await response.json();
        setFailureDetails(failureDetails);
      } else {
        log.error(
          `Error fetching failure details for runId ${runId}, status code: ${response.status}`,
        );
      }
    } catch (error) {
      log.error('Error:', error);
    }
    setFailureDetailsLoading(false);
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
        {[...Array(Math.ceil(paginationData.length / 4))].map((_, rowIndex) => {
          const uniqueKey = paginationData
            .slice(rowIndex * 4, (rowIndex + 1) * 4)
            .map(item => item.id)
            .join('-');
          return (
            <div key={uniqueKey} className="row mt-">
              {paginationData
                .slice(rowIndex * 4, (rowIndex + 1) * 4)
                .map((item, index) => (
                  <div key={item.id} className="col-md-3 mb-3">
                    <div
                      className={`card ${classes.card1}`}
                      style={{
                        backgroundColor: 'white',
                        borderColor: getStatusColor(item.conclusion),
                        borderWidth: 'thin',
                        borderStyle: 'solid',
                      }}
                    >
                      <h5
                        ref={textRef}
                        className={`card-title me-2 ${classes.cardTitle} ${classes.customText}`}
                        style={{ maxWidth: '75%', wordWrap: 'break-word' }}
                      >
                        <a
                          href={item.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={`${classes.hoverUnderline} ${classes.truncateText}`}
                          style={{
                            color: getStatusColor(item.conclusion),
                            fontSize: '1rem',
                          }}
                          title={item.name}
                        >
                          {item.name}
                        </a>
                      </h5>
                      <span className={`mt-1 ${classes.pipeIdCss}`}>
                        ID: {String(item.id)}
                      </span>

                      <span
                        className={`position-absolute top-0 end-0 m-2 ${classes.statusCss}`}
                        style={{
                          width: '30%',
                          textAlign: 'right',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'flex-end',
                        }}
                      >
                        {item.conclusion === 'failure' && (
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
                                  {failureDetailsLoading ? (
                                    <div>Loading...</div>
                                  ) : (
                                    <div>
                                      <div>
                                        <b>Failure Message: </b>
                                        {failureDetails?.failureDetails?.[0]
                                          ?.errorMessage ||
                                          'no error message found'}
                                      </div>
                                      <div>
                                        <b>Step Name: </b>
                                        {failureDetails?.failureDetails?.[0]
                                          ?.stepName || 'no step name found'}
                                      </div>
                                      <div>
                                        <b>Build URL: </b>
                                        <a
                                          href={item.url}
                                          target="_blank"
                                          rel="noopener noreferrer"
                                          style={{ color: '#3f51b5' }}
                                        >
                                          Link{' '}
                                          <OpenInNewIcon fontSize="small" />
                                        </a>
                                      </div>
                                    </div>
                                  )}
                                </Popover.Body>
                              </Popover>
                            }
                          >
                            <span
                              className={`${classes.idCss}`}
                              style={{
                                cursor: 'pointer',
                              }}
                              onClick={() => fetchFailureDetails(item.id)}
                              title="" // Explicitly remove tooltip
                            >
                              <ErrorIcon
                                fontSize="1rem"
                                style={{
                                  color: getStatusColor(item.conclusion),
                                  transform: 'translate(5px, -2px)',
                                }}
                                title="" // Explicitly remove tooltip
                              />
                            </span>
                          </OverlayTrigger>
                        )}
                        <span
                          style={{
                            marginLeft: '10px',
                            fontSize: '0.8rem',
                            color: getStatusColor(item.conclusion),
                          }}
                          title="" // Explicitly remove tooltip
                        >
                          {item.conclusion}
                        </span>
                      </span>
                      <div
                        className={`card-body mt-2 ms-2 me-2 text-white ${classes.cardBody}`}
                        ref={tooltipRef}
                        data-bs-toggle="tooltip"
                        data-bs-placement="top"
                        title={item.name}
                        style={{ backgroundColor: 'white' }}
                      ></div>
                      <div
                        className="shadow p-2 mb-0 text-white"
                        style={{
                          backgroundColor: getStatusColor(item.conclusion),
                        }}
                      >
                        <div>
                          <CalendarMonthIcon style={{ fontSize: '16px' }} />{' '}
                          <span
                            style={{ fontSize: '0.6rem', marginLeft: '1px' }}
                          >
                            {item.createdAt}
                          </span>{' '}
                          <span className={`float-end ${classes.idCss}`}>
                            <img
                              src={clock}
                              alt="Clock Icon"
                              style={{ fontSize: '0.8rem' }}
                              className={`float-start ${classes.clockIcon}`}
                            />
                            {item.duration}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          );
        })}
      </div>

      <div>
        <nav aria-label="Page navigation example">
          <ul className={`pagination justify-content-end`}>
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
              className={` ${isNextDisabled ? 'disabled' : ''} ${
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
          </ul>
        </nav>
      </div>
    </div>
  );
};

export default CiCdCardComponent;
