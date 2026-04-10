import React, { useState, useEffect, useRef } from 'react';
import {
  Button,
  Card,
  CardContent,
  TextField,
  Typography,
  Box,
  Divider,
  FormControlLabel,
  Checkbox,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Snackbar,
  Alert,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import 'bootstrap/dist/css/bootstrap.min.css';
import cssClasses from './CicdAzurePipelineCss';
import { Row, Pagination,  OverlayTrigger,  Popover } from 'react-bootstrap';
import OpenInNewIcon from '@material-ui/icons/OpenInNew';
import ErrorIcon from '@mui/icons-material/Error';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';

import clock from '../icons/clock.png';

import { configApiRef, useApi, fetchApiRef } from '@backstage/core-plugin-api';
import { useEntity } from '@backstage/plugin-catalog-react';

import log from 'loglevel';

const CiCdCardComponent = ({ currentpipelineData }) => {
  const classes = cssClasses();
  const { fetch } = useApi(fetchApiRef);
  const tooltipRef = useRef(null);
  const textRef = useRef(null);

  const config = useApi(configApiRef);
  const entity = useEntity();
  const backendBaseApiUrl =
    config.getString('backend.baseUrl') + '/api/azure-pipeline/';

  const projectName =
    entity.entity.metadata.annotations['flowsource/azure-project-name'];
  const durationDaysCatalog =
    entity.entity.metadata.annotations['flowsource/durationInDays'];

  const itemsPerPage = 8; // 2 rows * 4 cards per row

  const [currentPage, setCurrentPage] = useState(1);
  const [pipelineRunData, setPipelineRunData] = useState([]);
  const [totalPages, setTotalPages] = useState(0);
  const [paginationData, setPaginationData] = useState([]);
  const [, setRunDetailsError] = useState(null);
  const [cardLoading, setCardLoading] = useState(true);
  const [showCard, setShowCard] = useState(false);
  const [defaultBranch, setDefaultBranch] = useState(null);
  const [branchName, setBranchName] = useState(defaultBranch);
  const [showAdvancedOptions, setShowAdvancedOptions] = useState(false);
  const [showVariablesCard, setShowVariablesCard] = useState(false);
  const [showStagesCard, setShowStagesCard] = useState(false);
  const [variables, setVariables] = useState([]);
  const [stages, setStages] = useState([]);
  const [selectedStages, setSelectedStages] = useState([]);
  const [tempVariables, setTempVariables] = useState(
    variables.map(variable => ({ ...variable })),
  );
  const [stagesRunsValues, setStagesRunsValues] = useState([]);
  const [isUpdateDisabled, setIsUpdateDisabled] = useState(true);
  const [isStagesSelected, setIsStagesSelected] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('success');
  const [runId, setRunId] = useState(null);

  async function getPipelineRunDetails() {
    try {
      // Fetch pipeline run details
      let pipelineRunDetails = [];
      const pipelineRunsRes = await fetch(
        backendBaseApiUrl +
          'run-data?projectName=' +
          projectName +
          '&pipelineId=' +
          currentpipelineData.id +
          '&durationDaysCatalog=' +
          durationDaysCatalog,
      );

      if (pipelineRunsRes.ok) {
        pipelineRunDetails = await pipelineRunsRes.json();
        return pipelineRunDetails;
      } else {
        setRunDetailsError(
          `Error fetching Azure pipeline run details, with status code ${pipelineRunsRes.status} `,
        );
      }
    } catch (error) {
      log.error('Error:', error);
      setRunDetailsError(error.message);
    }
  }

  const handleTriggerClick = () => {
    setShowCard(true);
  };

  const handleCancelClick = () => {
    setShowCard(false);
    setSelectedStages([]);
  };

  const handleBranchNameChange = e => {
    setBranchName(e.target.value);
  };

  const handleVariablesClick = () => {
    setShowVariablesCard(true);
  };

  const handleStagesClick = () => {
    setShowStagesCard(true);
  };

  const handleBackClick = () => {
    setShowVariablesCard(false);
    setShowStagesCard(false);
  };

  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
  };

  const handleVariableChange = (index, value) => {
    const updatedTempVariables = tempVariables.map((variable, i) =>
      i === index ? { ...variable, value } : variable,
    );

    setTempVariables(updatedTempVariables);

    const hasChanges = updatedTempVariables.some(
      (variable, i) => variable.value !== variables[i]?.value,
    );

    setIsUpdateDisabled(!hasChanges); 
  };

  const handleSaveClick = () => {
    setVariables(tempVariables.map(variable => ({ ...variable })));
    setIsUpdateDisabled(true);
  };
  const handleStageSelection = (stage, isChecked) => {
    if (!isChecked) {
      // Add the stage to stagesRunsValues when unchecked
      setStagesRunsValues(prev => [...prev, stage]);
    } else {
      // Remove the stage from stagesRunsValues when checked again
      setStagesRunsValues(prev => prev.filter(s => s !== stage));
    }
  };

  const handleStagesSaveClick = () => {
    setSelectedStages(stagesRunsValues); // Store the unchecked stages
    // Perform any additional save logic here
  };

  const handleSubmit = async () => {
    if (!branchName) {
      setSnackbarMessage('Please enter a branch name');
      setSnackbarSeverity('warning');
      setSnackbarOpen(true);
      return;
    }
    setSnackbarMessage('');
    setSnackbarSeverity('info');
    setSnackbarOpen(false);

    try {
      const variableName = variables.map(variable => variable.name).join(',');
      const variableValue = variables.map(variable => variable.value).join(',');
      const stagesToRuns = selectedStages.join(','); 

      const response = await fetch(
        `${backendBaseApiUrl}trigger-pipeline?projectName=${projectName}&pipelineId=${
          currentpipelineData.id
        }&branchName=${encodeURIComponent(
          branchName,
        )}&variableName=${encodeURIComponent(
          variableName,
        )}&variableValue=${encodeURIComponent(
          variableValue,
        )}&stagesToRuns=${encodeURIComponent(stagesToRuns)}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
        },
      );

      if (response.ok) {
        setSnackbarMessage('Pipeline triggered successfully!');
        setSnackbarSeverity('success');
        setSnackbarOpen(true);
        setShowCard(false);
        setBranchName('');
      } else {
        setSnackbarMessage('Failed to trigger pipeline');
        setSnackbarSeverity('error');
        setSnackbarOpen(true);
      }
    } catch (error) {
      console.error('Error triggering pipeline:', error);
      setSnackbarMessage('An error occurred while triggering the pipeline');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
    }
  };

  const fetchVariablesFromBackend = async () => {
    try {
      const response = await fetch(
        `${backendBaseApiUrl}fetch-variables?projectName=${projectName}&pipelineId=${currentpipelineData.id}&runId=${runId}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        },
      );

      if (response.ok) {
        const data = await response.json();
        if (data.success && data.triggerResult) {
          const { result, stageRuns } = data.triggerResult;

          if (Array.isArray(result)) {
            setVariables(result);
            setTempVariables(result);
          } else {
            console.error('Unexpected format for result');
          }

          if (Array.isArray(stageRuns)) {
            setStages(stageRuns);
          } else {
            alert('Unexpected format for stageRuns');
          }
        } else {
          alert('Unexpected response format or no variables found');
        }
      } else {
        alert('Failed to fetch variables');
      }
    } catch (error) {
      console.error('Error fetching variables:', error);
      alert('An error occurred while fetching variables');
    }
  };

  async function getPipelineBuildDetails(pageNumber, runDetails) {
    try {
      // Slice pipelineRunData based on pagination
      const startIndex = (pageNumber - 1) * itemsPerPage;
      const endIndex = startIndex + itemsPerPage;
      const paginatedRunData = runDetails.slice(startIndex, endIndex);

      // Fetch pipeline name and duration details
      const pipelineBiuldRes = await fetch(
        backendBaseApiUrl +
          'build-data?projectName=' +
          projectName +
          '&runDetails=' +
          JSON.stringify(paginatedRunData),
      );

      if (pipelineBiuldRes.ok) {
        const pipelineBuildData = await pipelineBiuldRes.json();

        const promises = paginatedRunData.map(async runDetail => {
          // Find corresponding build detail based on id
          const buildDetail = pipelineBuildData.find(
            build => build.id === runDetail.id,
          );
          buildDetail.name = buildDetail.name.replace(/&gt;/g, '>');

          // Combining necessary fields from runDetail and buildDetail
          const data = {
            id: runDetail?.id ?? 'N/A',
            name: runDetail?.name ?? 'N/A',
            commitMessage: runDetail.commitMessage,
            status: runDetail.status,
            url: runDetail.url,
            message: runDetail.message,
            stageName: runDetail.stageName,
            duration: buildDetail ? buildDetail.runDuration : null,
            runNumber: runDetail.runNumber,
            defaultBranchName: runDetail.defaultBranchName,
          };
          setRunId(data.runNumber);
          setDefaultBranch(data.defaultBranchName);
          return data;
        });

        // Wait for all promises to resolve
        const result = await Promise.all(promises);

        // Set paginationData with the combined data
        setPaginationData(result);
      } else {
        setRunDetailsError(
          `Error fetching Azure pipeline build details, with status code ${pipelineBiuldRes.status} `,
        );
      }

      setCardLoading(false);
    } catch (error) {
      log.error('Error:', error);
      setRunDetailsError(error.message);
      setCardLoading(false);
    }
  }

  useEffect(async () => {
    const fetchData = async () => {
      const data = await getPipelineRunDetails();
      setPipelineRunData(data.pipelineRunDetails);
      let totalPage = Math.ceil(data.pipelineRunCount / itemsPerPage);
      setTotalPages(totalPage);

      await getPipelineBuildDetails(1, data.pipelineRunDetails);
    };
    fetchData();
  }, []);

  useEffect(() => {
    setStagesRunsValues([]);
  }, [stages]);

  useEffect(() => {
    setBranchName(defaultBranch);
  }, [defaultBranch]);

  useEffect(() => {
    setIsStagesSelected(stagesRunsValues.length < stages.length);
  }, [stagesRunsValues, stages]);

  const isPreviousDisabled = currentPage === 1;
  const isNextDisabled = currentPage === totalPages;
  const start = (currentPage - 1) * itemsPerPage + 1;
  const end = Math.min(currentPage * itemsPerPage, pipelineRunData.length);
  const currentRange = { start, end };

  const handlePageChange = page => {
    setCurrentPage(page);
    getPipelineBuildDetails(page, pipelineRunData);
  };

  function truncateString(str, num) {
    if (str.length <= num) {
      return str;
    }
    return str.slice(0, num) + '...';
  }

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
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert
          onClose={handleSnackbarClose}
          severity={snackbarSeverity}
          sx={{ width: '100%' }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
      <div className={`row ${classes.cardcontent}`}>
        {[...Array(Math.ceil(paginationData.length / 4))].map((_, rowIndex) => {
          const uniquekey = paginationData
            .slice(rowIndex * 4, (rowIndex + 1) * 4)
            .map(item => item.id)
            .join('-');
          return (
            <div key={uniquekey} className="row mt-2">
              {paginationData
                .slice(rowIndex * 4, (rowIndex + 1) * 4)
                .map(item => (
                  <div key={item.id} className="col-md-3 mb-3">
                    <div
                      className={`card ${classes.card1}`}
                      style={{
                        backgroundColor: 'white',
                        borderColor: getStatusColor(item.status),
                        borderWidth: 'thin',
                        borderStyle: 'solid',
                        height: '150px',
                      }}
                    >
                      <div
                        className={`card-body mt-2 ms-2 me-2 text-white ${classes.cardBody}`}
                        ref={tooltipRef}
                        data-bs-toggle="tooltip"
                        data-bs-placement="top"
                        title={item.id}
                      >
                        <h5
                          ref={textRef}
                          className={`card-title me-2 ${classes.cardTitle} ${classes.customText}`}
                        >
                          <a
                            href={item.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={`position-absolute top-0 start-0 m-2 ${classes.hoverUnderline}`}
                            style={{
                              color: getStatusColor(item.status),
                              fontSize: '12px',
                              width: '50%',
                            }}
                          >
                            {item.commitMessage}
                          </a>
                        </h5>
                        <span
                          className={`position-absolute top-0 end-0 m-2 ${classes.statusCss}`}
                          style={{
                            width: '40%',
                            textAlign: 'right',
                            fontSize: '12px',
                          }}
                        >
                          {item.status}
                        </span>
                      </div>
                      <div
                        className={`shadow p-2 mb-0 text-white ${classes.shadow}`}
                        style={{
                          backgroundColor: getStatusColor(item.status),
                        }}
                      >
                        <span
                          className={`float-start ${classes.idCss}`}
                          title={item.name}
                        >
                          ID: {truncateString(item.name, 3)}
                        </span>
                        {item.status === 'Failed' && (
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
                                    <span>{item.message}</span>
                                  </div>
                                  {item.message != 'not executed' && (
                                    <div>
                                      <b>Step Name: </b>
                                      {item.stageName}
                                    </div>
                                  )}
                                  <div>
                                    <b>Build URL: </b>
                                    <a
                                      href={item.url}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      style={{ color: '#3f51b5' }}
                                    >
                                      Link <OpenInNewIcon fontSize="small" />
                                    </a>
                                  </div>
                                </Popover.Body>
                              </Popover>
                            }
                          >
                            <span
                              className={`mx-auto ${classes.idCss}`}
                              style={{
                                cursor: 'pointer',
                                marginLeft: '10px',
                                paddingLeft: '1px',
                              }}
                            >
                              <ErrorIcon fontSize="small" /> Failure Reason
                            </span>
                          </OverlayTrigger>
                        )}
                        <span className={`float-end ${classes.idCss}`}>
                          <img
                            src={clock}
                            alt="Clock Icon"
                            className={`float-start ${classes.clockIcon}`}
                          />
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
                  {pipelineRunData.length}
                </li>
              </ul>
            </nav>
          </div>
        </Row>
      )}

      <div>
        <Button
          variant="contained"
          color="primary"
          onClick={() => {
            handleTriggerClick(); 
            fetchVariablesFromBackend(); 
          }}
        >
          Trigger Pipeline
        </Button>

        {showCard && !showVariablesCard && (
          <div
            style={{
              position: 'fixed',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              zIndex: 1000,
            }}
          >
            <Box mt={2} width="500px">
              <Card>
                <CardContent
                  style={{
                    maxHeight: '500px', 
                    overflowY: 'auto',
                  }}
                >
                  <Typography variant="h6" gutterBottom>
                    Run Pipeline
                  </Typography>
                  <Box mt={1}>
                    <Typography
                      variant="body2"
                      color="textSecondary"
                      gutterBottom
                    >
                      Select parameters below and manually run the pipeline
                    </Typography>
                  </Box>
                  <Box mt={2} mb={2}>
                    <Accordion>
                      <AccordionSummary
                        expandIcon={<ExpandMoreIcon />}
                        aria-controls="branch-content"
                        id="branch-header"
                      >
                        <Typography variant="body2">Branch </Typography>
                      </AccordionSummary>
                      <AccordionDetails>
                        <Box mt={3}>
                          <TextField
                            fullWidth
                            label="Enter the Branch Name"
                            variant="outlined"
                            value={branchName}
                            onChange={handleBranchNameChange}
                          />
                        </Box>
                      </AccordionDetails>
                    </Accordion>

                    <Accordion>
                      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                        <Typography variant="body2">Variables</Typography>
                      </AccordionSummary>
                      <AccordionDetails>
                        <Typography>
                          <Typography variant="body2" gutterBottom>
                            {variables.length > 0
                              ? 'Here are your variables:'
                              : 'There are no Defined Variables.'}
                          </Typography>
                          <Box mt={2}>
                            {tempVariables.map((variable, index) => (
                              <Box key={variable.id || index} mb={2}>
                                <Typography variant="body2" gutterBottom>
                                  Name:
                                </Typography>
                                <input
                                  type="text"
                                  value={variable.name}
                                  disabled
                                  style={{
                                    width: '100%',
                                    padding: '8px',
                                    boxSizing: 'border-box',
                                    backgroundColor: '#f5f5f5',
                                    color: '#888',
                                  }}
                                />
                                <Typography
                                  variant="body2"
                                  gutterBottom
                                  style={{ marginTop: '8px' }}
                                >
                                  Value:
                                </Typography>
                                <input
                                  type="text"
                                  value={variable.value}
                                  onChange={e =>
                                    handleVariableChange(index, e.target.value)
                                  }
                                  style={{
                                    width: '100%',
                                    padding: '8px',
                                    boxSizing: 'border-box',
                                  }}
                                />
                                {variable.description && (
                                  <Typography
                                    variant="caption"
                                    color="textSecondary"
                                  >
                                    {variable.description}
                                  </Typography>
                                )}
                              </Box>
                            ))}
                          </Box>
                          <Box
                            mt={2}
                            display="flex"
                            justifyContent="flex-end"
                            gap={2}
                          >
                            <Button
                              variant="contained"
                              style={{
                                backgroundColor: isUpdateDisabled
                                  ? '#d3d3d3'
                                  : '#007bff',
                                color: isUpdateDisabled ? 'black' : 'white',
                                textTransform: 'none',
                                opacity: isUpdateDisabled ? 0.6 : 1,
                                cursor: isUpdateDisabled
                                  ? 'not-allowed'
                                  : 'pointer',
                              }}
                              disabled={isUpdateDisabled}
                              onClick={handleSaveClick}
                            >
                              Update
                            </Button>
                          </Box>
                        </Typography>
                      </AccordionDetails>
                    </Accordion>

                    <Accordion>
                      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                        <Typography variant="body2">Stages To Run</Typography>
                      </AccordionSummary>
                      <AccordionDetails>
                        <Box mt={2}>
                          <Typography variant="body2" gutterBottom>
                            {stages.length > 0
                              ? 'Deselect stages you want to skip for this run:'
                              : 'No stages available.'}
                          </Typography>
                          <Box mt={2}>
                            {stages.map((stage, index) => (
                              <Box
                                key={index}
                                mb={2}
                                p={2}
                                sx={{
                                  borderRadius: 1,
                                  backgroundColor: '#f9f9f9',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'space-between',
                                  height: '60px',
                                  '&:hover': {
                                    backgroundColor: '#d3d3d3',
                                  },
                                }}
                              >
                                <FormControlLabel
                                  control={
                                    <Checkbox
                                      value={stage}
                                      checked={
                                        !stagesRunsValues.includes(stage)
                                      }
                                      onChange={e =>
                                        handleStageSelection(
                                          e.target.value,
                                          e.target.checked,
                                        )
                                      }
                                    />
                                  }
                                  label={stage}
                                  sx={{ marginLeft: 0 }}
                                />
                              </Box>
                            ))}
                          </Box>
                          <Box
                            mt={2}
                            display="flex"
                            justifyContent="flex-end"
                            gap={2}
                          >
                            <Button
                              variant="contained"
                              style={{
                                textTransform: 'none',
                              }}
                              onClick={handleStagesSaveClick}
                              disabled={!isStagesSelected} // Disable button if no stages are selected
                            >
                              Use Selected Stages
                            </Button>
                          </Box>
                        </Box>
                      </AccordionDetails>
                    </Accordion>
                  </Box>

                  <Box mt={2} display="flex" justifyContent="flex-end" gap={2}>
                    <Button
                      variant="contained"
                      style={{
                        backgroundColor: '#d3d3d3',
                        color: 'black',
                        textTransform: 'none',
                      }}
                      onClick={handleCancelClick}
                    >
                      Cancel
                    </Button>
                    <Button
                      variant="contained"
                      style={{
                        backgroundColor: '#007bff',
                        color: 'white',
                        textTransform: 'none',
                      }}
                      onClick={handleSubmit}
                    >
                      Run
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            </Box>
          </div>
        )}
      </div>
    </div>
  );
};

export default CiCdCardComponent;

const getStatusColor = status => {
  switch (status) {
    case 'Success':
      return '#44b98c';
    case 'Failed':
      return '#e76c71';
    case 'In Progress':
      return '#F29F58';
    case 'Cancelled':
    case 'unstable':
    case 'not built':
      return '#9e9e9e';
    default:
      return '#e76c71';
  }
};
