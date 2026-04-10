import { useState, useEffect, React } from 'react';
import { useApi, configApiRef, fetchApiRef } from '@backstage/core-plugin-api';
import { useEntity } from '@backstage/plugin-catalog-react';
import cssClasses from './css/GitHubRepoMainCss';
import BarChart from './BarChart';
import LineChart from './LineChart';
import CycleTimeChart from './CycleTimeChart';
import TableComponent from './TableComponent';
import GaugeChart from 'react-gauge-chart';
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
  Grid,
  Tooltip,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import info_icon from './Icon/info_icon.svg';
import PluginVersion from '../PluginVersion/PluginVersion';

import log from 'loglevel';

const Spacer = () => <div className="mb-4" />; // Spacer component

const ErrorMessage = ({ error }) => (
  error ? (
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
  ) : null
);

const NoDataMessage = ({ condition }) => {

  const classes = cssClasses();

  return (
    condition ? (
      <div className={`card ${classes.dataUnavailable}`}>
        <div className="card-body">
          <h6 className="card-title">No Data Available</h6>
        </div>
      </div>
    ) : null
  );
};

const NoDataMessagePrCycle = ({ condition }) => {

  const classes = cssClasses();

  return (
    condition ? (
      <div className={`card ${classes.noDataMessagePrCycle}`}>
        <div className="card-body">
          <h6 className="card-title">No Data Available</h6>
        </div>
      </div>
    ) : null
  );
};

