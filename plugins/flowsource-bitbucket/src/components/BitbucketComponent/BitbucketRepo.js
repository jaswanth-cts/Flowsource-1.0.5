import { useState, useEffect, React } from 'react';
import { useApi, configApiRef, fetchApiRef } from '@backstage/core-plugin-api';
import { useEntity } from '@backstage/plugin-catalog-react';
import cssClasses from './css/BitbucketRepoMainCss';
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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
} from '@mui/material';
import info_icon from './Icon/info_icon.svg';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import PluginVersion from '../PluginVersion/PluginVersion';

import log from 'loglevel';

const Spacer = () => <div className="mb-4" />; // Spacer component

function BitbucketRepo() {
  const classes = cssClasses();
  const { fetch } = useApi(fetchApiRef);
  const config = useApi(configApiRef);
  const backendBaseApiUrl =
    config.getString('backend.baseUrl') + '/api/flowsource-bitbucket/';
  const entity = useEntity();

  const [isLoading, setLoading] = useState(true);
  const [isLoadingData, setLoadingData] = useState(true);
  const [isLoadingChart, setLoadingChart] = useState(false);
  const [isLoadingCycleTime, setLoadingCycleTime] = useState(false); // State for PR Cycle Time loading
  const [bitbucketPRData, setBitbucketPRData] = useState([]);
  const [additionalData, setAdditionalData] = useState({});
  const [additionalDataLoading, setAdditionalDataLoading] = useState(false);
  const [bitbucketPRTrendAgingData, setBitbucketPRTrendAgingData] = useState({});
  const [prCycleTimeData, setPRCycleTimeData] = useState(null); // State for PR Cycle Time data
  const [prCycleTimeError, setPRCycleTimeError] = useState(null); // State for PR Cycle Time error
  const [error, setError] = useState(null);
  const [selectedDuration, setSelectedDuration] = useState(2); // Default to 2 months
  const [isDialogOpen, setDialogOpen] = useState(false); // State to control dialog visibility

  const repoOwner = entity.entity.metadata.annotations['flowsource/bitbucket-repo-owner'];
  const repoName = entity.entity.metadata.annotations['flowsource/bitbucket-repo-name'];
  const durationDaysCatalog = entity.entity.metadata.annotations['flowsource/durationInDays'];
  const hostFromCatalog = entity.entity.metadata.annotations['flowsource/bitbucket-host'] || '';

  // New annotations for cycle time thresholds
  const prCycleTimeMin =
    entity.entity.metadata.annotations['flowsource/bitbucket-PRCycleTimeMin'];
  const prCycleTimeMax =
    entity.entity.metadata.annotations['flowsource/bitbucket-PRCycleTimeMax'];
  const prReviewCycleTimeMin =
    entity.entity.metadata.annotations['flowsource/bitbucket-PRReviewCycleTimeMin'];
  const prReviewCycleTimeMax =
    entity.entity.metadata.annotations['flowsource/bitbucket-PRReviewCycleTimeMax'];
  const prMergeCycleTimeMin =
    entity.entity.metadata.annotations['flowsource/bitbucket-PRMergeCycleTimeMin'];
  const prMergeCycleTimeMax =
    entity.entity.metadata.annotations['flowsource/bitbucket-PRMergeCycleTimeMax'];

  const fetchAllData = async state => {
    setLoadingData(true);
    try {
      const response = await fetch(
        `${backendBaseApiUrl}pullrequests?repoName=${repoName}&repoOwner=${repoOwner}&durationDaysCatalog=${durationDaysCatalog}&hostFromCatalog=${hostFromCatalog}&state=${state}`,
      );
      if (response.ok) {
        const result = await response.json();
        const bitBucketDataString = JSON.stringify(result).replace(
          /&gt;/g,
          '>',
        );
        const bitbucketData = JSON.parse(bitBucketDataString);
        setBitbucketPRData(bitbucketData);
        setLoading(false);
        setLoadingData(false);
      } else {
        if (response.status === 503) {
          setError(
            `This plugin has not been configured with the required values. Please ask your administrator to configure it`,
          );
        } 
        else if (response.status === 404) {
          const errorMessage = await response.text();
          if (
            errorMessage.includes(
              'Repository not found. Invalid repo owner or name',
            )
          ) {
            setError(
              `No repository found with repo-owner: "${repoOwner}" and repo-name: "${repoName}" in Bitbucket Repo. ` +
                `Please validate repo-onwer and repo-name if they have been configured correctly or check if appropirate access has been provided and try again.`,
            );
          } else {
            setError(
              `Error fetching Bitbucket PRs details:`,
              response.statusText,
            );
          }
        } else {
          setError(
            `Error fetching Bitbucket PRs details:`,
            response.statusText,
          );
        }
        setLoading(false);
        setLoadingData(false);
      }
    } catch (error) {
      log.error('Error:', error);
      setError(`${error.message}`);
      setLoading(false);
      setLoadingData(false);
    } finally {
      setLoadingData(false);
    }
  };

  const fetchDataOnClick = async (prID) => {
    setAdditionalDataLoading(true);
    try {
      const response = await fetch(
        `${backendBaseApiUrl}pullrequests/${prID}?repoName=${repoName}&repoOwner=${repoOwner}&hostFromCatalog=${hostFromCatalog}`,
      );
      if (response.ok) {
        const result = await response.json();
        const data = JSON.stringify(result).replace(/&gt;/g, '>');
        const bitbucketData = JSON.parse(data);
        setAdditionalData(bitbucketData);
        setAdditionalDataLoading(false);
      }
      else {
        setError(`Error fetching Bitbucket PRs details:`, response.statusText);
      }
    } catch (error) {
      log.error('Error:', error);
      setAdditionalDataLoading(false);
    }
  }

  const fetchPRTrendAndAgingData = async () => {
    setLoadingChart(true);
    try {
      const response = await fetch(
        `${backendBaseApiUrl}pullrequests?repoName=${repoName}&repoOwner=${repoOwner}&hostFromCatalog=${hostFromCatalog}&fetchSixMonthsData=true`,
      );
      if (response.ok) {
        const result = await response.json();
        const bitBucketDataString = JSON.stringify(result).replace(
          /&gt;/g,
          '>',
        );
        const bitbucketData = JSON.parse(bitBucketDataString);
        setBitbucketPRTrendAgingData(bitbucketData);
      } else {
        if (response.status === 503) {
          setError(
            `This plugin has not been configured with the required values. Please ask your administrator to configure it`,
          );
        } else {
          setError(
            `Error fetching Bitbucket PRs details:`,
            response.statusText,
          );
        }
      }
    } catch (error) {
      log.error('Error:', error);
      setError(`${error.message}`);
    } finally {
      setLoadingChart(false);
    }
  };

  const fetchPRCycleTime = async (duration) => {
    setLoadingCycleTime(true);

    // Use app-config values if catalog annotations are missing
    const resolvedPRCycleTimeMin =
      prCycleTimeMin || config.getOptionalNumber('pullRequestCycleTime.PRCycleTimeMin');
    const resolvedPRCycleTimeMax =
      prCycleTimeMax || config.getOptionalNumber('pullRequestCycleTime.PRCycleTimeMax');
    const resolvedPRReviewCycleTimeMin =
      prReviewCycleTimeMin || config.getOptionalNumber('pullRequestCycleTime.PRReviewCycleTimeMin');
    const resolvedPRReviewCycleTimeMax =
      prReviewCycleTimeMax || config.getOptionalNumber('pullRequestCycleTime.PRReviewCycleTimeMax');
    const resolvedPRMergeCycleTimeMin =
      prMergeCycleTimeMin || config.getOptionalNumber('pullRequestCycleTime.PRMergeCycleTimeMin');
    const resolvedPRMergeCycleTimeMax =
      prMergeCycleTimeMax || config.getOptionalNumber('pullRequestCycleTime.PRMergeCycleTimeMax');

    try {
      const response = await fetch(
        `${backendBaseApiUrl}bitbucketPRMetrics?repoName=${repoName}&repoOwner=${repoOwner}&durationInMonths=${duration}&hostFromCatalog=${hostFromCatalog}&prCycleTimeMin=${resolvedPRCycleTimeMin}&prCycleTimeMax=${resolvedPRCycleTimeMax}&prReviewCycleTimeMin=${resolvedPRReviewCycleTimeMin}&prReviewCycleTimeMax=${resolvedPRReviewCycleTimeMax}&prMergeCycleTimeMin=${resolvedPRMergeCycleTimeMin}&prMergeCycleTimeMax=${resolvedPRMergeCycleTimeMax}`,
      );
      if (response.ok) {
        const result = await response.json();
        setPRCycleTimeData(result);
      } else {
        setPRCycleTimeError('Error fetching PR Cycle Time data');
      }
    } catch (error) {
      log.error('Error fetching PR Cycle Time data:', error);
      setPRCycleTimeError('Error fetching PR Cycle Time data');
    } finally {
      setLoadingCycleTime(false);
    }
  };

  const handleDurationChange = (duration) => {
    setSelectedDuration(duration);
    fetchPRCycleTime(duration); // Fetch data for the selected duration
  };

  const handleDialogOpen = () => {
    setDialogOpen(true);
  };

  const handleDialogClose = () => {
    setDialogOpen(false);
  };

  useEffect(() => {
    fetchAllData('OPEN');
  }, []);

  const handleAccordionChange = (event, isExpanded) => {
    if (isExpanded) {
      fetchPRTrendAndAgingData();
      fetchPRCycleTime(2);
    }
  };

  const renderPRCycleTimeChart = () => {
    return (
      <div
        className={`card ${classes.cardCss}`}
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
                  count={prCycleTimeData.metrics.totalCounts || 0}
                />
              </div>
              <div className={`d-flex flex-column align-items-center`}>
                <b>
                  Total Merged and Approved PR Count:{' '}
                  {prCycleTimeData.metrics.totalCounts || 0}
                </b>
                <div className="d-flex align-items-center">
                  <div
                    className="d-flex"
                    style={{
                      marginTop: '4rem',
                      transform: 'translateX(-1rem)',
                    }}
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

  function renderBitbucketRepo() {
    if (isLoading) {
      return <div className={`App p-3 ${classes.isLoading}`}>Loading...</div>;
    } else if(error) {
      return (
        <>
          <BitbucketRepoHeadingComponent />
          <BitbucketRepoErrorComponent error={error}/>
        </>
      );
    } else {
      return (
        <>
          <BitbucketRepoHeadingComponent />
          <div className={`w-100 mb-3 p-0`}>
            <TableComponent
              values={bitbucketPRData}
              fetchAllData={fetchAllData}
              isLoadingData={isLoadingData}
              additionalData={additionalData}
              fetchDataOnClick={fetchDataOnClick}
              additionalDataLoading={additionalDataLoading}
            />
          </div>
          <div className={`w-100`}>
            {/* PR Trend & Aging Accordion */}
            <Accordion
              onChange={handleAccordionChange}
              className={`${classes.accordionSpacing}`} // Add a class for spacing
            >
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
                  <div className={`${classes.isLoadingAccordian}`} > Loading... </div>
                ) : (
                  <Grid container spacing={2}>
                    <Grid item xs={6}>
                      <RenderPrTrendChart
                        bitbucketPRTrendAgingData={bitbucketPRTrendAgingData}
                      />
                    </Grid>
                    <Grid item xs={6}>
                      <RenderOpenPrAgingChart
                        bitbucketPRTrendAgingData={bitbucketPRTrendAgingData}
                      />
                    </Grid>
                  </Grid>
                )}
              </AccordionDetails>
            </Accordion>

            {/* PR Cycle Time Accordion */}
            <Accordion
              onChange={(event, isExpanded) => {
                if (isExpanded) {
                  fetchPRCycleTime(selectedDuration); // Fetch default 2 months data when expanded
                }
              }}
              className={`${classes.accordionSpacing}`}
            >
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
                  <button
                    className={`${classes.cycleButtonStyle} ${
                      selectedDuration === 2 ? classes.activeButton : ''
                    }`}
                    onClick={() => handleDurationChange(2)}
                  >
                    Last 60 days
                  </button>
                  <button
                    className={`${classes.cycleButtonStyle} ${
                      selectedDuration === 4 ? classes.activeButton : ''
                    }`}
                    onClick={() => handleDurationChange(4)}
                  >
                    Last 120 days
                  </button>
                  <button
                    className={`${classes.cycleButtonStyle} ${
                      selectedDuration === 6 ? classes.activeButton : ''
                    }`}
                    onClick={() => handleDurationChange(6)}
                  >
                    Last 180 days
                  </button>
                </div>
                {isLoadingCycleTime ? (
                  <div className={`${classes.displayMsg}`}>Loading...</div>
                ) : prCycleTimeError ? (
                  <Alert severity="error">{prCycleTimeError}</Alert>
                ) : prCycleTimeData && Object.keys(prCycleTimeData).length > 0 ? (
                  renderPRCycleTimeChart()
                ) : (
                  <div className={`${classes.displayMsg}`}>No Data Available</div>
                )}
              </AccordionDetails>
            </Accordion>
          </div>
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
                <b>Line Chart:</b> The line chart shows the Avg PR cycle time for
                the selected duration. Each point represents the days count of
                Merged and Approved PRs with their Avg PR cycle time for specific
                month.
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
                determined based on the threshold values provided by the user in
                the catalog file or in the app-config file.
              </Typography>
            </DialogContent>
            <DialogActions>
              <Button onClick={handleDialogClose} color="primary">
                Close
              </Button>
            </DialogActions>
          </Dialog>
        </>
      );
    }
  }

  return (
    <>
      { renderBitbucketRepo() }
    </>
  );
}

const BitbucketRepoHeadingComponent = () => {
  
  const classes = cssClasses();

  return (
    <div className={`w-100`}>
      <div className={`row`}>
        <div className={`${classes.pluginHeading}`}>
          <div>
            <h5>
              <b> Bitbucket Repo - Pull Requests </b>
            </h5>
          </div>
          <div>
            <PluginVersion />
          </div>
        </div>
      </div>
    </div>
  );
};

const BitbucketRepoErrorComponent = ({ error }) => {
  const classes = cssClasses();

  return (
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
  );
};

const RenderPrTrendChart = ({ bitbucketPRTrendAgingData }) => {

  const classes = cssClasses();

  return (
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
          values={bitbucketPRTrendAgingData.monthlyPRMap}
          count={
            bitbucketPRTrendAgingData.totalCountForPRTrend
          }
        />
      </div>
    </div>
  );
};

const RenderOpenPrAgingChart = ({ bitbucketPRTrendAgingData }) => {
  
  const classes = cssClasses();

  return (
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
          values={bitbucketPRTrendAgingData.pullRequestsAging}
          count={
            bitbucketPRTrendAgingData.totalCountForPRAging
          }
        />
      </div>
    </div>
  );
};

export default BitbucketRepo;
