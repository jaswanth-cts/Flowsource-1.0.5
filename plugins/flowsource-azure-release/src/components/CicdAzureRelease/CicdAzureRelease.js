import React, { useState, useEffect } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import cssClasses from './CicdAzureReleaseCss';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import {configApiRef, useApi, fetchApiRef} from '@backstage/core-plugin-api';
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
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Pagination,
} from '@mui/material';
import log from 'loglevel';
import branchIcon from './icons/branch_icon.png';
import buildIcon from './icons/build_icon.png';
import completeIcon from './icons/complete_icon.svg';
import cancelledIcon from './icons/cancelled_icon.svg';
import errorIcon from './icons/error_icon.svg';
import abandonedIcon from './icons/abandoned_icon.png';
import defaultIcon from './icons/default.png';
import notStarted from './icons/not_started_icon.svg';
import inProgressIcon from './icons/inprogress_icon.svg';
import { useEntity } from '@backstage/plugin-catalog-react';

const itemsPerPage = 10;

const CicdAzureRelease = () => {
  const classes = cssClasses();
  const { fetch } = useApi(fetchApiRef);
  const config = useApi(configApiRef);
  const entity = useEntity();
  const backendBaseUrl = config.getString('backend.baseUrl').replace(/\/$/, '') + '/api/flowsource-azure-release';
  const pipelineNames = entity.entity.metadata.annotations['flowsource/azure-release-pipeline'] ? entity.entity.metadata.annotations['flowsource/azure-release-pipeline'].split(",") : [];
  const organization = entity.entity.metadata.annotations['flowsource/azure-organization'];
  const project = entity.entity.metadata.annotations['flowsource/azure-project'];
  const baseUrlConfig = config.getOptionalString('azureRelease.hostUrl') || '';
  const hostURL = baseUrlConfig?.endsWith('/')
    ? baseUrlConfig.slice(0, -1)
    : baseUrlConfig;
  const azureBaseURL = `${hostURL}/${organization}/${project}`
  const [releaseData, setReleaseData] = useState({});
  const [error, setError] = useState(null);
  const [expandedAccordion, setExpandedAccordion] = useState(null);
  const [loading, setLoading] = useState(false);
  const [popupData, setPopupData] = useState(null);
  const [popupLog, setPopupLog] = useState('');
  const [pageStates, setPageStates] = useState({});

  const handleAccordionChange = pipelineName => async (_, isExpanded) => {
    if (isExpanded) {
      setExpandedAccordion(pipelineName);
      if (!releaseData[pipelineName]) {
        setLoading(true);
        try {
          const res = await fetch(
            `${backendBaseUrl}/releases?pipelineName=${encodeURIComponent(pipelineName)}&organization=${encodeURIComponent(organization)}&project=${encodeURIComponent(project)}`
          );
          const data = await res.json();
          if (data.success) {
            setReleaseData(prev => ({
              ...prev,
              [pipelineName]: data.data,
            }));
            setPageStates(prev => ({ ...prev, [pipelineName]: 1 }));
          } else {
            setError('Failed to load release data');
          }
        } catch (err) {
          log.error('Error in fetching release data', err);
          setError(err.message);
        } finally {
          setLoading(false);
        }
      }
    } else {
      setExpandedAccordion(null);
    }
  };

  const handleChangePage = (pipelineName, newPage) => {
    setPageStates(prev => ({
      ...prev,
      [pipelineName]: newPage,
    }));
  };

  const getStageClass = status => {
    const safeStatus = typeof status === 'string' ? status.toLowerCase() : 'unknown';
    switch (safeStatus) {
      case 'succeeded':
        return classes.succeeded;
      case 'canceled':
        return classes.cancelled;
      case 'inprogress':
        return classes.inProgress;
      case 'error':
      case 'notStarted':
      case 'rejected':
        return classes.error;
      case 'abandoned':
        return classes.abandoned;
      default:
        return classes.stageUnknown;
    }
  };


  const getStageIcon = status => {
    const safeStatus = typeof status === 'string' ? status.toLowerCase() : 'unknown';
    switch (safeStatus) {
      case 'succeeded':
        return completeIcon;
      case 'inprogress':
        return inProgressIcon;
      case 'canceled':
        return cancelledIcon;
      case 'error':
      case 'failed':
      case 'rejected':
        return errorIcon;
      case 'notstarted':
        return notStarted;
      case 'abandoned':
        return abandonedIcon;
      default:
        return defaultIcon;
    }
  };

  const handleStageClick = async (releaseId, stageName, deployStatus, stageId) => {
    try {
      const res = await fetch(
        `${backendBaseUrl}/stage-log?releaseId=${releaseId}&organization=${organization}&project=${project}`
      );
      const data = await res.json();

      if (data.success && Array.isArray(data.data)) {
        const stageLog = data.data.find(stage => stage.stageId === stageId);

        setPopupData({ stageName, deployStatus });

        if (stageLog) {
          const errorMsg = stageLog.taskError || 'No error message';
          const logMessage = `Status: ${stageLog.deployStatus}\nMessage: ${errorMsg}`;
          setPopupLog(logMessage);
        } else {
          setPopupLog('No logs found for this stage.');
        }
      } else {
        setPopupData({ stageName, deployStatus });
        setPopupLog('No logs found for this stage.');
      }
    } catch (err) {
      log.error('Error fetching stage logs', err);
      setPopupData({ stageName, deployStatus });
      setPopupLog('Error fetching stage logs');
    }
  };

  return (
    <div className={`${classes.paddingchn}`}>
      <div className="row">
        <div className="col-12">
          <div className={classes.pluginHeading}>
            <h5><b>Azure Release</b></h5>
          </div>
        </div>
      </div>

      {loading && (
        <div className="App p-3" style={{ display: 'flex', justifyContent: 'center', alignItems: 'flex-start', height: '100vh', paddingTop: '30%' }}>
          Loading...
        </div>
      )}
      
      {pipelineNames.map((pipelineName, index) => {
        const currentPage = pageStates[pipelineName] || 1;
        const releases = releaseData[pipelineName] || [];

        //Context Variables for Pagination
        const totalPages = Math.ceil(releases.length / itemsPerPage);

        useEffect(() => {
          if (releases.length) {
            setPageStates(prev => ({
              ...prev,
              [pipelineName]: 1,
            }));
          }
        }, [releases, pipelineName]);

        const handlePageChange = (_, newPage) => {
          setPageStates(prev => ({
            ...prev,
            [pipelineName]: newPage,
          }));
        };

        const paginatedReleases = releases.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

        return (
          <Accordion
            key={index}
            expanded={expandedAccordion === pipelineName}
            onChange={handleAccordionChange(pipelineName)}
          >
            <AccordionSummary expandIcon={<ExpandMoreIcon />} aria-controls={`panel${index}-content`} id={`panel${index}-header`} style={{ backgroundColor: '#92bbe6' }}>
              <Typography>{pipelineName}</Typography>
            </AccordionSummary>
            <AccordionDetails>
              {releases.length > 0 ? (
                <>
                  <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 10, gap: '9px' }}>
                    {[{ icon: completeIcon, label: 'Completed' },
                    { icon: inProgressIcon, label: 'In Progress'},
                    { icon: cancelledIcon, label: 'Cancelled' },
                    { icon: errorIcon, label: 'Failed' },
                    { icon: notStarted, label: 'Not Started' }]
                      .map(({ icon, label }) => (
                        <div className={classes.legendLabel} key={label}>
                          <img src={icon} className={classes.legendIcon} alt={label} />
                          {label}
                        </div>
                      ))}
                  </div>

                  <Paper style={{ width: '100%', overflowX: 'auto' }}>
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell className={classes.bgInfo}>Release Name</TableCell>
                          <TableCell className={classes.bgInfo}>Created</TableCell>
                          <TableCell className={classes.bgInfo}>Stage</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {paginatedReleases.map((release, idx) => (
                          <TableRow key={idx}>
                            <TableCell>
                              <div style={{ fontWeight: 'bold' }}>
                                <a
                                  href={`${azureBaseURL}/_releaseProgress?_a=release-pipeline-progress&releaseId=${release.releaseId}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  style={{ textDecoration: 'none', color: '#000048' }}
                                >
                                  {release.releaseName}
                                </a>
                              </div>
                              <br />
                              <div style={{ fontSize: '0.75rem', color: 'rgba(102,102,102, 1)', display: 'flex', flexDirection: 'row', alignItems: 'center', cursor: 'pointer' }}>
                                <img src={buildIcon} className={classes.buildBranchIcon} alt="build" />
                                {release.buildNumber}
                                &nbsp; | &nbsp;
                                <img style={{ marginBottom: '4px' }} src={branchIcon} className={classes.buildBranchIcon} alt="branch" />
                                {release.branchName}
                              </div>
                            </TableCell>

                            <TableCell>
                              {new Date(release.releaseCreatedOn).toLocaleString()}
                            </TableCell>
                            <TableCell className={classes.stageCell}>
                              <div className={classes.stageScrollContainer}>
                                
                                {release.releaseStages.map((stage, i) => (
                                  <Button
                                    key={i}
                                    size="small"
                                    variant="contained"
                                    className={`${classes.stageButton} ${getStageClass(stage.stageStatus)}`}
                                    onClick={() =>
                                      handleStageClick(release.releaseId, stage.stageName, stage.stageStatus, stage.stageId)
                                    }
                                  >
                                    <img
                                      src={getStageIcon(stage.stageStatus)}
                                      className={classes.stageButtonIcon}
                                      alt={stage.stageStatus}
                                    />
                                    {stage.stageName}
                                  </Button>
                                ))}
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                    {/* Pagination */}
                    {totalPages >= 1 && (
                      <div>
                        <div
                          className='float-end'
                          style={{
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center',
                            backgroundColor: '#fff',
                            gap: '0.5rem',
                            width: '85px',
                            height: '35px',
                            flexDirection: 'row-reverse',
                            marginTop: '15px'
                          }}
                        >
                          <span
                            style={{
                              fontWeight: 'bold',
                              color: '#000'
                            }}>
                            {currentPage} - {totalPages} of {totalPages}
                          </span>
                        </div>

                        <div 
                        className='float-end' 
                        style={{ gap: '0.1rem' }}>
                          <div style={{ 
                            display: 'flex', 
                            justifyContent: 'center', 
                            alignItems: 'center', 
                            backgroundColor: '#000048',
                            height: '35px',
                            marginTop: '15px'
                            }}>
                            <button
                              onClick={() => handlePageChange(null, currentPage - 1)}
                              disabled={currentPage === 1}
                              style={{
                                backgroundColor: '#000048',
                                color: '#fff',
                                border: 'none',
                                padding: '0.2rem 0.8rem',
                                cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                                display: 'flex', 
                                justifyContent: 'center', 
                                alignItems: 'center'
                              }}
                            >
                              &lt;
                            </button>

                            <div
                              style={{
                                backgroundColor: '#fff',
                                color: '#000',
                                padding: '2px 5px',
                                fontWeight: 'bold',
                                borderRadius: '3px'
                              }}
                            >
                              {currentPage}
                            </div>

                            <button
                              onClick={() => handlePageChange(null, currentPage + 1)}
                              disabled={currentPage === totalPages}
                              style={{
                                backgroundColor: '#000048',
                                color: '#fff',
                                border: 'none',
                                padding: '0.2rem 0.8rem',
                                cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
                                display: 'flex', 
                                justifyContent: 'center', 
                                alignItems: 'center'
                              }}
                            >
                              &gt;
                            </button>
                          </div>
                        </div>
                      </div>
                    )}

                  </Paper>
                </>
              ) : (
                <Typography variant="body2">No release data found.</Typography>
              )}
            </AccordionDetails>
          </Accordion>
        );
      })}

      {/* Stage Log Popup */}
      {popupData && (
        <Dialog open={true} onClose={() => setPopupData(null)} maxWidth="md" fullWidth>
          <DialogTitle>Stage Log: {popupData.stageName}</DialogTitle>
          <DialogContent>
            <Typography variant="body2" style={{ whiteSpace: 'pre-wrap', fontFamily: 'monospace' }}>
              {popupLog || 'No logs found for this stage.'}
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setPopupData(null)} color="primary">Close</Button>
          </DialogActions>
        </Dialog>
      )}
    </div>
  );
};

export default CicdAzureRelease;
