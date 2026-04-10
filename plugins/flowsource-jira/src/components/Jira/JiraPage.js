import React, { useState, useEffect } from 'react';
import 'chart.js/auto';
import { configApiRef, useApi, fetchApiRef } from '@backstage/core-plugin-api';
import { useEntity } from '@backstage/plugin-catalog-react';
import 'bootstrap/dist/css/bootstrap.min.css';

import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import Card from '@mui/material/Card';
import Paper from '@mui/material/Paper';
import CardHeader from '@mui/material/CardHeader';
import Divider from '@mui/material/Divider';
import CardContent from '@mui/material/CardContent';
import Alert from '@mui/material/Alert';

import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

import cssClasses from './JiraPageCss';

import IssueStatusBarChart from './IssueStatusBarChart';
import RequestByPriorityBarChart from './RequestByPriorityBarChart';
import JiraTableContent from './JiraTableContent';
import JiraBot from './JiraBot';

import PluginVersion from '../PluginVersion/PluginVersion';

import log from 'loglevel';

const Spacer = () => <div className="mb-4" />; // Spacer component

const JiraProjectNameAndIcon = ({ projectName, classes }) => {
  return (
    <div className={`${classes.infoContPrjName}`}>
      <Typography variant="h5" className={`${classes.infoContPrjNameContent}`}>
        Jira project name: {projectName}
      </Typography>
      <div className={`${classes.pluginVersion}`}>
        <PluginVersion />
      </div>
    </div>
  );
};

