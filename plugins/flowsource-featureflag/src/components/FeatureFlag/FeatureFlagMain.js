import React, { useState , useEffect } from 'react';
import { IconButton, Popover, Typography, Paper, Link, Snackbar, Button as MuiButton } from '@mui/material';
import { configApiRef, useApi, fetchApiRef } from '@backstage/core-plugin-api';
import OpenInNewIcon from '@material-ui/icons/OpenInNew';
import { useEntity } from '@backstage/plugin-catalog-react';
import Switch from '@mui/material/Switch';
import cssClasses from './FeatureFlagMainCss';
import envimage from './Icons/env.png';
import seenimage from './Icons/Lastseen.png';
import searchimage from './Icons/search.png';
import clsx from 'clsx';
import { useCallback } from 'react';

function FeatureFlagMain() {
  const classes = cssClasses();
  const { fetch } = useApi(fetchApiRef);
  const config = useApi(configApiRef);
  const entity = useEntity();
  const projectId = entity.entity.metadata.annotations['flowsource/featureflag-project-name'];
  const appName = entity.entity.metadata.annotations['flowsource/featureflag-app-name'];
  const unleashBaseUrl = config.getOptionalString('unleash.unleashBaseUrl') || '';
  const unleashProjectUrl = `${unleashBaseUrl}/projects/${projectId}` || '';
  const [flagsData, setFlagsData] = useState([]);
  const [flagsSize, setFlagsSize] = useState(0);
  const [error, setError] = useState(null);
  const [isLoading, setLoading] = useState(true);
  const [anchorEl, setAnchorEl] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [currentRange, setCurrentRange] = useState({
    start: 1,
    end: itemsPerPage,
  });
  const isPreviousDisabled = currentPage === 1;
  const isNextDisabled = currentPage * itemsPerPage >= flagsSize;
  
  const open = Boolean(anchorEl);
  const id = open ? 'simple-popover' : undefined;
  const [searchTerm, setSearchTerm] = useState('');
  const [environments, setEnvironments] = useState([]); // Initialize with the environments prop or an empty array

  const [updates, setUpdates] = useState(null);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [enableUpdate, setEnableUpdate] = useState(false);
  const [currentFlagIndex, setCurrentFlagIndex] = useState(null); // Track which flag is being updated
  const [originalFlagsData, setOriginalFlagsData] = useState(null); // Store original state for cancel

  const backendBaseApiUrl = config.getString('backend.baseUrl') + '/api/flowsource-featureflag';
  const [showPopup, setShowPopup] = useState({});

  const togglePopup = flagName => {
    setShowPopup(prev => {
      const isCurrentlyOpen = prev[flagName];

      // If opening popup, store original state
      if (!isCurrentlyOpen) {
        setOriginalFlagsData([...flagsData]);
      }

      return {
        ...prev,
        [flagName]: !prev[flagName],
      };
    });
  };

  const fetchFeatureFlags = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch(`${backendBaseApiUrl}/details?projectId=${projectId}&appName=${appName}`);

      if (!response.ok) {
        throw new Error('Failed to fetch feature flags');
      }
      const data = await response.json();
      setFlagsData(data.flags);
      setFlagsSize(data.flags.length);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [backendBaseApiUrl, projectId, appName, fetch]);

  useEffect(() => {
    fetchFeatureFlags();
  }, [fetchFeatureFlags])
 
  // Filter the data based on the search term
  const filteredData = flagsData.filter((item) =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const timeAgo = (timestamp) => {
    if (!timestamp) {
      return "no usage"; // Return "no usage" if timestamp is null or undefined
    }
    const now = new Date();
    const past = new Date(timestamp);
    const diffInMs = now - past; // Difference in milliseconds
  
    const isFuture = diffInMs < 0; // Check if the timestamp is in the future
    const absDiffInMs = Math.abs(diffInMs); // Get the absolute difference

    const seconds = Math.floor(diffInMs / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
  
    if (days > 0) {
      return isFuture
        ? `in ${days} day${days > 1 ? 's' : ''}`
        : `${days} day${days > 1 ? 's' : ''} ago`;
    } else if (hours > 0) {
      return isFuture
        ? `in ${hours} hour${hours > 1 ? 's' : ''}`
        : `${hours} hour${hours > 1 ? 's' : ''} ago`;
    } else if (minutes > 0) {
      return isFuture
        ? `in ${minutes} minute${minutes > 1 ? 's' : ''}`
        : `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
    } else {
      return isFuture
        ? `in ${seconds} second${seconds > 1 ? 's' : ''}`
        : `${seconds} second${seconds > 1 ? 's' : ''} ago`;
    }
  };

  const renderToolTip = (environments) => {
    const handleMouseEnter = (event) => {
      setAnchorEl(event.currentTarget);
    };
  
    const handleMouseLeave = () => {
      setAnchorEl(null);
    };

    return (
      <div>
        <IconButton
          sx={{ cursor: 'pointer', '&:hover': { color: '#000048' } }}
          aria-describedby={id}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          <img src={seenimage} alt="Last Seen" />
        </IconButton>
        <Popover
          sx={{ pointerEvents: 'none' }}
          open={open}
          anchorEl={anchorEl}
          anchorOrigin={{
            vertical: 'bottom',
            horizontal: 'center',
          }}
          transformOrigin={{
            vertical: 'top',
            horizontal: 'center',
          }}
          onClose={handleMouseLeave}
          disableRestoreFocus
        >
          <Paper className={`${classes.cardSection}`}>
            <Typography
              variant="subtitle1"
              component="div"
              className={`${classes.infoHeading}`}
            >
              Last usage reported
            </Typography>
            {environments.map((env, index) => (
              <div key={index}>
                <div className={`${classes.frontEndSect}`}>
                  <div className={`${classes.infoSection}`}>
                    <Typography variant="subtitle2">
                      <b> {env.name} </b>
                    </Typography>
                    <Typography variant="subtitle2">
                      {timeAgo(env.lastSeenAt)}
                    </Typography>
                  </div>
                </div>
              </div>
            ))}
          </Paper>
        </Popover>
      </div>
    );
  };

  const renderTableBody = () => {
    const label = { inputProps: { 'aria-label': 'Switch demo' } };

    // Handle switch toggle
    const handleToggle = (flagIndex, envIndex, event) => {
      const isChecked = event.target.checked; // Get the checked state
      const updatedFlags = [...flagsData];
      updatedFlags[flagIndex] = {
        ...updatedFlags[flagIndex],
        environments: updatedFlags[flagIndex].environments.map((env, i) =>
          i === envIndex ? { ...env, enabled: isChecked } : env,
        ),
      };
      setFlagsData(updatedFlags);
      setUpdates(updatedFlags[flagIndex].environments[envIndex]);
      setCurrentFlagIndex(flagIndex); // Track which flag is being updated
      setEnableUpdate(true);
    };

    const handleCancelClick = flagName => {
      // Revert to original state instead of making API call
      if (originalFlagsData) {
        setFlagsData(originalFlagsData);
      }

      setShowPopup(prev => ({
        ...prev,
        [flagName]: false,
      }));
      setEnableUpdate(false);
      setCurrentFlagIndex(null);
      setOriginalFlagsData(null); // Clear original state
    };

    const handleUpdateClick = async (flagIndex, envIndex, event) => {
      if (!updates || currentFlagIndex !== flagIndex) return;

      // Handle the update logic here
      const flagName = flagsData[flagIndex].name;
      const envName = updates.name;
      const enabled = updates.enabled ? 'on' : 'off';
      const url = `${backendBaseApiUrl}/toggle`;

      try {
        const response = await fetch(url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            projectId: projectId,
            flagName: flagName,
            environment: envName,
            enabled: enabled,
          }),
        });

        if (response.ok) {
          setSnackbarOpen(true);
        } else {
          // Get more detailed error information
          const errorData = await response.text();
          console.error('API Error:', errorData);
          alert(
            `Error updating feature flag: ${response.status} ${response.statusText}`,
          );
        }
      } catch (error) {
        console.error('Network Error:', error);
      } finally {
        // Always refresh to get the true server state, regardless of success/failure
        try {
          await fetchFeatureFlags();
        } catch (refreshError) {
          console.error('Failed to refresh data:', refreshError);
        }

        // Always reset popup and state
        setShowPopup(prev => ({
          ...prev,
          [flagName]: false,
        }));
        setEnableUpdate(false);
        setCurrentFlagIndex(null);
        setOriginalFlagsData(null); // Clear original state
      }
    };

    const handleSnackbarClose = () => {
      setSnackbarOpen(false);
    };
    if (isLoading) {
      return (
        <tr>
          <td colSpan="7" style={{ textAlign: 'center' }}>
            Loading...
          </td>
        </tr>
      );
    } else if ( filteredData.length === 0 ) {
      return (
        <tr>
          <td colSpan="7" style={{ textAlign: 'center' }}>
            No Flags Available for the App. 
          </td>
        </tr>
      );
    } else {
      return filteredData.map((value, flagIndex) => (
        <tr key={value.name}>
          <td
            className={`tdNameStyle`}
            style={{ color: '#0db1fdf5', fontWeight: 'bold' }}
          >
            {value.name}
          </td>
          <td className={`tdNameStyle`}>{value.createdAt.split("T")[0]}</td>
          <td className={`tdNameStyle`} style={{ width: '180px' }}>
            {value.createdBy.split("@")[0]}
          </td>
          <td className={`tdNameStyle`}>{renderToolTip(value.environments)}</td>
          <td className={`tdNameStyle`}>{value.lifecycleStage}</td>
          <td className={`tdNameStyle`} style={{ width: '130px' }}>
            <div
              className="icon-container"
              onClick={() => togglePopup(value.name)}
            >
              <img src={envimage} alt="Environments" />
              {showPopup[value.name] && (
                <div
                  className={`${classes.overlay}`}
                  onClick={e => e.stopPropagation()}
                ></div>
              )}
              {showPopup[value.name] && (
                <div
                  className={`${classes.popup}`}
                  onClick={e => e.stopPropagation()}
                >
                  <table className={`table ${classes.tableStriped1}`}>
                    <thead>
                      <tr className={`${classes.trStyle}`}>
                        <th
                          className={`${classes.thStyle}`}
                          style={{ fontSize: '16px !important;' }}
                        >
                          Environment
                        </th>
                        <th
                          className={`${classes.thStyle}`}
                          style={{ fontSize: '16px !important;' }}
                        >
                          Feature Flags
                        </th>
                      </tr>
                    </thead>
                    {value.environments.map((env, envIndex) => (
                      <tbody className={'alignItems:center'}>
                        <tr key={`${value.name}-${env.name}`}>
                          <td className={`tdNameStyle`}>
                            <b>{env.name}</b>
                          </td>
                          <td className={`tdNameStyle`}>
                            <Switch
                              {...label}
                              checked={env.enabled}
                              onChange={event =>
                                handleToggle(flagIndex, envIndex, event)
                              }
                              disabled={env.name === "production"}
                            />
                          </td>
                        </tr>
                      </tbody>
                    ))}
                  </table>
                  <div
                    className={`${classes.buttonContainer}`}
                    style={{ marginTop: '10px', textAlign: 'right' }}
                  >
                    <button
                      className={`${classes.button}`}
                      style={{ marginRight: '10px' }}
                      onClick={event => handleUpdateClick(flagIndex, event)}
                      disabled={!enableUpdate || currentFlagIndex !== flagIndex}
                    >
                      Update
                    </button>
                    <button
                      className={`${classes.button}`}
                      onClick={() => handleCancelClick(value.name)}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
          </td>
        </tr>
      ));
    }
  };

  // Add handlePageChange function for pagination
  const handlePageChange = newPage => {
    if (newPage < 1 || newPage > Math.ceil(filteredData.length / itemsPerPage))
      return;
    setCurrentPage(newPage);
    const start = (newPage - 1) * itemsPerPage + 1;
    const end = Math.min(newPage * itemsPerPage, filteredData.length);
    setCurrentRange({ start, end });
  };

  return (
    <div>
      <div className={`${classes.header}`}>
        <div className={`${classes.leftSection}`}>
          <span className={`${classes.p}`}>
            Feature flags ({filteredData.length})
          </span>

          <div className={`${classes.searchContainer}`}>
            <input
              type="text"
              className={`${classes.searchInput}`}
              placeholder="Search"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)} // Update searchTerm state
            />
            <span className={`${classes.searchIcon}`}>
              <img src={searchimage} height="20px" alt="Search" />
            </span>
          </div>
        </div>
        <Link
          href={unleashProjectUrl}
          target="_blank"
          rel="noopener noreferrer"
          className={classes.unleashLink}
        >
          <b>
            View more details <OpenInNewIcon fontSize="small" />
          </b>
        </Link>
      </div>
      <table className={`table  ${classes.tableStriped1} `}>
        <thead>
          <tr className={`${classes.trStyle}`}>
            <th className={`${classes.thStyle}`}>Name</th>
            <th className={`${classes.thStyle}`}>Created</th>
            <th className={`${classes.thStyle}`}>By</th>
            <th className={`${classes.thStyle}`}>Last seen</th>
            <th className={`${classes.thStyle}`}>Lifecycle</th>
            <th className={`${classes.thStyle}`}>Environments</th>
          </tr>
        </thead>
        <tbody className={'alignItems:center'}>{renderTableBody()}</tbody>
      </table>
      {!isLoading && filteredData.length > 0 && (
        <nav aria-label="Page navigation">
          <ul className={`${classes.pagination}`}>
            <li
              className={`${isPreviousDisabled ? 'disabled' : ''} ${
                classes.liCss
              } ${classes.numCss}`}
            >
              <button
                aria-label="Previous"
                tabIndex={-1}
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={isPreviousDisabled}
                className={`${classes.liCss} ${classes.btnCss}`}
              >
                <span
                  aria-hidden="true"
                  style={{
                    color: 'white',
                    fontWeight: 'bold',
                    fontSize: '20px',
                    position: 'relative',
                    top: '-1px',
                  }}
                >
                  &lsaquo;
                </span>
              </button>
            </li>
            <li className={`${classes.liCss} ${classes.numCss}`}>
              <span
                style={{
                  backgroundColor: 'white',
                  padding: '0px 3px',
                  borderRadius: '3px',
                }}
              >
                {currentPage}
              </span>
            </li>
            <li
              className={`${isNextDisabled ? 'disabled' : ''} ${
                classes.liCss
              } ${classes.numCss}`}
            >
              <button
                aria-label="Next"
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={isNextDisabled}
                className={`${classes.liCss} ${classes.btnCss}`}
              >
                <span
                  aria-hidden="true"
                  style={{
                    color: 'white',
                    fontWeight: 'bold',
                    fontSize: '20px',
                    position: 'relative',
                    top: '-1px',
                  }}
                >
                  &rsaquo;
                </span>
              </button>
            </li>
            <li
              className={`${classes.liCss}`}
              style={{
                border: '1px solid gray',
                borderLeft: 'none',
                padding: '2px 8px 2px 3px',
              }}
            >
              {currentRange.start} -{' '}
              {currentRange.end > filteredData.length
                ? filteredData.length
                : currentRange.end}{' '}
              of {filteredData.length}
            </li>
          </ul>
        </nav>
      )}

      {/* Snackbar for update notifications */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={() => setSnackbarOpen(false)}
        message="Feature flag updated successfully"
        action={
          <MuiButton
            color="inherit"
            size="small"
            onClick={() => setSnackbarOpen(false)}
          >
            Close
          </MuiButton>
        }
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      />
    </div>
  );
}

export default FeatureFlagMain;
