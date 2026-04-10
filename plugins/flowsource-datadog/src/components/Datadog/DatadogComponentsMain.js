import 'bootstrap/dist/css/bootstrap.min.css';
import cssClasses from './DatadogCss.js';
import BarChart from './BarChart.js';
import { transformErrors, seggregateTags } from './DatadogHelper';
import { useState, useEffect, React } from 'react';
import {
  useApi,
  configApiRef,
  fetchApiRef
} from '@backstage/core-plugin-api';
import { useEntity } from '@backstage/plugin-catalog-react';
import { Modal, Button } from 'react-bootstrap';
import copyIcon from './Icons/copy.png';
import detailIcon from './Icons/detail.png';
import monitorIcon from './Icons/monitorIcon.png';
import createIcon from './Icons/create.png';
import ArrowBackIosNewRoundedIcon from '@mui/icons-material/ArrowBackIosNewRounded';
import ArrowForwardIosRoundedIcon from '@mui/icons-material/ArrowForwardIosRounded';
import {
  IconButton,
  Link
} from '@material-ui/core';
import {
  EntitySwitch,
} from '@backstage/plugin-catalog';
import { EmptyState } from '@backstage/core-components';
import {
  Paper,
  Card,
  CardHeader,
  div,
  Divider,
  CardContent,
  Alert,
} from '@mui/material';
import PluginVersion from '../PluginVersion/PluginVersion.js';
import OpenInNewIcon from '@material-ui/icons/OpenInNew';

import log from 'loglevel';

const Spacer = () => <div className="mb-4" />;

