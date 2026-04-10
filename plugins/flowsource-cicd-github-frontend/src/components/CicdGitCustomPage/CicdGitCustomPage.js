import React, { useState , useEffect } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import cssClasses from './CicdGitCustomPageCss';

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

import CiCdCardComponent from './CiCdCardComponent';

import PluginVersion from '../PluginVersion/PluginVersion';

import log from 'loglevel';

const Spacer = () => <div className="mb-4" />; // Spacer component

const CicdGitCustomPage = () => {
  const classes = cssClasses();
  const { fetch } = useApi(fetchApiRef);

  const [workflowData, setWorkflowData] = useState([]);
  const [isLoading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedAccordion, setExpandedAccordion] = useState(null);
  const config = useApi(configApiRef);
  const backendBaseApiUrl = config.getString('backend.baseUrl') + '/api/flowsource-cicd/';
  const entity = useEntity();
  
  const githubWorkflowName = entity.entity.metadata.annotations['flowsource/github-workflows'];
  const workflowNames = githubWorkflowName ? githubWorkflowName.toString() : '';
  
  const gitOwner = entity.entity.metadata.annotations['flowsource/github-repo-owner'];
  const gitRepo = entity.entity.metadata.annotations['flowsource/github-repo-name'];
  
  const maxWorkflowLimit = 25;

  async function getWorkflowData() {
    try {
      // Fetch workflow names
      const workflowNamesRes = await fetch(
        backendBaseApiUrl +
          'workflows?gitOwner=' +
          gitOwner +
          '&gitRepo=' +
          gitRepo +
          '&workflowNames=' +
          encodeURIComponent(workflowNames) +
          '&maxWorkflowLimit=' +
          maxWorkflowLimit,
      );
      if (workflowNamesRes.ok) {
        const result = await workflowNamesRes.json();

        setWorkflowData(result.matchingWorkflowsArray);
        setError(result.errorArray.join('\n'));
      } else {
        if (workflowNamesRes.status === 503) {
          setError(
            `This plugin has not been configured with the required values. Please ask your administrator to configure it`,
          );
        } else if(workflowNamesRes.status === 404) {
          const errorData = await workflowNamesRes.json();

          if(errorData.error.includes("Incorrect git owner or repo")) {
            setError( `No repository found with git-owner: "${gitOwner}" and git-repo: "${gitRepo}" in GitHub Actions. `
            + `Please validate git-owner and git-repo if they have been configured correctly and try again.`);
          } else {
            setError(
              `Error fetching github workflow details, with status code ${workflowNamesRes.status} `,
            );
          }
        } 
        else
          setError(
            `Error fetching github workflow details, with status code ${workflowNamesRes.status} `,
          );
      }

      setLoading(false);
    } catch (error) {
      log.error('Error:', error);
      setLoading(false);
      setError(error.message);
    }
  }

  useEffect(async () => {
    getWorkflowData();
  }, []);

  const getAccordionColor = state => {
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

  const handleAccordionChange = workflowId => (event, isExpanded) => {
    if (isExpanded) {
      setExpandedAccordion(workflowId);
    } else {
      setExpandedAccordion(null);
    }
  };

  return (
    <div className={`${classes.paddingchn}`}>
      <div className={`row`}>
        <div className={`col-12`}>
          <div className={`${classes.pluginHeading}`}>
            <div>
              <h5>
                <p>
                  <b>GitHub Actions</b>
                </p>
              </h5>
            </div>
            <div>
              <PluginVersion />
            </div>
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
      {error &&
        !workflowData.length && ( // Show error if exists and no workflow data
          <div className="card me-1 mb-1 mt-2">
            <div className="card-header">
              <h6 className="mb-0">Error</h6>
            </div>
            <div className="card-body">
              <div className="alert alert-danger mt-2 mb-2" role="alert" style={{ 'white-space': 'pre-wrap' }}>
                {error}
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
                        backgroundColor: getAccordionColor(
                          workflow.workflowState,
                        ),
                        marginRight: '8px',
                      }}
                    ></div>
                    <Typography>{workflow.name}</Typography>
                  </div>{' '}
                </AccordionSummary>
                <AccordionDetails>
                  <Typography>{workflow.content}</Typography>
                  {expandedAccordion === workflow.id && (
                    <div>
                      <CiCdCardComponent currentWorkFlowData={workflow} />
                    </div>
                  )}
                </AccordionDetails>
              </Accordion>
            ))}
          </div>
        )}
      {error &&
        workflowData.length > 0 && ( // Show both error and workflow data if both exist
        <div>
          <div className="card me-0 mb-1 mt-2">
            <div className="card-header">
              <h6 className="mb-0">Error</h6>
            </div>
            <div className="card-body">
              <div className="alert alert-danger mt-2 mb-2" role="alert" style={{ 'white-space': 'pre-wrap' }}>
                {error}
              </div>
            </div>
          </div>
          <Spacer />
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
                        backgroundColor: getAccordionColor(
                          workflow.workflowState,
                        ),
                        marginRight: '8px',
                      }}
                    ></div>
                    <Typography>{workflow.name}</Typography>
                  </div>
                </AccordionSummary>
                <AccordionDetails>
                  <Typography>{workflow.content}</Typography>
                  {expandedAccordion === workflow.id && (
                    <div>
                      <CiCdCardComponent currentWorkFlowData={workflow} />
                    </div>
                  )}
                </AccordionDetails>
              </Accordion>
            ))}
          </div>
        )}
    </div>
  );
};

export default CicdGitCustomPage;