function GitHubRepoMain() {
  const classes = cssClasses();
  const { fetch } = useApi(fetchApiRef);
  const config = useApi(configApiRef);
  const backendBaseApiUrl = config.getString('backend.baseUrl') + '/api/flowsource-github/';
  const entity = useEntity();

  const [isLoading, setLoading] = useState(true);
  const [isLoadingAll, setLoadingAll] = useState(false);
  const [isLoadingChart, setLoadingChart] = useState(false);
  const [githubPRData, setGithubPRData] = useState({});
  const [githubChartData, setGithubChartData] = useState({});
  const [prCycleTimeData, setPRCycleTimeData] = useState(null);
  const [prCycleTimeError, setPRCycleTimeError] = useState(null);
  const [isLoadingPRCycleTime, setLoadingPRCycleTime] = useState(false);
  const [error, setError] = useState(null);
  const [fetchAllPRError, setFetchAllPRError] = useState(null); // Error for fetchAllPRDetails

  const [fetchFullError, setFetchFullError] = useState(null); // Error for fetchFullPRDetails
  const repoOwner = entity.entity.metadata.annotations["flowsource/github-repo-owner"];
  const repoName = entity.entity.metadata.annotations["flowsource/github-repo-name"];
  const prCycleTimeMin = entity.entity.metadata.annotations["flowsource/github-PRCycleTimeMin"];
  const prCycleTimeMax = entity.entity.metadata.annotations["flowsource/github-PRCycleTimeMax"];
  const prReviewCycleTimeMin = entity.entity.metadata.annotations["flowsource/github-PRReviewCycleTimeMin"];
  const prReviewCycleTimeMax = entity.entity.metadata.annotations["flowsource/github-PRReviewCycleTimeMax"];
  const prMergeCycleTimeMin = entity.entity.metadata.annotations["flowsource/github-PRMergeCycleTimeMin"];
  const prMergeCycleTimeMax = entity.entity.metadata.annotations["flowsource/github-PRMergeCycleTimeMax"];
  const durationDaysCatalog = entity.entity.metadata.annotations['flowsource/durationInDays'];
  const hostFromCatalog = entity.entity.metadata.annotations['flowsource/github-host'] || '';



  const fetchFullPRDetails = async () => {
    setLoadingChart(true);
    try {
      const githubPRResponse = await fetch(backendBaseApiUrl + 'githubGraphPullRequests?repoName=' + repoName + '&repoOwner=' + repoOwner + "&hostFromCatalog=" + hostFromCatalog);
      if (githubPRResponse.ok) {
        const result = await githubPRResponse.json();
        const githubPRDataString = JSON.stringify(result).replace(/&gt;/g, '>');
        const githubPRData = JSON.parse(githubPRDataString);

        setGithubChartData(githubPRData);
      } else {
        setFetchFullError('Error fetching PR details');
      }
    } catch (error) {
      log.error('Error:', error);
      setFetchFullError('Error fetching PR details');
    }
    finally {
      setLoadingChart(false);
    }
  };

  const fetchAllPRDetails = async (state) => {
    setLoadingAll(true);
    try {
      const githubPRResponse = await fetch(backendBaseApiUrl + 'githubPullRequests?repoName=' + repoName + '&repoOwner=' + repoOwner + '&durationDaysCatalog=' + durationDaysCatalog + "&hostFromCatalog=" + hostFromCatalog + "&state=" + state);
      if (githubPRResponse.ok) {
        const result = await githubPRResponse.json();
        const githubPRDataString = JSON.stringify(result).replace(/&gt;/g, '>');
        const githubPRData = JSON.parse(githubPRDataString);
       
        setGithubPRData(githubPRData);
        setLoading(false);
      } else  {
        if (githubPRResponse.status === 503) {
          setError('This plugin has not been configured with the required values. Please ask your administrator to configure it');
        } else if(githubPRResponse.status === 404) {

          const errorData = await githubPRResponse.json();

          if(errorData.error.includes('Incorrect git owner or repo')) {
            setError( `No repository found with git-owner: "${repoOwner}" and repo-name: "${repoName}" in GitHub. `
            + `Please validate git-owner and repo-name if they have been configured correctly and try again.`);
          } else {
            setError(
              `Error fetching github pr details, with status code ${githubPRResponse.status} `,
            );
          }
        } else {
          setError(
            `Error fetching github pr details, with status code ${githubPRResponse.status} `,
          );
        }
    }
    }
    catch (error) {
      log.error('Error:', error);
      setFetchAllPRError('Error fetching PRs');
    } finally {
      setLoading(false);
      setLoadingAll(false);
    }
  };

  const fetchPRCycleTime = async () => {
    setLoadingPRCycleTime(true);
    try {
      const githubPRMetricsResponse = await fetch(backendBaseApiUrl + 'githubPRMetrics?repoName=' + repoName + '&repoOwner=' + repoOwner + '&durationDaysCatalog=' + durationDaysCatalog + "&hostFromCatalog=" + hostFromCatalog + "&prCycleTimeMin=" + prCycleTimeMin + "&prCycleTimeMax=" + prCycleTimeMax + "&prReviewCycleTimeMin=" + prReviewCycleTimeMin + "&prReviewCycleTimeMax=" + prReviewCycleTimeMax + "&prMergeCycleTimeMin=" + prMergeCycleTimeMin + "&prMergeCycleTimeMax=" + prMergeCycleTimeMax);
      if (githubPRMetricsResponse.ok) {
        const result = await githubPRMetricsResponse.json();
        setPRCycleTimeData(result);
      } else {
        setPRCycleTimeError('Error fetching PR Cycle Time data');
      }
    } catch (error) {
      log.error('Error fetching PR Cycle Time data:', error);
      setPRCycleTimeError('Error fetching PR Cycle Time data');
    } finally {
      setLoadingPRCycleTime(false);
    }
  };

  useEffect(() => {
    fetchAllPRDetails("open");
  }, []);

  const handleAccordionChange = (event, isExpanded) => {
    if (isExpanded) {
      fetchFullPRDetails();
      fetchPRCycleTime();
    }
  };
 
  function renderGitHubRepoMainComponent() {
    if (isLoading) {
      return <div className={`App p-3 ${classes.isLoading}`}>Loading...</div>;
    } else if(error) {
      return ( 
        <>
          <GitHubRepoHeadingComponent />
          <ErrorMessage error={error} />
        </>
      );
    } else {
      return (
        <>
          <GitHubRepoHeadingComponent />
          <RenderGitHubTableComponent fetchAllPRError={fetchAllPRError}
            values={githubPRData.githubPRList}
            fetchAllPRDetails={fetchAllPRDetails}
            isLoadingAll={isLoadingAll}
          />
          <div className={`w-100`}>
            <Accordion onChange={handleAccordionChange}>
              <AccordionSummary
                expandIcon={<ExpandMoreIcon />}
                style={{ backgroundColor: 'rgb(141 180 226)' }}
              >
                <Typography style={{ color: '#00008B' }}>
                  <b>PR Trend & Aging</b>
                </Typography>
              </AccordionSummary>
              <AccordionDetails style={{ backgroundColor: '#FFFFFF' }}>
                {isLoadingChart ? (
                  <div className={`${classes.displayMsg}`}>
                    Loading...
                  </div>
                ) : (
                  <Grid container spacing={2}>
                    <Grid item xs={6}>
                      <RenderPrTrendChart isLoadingChart={isLoadingChart}
                        fetchFullError={fetchFullError}
                        githubChartData={githubChartData}
                      />
                    </Grid>
                    <Grid item xs={6}>
                      <RenderOpenPRAgingChart isLoadingChart={isLoadingChart}
                        fetchFullError={fetchFullError}
                        githubChartData={githubChartData}
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <RenderPrCycleTimeChart isLoadingPRCycleTime={isLoadingPRCycleTime}
                        prCycleTimeError={prCycleTimeError} prCycleTimeData={prCycleTimeData}
                        githubChartData={githubChartData}
                      />
                    </Grid>
                  </Grid>
                )}
              </AccordionDetails>
            </Accordion>
          </div>
        </>
      );
    }
  };

  return (
    <div>
      { renderGitHubRepoMainComponent() }
    </div>
  );
};


