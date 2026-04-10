import React, { useState, useEffect } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import cssClasses from './CicdGcpCustomPageCss';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

import { configApiRef, useApi, fetchApiRef } from '@backstage/core-plugin-api';
import { useEntity } from '@backstage/plugin-catalog-react';

import {
  Paper,
  Card,
  CardHeader,
  Typography,
  Divider,
  CardContent,
  Alert,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from '@mui/material';

import CiCdCardComponent from './CiCdGcpCardComponent';
import PluginVersion from '../PluginVersion/PluginVersion';

import log from 'loglevel';

const Spacer = () => <div className="mb-4" />; // Spacer component

const CicdGcpCustomPage = () => {
  const classes = cssClasses();
  const { fetch } = useApi(fetchApiRef);

  const [workflowData, setWorkflowData] = useState([]);
  const [, setGithubOwner] = useState([]);
  const [isLoading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedAccordion, setExpandedAccordion] = useState(null);
  const [exceedingLimit, setExceedingLimit] = useState(null);
  const config = useApi(configApiRef);
  const backendBaseApiUrl =
    config.getString('backend.baseUrl') + '/api/flowsource-cicd-gcp/';
  const entity = useEntity();
  const gcpPipelineName = entity.entity.metadata.annotations['flowsource/gcp-pipelines'];
  const gcpRegion = entity.entity.metadata.annotations['flowsource/gcp-region'];

  const pipelineNames = gcpPipelineName ? gcpPipelineName.toString() : '';
  const region = gcpRegion ? gcpRegion.toString() : '';

  async function getWorkflowData() {
    try {
      let pipelineName = pipelineNames.split(',');
      let selectedPipelineName = pipelineName.splice(0, 25); // This modifies pipelineNames and removes the first 25 elements
      let extraPipelineNames = pipelineName; // This now contains the remaining elements after the first 25 have been removed
      // Fetch pipeline data
      const workflowNamesRes = await fetch(
        backendBaseApiUrl +
        'pipelines?pipelineNames=' +
        selectedPipelineName +
        '&region=' +
        region,
      );
      if (workflowNamesRes.ok) {
        const result = await workflowNamesRes.json();
        setWorkflowData(result.latestBuilds);
        setGithubOwner(result.gitOwner);
        let errorMessage = '';
        if (result.clientErrorMessage.pipelineError) {
          errorMessage = result.clientErrorMessage.pipelineError;
        }
        if (result.clientErrorMessage.sourceError) {
          errorMessage += '\n\n' + result.clientErrorMessage.sourceError;
        }
        setError(errorMessage);
        setExceedingLimit(joinWithCommas(extraPipelineNames));
      } else {
        if(workflowNamesRes.status === 503) {
          setError(
            `This plugin has not been configured with the required values. Please ask your administrator to configure it`,
          );
        } else if(workflowNamesRes.status === 404) {
          const errorData = await workflowNamesRes.json();

          if (errorData.error.includes("Invalid GCP Region")) {
            setError(`Invalid argument error encountered. Please validate your GCP-region annotation, which is \"${ region }\" and try again.`);
          } else {
            setError(`Error fetching gcp code build project & code pipeline details, with status code ${workflowNamesRes.status}.`);
          }
        } else {
          setError(
            `Error fetching gcp code build project & code pipeline details, with status code ${workflowNamesRes.status}.`,
          );
        } 
      }

      setLoading(false);
    } catch (error) {
      log.error('Error:', error);
      setLoading(false);
      setError(error.message);
    }
  }

  useEffect(() => {
    getWorkflowData();
  }, []);
 
  function joinWithCommas(arr) {
    return arr.map(name => `"${name}"`).join(' , ');
}
 
const getAccordionColor = (state) => {
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

  const handleAccordionChange = workflowId => (event, isExpanded) => {
    if (isExpanded) {
      setExpandedAccordion(workflowId);
    } else {
      setExpandedAccordion(null);
    }
  };

  return (
    <div className="container">
      <div className={`row`}>
        <div className={`${classes.pluginHeading}`}>
          <div>
            <h5>
              <p>
                <b>GCP Cloud Build</b>
              </p>
            </h5>
          </div>
          <div>
            <PluginVersion />
          </div>
        </div>
      </div>
      {isLoading && (
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
      )}
      {(error &&
        !workflowData.length || exceedingLimit)  && ( // Show error if exists and no workflow data
          <div className="card ms-0 me-0 mb-1 mt-2">
            <div className="card-header">
              <h6 className="mb-0">Error</h6>
            </div>
            <div className="card-body">
              <div className="alert alert-danger mt-2 mb-2" role="alert">
                <p className="mb-0">{error}</p>
                {exceedingLimit && (
                  <p className="mb-0">Max allowed workflow is 25, following pipelines are skipped {exceedingLimit}</p>
                )}
              </div>
            </div>
          </div>
        )}
      {workflowData.length > 0 &&
        !error && ( // Show workflow data if exists and no error
          <div>
            {workflowData.map((workflow, index) => (
              <Accordion
                key={workflow.id}
                expanded={expandedAccordion === workflow.id} // Check if expandedAccordion matches workflow id
                onChange={handleAccordionChange(workflow.id)} // Pass workflow id to handleAccordionChange
              >
                <AccordionSummary
                  expandIcon={<ExpandMoreIcon />}
                  aria-controls={`panel${index}-content`}
                  id={`panel${index}-header`}
                  style={{ backgroundColor: '#92bbe6', position: 'relative' }}
                >
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                                            <div
                                                style={{
                                                    width: '16px',
                                                    height: '16px',
                                                    borderRadius: '4px',
                                                    backgroundColor: getAccordionColor(workflow.workflowState),
                                                    marginRight: '8px'
                                                }}
                                            ></div>
                  <Typography>{workflow.name}</Typography>
                  </div>
                </AccordionSummary>
                <AccordionDetails>
                  <Typography>{workflow.content}</Typography>
                  {expandedAccordion === workflow.id && (
                    <div>
                      {workflow.length === 0 ? (
                                                    <Typography>No builds found.</Typography>
                                                ) : (
                      <CiCdCardComponent currentWorkFlowData={workflow} />)}
                    </div>
                  )}
                </AccordionDetails>
              </Accordion>
            ))}
          </div>
        )}

      {error && workflowData.length > 0 && (
        <>
          <div className="card ms-0 me-0 mb-1 mt-2">
            <div className="card-header">
              <h6 className="mb-0">Error</h6>
            </div>
            <div className="card-body">
              <div className="alert alert-danger mt-2 mb-2" role="alert">
                <p className="mb-0">{error}</p>
                {exceedingLimit && (
                  <p className="mb-0">Max allowed workflow is 25, following pipelines are skipped {exceedingLimit}</p>
                )}
              </div>
            </div>
          </div>
          <Spacer />
          { workflowData.map((workflow, index) => (
            <Accordion
              key={workflow.id}
              expanded={expandedAccordion === workflow.id} // Check if expandedAccordion matches workflow id
              onChange={handleAccordionChange(workflow.id)} // Pass workflow id to handleAccordionChange
            >
              <AccordionSummary
                expandIcon={<ExpandMoreIcon />}
                aria-controls={`panel${index}-content`}
                id={`panel${index}-header`}
                style={{ backgroundColor: '#92bbe6', position: 'relative' }}
              >
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <div
                    style={{
                      width: '16px',
                      height: '16px',
                      borderRadius: '4px',
                      backgroundColor: getAccordionColor(workflow.workflowState),
                      marginRight: '8px'
                    }}
                  ></div>
                  <Typography>{workflow.name}</Typography>
                </div>
              </AccordionSummary>
              <AccordionDetails>
                <Typography>{workflow.content}</Typography>
                {expandedAccordion === workflow.id && (
                  <div>
                    {workflow.length === 0 ? (
                      <Typography>No builds found.</Typography>
                    ) : (
                      <CiCdCardComponent currentWorkFlowData={workflow} />)}
                  </div>
                )}
              </AccordionDetails>
            </Accordion>
          ))}
        </>
      )}
    </div>
  );
};

export default CicdGcpCustomPage;