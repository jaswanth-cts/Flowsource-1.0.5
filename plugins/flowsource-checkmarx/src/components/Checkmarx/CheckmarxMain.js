import { useState, useEffect, React } from 'react';
import cssClasses from './CheckmarxCss';
import 'chart.js/auto';
import GroupedBarChart from './GroupedBarChart';
import PieChart from './PieChart';
import { configApiRef, useApi, fetchApiRef } from '@backstage/core-plugin-api';
import { useEntity } from '@backstage/plugin-catalog-react';
import pdfIcon from './icons/pdf-file.png';
import {
  Paper,
  Card,
  CardHeader,
  Typography,
  Divider,
  CardContent,
  Alert,
} from '@mui/material';

import PluginVersion from '../PluginVersion/PluginVersion';
import { Link } from "@material-ui/core";
import OpenInNewIcon from '@material-ui/icons/OpenInNew';

import log from 'loglevel';

const Spacer = () => <div className="mb-4" />;

const CheckmarxMain = () => {
  const classes = cssClasses();
  const { fetch } = useApi(fetchApiRef);
  const entity = useEntity();
  const applicationName = entity.entity.metadata.annotations["flowsource/checkmarx-project-id"];

  log.info('entity applicationName ', applicationName);

  const formatDate = (isoDate) => {
    const date = new Date(isoDate);
    const day = date.getDate();
    const month = date.toLocaleString('default', { month: 'short' });
    const year = date.getFullYear();
    const hours = date.getHours();
    const minutes = date.getMinutes();
    const seconds = date.getSeconds();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    // Convert to 12-hour format\
    const formattedHours = hours % 12 || 12;
    return `${day} ${month} ${year} ${formattedHours}:${minutes}:${seconds} ${ampm} IST`;
  };

  const [checkmarxSummary, setCheckmarxSummary] = useState(null);

  const [scanId, setScanId] = useState(null);
  const [isLoading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [projectId, setProjectId] = useState(null);
  const config = useApi(configApiRef);
  const backendBaseApiUrl = config.getString('backend.baseUrl') + '/api/flowsource-checkmarx/';
  log.info('Application name --- ' + applicationName);

  const fetchAllData = async () => {
    try {
      //fetch project_details
      const checkmarx_summary = await fetch(backendBaseApiUrl + 'checkmarx-summary?applicationName=' + applicationName);
      if (checkmarx_summary.ok) {
        const result = await checkmarx_summary.json();
        setScanId(result.scanId);
        setProjectId(result.projectId);
        const checkmarxDataString = JSON.stringify(result).replace(/&gt;/g, '>');
        const checkmarxData = JSON.parse(checkmarxDataString);
        setCheckmarxSummary(checkmarxData);
        setLoading(false);
      }
      else if (checkmarx_summary.status === 404)
      {
        const errorMessage = await checkmarx_summary.json();

        if(errorMessage.error.includes("No project found for the provided filter.")) {
          setError("No project could be found with name \"" + applicationName + "\" in Checkmarx. Please check the project name and try again.");
          setLoading(false);
        } else {
          setError(`Error fetching Checkmarx details, with status code ${checkmarx_summary.status}.`);
          setLoading(false);
        }
      }
      else if (checkmarx_summary.status === 503) {
        setError('This plugin has not been configured with the required values. Please ask your administrator to configure it');
        setLoading(false);
      } else {
        log.error('Error fetching project details:', checkmarx_summary.statusText);
        setError(`Error fetching Checkmarx details, with status code ${checkmarx_summary.status}.`);
        setLoading(false);
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
  const baseUrl = config.getString('checkmarx.baseUrl');
  const checkmarxProjectUrl = baseUrl +`cxwebclient/ProjectStateSummary.aspx?projectid=${projectId}`;
  if (isLoading) {
    return <div className={`App p-3`}>Loading...</div>;
  }


  if (error) {
    return (
      <div className="card ms-2 me-2 mb-2 mt-2">
        <div className="card-header">
          <h6 className="mb-0">Error</h6>
        </div>
        <div className="card-body">
          <div className="alert alert-danger mt-2 mb-2" role="alert">
            {error}
          </div>
        </div>
      </div>
    );
  }

  const handleDownload = async () => {
    try {
      const response = await fetch(backendBaseApiUrl + 'pdf-report?scanId=' + scanId);
      const blob = await response.blob();

      // Create a download link
      const link = document.createElement('a');
      link.href = window.URL.createObjectURL(new Blob([blob]));
      link.download = applicationName + '-checkmarx-report.pdf';

      // Trigger a click event to start the download
      link.click();
    } catch (error) {
      log.error('Error downloading PDF:', error);
    }
  };

  return (
    <div style={{ width: '100%' }}>
    {checkmarxSummary && Object.keys(checkmarxSummary).length !== 0 ? (
      <div style={{ width: '100%' }}>
        <div className={`${classes.mainBackground}`} style={{ width: '100%' }}>
            {/* First Row */}
            <div className={`row ms-1 me-1 mt-1 ps-2`}>
              <h6>
                <div className={`row`}>
                  <div className={`${classes.heading} col-9 mt-1`}>Checkmarx Scan Report</div>
                  <div className={`${classes.iconStyle} col-3`}>
                    <div className={`${classes.pluginHeading}`}>
                      <Link href={checkmarxProjectUrl} target="_blank" rel="noopener noreferrer" className={classes.checkmarxLink}>
                        <b>Project <OpenInNewIcon fontSize="small" /></b>
                      </Link>
                      <button onClick={handleDownload} className={`${classes.bStyle}`}>
                        <img src={pdfIcon} className={`${classes.imageStyle}`} />
                      </button>
                      <PluginVersion />
                    </div>
                  </div>
                </div>
              </h6>
            </div>
            <div className={`row ms-1 me-1`}>
              <div className={`col-4`}>
                <div className={`card ${classes.card5}`}>
                  <div className={`card-text ${classes.card1} ms-2 mt-2`}>
                    <div className={`mb-2`}>Project Name: <strong>{applicationName}</strong></div>
                    <div className={`mb-2`}>Preset: <strong>{(checkmarxSummary.projectSummary.preset !== undefined) ? (checkmarxSummary.projectSummary.preset) : ""}</strong></div>
                    <div className={`mb-2`}>Last Scan: <strong>{(checkmarxSummary.projectSummary.lastScane) ? formatDate(checkmarxSummary.projectSummary.lastScane) : "N/A"}</strong></div>
                    <div className={`mb-2`}>Scan Type: <strong>{checkmarxSummary.projectSummary.scanType ? checkmarxSummary.projectSummary.scanType : "N/A"}</strong></div>
                    <div className={`mb-2`}>Density: <strong>{checkmarxSummary.projectSummary.density}</strong></div>
                    <div className={`mb-2`}>Lines Of Code Scanned: <strong>{checkmarxSummary.projectSummary.linesOfCodeScanned}</strong></div>
                    <div className={`mb-2`}>Files Scanned: <strong>{checkmarxSummary.projectSummary.filesScanned}</strong></div>
                  </div>
                </div>
              </div>
              <div className={`col-8`}>
                <div className={`card ${classes.card5}`}>
                  <div className={classes.cardHeading}>Issue Distribution</div>
                  <PieChart data={checkmarxSummary} />
                </div>
              </div>
            </div>

            {/* Second Row */}
            <div className={`row ms-1 me-1 mb-2 mt-4`}>
              <div className={`col-5`}>

                <div className={`card ${classes.card5}`}>
                  <div className={classes.cardHeading}>High vulnerabilities</div>
                  {checkmarxSummary.topFiveVulnerabilities && checkmarxSummary.topFiveVulnerabilities.length > 0 ? (
                    checkmarxSummary.topFiveVulnerabilities.map((item) => (
                      <ul key={item.id} className={`${classes.customList} mt-1`}>
                        <li key={item.id} className={`${classes.customListItem}`}>{item.vulnerability.name}</li>
                        <span className={`${classes.fStyle} `}>- {item.mostVulnerableFile}</span>
                      </ul>
                    ))
                  ) : (
                    <div className={classes.cardStyle}>
                      <p className={`${classes.pStyle}`}><strong>No Vulnerabilities Available</strong></p>
                    </div>
                  )}
                </div>
              </div>
              <div className={`col-7`}>
                <div className={`card ${classes.card5}`}>
                  <div className={classes.cardHeading}>Vulnerabilities as of current date</div>

                  <GroupedBarChart values={checkmarxSummary} />
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div>
          <h5><strong>{applicationName} details are not available in Checkmarx Portal</strong></h5>
        </div>
      )}
    </div>
  );
};

export default CheckmarxMain;