const GitHubRepoHeadingComponent = () => {
  
  const classes = cssClasses();
  
  return (
    <div className={`row`}>
      <div className={`${classes.pluginHeading}`}>
        <div>
          <h5 style={{ paddingTop: '0.5rem' }}>
            <b> GitHub Repo - Pull Requests </b>
          </h5>
        </div>
        <div>
          <PluginVersion />
        </div>
      </div>
    </div>
  );
};

const RenderGitHubTableComponent = ({ fetchAllPRError, values, fetchAllPRDetails, isLoadingAll }) => {

  function renderTableUi() {
    if(fetchAllPRError) {
      return ( <ErrorMessage error={fetchAllPRError} /> );
    } else {
      return (
        <div className={`w-100 mb-3 p-0`}>
          <TableComponent
            values={values}
            fetchAllPRDetails={fetchAllPRDetails}
            isLoadingAll={isLoadingAll}
          />
        </div>
      );
    }
  };

  return (
    <>
      { renderTableUi() }
    </>
  );
};

const RenderPrTrendChart = ({ isLoadingChart, fetchFullError, githubChartData }) => {

  const classes = cssClasses();

  function renderPrChart() {
    if(isLoadingChart) {
      return ( <div className={`App p-3`}>Loading...</div> );
    } else if(fetchFullError) {
      return ( <ErrorMessage error={fetchFullError} /> );
    } 
    else 
    {
      if(githubChartData && githubChartData.monthlyPRMap && Object.keys(githubChartData.monthlyPRMap).length > 0) 
      {
        return (
          <LineChart
            values={githubChartData.monthlyPRMap}
            count={githubChartData.totalCountForPRTrend}
          />
        );
      } else {
        return ( <NoDataMessage condition={true} /> );
      }
    }
  }

  return (
    <div className={`card ${classes.cardCss}`} style={{ position: 'relative' }}>
      <div className={`card-text ms-2 mt-2`}>
        <div className="d-flex align-items-center justify-content-between">
          <div className={`ms-1 mb-2`}>
            <b>PR Trend</b>
          </div>
          <Tooltip title="This data is for the last 6 months">
            <img
              src={info_icon}
              style={{
                position: 'absolute',
                top: '10px',
                right: '10px',
                height: '1.2rem',
              }}
              alt="Info Icon"
            />
          </Tooltip>
        </div>
        { renderPrChart() }
      </div>
    </div>
  );
};

