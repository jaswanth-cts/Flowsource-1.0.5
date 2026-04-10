import React, { useEffect, useState } from 'react';
import { configApiRef, fetchApiRef, useApi } from '@backstage/core-plugin-api';
import { useEntity } from '@backstage/plugin-catalog-react';
import {
  FormControl,
  MenuItem,
  Select,
  Typography,
  styled,
  Tooltip,
 IconButton } from '@mui/material';
import Button from '@mui/material/Button';
import ButtonGroup from '@mui/material/ButtonGroup';
import 'bootstrap/dist/css/bootstrap.min.css';
import cssClasses from './JiraPageCss';
import FilterAltIcon from '@mui/icons-material/FilterAlt';

import log from 'loglevel';


const JiraTableContent = ({ storydetails, issueCount, statusOptions }) => {
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
  const getAnnotation = (entity, key, defaultValue = '') => {
    return entity.entity.metadata.annotations?.[key] ?? defaultValue;
  };
  const filterFieldKey = getAnnotation(
    entity,
    'flowsource/jira-filter-field-key',
  );
  const filterFieldValue = getAnnotation(
    entity,
    'flowsource/jira-filter-field-value',
  );
  const filterFieldId = getAnnotation(entity, 'flowsource/jira-filter-Id');
  const currentSprintEnable =
    entity.entity.metadata.annotations?.[
      'flowsource/jira-enable-current-sprint'
    ] === 'true';
  const jiraAssignedToMeFilter = config.getBoolean(
    'jiracustom.jiraAssignedToMeFilter',
  );

  const [selectedValue, setSelectedValue] = useState(statusOptions[0]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [currentRange, setCurrentRange] = useState({
    start: 1,
    end: itemsPerPage,
  });
  const [nextPageToken, setNextPageToken] = useState('');
  const [storyLinkPrefix, setStoryLinkPrefix] = useState('');
  const [paginationData, setPaginationData] = useState([]);
  const [storyCount, setStoryCount] = useState(0);
  const [selectedButton, setSelectedButton] = useState('My Stories');
  const [assigneeToMe, setAssigneeToMe] = useState(jiraAssignedToMeFilter);
  const [currentSprintDetails, setCurrentSprintDetails] =
    useState(currentSprintEnable);
  const [filterDetails, setFilterDetails] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const handlePageChange = page => {
    getStoryDetails(
      page,
      itemsPerPage,
      selectedValue,
      assigneeToMe,
      currentSprintDetails,
    );
  };

  const handleMyStories = button => {
    setAssigneeToMe(true);
    setNextPageToken('');
    setSelectedButton(button);
  };

  const handleAllStories = button => {
    setAssigneeToMe(false);
    setSelectedButton(button);
  };

  const handleSprintChange = button => {
    setCurrentSprintDetails(button === 'Active Sprint');
  };

  const renderTableBody = () => {
    if (isLoading) {
      return (
        <tr>
          <td colSpan="7" style={{ textAlign: 'center' }}>
            Loading...
          </td>
        </tr>
      );
    } else if (
      paginationData.length === 0 ||
      paginationData.every(value => !value.key)
    ) {
      return (
        <tr>
          <td colSpan="7" style={{ textAlign: 'center' }}>
            No stories available for the filter criteria specified
          </td>
        </tr>
      );
    } else {
      return paginationData.map(value => (
        <tr key={value.key}>
          <td className={`tdNameStyleCenter`}>
            <a
              href={storyLinkPrefix + value.key.trim()}
              target="_blank"
              rel="noopener noreferrer"
              className={`${classes.hoverUnderline}`}
            >
              {value.key}
            </a>
          </td>
          <td className={`tdNameStyle `}>{value.story}</td>
          <td className={`tdNameStyleCenter`} style={{ width: '180px' }}>
            {value.status}
          </td>
          <td className={`tdNameStyleCenter`}>{value.points}</td>
          <td className={`tdNameStyleCenter`}>{value.priority}</td>
          <td className={`tdNameStyleCenter`} style={{ width: '130px' }}>
            {value.type}
          </td>
          <td className={`tdNameStyleCenter`}>{value.sprint}</td>
        </tr>
      ));
    }
  };

  async function getStoryDetails(
    pageNumber,
    pageSize,
    status,
    jiraAssigneeToMe,
    currentSprintDetails,
  ) {
    setIsLoading(true);
    try {
      const response = await fetch(
        backendBaseApiUrl +
          'storyDetails?projectName=' +
          projectName +
          '&durationDaysCatalog=' +
          durationDaysCatalog +
          '&nextPageToken=' +
          nextPageToken +
          '&pageSize=' +
          pageSize +
          '&storyPointsFieldCatalog=' +
          encodeURIComponent(storyPointsFieldCatalog) +
          '&status=' +
          status +
          '&assigneeToMe=' +
          jiraAssigneeToMe +
          '&filterFieldKey=' +
          filterFieldKey +
          '&filterFieldValue=' +
          filterFieldValue +
          '&filterFieldId=' +
          filterFieldId +
          '&currentSprintDetails=' +
          currentSprintDetails,
      );

      if (response.ok) {
        const result = await response.json();
        const start = (pageNumber - 1) * pageSize + 1;
        const end = Math.min(pageNumber * pageSize, result.storyLength);
        setStoryLinkPrefix(result.storyLink);
        setPaginationData(result.jiraStoryInfo);
        setStoryCount(result.storyLength);
        setCurrentPage(pageNumber);
        setCurrentRange({ start, end });
        setNextPageToken(result.nextPageToken || '');
        const filterDetails = {
          JQLQuery: result.jqlQuery,
          ProjectKey: result.projectName,
          FilterName: result.filterName,
        };
        setFilterDetails(filterDetails);
        setIsLoading(false);
      } else {
        log.error('Error fetching project details:', response.statusText);
      }
    } catch (error) {
      log.error('Error fetching project details:', error);
    }
  }

  const handleChange = event => {
    const status = event.target.value;
    setSelectedValue(status);
    setNextPageToken('');
  };

  useEffect(() => {
    getStoryDetails(
      1,
      itemsPerPage,
      selectedValue,
      assigneeToMe,
      currentSprintDetails,
    );
  }, [selectedValue, assigneeToMe, currentSprintDetails]);

  const isPreviousDisabled = currentPage === 1;
  const isNextDisabled = currentPage * itemsPerPage >= storyCount;

  const BootstrapButton = styled(Button)({
    textTransform: 'none',
    fontsize: '13px',
    height: '25px',
  });

  const formatFilterDetails = details => {
    if (!details) {
      return 'No details available';
    }
    return (
      <ol style={{ paddingLeft: '20px', margin: 0 }}>
        {Object.entries(details)
          .filter(([key, value]) => value) // Filter out entries with empty values
          .map(([key, value]) => (
            <li key={key}>
              <strong>{key}:</strong> {value}
            </li>
          ))}
      </ol>
    );
  };

  const filterDetailsString = formatFilterDetails(filterDetails);

  return (
    <div className={`card-body`}>
      <div className={`card ${classes.cardBorder}`}>
        <div
          className="card-title"
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center' }}>
            {jiraAssignedToMeFilter && (
              <ButtonGroup
                variant="outlined"
                aria-label="Basic button group"
                style={{
                  fontWeight: 'bold',
                  fontSize: '13px',
                  paddingTop: '10px',
                  marginLeft: '16px',
                  textTransform: 'lowercase',
                }}
              >
                <BootstrapButton
                  onClick={() => handleMyStories('My Stories')}
                  style={{
                    color:
                      selectedButton === 'My Stories' ? 'white' : 'inherit',
                    backgroundColor:
                      selectedButton === 'My Stories' ? '#13225F' : 'inherit',
                  }}
                >
                  My Stories
                </BootstrapButton>
                <BootstrapButton
                  onClick={() => handleAllStories('All Stories')}
                  style={{
                    color:
                      selectedButton === 'All Stories' ? 'white' : 'inherit',
                    backgroundColor:
                      selectedButton === 'All Stories' ? '#13225F' : 'inherit',
                  }}
                >
                  All Stories
                </BootstrapButton>
              </ButtonGroup>
            )}
            {currentSprintEnable && (
              <ButtonGroup
                variant="outlined"
                aria-label="Sprint button group"
                style={{
                  fontWeight: 'bold',
                  fontSize: '13px',
                  paddingTop: '10px',
                  marginLeft: '16px',
                  textTransform: 'lowercase',
                }}
              >
                <BootstrapButton
                  onClick={() => handleSprintChange('Active Sprint')}
                  style={{
                    color: currentSprintDetails ? 'white' : 'inherit',
                    backgroundColor: currentSprintDetails
                      ? '#13225F'
                      : 'inherit',
                  }}
                >
                  Active Sprint
                </BootstrapButton>
                <BootstrapButton
                  onClick={() => handleSprintChange('All Sprints')}
                  style={{
                    color: !currentSprintDetails ? 'white' : 'inherit',
                    backgroundColor: !currentSprintDetails
                      ? '#13225F'
                      : 'inherit',
                  }}
                >
                  All Sprints
                </BootstrapButton>
              </ButtonGroup>
            )}
          </div>

          <div style={{ display: 'flex', alignItems: 'center' }}>
            <Typography
              variant="body1"
              style={{
                fontWeight: 'bold',
                fontSize: '13px',
                paddingTop: '10px',
                marginRight: '20px',
              }}
            >
              Status
            </Typography>
            <FormControl
              variant="outlined"
              style={{
                minWidth: '216px',
                paddingTop: '10px',
                paddingRight: '25px',
              }}
            >
              <Select
                style={{ height: '26px', fontSize: '13px' }}
                value={selectedValue}
                onChange={handleChange}
              >
                {statusOptions.map(status => (
                  <MenuItem key={status} value={status}>
                    {status}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <Tooltip title={filterDetailsString} arrow>
              <IconButton
                sx={{
                  backgroundColor: '#F3F3F3',
                  borderRadius: 1,
                  padding: '4px',
                  boxShadow: '0px 1px 2px rgba(0, 0, 0, 0.2)',
                  marginRight: '20px',
                  marginTop: '8px',
                  paddingTop: '4px',
                  paddingBottom: '4px',
                  cursor: 'default', // Change cursor to pointer
                  '&:hover': {
                    backgroundColor: '#F3F3F3', // Prevent background color change on hover
                  },
                }}
              >
                <FilterAltIcon
                  sx={{
                    fontSize: 20,
                    color: '#B0B0B0',
                    pointerEvents: 'none', // Prevent icon from changing color on hover
                  }}
                />
              </IconButton>
            </Tooltip>
          </div>
        </div>
        <div className={`card-body ${classes.cardBody}`}>
          <div className={`${classes.tableStyle}`}>
            <table className={`table  ${classes.tableStriped1} `}>
              <thead>
                <tr className={`${classes.trStyle}`}>
                  <th className={`${classes.thStyle}`}>Id</th>
                  <th className={`${classes.thStyle}`}>Story</th>
                  <th className={`${classes.thStyle}`}>Status</th>
                  <th className={`${classes.thStyle}`}>Points</th>
                  <th className={`${classes.thStyle}`}>Priority</th>
                  <th className={`${classes.thStyle}`}>Type</th>
                  <th className={`${classes.thStyle}`}>Sprint</th>
                </tr>
              </thead>
              <tbody className={'alignItems:center'}>{renderTableBody()}</tbody>
            </table>
            {!isLoading && storyCount > 0 && (
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
                    {currentRange.start} - {currentRange.end} of {storyCount}
                  </li>
                </ul>
              </nav>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default JiraTableContent;
