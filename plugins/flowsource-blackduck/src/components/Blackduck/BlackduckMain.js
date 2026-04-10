import { useState, useEffect, useCallback } from 'react';
import { configApiRef, useApi, fetchApiRef } from '@backstage/core-plugin-api';
import { useEntity } from '@backstage/plugin-catalog-react';
import {
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Typography,
} from '@material-ui/core';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import cssClasses from './BlackduckCss';
import PieChart from './PieChart';
import GroupedBarChart from './GroupedBarChart';
import PluginVersion from '../PluginVersion/PluginVersion';
import versionZipIcon from './icons/version-zip-icon.png';
import bomZipIcon from './icons/bom-zip-icon.png';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
} from '@material-ui/core';
// Reusable Download Alert Component
const DownloadAlert = ({ message, onClose }) => {
  const classes = cssClasses();
  const [dots, setDots] = useState('');

  useEffect(() => {
    const interval = setInterval(() => {
      setDots(prev => (prev.length < 5 ? prev + '.' : ''));
    }, 500);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className={classes.alertMessageContainer}>
      <span className={classes.alertText}>
        {message}
        <span className={classes.boldDots}>{dots}</span>
      </span>
      <button className={classes.alertCloseButton} onClick={onClose}>
        ×
      </button>
    </div>
  );
};

const BlackduckMain = () => {
  const classes = cssClasses();
  const { fetch } = useApi(fetchApiRef);
  const config = useApi(configApiRef);
  const { entity } = useEntity();

  const project_Name =
    entity?.metadata?.annotations?.['flowsource/blackduck-project-id'];
  const apiBase = `${config.getString(
    'backend.baseUrl',
  )}/api/flowsource-blackduck`;

  const blackduckBaseUrl = config.getString('blackduck.blackduckBaseUrl');

  const [projectOverview, setProjectOverview] = useState(null);
  const [issueSummary, setIssueSummary] = useState(null);
  const [highVulnerabilities, setHighVulnerabilities] = useState([]);
  const [agingComponents, setAgingComponents] = useState(null);

  const [versionId, setVersionId] = useState(null);
  const [projectId, setProjectId] = useState(null);
  const [projectName, setProjectName] = useState(null);
  const [componentId, setComponentId] = useState(null);
  const [componentVersionId, setComponentVersionId] = useState(null);
  const [originId, setOriginId] = useState(null);
  const [showDownloadMessage, setShowDownloadMessage] = useState(false);
  const [showBomDownloadMessage, setShowBomDownloadMessage] = useState(false);
  const [tableData, setTableData] = useState([]);
  const [isDialogOpen, setDialogOpen] = useState(false);
  const [dialogData, setDialogData] = useState([]);
  const [versions, setVersions] = useState([]);
  const [totalBomEntries, setTotalBomEntries] = useState(null);
  const [selectedVersionName, setSelectedVersionName] = useState(null); // New state for dropdown selection
  const [selectedVersionDetails, setSelectedVersionDetails] = useState({
    lastScanDate: 'N/A',
    lastBomUpdateDate: 'N/A',
  });
  const [isDialogLoading, setIsDialogLoading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [tableLoading, setTableLoading] = useState(true);
  const [graphLoading, setGraphLoading] = useState(true);
  const [expanded, setExpanded] = useState(false);
  const [isDefaultLoad, setIsDefaultLoad] = useState(true); // Track if it's the default load

  const fetchAllData = useCallback(async () => {
    setLoading(true);
    setIsDefaultLoad(true); // Indicate default load
    try {
      const res = await fetch(
        `${apiBase}/blackduck-scan-overview?projectName=${project_Name}`,
      );
      if (!res.ok) throw new Error('Failed to fetch project overview');

      const projectData=
        await res.json();
      setVersionId(projectData.latestVersionId);
      setProjectId(projectData.projectId);
      setSelectedVersionName(projectData.latestVersionName);
      setVersions(projectData.versionsList);
      setProjectName(projectData.projectName);
      setLoading(false);
    } catch (err) {
      console.error('Fetch error:', err);
      setLoading(false);
    }
  }, [apiBase, project_Name, fetch]);

  const fetchTableData = async () => {
    setTableLoading(true);
    try {
      const response = await fetch(
        `${apiBase}/blackduck-components?versionId=${versionId}&projectId=${projectId}`,
      );

      if (!response.ok) throw new Error('Failed to fetch components data');

      const data = await response.json();
      setTableData(data.componentsData); // Ensure tableData includes componentId, componentVersionId, and originId
      setTotalBomEntries(data.totalBomEntries);
      setTableLoading(false);
    } catch (error) {
      console.error('Error fetching components data:', error);
      setTableLoading(false);
    }
  };

  const fetchGraphData = async (versionId, projectId) => {
    setGraphLoading(true);
    try {
      const res = await fetch(`${apiBase}/blackduck-graph?versionId=${versionId}&projectId=${projectId}`);
      if (!res.ok) throw new Error('Failed to fetch graph data');
      const graphData = await res.json();

      setIssueSummary(graphData.issueDistribution);
      setAgingComponents(graphData.riskaging);
      setSelectedVersionDetails({
        lastScanDate: graphData.lastScanDate,
        versionPhase: graphData.versionPhase,
        versionDistribution: graphData.versionDistribution,
        lastBomUpdateDate: graphData.lastBomUpdateDate,
      });
      setGraphLoading(false);
    } catch (error) {
      console.error('Error fetching graph data:', error);
      setGraphLoading(false);
    }
  };

  const handleVersionChange = async e => {
    const selectedVersion = e.target.value;
    setSelectedVersionName(selectedVersion); // Update the selected version name
    setIsDefaultLoad(false); // Indicate user-triggered change

    // Fetch details for the selected version
    const selectedVersionData = versions.find(
      version => version.versionName === selectedVersion,
    );
    if (selectedVersionData) {
      setVersionId(selectedVersionData.versionId); // Update versionId
      await fetchGraphData(selectedVersionData.versionId, projectId); // Fetch graph data for the selected version
    }
  };

  const fetchVulnerabilitiesData = async (
    componentId,
    componentVersionId,
    originId,
    severityFilter,
  ) => {
    setIsDialogLoading(true);
    try {
      const response = await fetch(
        `${apiBase}/blackduck-vulnerabilities?versionId=${versionId}&projectId=${projectId}&componentId=${componentId}&componentVersionId=${componentVersionId}&originId=${originId}&vulnerabilities`,
      );

      if (!response.ok) throw new Error('Failed to fetch vulnerabilities data');

      const data = await response.json();

      // Filter vulnerabilities by severity if severityFilter is provided
      const filteredData = severityFilter
        ? data.filter(
            vulnerability => vulnerability.severity === severityFilter,
          )
        : data;
      setDialogData(filteredData);
    } catch (error) {
      console.error('Error fetching vulnerabilities data:', error);
    } finally {
      setIsDialogLoading(false);
    }
  };

  const handleToggle = () => {
    setExpanded(prev => !prev);
  };

  const handleDialogOpen = () => {
    setDialogOpen(true);
  };

  const handleDialogClose = () => {
    setDialogOpen(false);
  };

  useEffect(() => {
    fetchAllData();
  }, [fetchAllData]);

  // Fetch table data after projectId and versionId are set
  useEffect(() => {
    if (projectId && versionId) {
      fetchTableData();
    }
  }, [projectId, versionId]);

  useEffect(() => {
    if (expanded && projectId && versionId) {
      fetchGraphData(versionId, projectId);
    }
  }, [expanded, projectId, versionId]);

  const handleDownload = async type => {
    try {
      type === 'version'
        ? setShowDownloadMessage(true)
        : setShowBomDownloadMessage(true);
      setTimeout(
        () =>
          type === 'version'
            ? setShowDownloadMessage(false)
            : setShowBomDownloadMessage(false),
        10000,
      );

      const endpoint =
        type === 'version' ? 'blackduck-report' : 'blackduck-sbom-report';
      const fileName =
        type === 'version'
          ? 'blackduck-report.zip'
          : 'blackduck-bom-report.zip';

      const res = await fetch(
        `${apiBase}/${endpoint}?versionId=${versionId}&projectId=${projectId}`,
      );
      const blob = await res.blob();
      const link = document.createElement('a');
      link.href = URL.createObjectURL(new Blob([blob]));
      link.download = fileName;
      link.click();
    } catch (err) {
      console.error(`Error downloading ${type} report:`, err);
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  const tableStyle = { border: '1px solid #ccc', padding: '8px' };

  return (
    <div className={classes.cardContainer} style={{ width: '100%' }}>
      {showDownloadMessage && (
        <DownloadAlert
          message="Downloading Version Report"
          onClose={() => setShowDownloadMessage(false)}
        />
      )}
      {showBomDownloadMessage && (
        <DownloadAlert
          message="Downloading BOM Report"
          onClose={() => setShowBomDownloadMessage(false)}
        />
      )}
      <div className={classes.cardHeading}>Security Risk Details</div>
      <div
        style={{
          display: 'flex',
          justifyContent: 'flex-end',
        }}
      >
        <div style={{ display: 'flex', gap: '10px' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '5px',
            }}
          >
            <div
              style={{
                width: '15px',
                height: '15px',
                backgroundColor: '#3f0f0d',
              }}
            ></div>
            <span>Critical</span>
          </div>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '5px',
            }}
          >
            <div
              style={{
                width: '15px',
                height: '15px',
                backgroundColor: '#aa2328',
              }}
            ></div>
            <span>High</span>
          </div>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '5px',
            }}
          >
            <div
              style={{
                width: '15px',
                height: '15px',
                backgroundColor: '#F2ACB9',
              }}
            ></div>
            <span>Medium</span>
          </div>
        </div>
      </div>
      {tableLoading ? (
        <div style={{ textAlign: 'center', padding: '20px' }}>
          <p>Loading...</p>
        </div>
      ) : tableData && tableData.length > 0 ? (
        <table
          className={`table ${classes.tableBorders}`}
          style={{ borderCollapse: 'collapse' }}
        >
          <thead>
            <tr className={`${classes.tableHead}`}>
              <th
                style={{
                  border: '1px solid #ccc',
                  color: 'white',
                  backgroundColor: '#2e308e',
                }}
              >
                Component
              </th>
              <th
                style={{
                  border: '1px solid #ccc',
                  color: 'white',
                  backgroundColor: '#2e308e',
                }}
              >
                Occurrences
              </th>
              <th
                style={{
                  border: '1px solid #ccc',
                  color: 'white',
                  backgroundColor: '#2e308e',
                }}
              >
                Match Type
              </th>
              <th
                style={{
                  border: '1px solid #ccc',
                  color: 'white',
                  backgroundColor: '#2e308e',
                }}
              >
                Severity Risk
              </th>
            </tr>
          </thead>

          <tbody>
            {tableData.map((item, index) => (
              <tr key={index}>
                <td style={{ border: '1px solid #ccc', padding: '8px' }}>
                  {item.componentName} {item.componentVersionName}
                </td>

                <td style={{ border: '1px solid #ccc', padding: '8px' }}>
                  {item.totalFileMatchCount}
                </td>

                <td style={{ border: '1px solid #ccc', padding: '8px' }}>
                  {item.matchTypes
                    .map(matchType => {
                      switch (matchType) {
                        case 'FILE_EXACT':
                          return 'Exact Directory';
                        case 'FILE_EXACT_FILE_MATCH':
                          return 'Exact File';
                        case 'FILE_DEPENDENCY':
                          return 'Transitive Dependency';
                        case 'FILE_SOME_FILES_MODIFIED':
                          return 'Files Modified';
                        case 'FILE_FILES_ADDED_DELETED_AND_MODIFIED':
                          return 'Files Added/Deleted';
                        case 'FILE_DEPENDENCY':
                          return 'Direct Dependency';
                        default:
                          return matchType;
                      }
                    })
                    .join(', ')}
                </td>

                <td style={{ border: '1px solid #ccc', padding: '8px' }}>
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'center',
                      gap: '4px',
                    }}
                  >
                    {item.securityRiskProfile
                      .filter(profile =>
                        ['CRITICAL', 'HIGH', 'MEDIUM'].includes(
                          profile.countType,
                        ),
                      )
                      .sort((a, b) => {
                        const severityOrder = {
                          CRITICAL: 1,
                          HIGH: 2,
                          MEDIUM: 3,
                        };

                        return (
                          severityOrder[a.countType] -
                          severityOrder[b.countType]
                        );
                      })
                      .map(
                        profile =>
                          profile.count > 0 && (
                            <button
                              key={Math.random()}
                              style={{
                                backgroundColor:
                                  profile.countType === 'CRITICAL'
                                    ? '#3f0f0d'
                                    : profile.countType === 'HIGH'
                                    ? '#aa2328'
                                    : profile.countType === 'MEDIUM'
                                    ? '#F2ACB9'
                                    : '#ccc',
                                color: '#fff',
                                border: 'none',
                                width: '20px',
                                height: '20px',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                              }}
                              onClick={() => {
                                fetchVulnerabilitiesData(
                                  item.componentId,
                                  item.componentVersionId,
                                  item.originId,
                                  profile.countType
                                );
                                handleDialogOpen();
                              }}
                            >
                              {profile.count}
                            </button>
                          ),
                      )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <div className={classes.cardStyle}>
          <p className={classes.pStyle}>
            <strong>No Vulnerabilities Available</strong>
          </p>
        </div>
      )}
      {/* </AccordionDetails> */}
      {/* </Accordion> */}

      <Accordion expanded={expanded} onChange={handleToggle}>
        <AccordionSummary
          expandIcon={<ExpandMoreIcon />}
          style={{ backgroundColor: '#08cef5' }}
        >
          <Typography
            className={classes.cardHeading}
            style={{ lineHeight: '0.4' }}
          >
            Blackduck Summary
          </Typography>
        </AccordionSummary>

        <AccordionDetails style={{ display: 'block' }}>
          {/* Header Row: Dropdown + Icons */}

          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '16px',
            }}
          >
            {/* Left: Placeholder for optional content */}
            <div className={`${classes.heading} col-8 mt-1`}></div>

            {/* Right: Dropdown and Icons */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '5px',
              }}
            >
              <div
                style={{ display: 'flex', alignItems: 'center', gap: '5px' }}
              >
                <strong>Versions:</strong>
                <select
                  className={classes.dropdown}
                  style={{ width: '140px' }}
                  value={selectedVersionName || 'N/A'}
                  onChange={handleVersionChange}
                >
                  {versions.length > 0 ? (
                    versions.map(version => (
                      <option
                        key={version.versionId}
                        value={version.versionName}
                      >
                        {version.versionName}
                      </option>
                    ))
                  ) : (
                    <option value="N/A">No Versions Available</option>
                  )}
                </select>
              </div>

              <div
                className={classes.iconStyle}
                style={{ display: 'flex', alignItems: 'center', gap: '5px' }}
              >
                <button
                  onClick={() => handleDownload('version')}
                  className={classes.bStyle}
                  title="Version Report"
                >
                  <img
                    src={versionZipIcon}
                    className={classes.imageStyle}
                    alt="Version Download"
                  />
                </button>
                <button
                  onClick={() => handleDownload('bom')}
                  className={classes.bStyle}
                  title="BOM Report"
                >
                  <img
                    src={bomZipIcon}
                    className={classes.imageStyle}
                    alt="BOM Download"
                  />
                </button>
                <PluginVersion />
              </div>
            </div>
          </div>

          {/* Project Details and Pie Chart */}
          <div className="row col-12">
            <div className="col-6">
              <div
                style={{
                  border: '1px solid #ccc',
                  padding: '8px',
                  borderRadius: '5px',
                }}
              >
                <div className="mb-2">
                  <strong>Project Name: </strong>
                  {projectName || 'N/A'}
                </div>
                <div className="mb-2">
                  <strong>
                    {isDefaultLoad ? 'Last Scan Version:' : 'Scan Version:'}{' '}
                  </strong>
                  {selectedVersionName || 'N/A'}
                </div>
                <div className="mb-2">
                  <strong>
                    {isDefaultLoad ? 'Last Scan Date:' : 'Scan Date:'}{' '}
                  </strong>
                  {selectedVersionDetails.lastScanDate}
                </div>
                <div className="mb-2">
                  <strong>Version Phase: </strong>
                  {selectedVersionDetails.versionPhase || 'N/A'}
                </div>
                <div className="mb-2">
                  <strong>Version Distribution:</strong>{' '}
                  {selectedVersionDetails.versionDistribution || 'N/A'}
                </div>
                <div className="mb-2">
                  <strong>
                    {isDefaultLoad
                      ? 'Last BOM Update Date:'
                      : 'BOM Update Date:'}{' '}
                  </strong>
                  {selectedVersionDetails.lastBomUpdateDate}
                </div>
                <div className="mb-2">
                  <strong>Total BOM Entries: </strong>
                  {totalBomEntries !== null ? totalBomEntries : 'N/A'}
                </div>
              </div>
              <br />
              <div
                className="mb-2"
                style={{
                  border: '1px solid #ccc',
                  padding: '8px',
                  borderRadius: '5px',
                }}
              >
                {graphLoading ? (
                  <div style={{ textAlign: 'center', padding: '20px' }}>
                    Loading...
                  </div>
                ) : (
                  <PieChart data={issueSummary} />
                )}
              </div>
            </div>

            <div className="col-6">
              <div
                style={{
                  border: '1px solid #ccc',
                  padding: '8px',
                  borderRadius: '5px',
                }}
              >
                <div className={classes.cardHeading}>Risk Aging</div>
                <span className={classes.superBold}>S</span> - Security,&nbsp;
                <span className={classes.superBold}>O</span> -
                Operational,&nbsp;
                <span className={classes.superBold}>L</span> - License
                {graphLoading ? (
                  <div style={{ textAlign: 'center', padding: '20px' }}>
                    Loading...
                  </div>
                ) : (
                  <GroupedBarChart values={agingComponents} />
                )}
              </div>
            </div>
          </div>
        </AccordionDetails>
      </Accordion>

      {/* Dialog for Identifier information */}
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
        <DialogContent>
          {isDialogLoading ? (
            <div style={{ padding: '16px', textAlign: 'center' }}>
              <p>Loading...</p>
            </div>
          ) : dialogData && dialogData.length > 0 ? (
            <table
              className={`table ${classes.tableBorders}`}
              style={{ borderCollapse: 'collapse', width: '100%' }}
            >
              <thead>
                <tr className={`${classes.tableHead}`}>
                  <th
                    style={{
                      border: '1px solid #ccc',
                      color: 'white',
                      backgroundColor: '#2e308e',
                    }}
                  >
                    Identifier
                  </th>
                  <th
                    style={{
                      border: '1px solid #ccc',
                      color: 'white',
                      backgroundColor: '#2e308e',
                    }}
                  >
                    Severity
                  </th>
                  <th
                    style={{
                      border: '1px solid #ccc',
                      color: 'white',
                      backgroundColor: '#2e308e',
                    }}
                  >
                    Status
                  </th>
                </tr>
              </thead>
              <tbody>
                {dialogData.map((vulnerability, index) => (
                  <tr key={index}>
                    <td style={{ border: '1px solid #ccc', padding: '8px' }}>
                      <a
                        href={`${blackduckBaseUrl}/api/vulnerabilities/${vulnerability.id}/overview`}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ textDecoration: 'underline', color: 'blue' }}
                      >
                        {vulnerability.id}
                      </a>
                    </td>
                    <td style={{ border: '1px solid #ccc', padding: '8px' }}>
                      {vulnerability.severity}
                    </td>
                    <td style={{ border: '1px solid #ccc', padding: '8px' }}>
                      {vulnerability.remediationStatus}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className={classes.cardStyle}>
              <p className={classes.pStyle}>
                <strong>No Identifiers Available</strong>
              </p>
            </div>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDialogClose} color="primary">
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default BlackduckMain;
