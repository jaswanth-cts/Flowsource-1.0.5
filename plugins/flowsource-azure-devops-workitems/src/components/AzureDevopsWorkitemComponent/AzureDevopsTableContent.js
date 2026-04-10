import { configApiRef, fetchApiRef, useApi } from '@backstage/core-plugin-api';
import { useEntity } from '@backstage/plugin-catalog-react';
import {
  FormControl,
  MenuItem,
  Select,
  Typography,
  styled,
  Tooltip,
  IconButton,
} from '@mui/material';
import Button from '@mui/material/Button';
import ButtonGroup from '@mui/material/ButtonGroup';
import 'bootstrap/dist/css/bootstrap.min.css';
import { useEffect, useState } from 'react';
import cssClasses from './AzureDevopsWoorkitemPageCss';
import FilterAltIcon from '@mui/icons-material/FilterAlt';
import Chart from 'chart.js/auto';

import log from 'loglevel';

const AzureDevopsTableContent = ({
  workItemTypes,
  workItemStates,
}) => {
  const classes = cssClasses();
  const { fetch } = useApi(fetchApiRef);
  const config = useApi(configApiRef);
  const backendBaseApiUrl =
    config.getString('backend.baseUrl') + '/api/devopsworkitems/';
  const entity = useEntity();
  const projectName =
    entity.entity.metadata.annotations['flowsource/azure-devops-project-key'];
  const durationDaysCatalog =
    entity.entity.metadata.annotations['flowsource/durationInDays'];
  const currentSprintEnable =
    entity.entity.metadata.annotations?.[
      'flowsource/azure-devops-enable-current-sprint'
    ] === 'true';
  const getAnnotation = (entity, key, defaultValue = '') => {
    return entity.entity.metadata.annotations?.[key] ?? defaultValue;
  };

  const currentSprintTeamName = getAnnotation(
    entity,
    'flowsource/azure-devops-current-sprint-team-name',
  );
  const queryId = getAnnotation(entity, 'flowsource/azure-devops-queryId');
  const azureDevopsFilterFieldKey = getAnnotation(
    entity,
    'flowsource/azure-devops-Filter-Field-Key',
  );
  const azureDevopsFilterFieldValue = getAnnotation(
    entity,
    'flowsource/azure-devops-Filter-Field-value',
  );

  const azureAssignedToMeFilter = config.getBoolean(
    'azureDevOps.azureAssignedToMeFilter',
  );
  const [currentSprintDetails, setCurrentSprintDetails] =
    useState(currentSprintEnable);
  const [selectedAzureDevopsProj, setselectedAzureDevopsProj] = useState({
    id: '',
    name: '',
    workitemInfo: [
      {
        id: '',
        title: '',
        state: '',
        priority: '',
        workItemType: '',
        assignedBy: '',
        createdBy: '',
      },
    ],
  });

  const [selectedStatus, setSelectedStatus] = useState('All');
  const [selectedWorkitemType, setSelectedWorkitemType] = useState('All');
  const [workitemCount, setWorkItemCount] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const [paginationData, setpaginationData] = useState(
    selectedAzureDevopsProj.workitemInfo,
  );
  const [selectedButton, setSelectedButton] = useState('My Stories');
  const [assigneeToMe, setAssigneeToMe] = useState(azureAssignedToMeFilter);
  const [checkAllStories, setCheckAllStories] = useState(false);
  const [filterDetails, setFilterDetails] = useState(null);
  const itemsPerPage = 8;
  const [currentRange, setCurrentRange] = useState({
    start: 1,
    end: itemsPerPage,
  });
  const [isLoading, setLoading] = useState(true);

  const handlePageChange = page => {
    setCurrentPage(page);
  };

  const handleSprintChange = button => {
    setCurrentSprintDetails(button === 'Active Sprint');
    setCurrentPage(1);
  };

  const handleStatusChange = event => {
    const status = event.target.value;
    setSelectedStatus(status);
    setCurrentPage(1);
  };
 
  const handleWorkitemTypeChange = event => {
    const type = event.target.value;
    setSelectedWorkitemType(type);
    setCurrentPage(1);
  };

  const handleMyStories = button => {
    setAssigneeToMe(true);
    setCheckAllStories(false);
    setSelectedButton(button);
    setCurrentPage(1);
  };

  const handleAllStories = button => {
    setAssigneeToMe(false);
    setCheckAllStories(true);
    setSelectedButton(button);
    setCurrentPage(1);
  };
  async function getProjectWorkItems(
    pageNumber,
    pageSize,
    status,
    workitemType,
    azureAssigneeToMe,
    currentSprintDetails,
  ) {
    setLoading(true);
    //fetch project details
    const projectWorkItems = await fetch(
      backendBaseApiUrl +
        'projectDetails?projectName=' +
        projectName +
        '&pageNumber=' +
        pageNumber +
        '&pageSize=' +
        pageSize +
        '&durationDaysCatalog=' +
        durationDaysCatalog +
        '&status=' +
        status +
        '&workitemType=' +
        workitemType +
        '&assigneeToMe=' +
        azureAssigneeToMe +
        '&currentSprintDetails=' +
        currentSprintDetails +
        '&currentSprintTeamName=' +
        currentSprintTeamName +
        '&queryId=' +
        queryId +
        '&checkAllStories=' +
        checkAllStories +
        '&azureDevopsFilterFieldKey=' +
        azureDevopsFilterFieldKey +
        '&azureDevopsFilterFieldValue=' +
        azureDevopsFilterFieldValue,
    );

    if (projectWorkItems.ok) {
      const result = await projectWorkItems.json();
      setselectedAzureDevopsProj(result);
      setWorkItemCount(result.workitemCount);
      setLoading(false);
      setpaginationData(result.workitemInfo);
      setWorkItemCount(result.workitemCount);
      setCurrentPage(pageNumber);
      const start = (pageNumber - 1) * pageSize + 1;
      const end = Math.min(pageNumber * pageSize, result.workitemCount);
      setCurrentRange({ start, end });
      const filterDetails = {
        WIQLQuery: result.wiqlQuery,
        ProjectKey: result.name,
        FilterName: result.filterName,
      };
      setFilterDetails(filterDetails);
    } else {
      log.error(
        'Error fetching project workItems:',
        projectWorkItems.statusText,
      );
    }
  }

  useEffect(() => {
    // Fetch project work items on initial load and when relevant state changes
    getProjectWorkItems(
      currentPage,
      itemsPerPage,
      selectedStatus,
      selectedWorkitemType,
      assigneeToMe,
      currentSprintDetails,
    );
  }, [
    selectedStatus,
    selectedWorkitemType,
    assigneeToMe,
    currentSprintDetails,
    currentPage,
    selectedButton,
  ]);

  const isPreviousDisabled = currentPage === 1;
  const isNextDisabled = currentPage * itemsPerPage >= workitemCount;

  const BootstrapButton = styled(Button)({
    fontsize: '13px',
    height: '25px',
    textTransform: 'none',
  });

  const formatFilterDetails = details => {
    if (!details) {
      return 'No details available';
    }
    return (
      <ol style={{ paddingLeft: '20px', margin: 0 }}>
        {Object.entries(details)
          .filter(([key, value]) => value)
          .map(([key, value]) => (
            <li key={key}>
              <strong>{key}:</strong>{' '}
              {typeof value === 'object' ? JSON.stringify(value) : value}
            </li>
          ))}
      </ol>
    );
  };

  const filterDetailsString = formatFilterDetails(filterDetails);
  const renderTable = (isLoading, paginationData, classes) => {
    if (isLoading) {
      return (
        <tr>
          <td colSpan="7" style={{ textAlign: 'center' }}>
            Loading...
          </td>
        </tr>
      );
    } else if (paginationData.length === 0) {
      return (
        <tr>
          <td colSpan="5" className={`${classes.displayMsg}`}>
            No stories available for the filter criteria specified.
          </td>
        </tr>
      );
    } else {
      return paginationData.map(value => (
        <tr key={value.id}>
          <td className={`tdNameStyleCenter`}>
            <a
              href={value.url}
              target="_blank"
              rel="noopener noreferrer"
              className={`${classes.hoverUnderline}`}
            >
              {value.id}
            </a>
          </td>
          <td className={`tdNameStyle`}>{value.title}</td>
          <td className={`tdNameStyleCenter`}>{value.state}</td>
          <td className={`tdNameStyleCenter`}>{value.priority}</td>
          <td className={`tdNameStyleCenter`}>{value.workItemType}</td>
        </tr>
      ));
    }
  };
  return (
    <div className={`card-body`}>
      <div className={`card ${classes.cardBorder}`}>
        <div
          className="card-title"
          style={{
            display: 'flex',
            justifyContent: azureAssignedToMeFilter
              ? 'space-between'
              : 'flex-end',
            alignItems: 'center',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center' }}>
            {azureAssignedToMeFilter && (
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
          <div style={{ display: 'flex', alignItems: 'right', marginLeft:'auto', paddingRight:'2px' }}><Typography
              variant="body1"
              style={{
                fontWeight: 'bold',
                fontSize: '13px',
                paddingTop: '14px',
                marginRight: '10px',
              }}
            >
              Workitem Type
            </Typography>
            <FormControl
              variant="outlined"
              style={{
                minWidth: '150px',
                paddingTop: '10px',
              }}
            >
              <Select
                style={{ height: '26px', fontSize: '13px', marginRight: '2rem' }}
                value={selectedWorkitemType}
                onChange={handleWorkitemTypeChange}
              >
                {workItemTypes.map(type => (
                  <MenuItem key={type} value={type}>
                    {type}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
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
                minWidth: '130px',
                paddingTop: '10px',
                paddingRight: '25px',
              }}
            >
              <Select
                style={{ height: '26px', fontSize: '13px' }}
                value={selectedStatus}
                onChange={handleStatusChange}
              >
                {workItemStates.map(status => (
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
                  cursor: 'default',
                  '&:hover': {
                    backgroundColor: '#F3F3F3',
                  },
                }}
              >
                <FilterAltIcon
                  sx={{
                    fontSize: 20,
                    color: '#B0B0B0',
                    pointerEvents: 'none',
                  }}
                />
              </IconButton>
            </Tooltip>
          </div>
        </div>
        <div className={`card-body ${classes.cardBody}`}>
          <div className={`${classes.tableStyle}`}>
            <table className={`table ${classes.tableStriped1} `}>
              <thead>
                <tr className={`${classes.trStyle}`}>
                  <th className={`${classes.thStyle}`}>Id</th>
                  <th className={`${classes.thStyle}`}>Workitem</th>
                  <th className={`${classes.thStyle}`}>Status</th>
                  <th className={`${classes.thStyle}`}>Priority</th>
                  <th className={`${classes.thStyle}`}>Workitem Type</th>
                </tr>
              </thead>
              <tbody className={'alignItems:center'}>
                {renderTable(isLoading, paginationData, classes)}
              </tbody>
            </table>

            {!isLoading && workitemCount > 0 && (
              <nav aria-label="Page navigation example">
                <ul
                  className={`pagination justify-content-end ${classes.ulCss} ${classes.customPagination}`}
                >
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
                      style={{ backgroundColor: '#232f8e' }}
                    >
                      <span
                        aria-hidden="true"
                        style={{
                          color: 'white',
                          fontWeight: 'lighter',
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
                        color: 'black',
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
                      style={{ backgroundColor: '#232f8e' }}
                    >
                      <span
                        aria-hidden="true"
                        style={{
                          color: 'white',
                          fontWeight: 'lighter',
                          fontSize: '20px',
                          position: 'relative',
                          top: '-1px',
                          border: 'none',
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
                      color: 'black',
                    }}
                  >
                    {currentRange.start} - {currentRange.end} of {workitemCount}
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

export default AzureDevopsTableContent;
