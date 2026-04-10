import React, { useState , useEffect, useRef } from 'react';


import 'bootstrap/dist/css/bootstrap.min.css';
import cssClasses from './BitbucketCicdCss';
import { OverlayTrigger, Popover } from 'react-bootstrap';
import ErrorIcon from '@mui/icons-material/Error';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';

import clock from '../icons/clock.png';

import { useApi, fetchApiRef  } from '@backstage/core-plugin-api';

import log from 'loglevel';

const BitbucketCiCdCardComponent = ({ pipelineName, repoName, repoOwner, hostFromCatalog, durationDaysCatalog, backendBaseApiUrl }) => {

  const classes = cssClasses();
  const tooltipRef = useRef(null);
  const textRef = useRef(null);
  const { fetch } = useApi(fetchApiRef);

  const itemsPerPage = 8; // 2 rows * 4 cards per row

  const [currentPage, setCurrentPage] = useState(1);
  const [buildData, setBuildData] = useState([]);
  const [buildDataLoading, setBuildDataLoading] = useState(true);
  const [, setError] = useState(null);

  useEffect(() => {
    getBuildData(pipelineName, currentPage, itemsPerPage);
  }, [pipelineName, currentPage]);


  const getBuildData = async (pipelineName, pageNumber, pageLength) => {
    setBuildDataLoading(true);
    try {
      // Fetch build details
      const buildRes = await fetch(
        `${backendBaseApiUrl}bitbucket-build?repoName=${repoName}&repoOwner=${repoOwner}&pipelineName=${pipelineName}&hostFromCatalog=${hostFromCatalog}&durationDaysCatalog=${durationDaysCatalog}&pageNumber=${pageNumber}&pageLength=${pageLength}`,
      );

      if (buildRes.ok) {
        const result = await buildRes.json();
        setBuildData(result);
        setBuildDataLoading(false);
      } else {
        setError(
          `Error fetching Bitbucket build details, with status code ${buildRes.status} `,
        );
        setBuildDataLoading(false);
      }
    } catch (error) {
      log.error('Error:', error);
      setError(error.message);
      setBuildDataLoading(false);
    }
  }

    const isPreviousDisabled = currentPage === 1;
    const isNextDisabled = buildData.length === 0 || buildData.length < itemsPerPage;

    const handlePageChange = (pageNumber) => {
      setCurrentPage(pageNumber);
    };

    const getStatusColor = (status) => {
      switch (status) {
        case 'Success':
          return '#44b98c'; // green
        case 'Stopped':
          return '#9e9e9e'; // grey
        case 'In Progress':
          return '#f29f58'; // orange
        case 'Failed':
          return '#e76c71'; // red
        default:
          return '#e76c71'; // red
      }
    }

    function rednerCardsUI() {
      if(buildDataLoading) {
        return ( <div className="d-flex justify-content-center">Loading...</div> );
      } else if(buildData.length === 0) {
        return ( <div className="d-flex justify-content-center">No data available</div> );
      } 
      else {
        return buildData.map((item) => (
          <div key={item.id} className="col-md-3 my-2">
            <div
              className={`card ${classes.card1}`}
              style={{
                backgroundColor: 'white',
                borderColor: getStatusColor(item.status),
                borderWidth: 'thin',
                borderStyle: 'solid',
              }}
            >
              <div
                className={`card-body ${classes.cardBody} d-flex flex-column pb-2`}
                ref={tooltipRef}
                data-bs-toggle="tooltip"
                data-bs-placement="top"
                title={item.commitMessage}
              >
                <div className="d-flex justify-content-between ">
                  <h6
                    ref={textRef}
                    className={`${classes.customText}`}
                  >
                    <a href={item.url} target="_blank" rel="noopener noreferrer" className={`${classes.hoverUnderline}`}
                      style={{ color: getStatusColor(item.status) }}>
                      {item.commitMessage}
                    </a>
                  </h6>
                  <p className='ps-1' style={{fontSize:'13px', whiteSpace:'nowrap', color: getStatusColor(item.status)}}>{item.status !== 'Failed' ? (item.status) : (
                      <OverlayTrigger
                      trigger="click"
                      placement="top"
                      rootClose
                      overlay={<Popover id={`popover-${item.id}`}>
                      <Popover.Header as="h3">Failure Details</Popover.Header>
                      <Popover.Body>
                      <div><b>Message: </b><span>{item.errorMessage}</span></div>
                      <div><b>Step: </b>{item.failedStep || 'N/A'}</div>
                      <div><b>Build URL: </b><a href={item.url} target="_blank" rel="noopener noreferrer" style={{ color: '#3f51b5' }} >Link <OpenInNewIcon fontSize="small" /></a></div>
                      </Popover.Body>
                      </Popover>
                      }
                      >
                    <span className={`${classes.idCss}`}style={{ cursor: 'pointer' }}>
                    <ErrorIcon fontSize='small'/> {item.status}
                    </span>
                    </OverlayTrigger>
                    )}</p>
                </div>
                <div className='d-flex justify-content-start mt-auto'>
                  <span style={{fontSize:'13px'}}>ID: {item.id}</span>
                </div>    
              </div>
              <div
                className={`d-flex justify-content-between align-items-center shadow p-2 text-white ${classes.shadow}`}
                style={{
                  backgroundColor: getStatusColor(item.status)
                }}
              >
                <span className={`${classes.idCss} d-flex align-items-center gap-1`}>
                  <CalendarMonthIcon/>
                  {new Date(item.runDate).toLocaleString(undefined, { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit', hourCycle: 'h23'})}
                </span>
                  
                <span className={`${classes.idCss} d-flex align-items-center`}>
                  <img
                    src={clock}
                    alt="Clock Icon"
                    className={`${classes.clockIcon}`}
                  />
                  {item.runDuration}
                </span>
              </div>
            </div>
          </div>
        ));
      }
    };

    return (
      <div>
        <div className={`row ${classes.cardcontent}`}>
          { rednerCardsUI() }
        </div>
        <div>
          {!buildDataLoading && (buildData.length > 0 || currentPage>1) && (
          <nav aria-label="Page navigation example">
            <ul className={`pagination justify-content-end`} >
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
                className={` ${isNextDisabled ? 'disabled' : ''} ${classes.liCss
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
          )}
        </div>      
      </div>
    );
  };

  export default BitbucketCiCdCardComponent;