const DatadogComponentsMain = () => {
  const { fetch } = useApi(fetchApiRef);
  const [isLoading, setLoading] = useState(true);
  const [logDetailsData, setLogDetailsData] = useState([]);
  const [chartData, setChartData] = useState(null);
  const [error, setError] = useState(null);
  const [latencyMonitorExists, setLatencyMonitorExists] = useState(false);
  const [errorMonitorExists, setErrorMonitorExists] = useState(false);
  const [saturationMonitorExists, setSaturationMonitorExists] = useState(false);
  const [trafficMonitorExists, setTrafficMonitorExists] = useState(false);
  const [duration, setDuration] = useState(null);
  const [trafficMonitorUrl, setTrafficMonitorUrl] = useState(null);
  const [latencyMonitorUrl, setLatencyMonitorUrl] = useState(null);
  const [saturationMonitorUrl, setSaturationMonitorUrl] = useState(null);
  const [errorMonitorUrl, setErrorMonitorUrl] = useState(null);
  const [currentMonitorPage, setCurrentMonitorPage] = useState(0);
  const config = useApi(configApiRef);
  const backendBaseApiUrl =
    config.getString('backend.baseUrl') + '/api/flowsource-datadog/';
  const entity = useEntity();
  const appid = entity.entity.metadata?.appid?.toLowerCase();
  const tags = entity.entity.metadata?.annotations['flowsource/datadog-tags'];
  const teamEmail = entity.entity.metadata?.annotations['flowsource/datadog-team'];
  const tagsArray = seggregateTags(tags);

  const primaryTag = tagsArray.length > 0 ? `${tagsArray[0].key}:${tagsArray[0].value}` : 'N/A';

  function constructQueryParams(tagsArray) {
    if (!tagsArray || tagsArray.length === 0) {
      log.error('Tags are not available');
      return '';
    }

    return tagsArray.map(element => `${element.key}=${element.value}`).join('&');
  }

  let queryParams = constructQueryParams(tagsArray);
  const [tabOneText, setTabOneText] = useState('');
  const [tabTwoText, setTabTwoText] = useState('');
  const [dialogMessage, setDialogMessage] = useState('');
  const [showDialog, setShowDialog] = useState(false);
  function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  function getRequestConfig(bodyData) {
    return {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(bodyData),
    };
  }

  function buildRequestQuery(data) {
    let query = {};
    let queryData = '';
    if (data) {
      if (data.appid) {
        queryData = `appid:${data.appid}`;
      }
      if (data.tags && data.tags.length > 0)
        if (queryData !== '') {
          data.tags.forEach(element => {
            queryData = `${queryData} AND ${element.key}:${element.value}`;
          });
        }
    }
    query = { query: queryData };
    return query;
  }

  async function postCall(url, bodyData) {
    const body = buildRequestQuery(bodyData);
    const config = getRequestConfig(body);
    return await fetch(url, config);
  }

  async function tryFetch(max_retries = 3, current_try = 0) {
    const url = backendBaseApiUrl + 'error';
    let result = await postCall(url, { appid: appid, tags: tagsArray });

    if (!result) {
      if (current_try < max_retries) {
        log.info(
          "couldn't fetch error logs. Retrying - attempt count " +
          current_try +
          ' of ' +
          max_retries +
          " retries.')",
        );
        await delay(500);
        result = await tryFetch(max_retries, current_try + 1);
        log.info('Found data with retry');
      } else {
        log.info('No error logs. Giving up.');
        throw new Error(`Failed retrying 3 times`, result);
      }
    } else {
      const responseData = await result.json();
      if (responseData.code === 429) {
        log.info('Rate limited. Retrying');
        await delay(500);
        result = await tryFetch(max_retries, current_try + 1);
        log.info('Found data with retry');
      } else if (result.status === 503) { // Check if status code is 503
        throw new Error('This plugin has not been configured with the required values. Please ask your administrator to configure it');
      }
      else {
        setDuration(responseData.meta.duration);
        return responseData;
      }
    }
    return result;
  }

  function retriveLogDetailsDataFromRes(result) {
    try {
      const transformedErrors = transformErrors(result);

      if (transformedErrors === undefined || transformedErrors === null) {
        const emptyLogsDetails = [];
        setLogDetailsData(emptyLogsDetails);
        setLoading(false);
      }
      else if (transformedErrors && transformedErrors.errorDetails) {
        const data = transformErrors(result).errorDetails;
        setLogDetailsData(data);
        setChartData(transformedErrors.chartData);
      }

    } catch (error) {
      log.error('Error:', error);
      setError(error.message);
      setLoading(false);
    }
  }

    const hasTagsAndAppId = checkTagsAndAppId();

    function checkTagsAndAppId() {
      return tags !== undefined && tags !== null && appid !== undefined && appid !== null;
    };

  const fetchAllData = async () => {
    try {
      if ((!tags) || (!appid)) {
        //We will not make the call to backend as annotations are missing. We will only disable the loading message.
        setLoading(false);
      }
      else {
        let url = backendBaseApiUrl + 'error/?appid=' + appid + '&' + queryParams;
        const errorLogs_response = await tryFetch(url);
        if (errorLogs_response) {
          const result = errorLogs_response;

          if (result.code === 429) {
            log.error('Error fetching data:', errorLogs_response.statusText);
            alert(
              'exceeded the limit of 1000 logs, please try with different filters',
            );
          }
          else {
            retriveLogDetailsDataFromRes(result);
          }
          setLoading(false);
        }
        else {
          const emptyLogsDetails = [];
          setLogDetailsData(emptyLogsDetails);
          log.error('Error fetching data:', errorLogs_response.statusText);
          setLoading(false);
        }
      }
    } catch (error) {
      log.error('Error:', error);
      setError(error.message);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  let startDateEpoch = 0;
  let currentDateEpoch = 0;
  const baseUrl = config.getString('datadog.url');
  // Calculate epoch milliseconds for the duration
  if (duration === null) {
    setDuration(0);
  } else {
    const currentDate = new Date();
    const startDate = new Date(currentDate.getTime() - (duration * 24 * 60 * 60 * 1000));
    startDateEpoch = startDate.getTime();
    currentDateEpoch = currentDate.getTime();
  }
  const datadogProjectUrl = baseUrl + `/logs?query=-status%3A%28warn%20OR%20notice%20OR%20info%20OR%20debug%20OR%20emergency%20OR%20critical%29%20appid%3A${appid}&from_ts=${startDateEpoch}&to_ts=${currentDateEpoch}`;

  //  check monitor function
  const checkMonitor = async (type, setExists, setUrl) => {
    let endpoint = '';
    if (type === 'Latency') {
      endpoint = 'check-monitor-exists';
    } else {
      endpoint = `check-${type.toLowerCase()}-monitor-exists`;
    }
    try {
      const serviceTag = `service:${appid}`;
      const tagsArrayWithService = [...tagsArray.map(tag => `${tag.key}:${tag.value}`), serviceTag];
      const monitorName = `${tagsArrayWithService.join(', ')}, ${type} Monitor`;

      const response = await fetch(
        `${backendBaseApiUrl}${endpoint}?name=${encodeURIComponent(monitorName)}`,
        {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' }
        }
      );

      if (response.ok) {
        const data = await response.json();
        setExists(data.exists);
        setUrl(data.url);
      } else {
        console.error(`Error checking ${type} monitor existence:`, response.statusText);
      }
    } catch (error) {
      console.error(`Error checking ${type} monitor existence:`, error);
    }
  };

  // create monitor function
  const createMonitor = async (type, thresholds, setExists, setUrl) => {
    try {
      const alertMessages = {
        Latency: `High latency detected in ${appid || 'N/A'} service. Please investigate immediately.`,
        Traffic: `High traffic detected in ${appid || 'N/A'} service.`,
        Error: `High error rate detected in ${appid || 'N/A'} service. Please investigate immediately.`,
        Saturation: `High saturation rate detected in ${appid || 'N/A'} service. Please investigate immediately.`
      };
      const alertMessage = alertMessages[type] || `Alert for ${type} in ${appid || 'N/A'} service.`;
      const teamEmail = entity.entity.metadata?.annotations['flowsource/datadog-team'];
      const serviceTag = `service:${appid}`;
      const tagsArrayWithService = [...tagsArray.map(tag => `${tag.key}:${tag.value}`), serviceTag];
      const monitorName = `${tagsArrayWithService.join(', ')}, ${type} Monitor`;
      const monitorData = {
        name: monitorName,
        type: "query alert",
        message: `${alertMessage}\n\nNotify: @${teamEmail || 'team@example.com'}`,
        tags: tagsArrayWithService,
        priority: 3,
        thresholds
      };

      const response = await fetch(
        backendBaseApiUrl + `create-${type.toLowerCase()}-monitor`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(monitorData)
        }
      );

      if (response.ok) {
        const responseData = await response.json();
        setDialogMessage('Monitor has been created successfully in Datadog !!');
        setShowDialog(true);
        setExists(true);
        setUrl(responseData.monitorUrl);
      } else {
        const errorData = await response.json();
        setDialogMessage(`Error creating ${type.toLowerCase()} monitor: ${errorData.error}`);
        setShowDialog(true);
      }
    } catch (error) {
      console.error(`Error creating ${type} monitor:`, error);
      setDialogMessage(`An error occurred while creating the ${type.toLowerCase()} monitor.`);
      setShowDialog(true);
    }
  };
  useEffect(() => {
    checkMonitor('Latency', setLatencyMonitorExists, setLatencyMonitorUrl);
    checkMonitor('Traffic', setTrafficMonitorExists, setTrafficMonitorUrl);
    checkMonitor('Error', setErrorMonitorExists, setErrorMonitorUrl);
    checkMonitor('Saturation', setSaturationMonitorExists, setSaturationMonitorUrl);
  }, []);

  const classes = cssClasses();
  // Rendering Monitor data
  const renderMonitorCard = (title, monitorType, primaryTag, appid, thresholds, alertMessage, teamEmail, createMonitor, monitorExists, monitorUrl, triggeredWhen) => {
    return (
      <Card style={{ backgroundColor: "#d3d3d373" }}>
        <CardHeader
          avatar={<img src={monitorIcon} alt="Monitor Icon" style={{ width: '24px', height: '24px' }} />}
          title={
            <div className={classes.cardHeader}>
              <div variant="h6" className={classes.headingStyle}>
                {title}
              </div>
              <IconButton
                aria-label="monitor-link"
                href={monitorUrl || undefined}
                target={monitorUrl ? "_blank" : undefined}
                rel="noopener noreferrer"
                disabled={!monitorUrl}
                style={{
                  marginLeft: '8px',
                  color: monitorUrl ? '#16386a' : 'gray',
                  cursor: monitorUrl ? 'pointer' : 'not-allowed',
                }}
              >
                <OpenInNewIcon />
              </IconButton>
            </div>
          }
          style={{ paddingBottom: "0px" }}
        />
        <CardContent style={{ paddingBottom: "0px" }}>
          <div className={classes.monitorDetailItemSubtitle}>MONITOR TYPE</div>
          <div className={classes.monitorDetailItemBody}>{monitorType}</div>

          <div className={classes.monitorDetailItemSubtitle}>PRIMARY TAGS</div>
          <div className={classes.monitorDetailItemBody}>{primaryTag}</div>

          <div className={classes.monitorDetailItemSubtitle}>SERVICE</div>
          <div className={classes.monitorDetailItemBody}>{appid}</div>

          <div className={classes.monitorDetailItemSubtitle}>EVALUATE THE QUERY OVER THE LAST</div>
          <div className={classes.monitorDetailItemBody}>5 min</div>

          <div className={classes.monitorDetailItemSubtitle}>TRIGGERED WHEN</div>
          <div className={classes.monitorDetailItemBody}>{triggeredWhen} is above threshold</div>

          <div className={classes.monitorDetailItemSubtitle}>ALERT THRESHOLD</div>
          <div className={classes.monitorDetailItemBody}>{thresholds.critical}</div>

          <div className={classes.monitorDetailItemSubtitle}>WARNING THRESHOLD</div>
          <div className={classes.monitorDetailItemBody}>{thresholds.warning}</div>

          <div className={classes.monitorDetailItemSubtitle}>ALERT MESSAGE</div>
          <div className={classes.monitorDetailItemBody}>{alertMessage}</div>

          <div className={classes.monitorDetailItemSubtitle}>PRIORITY</div>
          <div className={classes.monitorDetailItemBody}>P3</div>

        </CardContent >
        {/* Divider before the button */}
        <div style={{ height: '1px', backgroundColor: '#ccc' }}></div>
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <IconButton
            aria-label="create"
            onClick={createMonitor}
            disabled={monitorExists}
            style={{
              display: 'flex',
              justifyContent: 'center',
              opacity: monitorExists ? 0.5 : 1,
              cursor: monitorExists ? 'not-allowed' : 'pointer',
            }}
          >
            <img
              src={createIcon}
              alt="Create Icon"
              className={classes.createIcon}
            />
            <div
              variant="button"
              display="block"
              style={{
                color: monitorExists ? 'gray' : '#16386a',
                fontSize: '0.9rem',
              }}
            >
              CREATE
            </div>
          </IconButton>
        </div>
      </Card>
    );
  };
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 5;
  const [selectedSeverity] = useState({
    high: true,
    medium: true,
    low: true,
  });
  const handlePageChange = pageNumber => {
    setCurrentPage(pageNumber);
  };
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    if (showModal)
      setActiveTab('message');
  }, [showModal]);

  const handleIconClick = (message, stacktrace) => {
    setTabOneText(message);
    setTabTwoText(stacktrace);
    setShowModal(true);
  };

  const getFilteredItems = () => {
    const filteredList = logDetailsData && logDetailsData.filter(row => {
      if (row !== undefined && row.severity !== undefined) {
        return (
          (selectedSeverity.high && row.severity === 'high') ||
          (selectedSeverity.medium && row.severity === 'medium') ||
          (selectedSeverity.low && row.severity === 'low') ||
          (!selectedSeverity.high &&
            !selectedSeverity.medium &&
            !selectedSeverity.low)
        );
      }
    })

    return filteredList;
  }

  const currentTableData = getFilteredItems().slice(startIndex, endIndex);
  const pagesToShow = 3;

  const totalPages = Math.ceil(
    getFilteredItems()?.length / ITEMS_PER_PAGE,
  );
  const pagesArray = [...Array(totalPages).keys()];


  const calculatePagination = (currentPage, pagesToShow, totalPages) => {
    let startPage = currentPage > pagesToShow - 2
      ? Math.max(1, currentPage - Math.floor(pagesToShow / 2))
      : 1; // Ensure startPage is at least 1

    let endPage = currentPage > pagesToShow - 2
      ? Math.min(startPage + pagesToShow - 1, totalPages)
      : Math.min(pagesToShow, totalPages); // Ensure endPage does not exceed totalPages

    return { startPage, endPage };
  };

  const { startPage, endPage } = calculatePagination(currentPage, pagesToShow, totalPages);
  const isPreviousDisabled = currentPage === 1;
  const isNextDisabled = currentPage === totalPages;

  const [activeTab, setActiveTab] = useState('message');
  const copyText = text => {
    navigator.clipboard
      .writeText(text)
      .then(() => log.info('Copied'))
      .catch(error => log.error('Error copying text: ', error));
  };

  if (isLoading) {
    return (
      <div className="App p-3" style={{ display: 'flex', justifyContent: 'center', alignItems: 'flex-start', height: '20vh', marginTop: '15vh' }}>
        Loading...
      </div>
    );
  }
  const truncateMessage = (message, length = 100) => {
    if (message.length > length) {
      return message.substring(0, length) + '......';
    }
    return message;
  };

  if (error) {
    return (
      <div style={{ 'width': '100% !important' }}>
        <Card>
          <CardHeader title={<div variant="h6">Error</div>} />
          <Divider />
          <CardContent>
            <Paper role="alert" elevation={0}>
              <Alert severity="error">{error}</Alert>
            </Paper>
          </CardContent>
        </Card>
        <Spacer />
      </div>
    );
  }

  const filteredItems = getFilteredItems();
  const hasNoItems = filteredItems?.length === 0;
  const nextDisabledClass = checkIsNextDisabled();
  const previousDisabledClass = checkPreviousDisabled();

  function checkIsNextDisabled() {
    if (isNextDisabled) {
      return 'disabled';
    } else {
      return '';
    }
  };
  function checkPreviousDisabled() {
    if (isPreviousDisabled) {
      return 'disabled';
    } else {
      return '';
    }
  }

  function renderChartData() {
    if (chartData === null || chartData?.length === 0) {
      return (<div className={`ms-1`}>No data available</div>);
    }
    else {
      return (<BarChart values={chartData} />);
    }

  };

  function getCssForActiveTabMessage() {
    if (activeTab === 'message') {
      return `${classes.activeTab}`;
    } else {
      return `${classes.disableTab}`;
    }
  };

  function getCssForActiveTabStacktrace() {
    if (activeTab === 'stacktrace') {
      return `${classes.active}`;
    } else {
      return `${classes.disableTab}`;
    }
  };

  function showMonitorcard() {
    // Thresholds (already in your code)
    const thresholdsLatency = { critical: 0.5, warning: 0.3 };
    const thresholdsTraffic = { critical: 3, warning: 2 };
    const thresholdsError = { critical: 5, warning: 3 };
    const thresholdsSaturation = { critical: 600, warning: 200 };
    // Create monitor handlers using the generic function
    const createLatencyMonitor = () =>
      createMonitor('Latency', thresholdsLatency, setLatencyMonitorExists, setLatencyMonitorUrl);

    const createTrafficMonitor = () =>
      createMonitor('Traffic', thresholdsTraffic, setTrafficMonitorExists, setTrafficMonitorUrl);

    const createErrorMonitor = () =>
      createMonitor('Error', thresholdsError, setErrorMonitorExists, setErrorMonitorUrl);

    const createSaturationMonitor = () =>
      createMonitor('Saturation', thresholdsSaturation, setSaturationMonitorExists, setSaturationMonitorUrl);
    // List of all monitor cards
    const monitors = [
      renderMonitorCard(
        'Latency Monitor',
        'APM',
        primaryTag,
        appid,
        thresholdsLatency,
        `High latency detected in ${appid || 'N/A'} service. Notify @${teamEmail || 'team'}`,
        teamEmail,
        createLatencyMonitor,
        latencyMonitorExists,
        latencyMonitorUrl,
        'P95 Latency'
      ),
      renderMonitorCard(
        'Traffic Monitor',
        'APM',
        primaryTag,
        appid,
        thresholdsTraffic,
        `High traffic detected in ${appid || 'N/A'} service. Notify @${teamEmail || 'team'}`,
        teamEmail,
        createTrafficMonitor,
        trafficMonitorExists,
        trafficMonitorUrl,
        'Request hits'
      ),
      renderMonitorCard(
        'Error Monitor',
        'APM',
        primaryTag,
        appid,
        thresholdsError,
        `High error rate detected in ${appid || 'N/A'} service. Notify @${teamEmail || 'team'}`,
        teamEmail,
        createErrorMonitor,
        errorMonitorExists,
        errorMonitorUrl,
        'Error rate'
      ),
      renderMonitorCard(
        'Saturation Monitor',
        'APM',
        primaryTag,
        appid,
        thresholdsSaturation,
        `High saturation rate detected in ${appid || 'N/A'} service. Notify @${teamEmail || 'team'}`,
        teamEmail,
        createSaturationMonitor,
        saturationMonitorExists,
        saturationMonitorUrl,
        'memory usage'
      ),
    ];

    const ITEMS_PER_PAGE = 3; // Number of monitors to display per page
    const startIndex = currentMonitorPage
    const endIndex = startIndex + ITEMS_PER_PAGE;
    const paginatedMonitors = monitors.slice(startIndex, endIndex);

    // Handlers for navigation
    const handleNextPage = () => {
      if (endIndex < monitors.length) {
        setCurrentMonitorPage(currentMonitorPage + 1);
      }
    };

    const handlePreviousPage = () => {
      if (startIndex > 0) {
        setCurrentMonitorPage(currentMonitorPage - 1);
      }
    };

    return (
      <div style={{ marginTop: '10px' }}>
        <div variant="h5" style={{ marginBottom: '20px', fontweight: 'bold', fontSize: "1.3rem" }}>
          Daywise Application Error
        </div>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '10px',
          }}
        >
          {/* Left Arrow */}
          <IconButton
            aria-label="Previous"
            onClick={handlePreviousPage}
            disabled={startIndex === 0}
            className={classes.previousnextbutton}
          >
            <ArrowBackIosNewRoundedIcon style={{ color: 'white', fontSize: '10px' }} />
          </IconButton>
          {/* Monitor Cards */}
          <div
            style={{
              display: 'flex',
              flexGrow: 1,
              justifyContent: 'space-around',
              gap: '20px',
            }}
          >
            {paginatedMonitors}
          </div>

          {/* Right Arrow */}
          <IconButton
            aria-label="Next"
            onClick={handleNextPage}
            disabled={endIndex >= monitors.length}
            className={classes.previousnextbutton}
          >
            <ArrowForwardIosRoundedIcon style={{ color: 'white', fontSize: '10px' }} />
          </IconButton>
          <Modal show={showDialog} onHide={() => setShowDialog(false)} centered >
            <Modal.Body>
              <div className={classes.modalBody}>{dialogMessage}</div>
              <div>
                <button onClick={() => setShowDialog(false)} className={classes.modalButton}>
                  OK
                </button>
              </div>
            </Modal.Body>
          </Modal>
        </div>
      </div>
    );
  };

  function rednderDataDogPage() {
    if (!hasTagsAndAppId) {
      return (
        <div className='mt-2 ms-4 me-4 mb-4'>
          <EntitySwitch>
            <EntitySwitch.Case>
              <EmptyState
                title="No Datadog page is available for this entity"
                missing="info"
                description="You need to add an annotation to your component if you want to see Datadog page for it."
              />
            </EntitySwitch.Case>
          </EntitySwitch>
        </div>
      );
    }
    else if (logDetailsData.length === 0 || logDetailsData === undefined || logDetailsData === null) {
      return (<NoDataTag />);
    }
    else {
      return (
        <div>
          <div className={`row mt-2`}>
            <div className={`col-12 ${classes.headingDiv1}`}>
              <h2 className="mt-2 ms-4" style={{ fontSize: '1.5rem' }}>
                Application Error Details
              </h2>
              <div className={`${classes.headingDiv2}`}>
                <Link href={datadogProjectUrl} target="_blank" rel="noopener noreferrer" className={classes.datadogLink}>
                  <b>View Logs <OpenInNewIcon fontSize="small" /></b>
                </Link>
                <PluginVersion />
              </div>
            </div>
            <div>
              <div
                className="ms-4 me-4 mb-4 table-responsive"
                style={{ marginTop: '1.5rem' }}
              >
                <table className={`table ${classes.tableStriped} ${classes.table}`}>
                  <thead>
                    <tr className={`${classes.tableHead}`}>
                      <th scope="col">Date</th>
                      <th scope="col">Tags</th>
                      <th scope="col">Message</th>
                      <th scope="col">Source</th>
                      <th scope="col">Details</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentTableData &&
                      currentTableData.map(row => (
                        <tr key={row.id}>
                          <td>
                            {new Date(row.date).toLocaleDateString('en-IN', {
                              day: '2-digit',
                              month: '2-digit',
                              year: 'numeric',
                            })}
                          </td>
                          <td>{row.tags}</td>
                          <td style={{ textAlign: 'left', fontSize: '14.5px' }}>{truncateMessage(row.message)}</td>
                          <td style={{ width: '10rem' }}>{row.source}</td>
                          <td>
                            <IconButton
                              onClick={() =>
                                handleIconClick(row.message, row.stacktrace)
                              }
                              color="inherit"
                              className={`${classes.detailButton}`}
                            >
                              <img
                                style={{ width: '81%' }}
                                src={detailIcon}
                                alt="button icon"
                              />
                            </IconButton>
                            {row.detail}
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
                {hasNoItems ? (
                  ''
                ) : (
                  <nav aria-label="Page navigation example">
                    <ul
                      className={`pagination justify-content-end ${classes.ulCss} ${classes.customPagination}`}
                    >
                      <li className={`page-item ${previousDisabledClass}`}>
                        <a
                          aria-label="Previous"
                          className="page-link"
                          href="#"
                          tabIndex="-1"
                          onClick={() => handlePageChange(currentPage - 1)}
                        >
                          <span aria-hidden="true">«</span>
                        </a>
                      </li>
                      {startPage > 1 && (
                        <li className="page-item disabled">
                          <span className="page-link">...</span>
                        </li>
                      )}
                      {pagesArray.slice(startPage - 1, endPage).map(index => (
                        <li key={index} className={`page-item ${classes.numCss}`}>
                          <a
                            className={`page-link  ${index + 1 === currentPage ? 'Mui-selected' : ''
                              }`}
                            href="#"
                            onClick={() => handlePageChange(index + 1)}
                          >
                            {index + 1}
                          </a>
                        </li>
                      ))}
                      {endPage < totalPages && (
                        <li className="page-item disabled">
                          <span className="page-link">...</span>
                        </li>
                      )}
                      <li className={`page-item ${nextDisabledClass}`}>
                        <a
                          href="#"
                          className="page-link"
                          onClick={() => handlePageChange(currentPage + 1)}
                          aria-label="Next"
                        >
                          <span aria-hidden="true">»</span>
                        </a>
                      </li>
                    </ul>
                  </nav>
                )}
              </div>
            </div>
            <div className={`row justify-content-center`}>
              <div className={`card ${classes.cardCss}`}>
                <div className={`card-text ms-2 mt-2`}>
                  <div className={`ms-1 mb-2`}>
                    <b>Application Errors</b>
                  </div>
                  {renderChartData()}
                </div>
              </div>
            </div>
            <div>
              <Modal size="lg" show={showModal} onHide={() => setShowModal(false)}>
                <div className={`row justify-content-start mt-4 ms-1 pb-2`}>
                  <div className={`col-sm-2`} style={{ width: '10%' }}>
                    <div
                      style={{ fontSize: '1rem' }}
                      className={`${classes.tab} ${getCssForActiveTabMessage()} ${classes.active}`}
                      onClick={() => setActiveTab('message')}
                    >
                      Message
                    </div>
                  </div>
                  <div className={`col-auto`}>
                    <div className={`${classes.verticalLine}`}></div>
                  </div>
                  <div className={`col-sm-2`}>
                    <div
                      style={{ fontSize: '1rem' }}
                      className={`${classes.tab} ${getCssForActiveTabStacktrace()} `}
                      onClick={() => setActiveTab('stacktrace')}
                    >
                      Stacktrace
                    </div>
                  </div>
                </div>

                <Modal.Body
                  style={{ overflowY: 'auto', maxHeight: 'calc(88vh - 210px)' }}
                >
                  {activeTab === 'message' && (
                    <div>
                      <div className={`row float-end`} style={{ margintop: '-4rem' }}>
                        <IconButton
                          onClick={() => {
                            copyText(tabOneText);
                            alert('Copied sucessfully !');
                          }}
                          color="inherit"
                          className={`${classes.copyButton}`}
                        >
                          <img
                            style={{ height: '1.7rem' }}
                            src={copyIcon}
                            alt="button icon"
                          />
                        </IconButton>

                      </div>
                      <div className={`row ${classes.rowButton}`}>
                        <div>{tabOneText}</div>
                      </div>
                    </div>
                  )}
                  {activeTab === 'stacktrace' && (
                    <div>
                      <div className={`row float-end`} style={{ margintop: '-4rem' }}>
                        <IconButton
                          onClick={() => {
                            copyText(tabTwoText);
                            alert('Copied sucessfully !');
                          }}
                          color="inherit"
                          className={`${classes.copyButton}`}
                        >
                          <img
                            style={{ height: '1.7rem' }}
                            src={copyIcon}
                            alt="button icon"
                          />
                        </IconButton>
                      </div>
                      <div className={`row ${classes.rowButton}`}>
                        <div>{tabTwoText}</div>
                      </div>
                    </div>
                  )}
                </Modal.Body>
                <Modal.Footer>
                  <button
                    onClick={() => setShowModal(false)}
                    className={`${classes.Footer}`}
                  >
                    Close
                  </button>
                </Modal.Footer>
              </Modal>
            </div>
          </div>
          { showMonitorcard() }
        </div>
      );
    }
  };

  return (
    <>
      { rednderDataDogPage() }
    </>
  );
};

const NoDataTag = () => {
  return (
    <div className={`row justify-content-center`}>
      <div className={`card`}>
        <div className={`card-text ms-2 mt-2`}>
          <div className={`mt-2 ms-2`} style={{ fontSize: '1.5rem' }}>
            <b>Application Error Details</b>
          </div>
          <div style={{ display: 'flex', justifyContent: 'center', width: '100%', fontSize: '1.2rem', paddingTop: '1.5rem', paddingBottom: '2rem' }}>
            <b>No data available</b>
          </div>
        </div>
      </div>
    </div>
  );
}

export default DatadogComponentsMain;
