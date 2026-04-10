import { useState, useEffect, React } from 'react';
import { useApi, configApiRef, fetchApiRef } from '@backstage/core-plugin-api';
import { useEntity } from '@backstage/plugin-catalog-react';
import cssClasses from './css/AzureRepoMainCss';
import BarChart from './BarChart';
import LineChart from './LineChart';
import TableComponent from './TableComponent';
import {
  Paper,
  Card,
  CardHeader,
  Typography,
  Divider,
  CardContent,
  Alert,
  Button,
  Grid,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import info_icon from './Icons/info_icon.svg';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import PluginVersion from '../PluginVersion/PluginVersion';

import log from 'loglevel';
import { Chart as ChartJS } from 'chart.js/auto';
import { Chart } from 'react-chartjs-2';
import CycleTimeChart from './CycleTimeChart';
import GaugeChart from 'react-gauge-chart';

const Spacer = () => <div className="mb-4" />;

function AzureRepoMain() {
  const classes = cssClasses();
  const { fetch } = useApi(fetchApiRef);
  const config = useApi(configApiRef);
  const entity = useEntity();
  const projectName =
    entity.entity.metadata.annotations['flowsource/azure-project-name'];
  const repositoryName =
    entity.entity.metadata.annotations['flowsource/azure-repo-name'];
  const durationDaysCatalog =
    entity.entity.metadata.annotations['flowsource/durationInDays'];
  const backendBaseApiUrl =
    config.getString('backend.baseUrl') +
    `/api/azure-repo/azurePullRequests?projectName=${projectName}&repositoryName=${repositoryName}&durationDaysCatalog=${durationDaysCatalog}`;

  const prCycleTimeMin =
    entity.entity.metadata.annotations['flowsource/azure-PRCycleTimeMin'];
  const prCycleTimeMax =
    entity.entity.metadata.annotations['flowsource/azure-PRCycleTimeMax'];
  const prReviewCycleTimeMin =
    entity.entity.metadata.annotations['flowsource/azure-PRReviewCycleTimeMin'];
  const prReviewCycleTimeMax =
    entity.entity.metadata.annotations['flowsource/azure-PRReviewCycleTimeMax'];
  const prMergeCycleTimeMin =
    entity.entity.metadata.annotations['flowsource/azure-PRMergeCycleTimeMin'];
  const prMergeCycleTimeMax =
    entity.entity.metadata.annotations['flowsource/azure-PRMergeCycleTimeMax'];

  const [isLoading, setLoading] = useState(true);
  const [azurePRData, setAzurePRData] = useState([]);
  const [azurePRDataTrendAging, setAzurePRDataTrendAging] = useState({});
  const [error, setError] = useState(null);
  const [isLoadingChart, setLoadingChart] = useState(true);
  const [isLoadingData, setLoadingData] = useState(true);
  const [additionalData, setAdditionalData] = useState({});
  const [additionalDataLoading, setAdditionalDataLoading] = useState(false);
  const [activeButton, setActiveButton] = useState('Last 60 Days'); // Default active button
  const [isDialogOpen, setDialogOpen] = useState(false);

  const [azureRepoChartData, setAzureRepoChartData] = useState({});
  const [prCycleTimeData, setPRCycleTimeData] = useState(null);
  const [prCycleTimeError, setPRCycleTimeError] = useState(null);
  const [isLoadingPRCycleTime, setLoadingPRCycleTime] = useState(false);
  const [fetchAllPRError, setFetchAllPRError] = useState(null); // Error for fetchAllPRDetails
  const [fetchPRMetricsError, setFetchPRMetricsError] = useState(null); // Error for fetchPRMetrics
  const [fetchFullError, setFetchFullError] = useState(null);
  const [isLoadingCycleTime, setLoadingCycleTime] = useState(false); // State for PR Cycle Time loading

  const getButtonStyles = (buttonState, activeButton) => ({
    backgroundColor: activeButton === buttonState ? '#2e308e' : 'transparent',
    color: activeButton === buttonState ? 'white' : '#2e308e',
    border: `1px solid #000048`,
  });

  const resolvedPRCycleTimeMin = prCycleTimeMin || config.getOptionalNumber('pullRequestCycleTime.PRCycleTimeMin');
  const resolvedPRCycleTimeMax = prCycleTimeMax || config.getOptionalNumber('pullRequestCycleTime.PRCycleTimeMax');
  const resolvedPRReviewCycleTimeMin = prReviewCycleTimeMin || config.getOptionalNumber('pullRequestCycleTime.PRReviewCycleTimeMin');
  const resolvedPRReviewCycleTimeMax = prReviewCycleTimeMax || config.getOptionalNumber('pullRequestCycleTime.PRReviewCycleTimeMax');
  const resolvedPRMergeCycleTimeMin = prMergeCycleTimeMin || config.getOptionalNumber('pullRequestCycleTime.PRMergeCycleTimeMin');
  const resolvedPRMergeCycleTimeMax = prMergeCycleTimeMax || config.getOptionalNumber('pullRequestCycleTime.PRMergeCycleTimeMax');

  const fetchAllData = async state => {
    setLoadingData(true);
    try {
      const url = `${backendBaseApiUrl}&state=${state}`;
      const azurePRResponse = await fetch(url);
      if (azurePRResponse.ok) {
        const result = await azurePRResponse.json();
        setAzurePRData(result);
        setLoading(false);
        setLoadingData(false);
      } else if (azurePRResponse.status === 503) {
        log.error(
          'This plugin has not been configured with the required values. Please ask your administrator to configure it.',
        );
        setError(
          'This plugin has not been configured with the required values. Please ask your administrator to configure it.',
        );
        setLoading(false);
        setLoadingData(false);
      } else if (azurePRResponse.status === 404) {
        const errorData = await azurePRResponse.json();

        if (errorData.error.includes("Project \"" + projectName + "\" not found")) {
          setError(`No project could be found with name "${projectName}" in Azure Repos. Please check the project name and try again.`);
          setLoading(false);
          setLoadingData(false);
        } else if (errorData.error.includes("Repository \"" + repositoryName + "\" not found")) {
          setError(`No repository could be found with name "${repositoryName}" in Azure Repos. Please check the repository name and try again.`);
          setLoading(false);
          setLoadingData(false);
        }
        else {
          setError(`Error fetching Azure PRs details, with status code ${azurePRResponse.status}: ${azurePRResponse.statusText}`);
          setLoading(false);
          setLoadingData(false);
        }
      } else {
        log.error(
          'Error fetching Azure PRs details:',
          azurePRResponse.statusText,
        );
        setError(
          `Error fetching Azure PRs details, with status code ${azurePRResponse.status}: ${azurePRResponse.statusText}`,
        );
        setLoading(false);
        setLoadingData(false);
      }
    } catch (error) {
      log.error('Error:', error);
      setError(error.message);
      setLoading(false);
      setLoadingData(false);
    }
  };

  const fetchDataOnClick = async id => {
    setAdditionalDataLoading(true);
    try {
      const Url =
        config.getString('backend.baseUrl') +
        `/api/azure-repo/azurePullRequests/${id}?projectName=${projectName}&repositoryName=${repositoryName}`;
      const response = await fetch(Url);
      if (response.ok) {
        const result = await response.json();
        setAdditionalData(result);
        setAdditionalDataLoading(false);
      } else if (response.status === 503) {
        log.error(
          'This plugin has not been configured with the required values. Please ask your administrator to configure it.',
        );
        setError(
          'This plugin has not been configured with the required values. Please ask your administrator to configure it.',
        );
        setAdditionalDataLoading(false);
      } else {
        log.error('Error fetching Azure PRs details:', response.statusText);
        setError(
          `Error fetching Azure PRs details, with status code ${response.status}: ${response.statusText}`,
        );
        setAdditionalDataLoading(false);
      }
    } catch (error) {
      log.error('Error:', error);
      setError(error.message);
      setAdditionalDataLoading(false);
    }
  };

  const fetchPRAgaingData = async () => {
    setLoadingChart(true);
    try {
      const url =
        config.getString('backend.baseUrl') +
        `/api/azure-repo/azureGraphData?projectName=${projectName}&repositoryName=${repositoryName}`;
      const azurePRResponse = await fetch(url);
      if (azurePRResponse.ok) {
        const result = await azurePRResponse.json();
        setAzurePRDataTrendAging(result);
        setLoadingChart(false);
      } else if (azurePRResponse.status === 503) {
        log.error(
          'This plugin has not been configured with the required values. Please ask your administrator to configure it.',
        );
        setError(
          'This plugin has not been configured with the required values. Please ask your administrator to configure it.',
        );
        setLoadingChart(false);
      } else {
        log.error(
          'Error fetching Azure PRs details:',
          azurePRResponse.statusText,
        );
        setError(
          `Error fetching Azure PRs details, with status code ${azurePRResponse.status}: ${azurePRResponse.statusText}`,
        );
        setLoadingChart(false);
      }
    } catch (error) {
      log.error('Error:', error);
      setError(error.message);
      setLoadingChart(false);
    } finally {
      setLoadingChart(false);
    }
  };

  const fetchPRCycleTime = async (durationDays) => {
    setLoadingPRCycleTime(true);
    try {
      const Url =
        config.getString('backend.baseUrl') +
        `/api/azure-repo/azurePRMetrics?projectName=${projectName}&repositoryName=${repositoryName}&durationDays=${durationDays}&prCycleTimeMin=${resolvedPRCycleTimeMin}&prCycleTimeMax=${resolvedPRCycleTimeMax}&prReviewCycleTimeMin=${resolvedPRReviewCycleTimeMin}&prReviewCycleTimeMax=${resolvedPRReviewCycleTimeMax}&prMergeCycleTimeMin=${resolvedPRMergeCycleTimeMin}&prMergeCycleTimeMax=${resolvedPRMergeCycleTimeMax}`;
      const azurePRMetricsResponse = await fetch(Url);
      if (azurePRMetricsResponse.ok) {
        const result = await azurePRMetricsResponse.json();
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

  // Handle button click to fetch data for the selected duration
  const handleButtonClick = duration => {
    setActiveButton(duration);
    const durationDays =
      duration === 'Last 60 Days' ? 60 : duration === 'Last 120 Days' ? 120 : 180;
    fetchPRCycleTime(durationDays);
  };

  const handleDialogOpen = () => {
    setDialogOpen(true);
  };

  const handleDialogClose = () => {
    setDialogOpen(false);
  };

  useEffect(() => {
    fetchAllData('active');
    fetchPRCycleTime(60); // Default to 2 months
  }, []);

  const handleAccordionChange = (event, isExpanded) => {
    if (isExpanded) {
      fetchPRAgaingData(); // Fetch data for PR trend and aging
      fetchPRCycleTime();
    }
  };

  const renderPRCycleTimeChart = () => {
    return (
      <div
        className={`card ${classes.cardCss}`} // Add card styling
        style={{ position: 'relative' }}
      >
        <div className={`card-text ms-2 mt-2`}>
          <div className="d-flex align-items-center justify-content-between">
            <div className={`ms-1 mb-2`}>
              <b>PR Cycle Time</b>
            </div>
            <Tooltip title="Click for more details">
              <img
                src={info_icon}
                style={{
                  position: 'absolute',
                  top: '10px',
                  right: '10px',
                  height: '1.2rem',
                  cursor: 'pointer',
                }}
                alt="Info Icon"
                onClick={handleDialogOpen}
              />
            </Tooltip>
          </div>
          {isLoadingCycleTime ? (
            <div className={`${classes.displayMsg}`}>Loading...</div>
          ) : prCycleTimeError ? (
            <Alert severity="error">{prCycleTimeError}</Alert>
          ) : prCycleTimeData && Object.keys(prCycleTimeData).length > 0 ? (
            <div className="d-flex align-items-start mt-1">
              <div className={`col-6`}>
                <CycleTimeChart
                  data={prCycleTimeData}
                  count={
                    prCycleTimeData.totalPRCount || 0
                  }
                />
              </div>
              <div className={`col-6`}>
                <div className="d-flex flex-column ms-4 align-items-center">
                <b>Total Approved and Merged PR Count: {prCycleTimeData.totalPRCount || 0}</b>
                  <div
                    className="d-flex"
                    style={{ marginTop: '4rem', marginLeft: '-1.7rem' }}
                  >
                    {/* Avg PR Cycle Time */}
                    <div
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                      }}
                    >
                      <GaugeChart
                        id="gauge-chart3"
                        nrOfLevels={200}
                        textColor="#000000"
                        arcWidth={0.3}
                        colors={[
                          prCycleTimeData?.metrics?.prRaisedToMerged?.color,
                        ]}
                        arcPadding={0}
                        needleColor="transparent"
                        needleBaseColor="transparent"
                        formatTextValue={() =>
                          prCycleTimeData?.metrics?.prRaisedToMerged?.value
                        }
                        style={{
                          width: '12rem',
                          height: '13rem',
                          marginRight: '-2.5rem',
                        }}
                      />
                      <div
                        style={{
                          marginTop: '-7.5rem',
                          marginLeft: '2rem',
                        }}
                      >
                        Avg PR cycle time
                      </div>
                    </div>
                    <div
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                      }}
                    >
                      <GaugeChart
                        id="gauge-chart1"
                        nrOfLevels={200}
                        textColor="#000000"
                        arcWidth={0.3}
                        colors={[
                          prCycleTimeData?.metrics?.prRaisedToApproved?.color,
                        ]}
                        arcPadding={0}
                        needleColor="transparent"
                        needleBaseColor="transparent"
                        formatTextValue={() =>
                          prCycleTimeData?.metrics?.prRaisedToApproved?.value
                        }
                        style={{
                          width: '12rem',
                          height: '13rem',
                          marginRight: '-2.5rem',
                        }}
                      />
                      <div
                        style={{
                          marginTop: '-7.5rem',
                          marginLeft: '2rem',
                        }}
                      >
                        Avg PR review time
                      </div>
                    </div>
                    <div
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                      }}
                    >
                      <GaugeChart
                        id="gauge-chart2"
                        nrOfLevels={200}
                        textColor="#000000"
                        arcWidth={0.3}
                        colors={[
                          prCycleTimeData?.metrics?.prApprovedToMerged?.color,
                        ]}
                        arcPadding={0}
                        needleColor="transparent"
                        needleBaseColor="transparent"
                        formatTextValue={() =>
                          prCycleTimeData?.metrics?.prApprovedToMerged?.value
                        }
                        style={{
                          width: '12rem',
                          height: '13rem',
                          marginRight: '-2rem',
                        }}
                      />
                      <div
                        style={{
                          marginTop: '-7.5rem',
                          marginLeft: '2rem',
                        }}
                      >
                        Avg PR Merged time
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className={`${classes.displayMsg}`}>No Data Available</div>
          )}
        </div>
      </div>
    );
  };

  if (isLoading) {
    return <div className={`App p-3`}>Loading...</div>;
  }
  let sortedValues = {};
  if (
    azurePRDataTrendAging &&
    azurePRDataTrendAging != null &&
    azurePRDataTrendAging != undefined &&
    Object.keys(azurePRDataTrendAging).length !== 0
  ) {
    // Sort the keys (months) in ascending order
    const sortedKeys = Object.keys(azurePRDataTrendAging.monthlyPRMap).sort(
      (a, b) => new Date(a) - new Date(b),
    );
    // Create a new object with the keys sorted in ascending order
    sortedKeys.forEach(key => {
      sortedValues[key] = azurePRDataTrendAging.monthlyPRMap[key];
    });
  }

  // Now pass sortedValues to the LineChart component
  return (
    <div>
          <div className={`w-100`}>
            <div className={`row`}>
              <div className={`${classes.pluginHeading}`}>
                <div>
                  <h5>
                    <b> Azure Repos - Pull Requests </b>
                  </h5>
                </div>
                <div>
                  <PluginVersion />
                </div>
              </div>
            </div>
          </div>
      {error && !azurePRData.length && (
        <div>
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
          <Spacer />
        </div>
      )}
      {!error && (
        <div>
          <div className={`w-100 mb-3 p-0`}>
            <TableComponent
              values={azurePRData}
              fetchAllData={fetchAllData}
              isLoadingData={isLoadingData}
              additionalData={additionalData}
              fetchDataOnClick={fetchDataOnClick}
              additionalDataLoading={additionalDataLoading}
            />
          </div>
          <div className={`w-100`}>
            <div>
              <Accordion onChange={handleAccordionChange}>
                <AccordionSummary
                  expandIcon={<ExpandMoreIcon />}
                  style={{ backgroundColor: '#ADD8E6' }}
                >
                  <Typography style={{ color: '#00008B' }}>
                    <b>PR Trend & Aging</b>
                  </Typography>
                </AccordionSummary>
                <AccordionDetails style={{ backgroundColor: '#FFFFFF' }}>
                  {isLoadingChart ? (
                    <tr>
                      <td colSpan="5" className={`${classes.displayMsg}`}>
                        Loading...
                      </td>
                    </tr>
                  ) : (
                    <Grid container spacing={2}>
                      <Grid item xs={6}>
                        <div
                          className={`card ${classes.cardCss}`}
                          style={{ position: 'relative' }}
                        >
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
                            <LineChart
                              values={sortedValues}
                              count={azurePRDataTrendAging.totalCountForPRTrend}
                            />
                          </div>
                        </div>
                      </Grid>
                      <Grid item xs={6}>
                        <div
                          className={`card ${classes.cardCss}`}
                          style={{ position: 'relative' }}
                        >
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
                            <BarChart
                              values={azurePRDataTrendAging.pullRequestsAging}
                              count={azurePRDataTrendAging.totalCountForPRAging}
                            />
                          </div>
                        </div>
                      </Grid>
                    </Grid>
                  )}
                </AccordionDetails>
              </Accordion>

              {/* PR Cycle Time Accordion */}
              <Accordion>
                <AccordionSummary
                  expandIcon={<ExpandMoreIcon />}
                  style={{ backgroundColor: '#ADD8E6' }}
                >
                  <Typography style={{ color: '#00008B' }}>
                    <b>PR Cycle Time</b>
                  </Typography>
                </AccordionSummary>
                <AccordionDetails style={{ backgroundColor: '#FFFFFF' }}>
                  <div className="col-12 mb-3 m-0 p-0 d-flex justify-content-end">
                    <div>
                      <button
                        className={`${classes.buttonStyle}`}
                        style={getButtonStyles('Last 60 Days', activeButton)}
                        onClick={() => handleButtonClick('Last 60 Days')}
                      >
                        Last 60 Days
                      </button>
                      <button
                        className={`${classes.buttonStyle}`}
                        style={getButtonStyles('Last 120 Days', activeButton)}
                        onClick={() => handleButtonClick('Last 120 Days')}
                      >
                        Last 120 Days
                      </button>
                      <button
                        className={`${classes.buttonStyle}`}
                        style={getButtonStyles('Last 180 Days', activeButton)}
                        onClick={() => handleButtonClick('Last 180 Days')}
                      >
                        Last 180 Days
                      </button>
                    </div>
                  </div>
                  {isLoadingPRCycleTime ? (
                    <div className={`${classes.displayMsg}`}>Loading...</div>
                  ) : prCycleTimeError ? (
                    <Alert severity="error">{prCycleTimeError}</Alert>
                  ) : prCycleTimeData &&
                    Object.keys(prCycleTimeData).length > 0 ? (
                    renderPRCycleTimeChart()
                  ) : (
                    <div className={`${classes.displayMsg}`}>
                      No Data Available
                    </div>
                  )}
                </AccordionDetails>
              </Accordion>
            </div>
            {/* Dialog for detailed information */}
            <Dialog
              open={isDialogOpen}
              onClose={handleDialogClose}
              PaperProps={{
                style: {
                  backgroundColor: 'rgba(255, 255, 255, 0.9)', // Transparent background
                  boxShadow: 'none',
                },
              }}
            >
             <DialogTitle>
              <b>PR Cycle Time Details</b>
            </DialogTitle>
            <DialogContent>
            <Typography variant="body1" gutterBottom>
            <b>Line Chart:</b> The line chart shows the PR cycle time for the
            selected duration. Each point represents the count of Merged and
            Approved PRs created in a specific month.
          </Typography>
          <Typography variant="body1" gutterBottom>
            <b>Average PR Cycle Time:</b> The average time from PR raised to
            merged within the duration.
          </Typography>
          <Typography variant="body1" gutterBottom>
            <b>Average PR Review Time:</b> The average time from PR raised to
            first approval within the duration.
          </Typography>
          <Typography variant="body1" gutterBottom>
            <b>Average PR Merged Time:</b> The average time from PR first
            approval to merged within the duration.
          </Typography>
          <Typography variant="body1" gutterBottom>
            <b>Note:</b> The color of the average cycle calculations is
            determined based on the threshold values provided by the user in the
            catalog file or in the app-config file.
          </Typography>
            </DialogContent>
              <DialogActions>
                <Button onClick={handleDialogClose} color="primary">
                  Close
                </Button>
              </DialogActions>
            </Dialog>
          </div>
        </div>
      )}
    </div>
  );
};
    
    export default AzureRepoMain;