const RenderOpenPRAgingChart = ({ isLoadingChart, fetchFullError, githubChartData }) => {

  const classes = cssClasses();

  function renderChart() {
    if(isLoadingChart) {
      return ( <div className={`App p-3`}>Loading...</div> );
    } else if(fetchFullError) {
      return ( <ErrorMessage error={fetchFullError} /> );
    }
    else 
    {
      if(githubChartData && githubChartData.pullRequestsAging && Object.keys(githubChartData.pullRequestsAging).length > 0) 
      {
        return (
          <BarChart
            values={githubChartData.pullRequestsAging}
            count={githubChartData.totalCountForPRAging}
          />
        );
      } else {
        return ( <NoDataMessage condition={true} /> );
      }
    }
  };

  return (
    <div className={`card ${classes.cardCss}`} style={{ position: 'relative' }}>
      <div className={`card-text ms-2 mt-2`}>
        <div className="d-flex align-items-center justify-content-between">
          <div className={`ms-1 mb-2`}>
            <b>Open PR Aging</b>
          </div>
          <Tooltip title="This data is for the last 6 months">
            <img
              src={info_icon}
              style={{
                position: 'absolute',
                top: '10px',
                right: '10px',
                height: '1.2rem',
              }}
              alt="Info Icon"
            />
          </Tooltip>
        </div>
        { renderChart() }
      </div>
    </div>
  );
};

const RenderPrCycleTimeChart = ({ isLoadingPRCycleTime, prCycleTimeError, prCycleTimeData, githubChartData }) => {

  const classes = cssClasses();

  function renderChart() {
    if(isLoadingPRCycleTime) {
      return ( <div className={`App p-3`}>Loading...</div> );
    } else if(prCycleTimeError) {
      return ( <ErrorMessage error={prCycleTimeError} /> );
    } 
    else
    {
      if(prCycleTimeData && Object.keys(prCycleTimeData).length > 0) 
      {
        return (
          <div className="d-flex align-items-start mt-1">
            <div className={`col-6`}>
              <CycleTimeChart data={prCycleTimeData} count={githubChartData.totalCountForPRTrend} />
            </div>
            <div className={`col-6`}>
              <div className="d-flex flex-column ms-4">
                <div className="d-flex" style={{ marginTop: '4rem', marginLeft: '-1.7rem' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <GaugeChart id="gauge-chart3"
                      nrOfLevels={200}
                      textColor="#000000"
                      arcWidth={0.3}
                      colors={[prCycleTimeData?.metrics?.prRaisedToMerged?.color]}
                      arcPadding={0}
                      needleColor="transparent"
                      needleBaseColor="transparent"
                      formatTextValue={() => prCycleTimeData?.metrics?.prRaisedToMerged?.value}
                      style={{ width: '12rem', height: '13rem', marginRight: '-2.5rem' }} />
                    <div style={{ marginTop: '-7.5rem', marginLeft: '2rem' }}>
                      Avg PR cycle time
                    </div>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <GaugeChart
                      id="gauge-chart1"
                      nrOfLevels={200}
                      textColor="#000000"
                      arcWidth={0.3}
                      colors={[prCycleTimeData?.metrics?.prRaisedToApproved?.color]}
                      arcPadding={0}
                      needleColor="transparent"
                      needleBaseColor="transparent"
                      formatTextValue={() => prCycleTimeData?.metrics?.prRaisedToApproved?.value}
                      style={{ width: '12rem', height: '13rem', marginRight: '-2.5rem' }}
                    />
                    <div style={{ marginTop: '-7.5rem', marginLeft: '2rem' }}>
                      Avg PR review time
                    </div>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <GaugeChart id="gauge-chart2"
                      nrOfLevels={200}
                      textColor="#000000"
                      arcWidth={0.3}
                      colors={[prCycleTimeData?.metrics?.prApprovedToMerged?.color]}
                      arcPadding={0}
                      needleColor="transparent"
                      needleBaseColor="transparent"
                      formatTextValue={() => prCycleTimeData?.metrics?.prApprovedToMerged?.value}
                      style={{ width: '12rem', height: '13rem', marginRight: '-2rem' }} />
                    <div style={{ marginTop: '-7.5rem', marginLeft: '2rem' }}>
                      Avg PR Merged time
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      } else {
        return ( <NoDataMessagePrCycle condition={true} /> );
      }
    }
  };

  return (
    <div className={`row mt-1 ${classes.cardStyle}`}>
      <div className='mt-3'>
        <div className="d-flex align-items-center justify-content-between">
          <div><b>PR Cycle Time</b></div>
          <Tooltip title="This data is for the last 6 months">
            <img
              src={info_icon}
              style={{ height: '1.2rem' }}
              alt="Info Icon"
            />
          </Tooltip>
        </div>
        { renderChart() }
      </div>
    </div>
  );
};



export default GitHubRepoMain;
