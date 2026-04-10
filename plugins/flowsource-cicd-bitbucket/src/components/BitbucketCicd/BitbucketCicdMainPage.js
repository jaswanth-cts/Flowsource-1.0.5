import React, { useState , useEffect } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import cssClasses from './BitbucketCicdCss';

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

import BitbucketCiCdCardComponent from './BitbucketCicdCardComponent';
import PluginVersion from '../PluginVersion/PluginVersion';

import log from 'loglevel';

const Spacer = () => <div className="mb-4" />; // Spacer component

export const BitbucketCicdMainPage = () => {
  const classes = cssClasses();
  const { fetch } = useApi(fetchApiRef);

  const [pipelineData, setPipelineData] = useState([]);
  const [isLoading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedAccordion, setExpandedAccordion] = useState(null);
  const config = useApi(configApiRef);
  const backendBaseApiUrl =
    config.getString('backend.baseUrl') + '/api/flowsource-cicd-bitbucket/';
  const entity = useEntity();
  const repoName =
    entity.entity.metadata.annotations['flowsource/bitbucket-repo-name'];
  const repoOwner =
    entity.entity.metadata.annotations['flowsource/bitbucket-repo-owner'];
  const pipelineNames =
    entity.entity.metadata.annotations['flowsource/bitbucket-pipelines'];
  const durationDaysCatalog =
    entity.entity.metadata.annotations['flowsource/durationInDays'];
  const hostFromCatalog =
    entity.entity.metadata.annotations['flowsource/bitbucket-host'] || '';
  async function getPipelineData() {
    try {
      // Fetch pipeline details
      const pipelineRes = await fetch(
        `${backendBaseApiUrl}bitbucket-workflow?repoName=${repoName}&repoOwner=${repoOwner}&pipelineNames=${pipelineNames}&durationDaysCatalog=${durationDaysCatalog}&hostFromCatalog=${hostFromCatalog}`,
      );

      if (pipelineRes.ok) {
        const result = await pipelineRes.json();

        setPipelineData(result.matchingPipelinesArray);
        setError(result.errorArray.join('\n'));
      } else if (pipelineRes.status === 503) {
        setError(
          `This plugin has not been configured with the required values. Please ask your administrator to configure it`,
        );
      } else {
        setError(
          `Error fetching Bitbucket pipeline details, with status code ${pipelineRes.status} `,
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

  const getAccordionColor = state => {
    log.info("__MD__ state "+ state);
    switch (state) {
      case 'Success':
      return '#44b98c'; // green
      case 'In Progress':
      return '#F29F58'; // orange
      case 'Stopped':
      return '#9e9e9e'; // grey
      default:
      return '#e76c71'; // red
    }
  };

  const handleAccordionChange = pipelineName => (event, isExpanded) => {
    if (isExpanded) {
      setExpandedAccordion(pipelineName);
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
                <b>Bitbucket Cloud</b>
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
          <div>
            <Card>
              <CardHeader title={<Typography variant="h6">Error</Typography>} />
              <Divider />
              <CardContent>
                <Paper role="alert" elevation={0}>
                  <Alert severity="error">{error}</Alert>
                </Paper>
              </CardContent>
            </Card>
            <Spacer />
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
                  style={{
                    backgroundColor: '#92bbe6',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                  <div
                    style={{
                      width: '16px',
                      height: '16px',
                      borderRadius: '4px',
                      backgroundColor: getAccordionColor(pipeline.pipelineState),
                      marginRight: '8px',
                    }}
                  ></div>
                  <Typography>{pipeline.name}</Typography></div>
                </AccordionSummary>
                <AccordionDetails>
                  <Typography>{pipeline.content}</Typography>
                  {
                    expandedAccordion === pipeline.name && (
                      <div>
                        <BitbucketCiCdCardComponent
                          pipelineName={pipeline.name}
                          repoName={repoName}
                          repoOwner={repoOwner}
                          hostFromCatalog={hostFromCatalog}
                          durationDaysCatalog={durationDaysCatalog}
                          backendBaseApiUrl={backendBaseApiUrl}
                        />
                      </div>
                    )
                  }
                </AccordionDetails>
              </Accordion>
            ))}
          </div>
        )}
      {error &&
        pipelineData.length > 0 && ( // Show both error and pipeline data if both exist
          <div>
            <Card>
              <CardHeader title={<Typography variant="h6">Error</Typography>} />
              <Divider />
              <CardContent>
                <Paper role="alert" elevation={0}>
                  <Alert severity="error">{error}</Alert>
                </Paper>
              </CardContent>
            </Card>
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
                  style={{
                    backgroundColor: '#92bbe6',
                  }}
                >
                  <Typography>{pipeline.name}</Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <Typography>{pipeline.content}</Typography>
                  {expandedAccordion === pipeline.name && (
                    <div>
                      <BitbucketCiCdCardComponent
                          pipelineName={pipeline.name}
                          repoName={repoName}
                          repoOwner={repoOwner}
                          hostFromCatalog={hostFromCatalog}
                          durationDaysCatalog={durationDaysCatalog}
                          backendBaseApiUrl={backendBaseApiUrl}
                        />
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
