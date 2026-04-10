import React, { useState, useEffect, useRef } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import cssClasses from './CicdAwsCustomPageCss';
import Tooltip from '@mui/material/Tooltip';
import { OverlayTrigger, Popover, Row } from 'react-bootstrap';
import ErrorIcon from '@mui/icons-material/Error'; // Import WarningIcon
import clock from '../icons/clock.png';
import OpenInNewIcon from '@material-ui/icons/OpenInNew';
import { configApiRef, useApi, fetchApiRef } from '@backstage/core-plugin-api';
import { useEntity } from '@backstage/plugin-catalog-react';
import {
  TextField,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Snackbar,
  CircularProgress,
  Button as MuiButton,
} from '@mui/material';

import log from 'loglevel';

import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';

const CiCdCardComponent = ({ currentPipelineData, pipelineName }) => {
  const classes = cssClasses();
  const { fetch } = useApi(fetchApiRef);
  const [, setRunDetailsError] = useState(null);

  const tooltipRef = useRef(null);
  const textRef = useRef(null);
  const config = useApi(configApiRef);
  const backendBaseApiUrl =
    config.getString('backend.baseUrl') + '/api/flowsource-cicd-aws/';
  const entity = useEntity();
  const durationDaysCatalog =
    entity.entity.metadata.annotations['flowsource/durationInDays'];
  const region = entity.entity.metadata.annotations['flowsource/aws-region'];
  const triggerPipelineAnnotation =
    entity.entity.metadata.annotations['flowsource/aws-pipelines-trigger'];
  const allowedPipelines = triggerPipelineAnnotation
    ? triggerPipelineAnnotation.split(',')
    : [];
  const enableTrigger =
    config.getOptionalBoolean('aws.awsCodePipeline.enableTrigger') ?? false;
  const isTriggerEnabled =
    enableTrigger && allowedPipelines.includes(pipelineName);
  const itemsPerPage = 8; // 2 rows * 4 cards per row
  const [cardLoading, setCardLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [pipelineData, setPipelineData] = useState([]);
  const [totalItems, setTotalItems] = useState(0); // Total number of items
  const [openDialog, setOpenDialog] = useState(false);
  const [pipelineVariables, setPipelineVariables] = useState([]);
  const [variableValues, setVariableValues] = useState({});
  const [currentPipelineName, setCurrentPipelineName] = useState('');
  const [snackbarOpen, setSnackbarOpen] = useState(false); // State for Snackbar
  const [isDialogLoading, setDialogLoading] = useState(false);
  const [loadingFailureReason, setLoadingFailureReason] = useState(false);
  const [failureReasonDetails, setFailureReasonDetails] = useState({});
  const [isButtonDisabled, setIsButtonDisabled] = useState(false);
  const [errors, setErrors] = useState({});
  const [isSubmitDisabled, setIsSubmitDisabled] = useState(false);
  const paginationData = pipelineData;
  const isPreviousDisabled = currentPage === 1;
  const isNextDisabled =
    pipelineData.length === 0 || pipelineData.length < itemsPerPage;

  const fetchPipelineData = async page => {
    setCardLoading(true);
    try {
      const response = await fetch(
        `${backendBaseApiUrl}pipelineDetails?pipelineName=${currentPipelineData.name}&durationDaysCatalog=${durationDaysCatalog}&region=${region}&page=${page}&limit=${itemsPerPage}`,
      );
      if (response.ok) {
        const data = await response.json();
        if (data.buildDetailsByInitiator.length > 0) {
          setPipelineData(data.buildDetailsByInitiator);
          setTotalItems(data.total);
        } else {
          setPipelineData([]);
          setTotalItems(0);
        }
        setRunDetailsError(data.clientErrorMessage?.pipelineError || null);
      } else {
        setRunDetailsError(
          `Error fetching pipeline data: ${response.statusText}`,
        );
      }
    } catch (error) {
      log.error('Error fetching pipeline data:', error);
      setRunDetailsError(error.message);
    }
    setCardLoading(false);
  };

  const fetchFailureReason = async (pipelineName, pipelineExecutionId) => {
    setLoadingFailureReason(true);
    try {
      const response = await fetch(
        `${backendBaseApiUrl}fetchFailureReason?pipelineName=${pipelineName}&pipelineExecutionId=${pipelineExecutionId}&region=${region}`,
      );
      if (response.ok) {
        const data = await response.json();
        setFailureReasonDetails(data.data);
      } else {
        log.error('Error fetching failure reason:', response.statusText);
        alert('Error fetching failure reason. Check console for details.');
      }
    } catch (error) {
      log.error('Error fetching failure reason:', error);
      alert('Error fetching failure reason. Check console for details.');
    }
    setLoadingFailureReason(false);
  };

  const fetchPipelineVariables = async pipelineName => {
    try {
      const response = await fetch(
        `${backendBaseApiUrl}pipelineVariables?pipelineName=${pipelineName}&region=${region}`,
      );
      if (response.ok) {
        const variables = await response.json();
        const environmentVariables = variables.find(
          variable => variable.name === 'EnvironmentVariables',
        );
        if (environmentVariables) {
          const parsedEnvVars = JSON.parse(environmentVariables.value);
          const cleanedEnvVars = parsedEnvVars.map(envVar => ({
            ...envVar,
            value: envVar.value.replace('#{variables.', '').replace('}', ''),
          }));
          setPipelineVariables(cleanedEnvVars);
          return true; // Environment variables exist
        } else {
          setPipelineVariables([]);
          return false; // No environment variables
        }
      } else {
        alert('Error fetching pipeline variables');
        return false;
      }
    } catch (error) {
      log.error('Error:', error);
      alert('Error fetching pipeline variables');
      return false;
    }
  };

  const handleTriggerPipeline = async () => {
    setIsButtonDisabled(true); // Disable the button
    setDialogLoading(true);
    const hasEnvVars = await fetchPipelineVariables(pipelineName);
    setDialogLoading(false);

    if (hasEnvVars) {
      setOpenDialog(true);
      setCurrentPipelineName(pipelineName);
    } else {
      await triggerPipelineDirectly(pipelineName);
      setIsButtonDisabled(false);
    }
  };

  const triggerPipelineDirectly = async pipelineName => {
    const url = `${backendBaseApiUrl}triggerPipeline?pipelineName=${pipelineName}&region=${region}`;
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ EnvironmentVariables: {} }), // No environment variables
      });
      if (response.ok) {
        setSnackbarOpen(true);
      } else {
        alert('Error triggering pipeline');
      }
    } catch (error) {
      log.error('Error:', error);
      alert('Error triggering pipeline');
    }
    setIsButtonDisabled(false);
  };

  const handleVariableChange = (name, value) => {
    setVariableValues(prevValues => ({
      ...prevValues,
      [name]: value,
    }));

    // Remove error message when user starts typing
    setErrors(prevErrors => ({
      ...prevErrors,
      [name]: value ? '' : 'Please enter a value',
    }));

    // Enable submit button if there are no errors
    setIsSubmitDisabled(Object.values(errors).some(error => error));
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setIsButtonDisabled(false); // Re-enable the trigger pipeline button
  };

  const handleSubmit = async () => {
    const newErrors = {};
    let hasErrors = false;
    // Validate environment variables
    pipelineVariables.forEach(envVar => {
      if (!variableValues[envVar.name]) {
        newErrors[envVar.name] = 'Please enter a value';
        hasErrors = true;
      }
    });
    setErrors(newErrors);
    setIsSubmitDisabled(hasErrors);

    if (hasErrors) {
      return; // Do not submit if there are validation errors
    }

    const url = `${backendBaseApiUrl}triggerPipeline?pipelineName=${currentPipelineName}&region=${region}`;
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ EnvironmentVariables: variableValues }),
      });
      if (response.ok) {
        setSnackbarOpen(true);
      } else {
        alert('Error triggering pipeline');
      }
    } catch (error) {
      log.error('Error:', error);
      alert('Error triggering pipeline');
    }
    setOpenDialog(false);
    setIsButtonDisabled(false); // Re-enable the button after triggering
  };

  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
  };

  const getStatusColor = state => {
    switch (state) {
      case 'Success':
        return '#44b98c';
      case 'In Progress':
        return '#F29F58';
      case 'Stopped':
      case 'Stopping':
      case 'Cancelled':
        return '#9e9e9e';
      default:
        return '#e76c71';
    }
  };

  const handlePageChange = pageNumber => {
    setCurrentPage(pageNumber);
  };

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage * itemsPerPage < totalItems) {
      setCurrentPage(currentPage + 1);
    }
  };

  useEffect(() => {
    fetchPipelineData(currentPage);
  }, [currentPage]);

  const truncateText = (text, maxLength) => {
    if (text.length > maxLength) {
      return text.slice(0, maxLength) + '...';
    }
    return text;
  };

  if (cardLoading) {
    return (
      <div
        className="App p-3"
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'flex-start',
          height: '50vh',
          paddingTop: '30%',
        }}
      >
        Loading...
      </div>
    );
  }

  if (pipelineData.length === 0) {
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
        No data available
      </div>
    );
  }

  return (
    <div>
      <div className={`row ${classes.cardcontent}`}>
        {pipelineData.map((item, index) => (
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
                    style={{ maxWidth: '70%', wordWrap: 'break-word' }}
                  >
                    <a
                      href={item.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`${classes.hoverUnderline}`}
                      style={{ color: getStatusColor(item.conclusion) }}
                    >
                      {truncateText(item.commitMessage, 30)}
                    </a>
                  </h6>
                  <span
                    className={`position-absolute top-0 end-0 m-2 ${classes.statusCss}`}
                    style={{
                      color: getStatusColor(item.conclusion),
                      padding: '3px',
                    }}
                  >
                    {item.conclusion === 'Failed' && (
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
                              {loadingFailureReason ? ( // Show loading indicator while fetching
                                <div>Loading failure details...</div>
                              ) : (
                                <div>
                                  <div>
                                    <b>Message: </b>
                                    {failureReasonDetails.message ||
                                      'No message available'}
                                  </div>
                                  <div>
                                    <b>StageName: </b>
                                    {failureReasonDetails.failedAt ||
                                      'No stage available'}
                                  </div>
                                  <div>
                                    <b>Build URL: </b>
                                    <a
                                      href={
                                        failureReasonDetails.executionUrl || '#'
                                      }
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      style={{ color: '#3f51b5' }}
                                    >
                                      Link <OpenInNewIcon fontSize="small" />
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
                          onClick={() => fetchFailureReason(item.name, item.id)}
                        >
                          <ErrorIcon
                            style={{ fontSize: '1rem', marginTop: '-.3rem' }}
                          />
                        </span>
                      </OverlayTrigger>
                    )}
                    {item.conclusion}
                  </span>
                </div>
                <div className="d-flex justify-content-start mt-auto">
                  <span style={{ fontSize: '10px', margin: '0.3rem' }}>
                    ID: {item.id}
                  </span>
                </div>
              </div>
              <div
                className="shadow p-2 mb-0 text-white"
                style={{
                  backgroundColor: getStatusColor(item.conclusion),
                }}
              >
                <CalendarMonthIcon
                  style={{ fontSize: '1rem', marginRight: '2px' }}
                />
                <span style={{ fontSize: '0.7rem', marginRight: '25px' }}>
                  {new Date(item.startTime).toLocaleString(undefined, {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                    hourCycle: 'h23',
                  })}
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
      {pipelineData.length > 0 && (
        <Row className={`${classes.lastRow}`}>
          <div
            className={`${classes.paginations}`}
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            {isTriggerEnabled ? (
              <MuiButton
                variant="contained"
                color="primary"
                style={{
                  marginLeft: '-42px',
                  padding: '6px',
                  marginTop: '-16px',
                  height: '27px',
                }}
                onClick={() => handleTriggerPipeline()}
                disabled={isButtonDisabled} // Disable the button based on state
              >
                Trigger Pipeline
              </MuiButton>
            ) : (
              <div style={{ width: '150px' }}></div> // Reserve space for the button
            )}
            <nav
              aria-label="Page navigation example"
              style={{ marginRight: '-0.5rem' }}
            >
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
                    onClick={handlePreviousPage}
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
                    onClick={handleNextPage}
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
          <Dialog open={openDialog} onClose={handleCloseDialog}>
            <DialogTitle>Trigger Pipeline</DialogTitle>
            <DialogContent style={{ width: '400px', height: '300px' }}>
              {isDialogLoading ? (
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    height: '100%',
                  }}
                >
                  <CircularProgress />
                </div>
              ) : (
                pipelineVariables.map(envVar => (
                  <div key={envVar.name}>
                    <TextField
                      label={envVar.value} // Show the value instead of the name
                      type="text"
                      fullWidth
                      margin="normal"
                      onChange={e =>
                        handleVariableChange(envVar.name, e.target.value)
                      }
                      error={!!errors[envVar.name]}
                      helperText={errors[envVar.name]}
                    />
                  </div>
                ))
              )}
            </DialogContent>
            <DialogActions>
              <MuiButton onClick={handleCloseDialog} color="secondary">
                Cancel
              </MuiButton>
              <MuiButton
                onClick={handleSubmit}
                color="primary"
                disabled={isSubmitDisabled}
              >
                Submit
              </MuiButton>
            </DialogActions>
          </Dialog>
          <Snackbar
            open={snackbarOpen}
            autoHideDuration={6000}
            onClose={handleSnackbarClose}
            message="Pipeline triggered successfully"
            action={
              <MuiButton
                color="inherit"
                size="small"
                onClick={handleSnackbarClose}
              >
                Close
              </MuiButton>
            }
            anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }} // Center the Snackbar
          />
        </Row>
      )}
    </div>
  );
};
export default CiCdCardComponent;
