import React, { useState, useEffect, useRef } from 'react';
import { Row, OverlayTrigger, Popover } from 'react-bootstrap';
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import ErrorIcon from '@mui/icons-material/Error';
import 'bootstrap/dist/css/bootstrap.min.css';
import cssClasses from './CicdJenkinsCustomPageCss';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import clock from '../icons/clock.png';
import OpenInNewIcon from '@material-ui/icons/OpenInNew';
import { configApiRef, useApi, fetchApiRef } from '@backstage/core-plugin-api';
import { useEntity } from '@backstage/plugin-catalog-react';
import { FormControl, MenuItem, Select, InputLabel, } from '@mui/material';
import log from 'loglevel';
import Snackbar from '@mui/material/Snackbar';

const CiCdCardComponent = ({ currentJobData, pipelineName, packageNameOptions=[] }) => {
  const classes = cssClasses();
  const { fetch } = useApi(fetchApiRef);
  const [, setBuildDetailsError] = useState(null);
  const tooltipRef = useRef(null);
  const textRef = useRef(null);
  const config = useApi(configApiRef);
  const backendBaseApiUrl = config.getString('backend.baseUrl') + '/api/flowsource-cicd-jenkins/';
  const entity = useEntity();
  const durationDaysCatalog = entity.entity.metadata.annotations['flowsource/durationInDays'];
  const triggerPipelineAnnotation = entity.entity.metadata.annotations['flowsource/jenkins-pipelines-trigger'];
  const allowedPipelines = triggerPipelineAnnotation ? triggerPipelineAnnotation.split(',') : [];
  const enableTrigger = config.getOptionalBoolean('jenkins.enableTrigger') ?? false;
  const isTriggerEnabled = enableTrigger && allowedPipelines.includes(pipelineName);
  const itemsPerPage = 8; // 3 rows * 4 cards per row  
  const [cardLoading, setCardLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [paginationData, setpaginationData] = useState([]);
  const totalPages = Math.ceil(currentJobData.totalBuilds / itemsPerPage);
  const isPreviousDisabled = currentPage === 1;
  const isNextDisabled = currentPage === totalPages;
  const start = (currentPage - 1) * itemsPerPage + 1;
  const end = Math.min(currentPage * itemsPerPage, currentJobData.totalBuilds);
  const currentRange = { start, end };
  const [showDialog, setShowDialog] = useState(false);
  const [parameters, setParameters] = useState([]);
  const [formValues, setFormValues] = useState({});
  const [isDialogLoading, setIsDialogLoading] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [isButtonDisabled, setIsButtonDisabled] = useState(false);
  const [isPipelineOrFreestyle, setIsPipelineOrFreestyle] = useState(false);
  const [hasUnsupportedParameters, setHasUnsupportedParameters] = useState(false);
  const [selectedPackageName, setSelectedPackageName] = useState('');

  const handleDialogSubmit = async () => {
    try {
      // Sanitize and split the job name for multibranch
      const sanitizedName = currentJobData.name.replace(/&gt;&gt;/g, '>>').replace(/&gt;/g, '>');
      let pipelineName = sanitizedName;
      let branchName = null;
      if (sanitizedName.includes('>>')) {
        const [parent, branch] = sanitizedName.split('>>').map(s => s.trim());
        pipelineName = parent;
        branchName = branch;
      }
      const payload = branchName
        ? { pipelineName, branchName, parameters: formValues }
        : { pipelineName, parameters: formValues };
      const response = await fetch(`${backendBaseApiUrl}trigger-build`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!response.ok) {
        throw new Error(`Failed to trigger build. Status: ${response.status}`);
      }
      setShowDialog(false);
      setIsButtonDisabled(false);
      setSnackbarOpen(true);
    } catch (error) {
      log.error('Error triggering build:', error);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormValues((prevValues) => ({
      ...prevValues,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleCloseDialog = () => {
    setShowDialog(false);
    setIsButtonDisabled(false); // Disable the button
  };

  const handleSnackbarClose = () => {
    setSnackbarOpen(false);

  };

  const validateProjectType = async (pipelineName) => {
    try {
      const response = await fetch(`${backendBaseApiUrl}get-project-type?pipelineName=${encodeURIComponent(pipelineName)}`);
      if (!response.ok) {
        throw new Error(`Failed to fetch project type. Status: ${response.status}`);
      }
      const projectType = await response.json();
      // Check if the project type is valid 
      const validTypes = [
        'org.jenkinsci.plugins.workflow.job.WorkflowJob',
        'hudson.model.FreeStyleProject',
        'hudson.matrix.MatrixProject',
        'org.jenkinsci.plugins.workflow.multibranch.BranchJobProperty'
      ];
      const isValid = validTypes.includes(projectType.projectType)
      setIsPipelineOrFreestyle(isValid);
    } catch (error) {
      log.error('Error validating project type:', error);
      setIsPipelineOrFreestyle(false); // Default to false if an error occurs
    }
  };

  useEffect(() => {
    validateProjectType(pipelineName);
  }, [pipelineName]);

  const renderInputField = (param) => {
    const { name, type, defaultParameterValue, description, choices } = param;
    switch (type) {
      case 'StringParameterDefinition':
        return (
          <Form.Group key={name} className="mb-3">
            <Form.Label>{description || name}</Form.Label>
            <Form.Control
              type="text"
              name={name}
              label={description || ''}
              defaultValue={defaultParameterValue?.value || ''}
              onChange={handleChange}
              required
            />
          </Form.Group>
        );
      case 'BooleanParameterDefinition':
        return (
          <Form.Group key={name} className="mb-3">
            <Form.Check
              type="checkbox"
              name={name}
              label={description || name}
              defaultChecked={defaultParameterValue?.value || false}
              onChange={handleChange}
            />
          </Form.Group>
        );
      case 'ChoiceParameterDefinition':
        return (
          <Form.Group key={name} className="mb-3">
            <Form.Label>{description || name}</Form.Label>
            <Form.Control
              as="select"
              label={description || name}
              name={name}
              defaultValue={defaultParameterValue?.value || ''}
              onChange={handleChange}
            >
              {choices.map((choice, index) => (
                <option key={index} value={choice}>
                  {choice}
                </option>
              ))}
            </Form.Control>
          </Form.Group>
        );
      default:
        return (
          <Form.Group key={name} className="mb-3">
            <Form.Text className="text-danger" style={{ fontsize: 'medium' }} >
              {`It contains ${type}  which is not supported for triggering the pipeline directly.`}
            </Form.Text>
          </Form.Group>
        );
    }
  };

  async function getJobRunDetails(pipelineName, pageNumber, pageSize) {
    try {
      const jobBuildRes = await fetch(backendBaseApiUrl + 'build-details?pipelineDisplayName=' + pipelineName + '&pageNumber=' + pageNumber + '&pageSize=' + pageSize + '&durationDaysCatalog=' + durationDaysCatalog);
      if (jobBuildRes.ok) {
        const jobRunDetails = await jobBuildRes.json();
        setpaginationData(jobRunDetails);
      } else {
        setBuildDetailsError(`Error fetching Jenkins job build details, with status code ${jobBuildRes.status} `);
      }
      setCardLoading(false);
    } catch (error) {
      log.error('Error:', error);
      setBuildDetailsError(error.message);
      setCardLoading(false);
    }
  }

  const handleTriggerPipeline = async (pipelineName) => {
    try {
      let fullPipelineName = pipelineName.replace(/&gt;&gt;/g, '>>').replace(/&gt;/g, '>');
      let branchName = null;
      if (pipelineName.includes('>>')) {
        const [parentJob, branch] = pipelineName.split('>>').map(part => part.trim());
        pipelineName = parentJob;
        branchName = branch;
      } setIsButtonDisabled(true);
      setIsDialogLoading(true);
      const response = await fetch(
        `${backendBaseApiUrl}check-parameters?pipelineName=${encodeURIComponent(fullPipelineName)}`
      );
      if (!response.ok) {
        throw new Error(`Failed to check parameters. Status: ${response.status}`);
      }
      const data = await response.json();
      if (data.isParameterized) {
        const initialFormValues = {};
        let unsupportedFound = false;
        data.parameters.forEach((param) => {
          initialFormValues[param.name] = param.defaultParameterValue?.value || '';
          // Check for unsupported parameter types
          if (
            param.type !== 'StringParameterDefinition' &&
            param.type !== 'BooleanParameterDefinition' &&
            param.type !== 'ChoiceParameterDefinition'
          ) {
            unsupportedFound = true;
          }
        });
        setFormValues(initialFormValues);
        setParameters(data.parameters);
        setHasUnsupportedParameters(unsupportedFound);
        setShowDialog(true);
      } else {
        const payload = branchName
          ? { pipelineName, branchName } // For multibranch pipelines
          : { pipelineName }; // For other pipelines
        const triggerResponse = await fetch(`${backendBaseApiUrl}trigger-build`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
        });
        if (!triggerResponse.ok) {
          throw new Error(`Failed to trigger build. Status: ${triggerResponse.status}`);
        }
        setSnackbarOpen(true);
      }
      setSelectedPackageName('');
    } catch (error) {
      log.error('Error in handleTriggerPipeline:', error);
      setIsDialogLoading(false);
      setIsButtonDisabled(false); // Re-enable the button
    }
  };

  const triggerBuild = async (pipelineName, parameters = []) => {
    try {
      const response = await fetch(`${backendBaseApiUrl}trigger-build`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          pipelineName,
          parameters,
        }),
      });
      if (!response.ok) {
        throw new Error(`Failed to trigger build. Status: ${response.status}`);
      }
      setSnackbarOpen(true);
    } catch (error) {
      log.error('Error triggering build:', error);
    }
  };
  const handlePageChange = (page) => {
    setCurrentPage(page);
    getJobRunDetails(currentJobData.name, page, itemsPerPage);
  };
  useEffect(() => {
    getJobRunDetails(currentJobData.name, 1, itemsPerPage);
  }, []);
  if (cardLoading) {
    return (
      <div className="App p-3" style={{ display: 'flex', justifyContent: 'center', alignItems: 'flex-start', height: '100vh', paddingTop: '30%' }}>
        Loading...
      </div>
    );
  }

  function renderFailurePopMessage(item) {
    if (item.projectType === 'pipeline-multibranch') {
      return (
        <>
          <div><b>Message: </b>{item.errorMessage || 'No details available'}</div>
          <div><b>StageName: </b>{item.stageName || 'null'}</div>
          <div><b>Build URL: </b><a href={item.url} target="_blank" rel="noopener noreferrer" style={{ color: '#3f51b5' }}>Link <OpenInNewIcon fontSize="small" /></a></div>
        </>
      );
    } else if (item.projectType === 'freestyle-multiconfig') {
      return (
        <>
          <div><b>Last 4 console lines: </b>......{item.errorMessage || 'No details available'}</div>
          <div><b>Build URL: </b><a href={item.url} target="_blank" rel="noopener noreferrer" style={{ color: '#3f51b5' }}>Link <OpenInNewIcon fontSize="small" /></a></div>
        </>
      );
    } else {
      return null;
    }
  };

  function TriggerPipelineButton(isPackageRequired = false) {
    const isTriggerButtonDisabled = isButtonDisabled || (isPackageRequired && !selectedPackageName);
    return <button
      className="btn btn-sm btn-outline-primary"
      onClick={(e) => {
        e.stopPropagation(); // Prevent any unwanted behavior
        handleTriggerPipeline(currentJobData.name); // Pass the pipeline name
      } }
      disabled={isTriggerButtonDisabled}
      style={{
        backgroundColor: isTriggerButtonDisabled ? 'white' : '#232f8e',
        color: isTriggerButtonDisabled ? '#232f8e' : 'white',
        border: '1px solid #232f8e',
        cursor: isTriggerButtonDisabled ? 'not-allowed' : 'pointer',
        width: '150px',
        height: '30px',
        fontSize: '12px',
        lineHeight: '20px',
        marginLeft: '20px',
      }}
    >
      Trigger Pipeline
    </button>;
  }

  function packageSelectDropdown() {
    return <div>
      <FormControl style={{ marginBottom: '8px', width: '15rem' }}>
        <InputLabel id="package-name-label">Package Name</InputLabel>
        <Select
          labelId="package-name-label"
          id="package-name-select"
          value={selectedPackageName}
          label="Package Name"
          onChange={e => setSelectedPackageName(e.target.value)}
          displayEmpty
        >
          <MenuItem value="">
            <em></em>
          </MenuItem>
          {packageNameOptions.map(option => (
            <MenuItem key={option} value={option}>{option}</MenuItem>
          ))}
        </Select>
      </FormControl>
    </div>;
  }

  return (
    <div>
      <div className={`row ${classes.cardcontent}`}>
        {[...Array(Math.ceil(paginationData.length / 4))].map((_, rowIndex) => {
          const uniqueKey = paginationData.slice(rowIndex * 4, (rowIndex + 1) * 4).map(item => item.id).join('-');
          return (
            <div key={uniqueKey} className="row mt-2">
              {paginationData.slice(rowIndex * 4, (rowIndex + 1) * 4).map((item, index) => (
                <div key={item.id} className="col-md-3 mb-3">
                  <div
                    className={`card ${classes.card1}`}
                    style={{
                      backgroundColor: 'white',
                      borderColor: getStatusColor(item.status),
                      borderWidth: 'thin',
                      borderStyle: 'solid'
                    }}
                  >
                    <h5
                      ref={textRef}
                      className={`card-title me-2 ${classes.cardTitle} ${classes.customText}`}
                    >
                      <a href={item.url} target="_blank" rel="noopener noreferrer" className={`${classes.hoverUnderline}`}
                        style={{
                          color: getStatusColor(item.status)
                        }}>
                        {item.name}
                      </a>
                    </h5>
                    <span className={`position-absolute top-0 end-0 m-2 ${classes.statusCss}`}>
                      {item.status === 'Failure' ? (
                        <OverlayTrigger
                          trigger="click"
                          placement="top"
                          rootClose
                          overlay={
                            <Popover id={`popover-${item.id}`}>
                              <Popover.Header as="h3">
                                {item.projectType === 'pipeline-multibranch' ? 'Failure Details' : 'Console Log'}
                              </Popover.Header>
                              <Popover.Body>
                                {renderFailurePopMessage(item)}
                              </Popover.Body>
                            </Popover>
                          }
                        >
                          <span className={`${classes.idCss}`}>
                            <ErrorIcon fontSize="small" /> Failed
                          </span>
                        </OverlayTrigger>
                      ) : (
                        item.status // Show the status value for other cases
                      )}
                    </span>
                    <div
                      className={`card-body mt-2 ms-2 me-2 text-white ${classes.cardBody}`}
                      ref={tooltipRef}
                      data-bs-toggle="tooltip"
                      data-bs-placement="top"
                      title={item.name}
                      style={{ backgroundColor: 'white' }}
                    >
                    </div>

                    <div
                      className={`shadow p-2 mb-0 text-white ${classes.customDiv}`}
                      style={{
                        backgroundColor: getStatusColor(item.status)
                      }}
                    >
                      <div>
                        <CalendarMonthIcon style={{ fontSize: '1rem', marginRight: '1px', margin: "1px" }} />
                        <span className={classes.calendericon}>
                          {item.dateandtime}
                        </span>
                        <span className={`float-end ${classes.durationCss}`}>
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
                </div>
              ))}
            </div>
          );
        })}
      </div>
      {paginationData.length > 0 && (
        <Row
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            width: '100%',
          }}
        >
          {/* Trigger Pipeline Button with package selection */}
          {isTriggerEnabled && isPipelineOrFreestyle && packageNameOptions.length > 0 && (
            <div style={{ display: 'flex', alignItems: 'left', flexDirection: 'row', border: '1px solid #ccc', padding: '10px', borderRadius: '5px',
                          width: '30rem',
                          marginLeft: '1rem',
                          }}>
              {packageSelectDropdown()}
              <div style={{ display: 'flex', justifyContent: 'flex-start', alignSelf: 'center' }}>
                {TriggerPipelineButton(true)}
              </div>
            </div>
          )}

          {/* Trigger Pipeline Button */}
          {isTriggerEnabled && isPipelineOrFreestyle && (packageNameOptions.length === 0) && (
            TriggerPipelineButton()
          )}

          <div
            style={{
              marginLeft: "15px",
              paddingbutton: isTriggerEnabled ? '-30px' : '0px', // Move pagination up if the button is present
            }}
          >
            <nav aria-label="Page navigation example">
              <ul
                className={`pagination justify-content-end ${classes.ulCss} ${classes.customPagination}`}
              >
                <li
                  className={`${isPreviousDisabled ? 'disabled' : ''} ${classes.liCss} ${classes.numCss}`}
                >
                  <button
                    aria-label="Previous"
                    tabIndex={-1}
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={isPreviousDisabled}
                    className={`${classes.liCss} ${classes.btnCss}`}
                    style={{ backgroundColor: '#232f8e' }}
                  >
                    <span aria-hidden="true" className={`${classes.previous}`}>
                      &lsaquo;
                    </span>
                  </button>
                </li>
                <li className={`${classes.liCss} ${classes.numCss}`}>
                  <span className={`${classes.current}`}>{currentPage}</span>
                </li>
                <li
                  className={`${isNextDisabled ? 'disabled' : ''} ${classes.liCss} ${classes.numCss}`}
                >
                  <button
                    aria-label="Next"
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={isNextDisabled}
                    className={`${classes.liCss} ${classes.btnCss}`}
                    style={{ backgroundColor: '#232f8e' }}
                  >
                    <span aria-hidden="true" className={`${classes.previous}`}>
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
                  {currentRange.start} - {currentRange.end} of {currentJobData.totalBuilds}
                </li>
              </ul>
            </nav>
          </div>
        </Row>
      )}
      <Modal className={`${classes.modalbox}`} show={showDialog} onHide={handleCloseDialog}>

        <Modal.Title className={`${classes.modalTitle}`}>Trigger Pipeline</Modal.Title>

        <Modal.Body>
          <>
            <Form>
              {parameters.map((param) => renderInputField(param))}
            </Form>
          </>
        </Modal.Body>
        <Modal.Footer className={`${classes.modalFooter}`}>
          <Button className={`${classes.Cancelbtn}`} onClick={handleCloseDialog}>
            Cancel
          </Button>
          <Button className={`${classes.Submitbtn}`}
            onClick={handleDialogSubmit}
            disabled={hasUnsupportedParameters}  >
            Submit
          </Button>
        </Modal.Footer>
      </Modal>
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
        message="Pipeline triggered successfully"
        action={
          <Button color="inherit" size="small" onClick={handleSnackbarClose}>
            Close
          </Button>
        }
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      />

    </div>
  );

};

export default CiCdCardComponent;
// Helper function to get status color
const getStatusColor = (status) => {
  switch (status) {
    case 'Success':
      return '#44b98c';
    case 'Failure':
      return '#e76c71';
    case 'In Progress':
      return '#F29F58';
    case 'Aborted':
    case 'Unstable':
    case 'Not Built':
      return '#9e9e9e';
    default:
      return '#e76c71';
  }
};