const JiraInfoContent = ({
  classes,
  error,
  graphDataError,
  storyDetailsError,
  issueCountError,
  issuesBarChart,
  reqByPriBarChart,
}) => {
  return (
    <div className={`${classes.jiraInfoContent}`}>
      {error ? (
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
      ) : (
        <>
          {(graphDataError ||
            storyDetailsError ||
            issueCountError) && (
            <div>
              <Card>
                <CardHeader
                  title={<Typography variant="h6">Error</Typography>}
                />
                <Divider />
                <CardContent>
                  <Paper role="alert" elevation={0}>
                    {graphDataError && (
                      <Alert severity="error">{graphDataError}</Alert>
                    )}
                    {storyDetailsError && (
                      <Alert severity="error">{storyDetailsError}</Alert>
                    )}
                    {issueCountError && (
                      <Alert severity="error">{issueCountError}</Alert>
                    )}
                  </Paper>
                </CardContent>
              </Card>
            </div>
          )}
          <Spacer />

          <div className={`row`}>
            <div className={`col-6`}>
              <Card variant="outlined" className={`${classes.chartCards}`}>
                <Typography
                  variant="body1"
                  className={`${classes.chartCardHeading}`}
                >
                  Issues by Status
                </Typography>
                {issuesBarChart && issuesBarChart.length > 0 ? (
                  <IssueStatusBarChart values={issuesBarChart} />
                ) : (
                  ''
                )}
              </Card>
            </div>
            <div className={`col-6`}>
              <Card variant="outlined" className={`${classes.chartCards}`}>
                <Typography
                  variant="body1"
                  className={`${classes.chartCardHeading}`}
                >
                  Issues by Priority
                </Typography>
                {reqByPriBarChart && reqByPriBarChart.chartLabels ? (
                  <RequestByPriorityBarChart values={reqByPriBarChart} />
                ) : (
                  ''
                )}
              </Card>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

const JiraIssueCards = ({
  issueTypes,
  issueCount,
  classes,
  setColor,
  error,
}) => {
  const generateContent = (issueType, issueCount) => {
    return issueCount?.[issueType.toLowerCase()] ? (
      <p className={`${classes.jiraIconIconValue}`}>
        {issueCount[issueType.toLowerCase()]}
      </p>
    ) : (
      <p style={{ marginTop: '10px' }}>No Data Available</p>
    );
  };

  return (
    <div>
      {!error && (
        <div className={`${classes.infoContPrjItems}`}>
          {issueTypes.map((issueType, index) => (
            <Card
              key={issueType}
              variant="outlined"
              className={`${classes.infoContPrjItemsCards}`}
            >
              <div className={`${classes.infoContPrjIcon}`}>
                <div
                  style={{ backgroundColor: setColor(index), width: '15%' }}
                />
                <div className={`${classes.infoContPrjIconContent}`}>
                  <Typography className={`${classes.jiraIconName}`}>
                    {issueType}
                  </Typography>
                  {issueCount?.[issueType.toLowerCase()] === 0 ? (
                    <p className={`${classes.jiraIconIconValue}`}>0</p>
                  ) : (
                    generateContent(issueType, issueCount)
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

const JiraPage = () => {
  const classes = cssClasses();
  const { fetch } = useApi(fetchApiRef);
  const config = useApi(configApiRef);
  const backendBaseApiUrl =
    config.getString('backend.baseUrl') + '/api/flowsource-jira/';
  const entity = useEntity();
  const projectName =
    entity.entity.metadata.annotations['flowsource/jira-project-key'];
  const durationDaysCatalog =
    entity.entity.metadata.annotations['flowsource/durationInDays'];
  const storyPointsFieldCatalog =
    entity.entity.metadata.annotations['flowsource/jira-storypoint-field'];
  const filterFieldKey =
    entity.entity.metadata.annotations?.['flowsource/jira-filter-field-key'] ??
    '';
  const filterFieldValue =
    entity.entity.metadata.annotations?.[
      'flowsource/jira-filter-field-value'
    ] ?? '';

  const filterFieldId =
    entity.entity.metadata.annotations?.['flowsource/jira-filter-Id'] ?? '';

  const [statusOptions, setStatusOptions] = useState([]);
  const [isAccordionExpanded, setAccordionExpanded] = useState(false);
  const [isLoading, setLoading] = useState(true);
  const [isGraphLoading, setIsGraphLoading] = useState(true);
  const [issueCount, setIssueCount] = useState({});
  const [storydetails, setStoryDetails] = useState({
    storyLink: '',
    jiraStoryInfo: [],
  });

  const [issuesBarChart, setIssuesBarChart] = useState([]);
  const [reqByPriBarChart, setReqByPriBarChart] = useState({});
  const [graphDataError, setGraphDataError] = useState(null);
  const [issueCountError, setIssueCountError] = useState(null);
  const [storyDetailsError, setStoryDetailsError] = useState(null);
  const [error, setError] = useState(null);
  const [issueTypes, setIssueTypes] = useState([]);
  const [jiraBotEnabled, setJiraBotEnabled] = useState(false);

  const [isJiraPageError, setIsJiraPageError] = useState(false);
  const [jiraPageErrMessgae, setJiraPageErrMessage] = useState('');

  const handleAccordionChange = (event, isExpanded) => {
    setAccordionExpanded(isExpanded);
    if (isExpanded) {
      fetchAllData();
    }
  };
  const setColor = index => {
    index = index % 6; //Reseting the index to 0,1,2...
    if (index === 0) {
      return '#7BDEEA';
    } else if (index === 1) {
      return '#8FDBF9';
    } else if (index === 2) {
      return '#70C5F8';
    } else if (index === 3) {
      return '#FCA7C6';
    } else if (index === 4) {
      return '#FBB8BE';
    } else if (index === 5) {
      return '#FFC48B';
    }
  };
  const getCardItemAlignment = () => {
    if (issueTypes.length == 3) {
      setalignCardItems('col-4');
    } else if (issueTypes.length == 4) {
      setalignCardItems('col-3');
    } else if (issueTypes.length == 5) {
      setalignCardItems('col-3');
    } else if (issueTypes.length == 6) {
      setalignCardItems('col-2');
    } else {
      setalignCardItems('col-2');
    }
  };
  const fetchStatusOptions = async () => {
    const response = await fetch(
      backendBaseApiUrl + 'statuses?projectName=' + projectName,
    );
    if (response.ok) {
      const result = await response.json();
      setStatusOptions(result.statusOptions);
    } else {
      log.error('Error fetching status options:', response.statusText);
    }
    setLoading(false);
  };

  const fetchAllData = async () => {
    try {
      // Fetch graph data
      const issueDetails = await fetch(
        backendBaseApiUrl +
          'graphData?projectName=' +
          projectName +
          '&durationDaysCatalog=' +
          durationDaysCatalog +
          '&storyPointsFieldCatalog=' +
          encodeURIComponent(storyPointsFieldCatalog) +
          '&filterFieldKey=' +
          filterFieldKey +
          '&filterFieldValue=' +
          filterFieldValue +
          '&filterFieldId=' +
          filterFieldId,
      );
      if (issueDetails.ok) {
        const issueDetailsResponse = await issueDetails.json();
        setIssuesBarChart(issueDetailsResponse.issueCountByStatus);
        setReqByPriBarChart(issueDetailsResponse.priorityChart);
        setGraphDataError(issueDetailsResponse.error);

        // Dynamically set issue counts
        const issueCountRes = {};
        Object.keys(issueDetailsResponse.priorityChart).forEach(issueType => {
          if (issueType !== 'chartLabels') {
            issueCountRes[issueType.toLowerCase()] =
              issueDetailsResponse.priorityChart[issueType].reduce(
                (total, current) => total + current,
              );
          }
        });
        setIssueCount(issueCountRes);
        setIssueCountError(issueDetailsResponse.error);
        setIssueTypes(issueDetailsResponse.issueTypes);

        // Set story details
        setStoryDetails(issueDetailsResponse.storyDetails);
        setStoryDetailsError(issueDetailsResponse.error);
        setIsGraphLoading(false);
      } else if (issueDetails.status === 503) {
        setError(
          'This plugin has not been configured with the required values. Please ask your administrator to configure it.',
        );
        setLoading(false);
        return;
      } else {
        log.error('Error fetching graph data:', issueDetails.statusText);
        setGraphDataError(
          `Error fetching graph data, with status code ${issueDetails.status} `,
        );
      }
      getCardItemAlignment();
    } catch (error) {
      log.error('Error:', error);
      setLoading(false);
    }
  };

  const [projectNameFromApi, setProjectNameFromApi] = useState('');
  const getProjectNameFromApi = async () => {
    try {
      const response = await fetch(backendBaseApiUrl + 'projectNameFromApi?projectKey=' + projectName);
      if (response.ok) {
        const result = await response.json();
        const projectNameFromResp = JSON.parse(result)['projectName'];

        if (projectNameFromResp !== null && projectNameFromResp !== undefined && projectNameFromResp !== '') {
          setProjectNameFromApi(projectNameFromResp);
        } else {
          setProjectNameFromApi(projectName);
        }

      } else if (response.status === 404) {
        const errorText = await response.text();

        if (errorText.includes('No project could be found with key'))
        {
          setIsJiraPageError(true);
          setJiraPageErrMessage("No project could be found with key \"" + projectName + "\" in Jira. Please check the project key and try again.");
        }
      }
      else {
        log.error('Error fetching project name:', response.statusText);
        setIsJiraPageError(true);
        setJiraPageErrMessage('Error fetching project name:'+ response.statusText);
        setProjectNameFromApi(projectName);
      }
    } catch(error) {
      log.error('Error in getProjectNameFromApi:', error);
      setProjectNameFromApi(projectName);
      setIsJiraPageError(true);
      setJiraPageErrMessage('Error fetching project name:'+ error);
    }
  };

  useEffect(async () => {
    await getProjectNameFromApi();
    await fetchStatusOptions();
    await isJiraBotEnabled();
  }, []);

  const isJiraBotEnabled = async () => {
    // Check if Jira Bot is enabled
    try {
      const resp = await fetch(backendBaseApiUrl + 'jiraBotEnabled');
      if (resp.ok) {
        const data = await resp.json();
        setJiraBotEnabled(Boolean(data.enabled));
      } else {
        setJiraBotEnabled(false);
      }
    } catch {
      setJiraBotEnabled(false);
    }
  };

  function renderJiraPage() {
    if (isLoading) {
      return (
        <div className={`App p-3 ${classes.isLoadingStyle}`} >
          Loading...
        </div>
      );
    } else if(isJiraPageError) {
      return ( <JiraErrorPage jiraPageErrMessgae={jiraPageErrMessgae} /> );
    }
    else {
      return (
        <div className={`${classes.jiraMainCointainer}`}>
          <Grid container>
            <Grid item md={12}>
              <JiraProjectNameAndIcon projectName={projectNameFromApi} classes={classes} />
            </Grid>
            <Grid item md={12}>
              {!error && storydetails && issueCount ? (
                <JiraTableContent
                  storydetails={storydetails}
                  issueCount={issueCount}
                  statusOptions={statusOptions}
                />
              ) : (
                ''
              )}
            </Grid>
          </Grid>
          <Spacer />
          <Accordion
            expanded={isAccordionExpanded}
            onChange={handleAccordionChange}
          >
            <AccordionSummary
              style={{
                backgroundColor: '#92bbe6',
                fontWeight: 'bold',
                color: '#384e85',
              }}
              expandIcon={<ExpandMoreIcon />}
              aria-controls="panel1-content"
              id="panel1-header"
            >
              Issue Metrics
            </AccordionSummary>
            <AccordionDetails>
              {isGraphLoading ? (
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'center',
                    paddingTop: '20px',
                  }}
                >
                  Loading...
                </div>
              ) : (
                <Grid>
                  <Grid item md={12}>
                    <JiraIssueCards
                      issueTypes={issueTypes}
                      issueCount={issueCount}
                      classes={classes}
                      setColor={setColor}
                      error={error}
                    />{' '}
                  </Grid>
                  <Grid item md={12}>
                    <JiraInfoContent
                      classes={classes}
                      error={error}
                      graphDataError={graphDataError}
                      storyDetailsError={storyDetailsError}
                      issueCountError={issueCountError}
                      issuesBarChart={issuesBarChart}
                      reqByPriBarChart={reqByPriBarChart}
                    />{' '}
                  </Grid>
                </Grid>
              )}
              <Spacer />
            </AccordionDetails>
          </Accordion>

          {jiraBotEnabled && (
                  <JiraBot fetch={fetch} backendBaseApiUrl={backendBaseApiUrl} projectName={projectName} />
                )}

        </div>
      );
    }
  }

  return (
    <>
      { renderJiraPage() }
    </>
  );
};

const JiraErrorPage = ({ jiraPageErrMessgae }) => {

  return (
    <div className="card ms-2 me-2 mb-2 mt-2">
      <div className="card-header">
        <h6 className="mb-0">Error</h6>
      </div>
      <div className="card-body">
        <div className="alert alert-danger mt-2 mb-2" role="alert">
          { jiraPageErrMessgae }
        </div>
      </div>
    </div>
  );
};

export default JiraPage;
