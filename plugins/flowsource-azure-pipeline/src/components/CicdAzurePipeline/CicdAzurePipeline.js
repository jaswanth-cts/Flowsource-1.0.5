import React, { useState , useEffect } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import cssClasses from './CicdAzurePipelineCss';

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
  AlertTitle,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Grid,
} from '@mui/material';

import CiCdCardComponent from './CiCdCardComponent';
import PluginVersion from '../PluginVersion/PluginVersion';

import log from 'loglevel';

const Spacer = () => <div className="mb-4" />; // Spacer component

const CicdAzurePipeline = () => {
  const classes = cssClasses();
  const { fetch } = useApi(fetchApiRef);

  const [pipelineData, setPipelineData] = useState([]);
  const [isLoading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedAccordion, setExpandedAccordion] = useState(null);
  const config = useApi(configApiRef);
  const backendBaseApiUrl =
    config.getString('backend.baseUrl') + '/api/azure-pipeline/';
  const entity = useEntity();
  const projectName = entity.entity.metadata.annotations['flowsource/azure-project-name'];
  const pipelineNames = entity.entity.metadata.annotations['flowsource/azure-pipelines'];
  
  const maxPipelineLimit = 25;
  async function getPipelineData() {
    try {
      // Fetch pipeline details

      const pipelineRes = await fetch(
        backendBaseApiUrl +
          'pipeline-data?projectName=' +
          projectName +
          '&pipelineNames=' +
          pipelineNames +
          '&maxPipelineLimit=' +
          maxPipelineLimit,
      );

      if (pipelineRes.ok) {
        const result = await pipelineRes.json();
        setPipelineData(result.matchingPipelinesArray);
        setError(result.errorArray.join('\n'));
      } else if (pipelineRes.status === 503) {
        setError(
          `This plugin has not been configured with the required values. Please ask your administrator to configure it.`,
        );
      } 
      else if (pipelineRes.status === 404) {
        const errorData = await pipelineRes.json();

        if (errorData.error.includes("Project \"" + projectName + "\" not found")) {
          setError(`No project could be found with name "${projectName}" in Azure Pipelines. Please check the project name and try again.`);
        } else {
          setError(`Error fetching Azure pipeline details, with status code ${pipelineRes.status} `);
        }
      } else {
        setError(
          `Error fetching Azure pipeline details, with status code ${pipelineRes.status} `,
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
    getPipelineData();
  }, []);

  const handleAccordionChange = pipelineName => (event, isExpanded) => {
    if (isExpanded) {
      setExpandedAccordion(pipelineName);
    } else {
      setExpandedAccordion(null);
    }
  };

  const getAccordionColor = state => {
    switch (state) {
      case 'succeeded':
        return '#44b98c'; // Green
      case 'inProgress':
        return '#F29F58'; // Orange
      case 'awaitingApproval':
      case 'queued':
      case 'canceled':
        return '#9e9e9e'; // Grey
      default:
        return '#e76c71'; // for state (failed, timeout, expired) red color will be applicable by default
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
                  <b>Azure Pipeline</b>
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
        !pipelineData.length && ( // Show error if exists and no pipeline data
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
      {pipelineData.length > 0 &&
        !error && ( // Show pipeline data if exists and no error
          <div>
            {pipelineData.map((pipeline, index) => (
              <Accordion
                key={pipeline.id}
                expanded={expandedAccordion === pipeline.name} // Check if expandedAccordion matches pipeline name
                onChange={handleAccordionChange(pipeline.name)} // Pass pipeline name to handleAccordionChange
              >
                <AccordionSummary
                  expandIcon={<ExpandMoreIcon />}
                  aria-controls={`panel${index}-content`}
                  id={`panel${index}-header`}
                  style={{ backgroundColor: '#92bbe6' }}
                >
                  <div
                    style={{
                      width: '16px',
                      height: '16px',
                      borderRadius: '4px',
                      backgroundColor: getAccordionColor(pipeline.status),
                      marginRight: '8px',
                    }}
                  ></div>
                  <Typography>{pipeline.name}</Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <Typography>{pipeline.content}</Typography>
                  {expandedAccordion === pipeline.name && (
                    <div>
                      <CiCdCardComponent currentpipelineData={pipeline} />
                    </div>
                  )}
                </AccordionDetails>
              </Accordion>
            ))}
          </div>
        )}
      {error &&
        pipelineData.length > 0 && ( // Show both error and pipeline data if both exist
          <div>
            <div className="card me-0 mb-0 mt-2">
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
            {pipelineData.map((pipeline, index) => (
              <Accordion
                key={pipeline.id}
                expanded={expandedAccordion === pipeline.name} // Check if expandedAccordion matches pipeline name
                onChange={handleAccordionChange(pipeline.name)} // Pass pipeline name to handleAccordionChange
              >
                <AccordionSummary
                  expandIcon={<ExpandMoreIcon />}
                  aria-controls={`panel${index}-content`}
                  id={`panel${index}-header`}
                  style={{ backgroundColor: '#92bbe6' }}
                >
                  <div
                    style={{
                      width: '16px',
                      height: '16px',
                      borderRadius: '4px',
                      backgroundColor: getAccordionColor(pipeline.status),
                      marginRight: '8px',
                    }}
                  ></div>
                  <Typography>{pipeline.name}</Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <Typography>{pipeline.content}</Typography>
                  {expandedAccordion === pipeline.name && (
                    <div>
                      <CiCdCardComponent currentpipelineData={pipeline} />
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

export default CicdAzurePipeline;
