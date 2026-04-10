import { configApiRef, useApi, fetchApiRef } from '@backstage/core-plugin-api';
import { useEntity } from '@backstage/plugin-catalog-react';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Alert,
  Card,
  CardContent,
  CardHeader,
  Divider,
  Paper,
  Typography,
} from '@mui/material';
import 'bootstrap/dist/css/bootstrap.min.css';
import React, { useEffect, useState } from 'react';
import CiCdCardComponent from './CicdAwsCardComponent';
import cssClasses from './CicdAwsCustomPageCss';
import PluginVersion from '../PluginVersion/PluginVersion';

import log from 'loglevel';

const Spacer = () => <div className="mb-4" />; // Spacer component

const CicdAwsCustomPage = () => {
  const classes = cssClasses();
  const { fetch } = useApi(fetchApiRef);

  const [pipelineData, setPipelineData] = useState([]);
  const [isLoading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedAccordion, setExpandedAccordion] = useState(null);

  const config = useApi(configApiRef);
  const backendBaseApiUrl =
    config.getString('backend.baseUrl') + '/api/flowsource-cicd-aws/';
  const entity = useEntity();
  const awsPipelineName = entity.entity.metadata.annotations['flowsource/aws-pipelines'];
  const region = entity.entity.metadata.annotations['flowsource/aws-region'];

  const pipelineNames = awsPipelineName ? awsPipelineName.toString() : '';

  async function getPipelineData() {
    try {
      const pipelineNamesRes = await fetch(
        backendBaseApiUrl +
          'listPipeline?pipelineNames=' +
          pipelineNames +
          '&region=' +
          region,
      );
      if (pipelineNamesRes.ok) 
      {
        const result = await pipelineNamesRes.json();
        setPipelineData(result.buildDetailsByInitiator);
        
        let errorMessage = '';
        if (result.clientErrorMessage.pipelineError) {
          errorMessage = result.clientErrorMessage.pipelineError;
          
          const notFoundPipelines = errorMessage.split('pipeline:')[1]?.trim();
          setError(`No pipelines found with the name "${notFoundPipelines}" in AWS CodePipeline. Please check the pipeline name and retry.`);
        }

      } else {
        if (pipelineNamesRes.status === 503) {
          setError(
            `This plugin has not been configured with the required values. Please ask your administrator to configure it`,
          );
        } else if (pipelineNamesRes.status === 404) {
          
          const errorMessage = await pipelineNamesRes.json();

          if(errorMessage.error.includes("AWS Hostname could not be resolved.")) {
            setError("AWS hostname could not be resolved. Please validate your aws-region annotation, which is \"" + region + "\" or check your network connection and retry.");
          } else {
            setError(`Error fetching aws code build project & code pipeline details, with status code ${pipelineNamesRes.status}.`);
          }
        }
        else {
          setError(`Error fetching aws code build project & code pipeline details, with status code ${pipelineNamesRes.status}.`);
        }
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

  const getAccordionColor = state => {
    switch (state) {
      case 'Succeeded':
        return '#44b98c';
      case 'Failed':
        return '#e76c71';
      case 'InProgress':
        return '#F29F58';
      case 'Stopped':
      case 'Stopping':
      case 'Cancelled':
        return '#9e9e9e';
      default:
        return '#e76c71';
    }
  };

  const handleAccordionChange = pipelineId => (event, isExpanded) => {
    setExpandedAccordion(isExpanded ? pipelineId : null);
  };

  return (
    <div className="container">
      <div className={`row`}>
        <div className={`${classes.pluginHeading}`}>
          <div>
            <h5>
              <p>
                <b>AWS CodeBuild</b>
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
      {error &&
        !pipelineData.length && ( // Show error if exists and no pipeline data
          <div className="card mt-2">
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
                expanded={expandedAccordion === pipeline.id} // Check if expandedAccordion matches pipeline id
                onChange={handleAccordionChange(pipeline.id)} // Pass pipeline id to handleAccordionChange
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
                        backgroundColor: getAccordionColor(pipeline.workflowState),
                        marginRight: '8px'
                      }}
                    >
                    </div>
                    <Typography>{pipeline.name}</Typography>
                  </div>
                </AccordionSummary>
                <AccordionDetails>
                  <Typography>{pipeline.content}</Typography>
                  {expandedAccordion === pipeline.id && (
                    <div>
                      <div>
                        {pipeline.length === 0 ? (
                          <Typography>No builds found.</Typography>
                        ) : (
                          <CiCdCardComponent currentPipelineData={pipeline} pipelineName={pipeline.name} />
                        )}
                      </div>
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
            <div className="card mt-2">
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
                expanded={expandedAccordion === pipeline.id} // Check if expandedAccordion matches pipeline id
                onChange={handleAccordionChange(pipeline.id)} // Pass pipeline id to handleAccordionChange
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
                        backgroundColor: getAccordionColor(pipeline.workflowState),
                        marginRight: '8px'
                      }}
                    >
                    </div>
                    <Typography>{pipeline.name}</Typography>
                  </div>
                </AccordionSummary>
                <AccordionDetails>
                  <Typography>{pipeline.content}</Typography>
                  {expandedAccordion === pipeline.id && (
                    <div>
                      <div>
                        {pipeline.length === 0 ? (
                          <Typography>No builds found.</Typography>
                        ) : (
                          <CiCdCardComponent currentPipelineData={pipeline} pipelineName={pipeline.name} />
                        )}
                      </div>
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

export default CicdAwsCustomPage;
