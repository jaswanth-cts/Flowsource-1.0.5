import cssClasses from './ServiceNowPageCss.js';
import { useState, useEffect, React } from 'react';
import { useApi, configApiRef, fetchApiRef } from '@backstage/core-plugin-api';
import { useEntity } from '@backstage/plugin-catalog-react';
import 'bootstrap/dist/css/bootstrap.min.css';
import { EntitySwitch } from '@backstage/plugin-catalog';
import { EmptyState } from '@backstage/core-components';
import {
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  TextField,
} from '@mui/material';

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
import Button from '@mui/material/Button';
import ButtonGroup from '@mui/material/ButtonGroup';
import { styled } from '@mui/material';
import { BsSearch } from 'react-icons/bs';

import SnServiceRequestPage from '../EnvironmentServiceNow/ServiceNowRequestComponents/SnServiceRequestPage';

// Mapping of state codes to state names
const stateMapping = {
  1: 'New',
  2: 'In Progress',
  3: 'Closed',
};

const statesMapping = {
  None: '',
  New: 1,
  'In Progress': 2,
  'On Hold': 3,
  Resolved: 4,
  Closed: 5,
};

const priorityMapping = {
  '0': '',
  '1': 1,
  '2': 2,
  '3': 3,
  '4': 4,
};

const ServiceNowPage = () => {
  const classes = cssClasses();
  const { fetch } = useApi(fetchApiRef);
  const [isLoading, setLoading] = useState(true);
  const entity = useEntity();
  const [error, setError] = useState(null);
  
  const config = useApi(configApiRef);
  const backendBaseApiUrl = config.getString('backend.baseUrl') + '/api/flowsource-service-now/';
  
  const configurationItem = entity.entity.metadata.annotations?.['flowsource/servicenow-configuration-item'];
  const environmentConfigItem = entity.entity.metadata.annotations?.['flowsource/servicenow-environment-configuration-item'];

  const kind = entity.entity.kind;
  const isKindEnvironment = kind === 'Environment';

  const isAnnotationValid = (() => {
    if (isKindEnvironment) {
      return environmentConfigItem !== undefined && environmentConfigItem !== null 
        && environmentConfigItem !== '' && configurationItem !== undefined 
        && configurationItem !== null && configurationItem !== '';
    }

    return configurationItem !== undefined && configurationItem !== null;
  })();

  let agenticAIOpsLink = {
    url: config.getOptionalString('serviceNow.environment.agenticAIOpsLink') || '',
    label: 'Agentic AIOps Dashboard',
  };

  // Function to normalize the instance URL
  const normalizeUrl = url => {
    if (!url.startsWith('https://') && !url.startsWith('http://')) {
      url = 'https://' + url;
    }
    if (!url.endsWith('/')) {
      url = url + '/';
    }
    return url;
  };

  // Extracting and normalizing instance URL for the hyperlink in incident column
  let instanceUrl = normalizeUrl(
    config.getOptionalString('serviceNow.instanceUrl') || '',
  );
  
  const itemsPerPage = 25;
  const [paginationData, setpaginationData] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [dataTotalCount, setDataTotalCount] = useState(0);
  const totalPages = Math.ceil(dataTotalCount / itemsPerPage);
  const pagesToShow = 4; // Number of pages to show before and after the active page
  const pagesArray = [...Array(totalPages).keys()];

  const handlePageChange = page => {
    fetchAllData(page, itemsPerPage);
  };

  const [priorityFilter, setPriorityFilter] = useState(''); // State to store the selected priority
  const [stateFilter, setStateFilter] = useState(''); // State to store the selected priority
  const [isMyIncidents, setIsMyIncidents] = useState(true); // Default to "My Incidents"
  const [searchQuery, setSearchQuery] = useState('');

  const handlePriorityFilterChange = value => {
    const mappedValue = priorityMapping[value]; // Map the selected string value to its numeric equivalent
    setPriorityFilter(mappedValue); // Update the state with the selected value
  };

  const handleStateFilterChange = value => {
    const mappedValue = statesMapping[value]; // Map the selected string value to its numeric equivalent
    setStateFilter(mappedValue); // Update the state with the numeric value
    // Send the mapped value to the backend here if needed
  };

  const handleSearchChange = async value => {
    setSearchQuery(value); // Update the search query state
  };

  const handleMyIncidentsClick = () => {
    setIsMyIncidents(true); // Set to "My Incidents"
  };

  const handleAllIncidentsClick = () => {
    setIsMyIncidents(false); // Set to "All Incidents"
  };

  const fetchAllData = async (pageNumber, pageSize) => {
    try {
      //api call to backend to get incidents from snow instance
      const url = `${backendBaseApiUrl}snow-incidents?configurationItem=${encodeURIComponent(
        configurationItem?.toLowerCase(),
      )}&pageNumber=${encodeURIComponent(
        pageNumber,
      )}&pageSize=${encodeURIComponent(pageSize)}${
        priorityFilter
          ? `&priorityFilter=${encodeURIComponent(priorityFilter)}`
          : ''
      }${stateFilter ? `&stateFilter=${encodeURIComponent(stateFilter)}` : ''}${
        isMyIncidents ? `&myIncidents=true` : `&myIncidents=false`
      }${searchQuery ? `&searchQuery=${encodeURIComponent(searchQuery)}` : ''}`;
      const snowIncidentResponse = await fetch(url);

      if (snowIncidentResponse.ok) {
        const snowIncidentsResult = await snowIncidentResponse.json();
        if (snowIncidentsResult) {
          // Set the api response data to the state
          setpaginationData(snowIncidentsResult.snowDetailsObject);
          setCurrentPage(pageNumber);
          // Set the total count of data from the api response
          setDataTotalCount(snowIncidentsResult.dataTotalCount);

        }
        setLoading(false);
      } else {
        if (snowIncidentResponse.status === 503) {
          const errorText = await snowIncidentResponse.json();
          setError(errorText.error);
        } else
          setError(
            `Error fetching service-now incident details, with status code ${snowIncidentResponse.status} `,
          );
        setLoading(false);
      }
    } catch (error) {
      setLoading(false);
      console.error('Error:', error);
      setError(error.message);
    }
  };

  useEffect(() => {
    if(isAnnotationValid)   
    {
      let timeoutId;

      if (searchQuery) {
        // Delay API call by 2 seconds if there is a search value
        timeoutId = setTimeout(() => {
          fetchAllData(1, itemsPerPage);
        }, 1000);
      } else {
        fetchAllData(1, itemsPerPage);
      }
  
      return () => clearTimeout(timeoutId);
    } else {
      setLoading(false);
    }
  }, [priorityFilter, stateFilter, isMyIncidents, searchQuery]);

  function renderServiceNowPage() {
    if (isLoading) {
      return <div className={`App p-3 ${classes.isLoading}`}>Loading...</div>;
    }
    else if(!isAnnotationValid) {
      return <ServiceNowAnnotationsMissingPage isKindEnvironment={isKindEnvironment} />;
    } 
    else if (error) {
      return (
        <>
          <ServiceNowHeadingSection isKindEnvironment={isKindEnvironment}
            agenticAIOpsLink={agenticAIOpsLink}
          />
          <ServiceNowErrorPage error={error} />
          { isKindEnvironment ? ( <SnServiceRequestPage environmentConfigItem={environmentConfigItem} /> ) : '' }
        </>
      );
    } 
    else {
      return(
        <>
          <ServiceNowHeadingSection isKindEnvironment={isKindEnvironment} 
            agenticAIOpsLink={agenticAIOpsLink} 
          />
          <div className={`col-lg-12`}>
            <div className={`card`}>
              <div className={`card-body`}>
                <SnIncidentButtonsAndFilterHeaderSection
                  isMyIncidents={isMyIncidents} handleMyIncidentsClick={handleMyIncidentsClick}
                  handleAllIncidentsClick={handleAllIncidentsClick} priorityFilter={priorityFilter}
                  handlePriorityFilterChange={handlePriorityFilterChange} stateFilter={stateFilter}
                  handleStateFilterChange={handleStateFilterChange}
                  handleSearchChange={handleSearchChange}
                />
                <ServiceNowIncidentTableSection paginationData={paginationData} 
                  instanceUrl={instanceUrl} configurationItem={configurationItem} 
                />
                <ServiceNowNavBarSection currentPage={currentPage} pagesToShow={pagesToShow} 
                  totalPages={totalPages} pagesArray={pagesArray} handlePageChange={handlePageChange} 
                />
              </div>
            </div>
          </div>
          { isKindEnvironment ? ( <SnServiceRequestPage environmentConfigItem={environmentConfigItem} /> ) : '' }
        </>
      );
    }
  };

  return (
    <div>
      { renderServiceNowPage() }
    </div>
  );
};

function ServiceNowHeadingSection({ isKindEnvironment, agenticAIOpsLink }) {
  
  const classes = cssClasses();

  const handleAgenticClick = () => {
    const url = agenticAIOpsLink.url.trim();

    if(url === '' || url === null || url === undefined) {
      window.alert("The URL configuration for Agentic AIOps Dashboard is missing. " + 
        "Please contact the administrator to configure it.");
      return;
    }

    window.open(url, '_blank', 'noopener,noreferrer');
  };

  if (isKindEnvironment) {
    return (
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <div
          className={`${classes.header}`}
          style={{
            fontWeight: 'bold',
            fontSize: '20px',
            whiteSpace: 'nowrap',
          }}
        >
          Incident Details
        </div>
        <Button
          variant="contained"
          color="primary"
          size="small"
          onClick={handleAgenticClick}
          style={{
            textTransform: 'none',
            fontSize: '13px',
            height: '30px',
          }}
        >
          {agenticAIOpsLink.label}
        </Button>
      </div>
    );
  } else {
    return (
      <div
        className={`${classes.header}`}
        style={{
          fontWeight: 'bold',
          fontSize: '20px',
          whiteSpace: 'nowrap',
        }}
      >
        Incident Details
      </div>
    );
  }
};

function SnIncidentButtonsAndFilterHeaderSection({ isMyIncidents, handleMyIncidentsClick,
  handleAllIncidentsClick, priorityFilter, handlePriorityFilterChange, stateFilter,
  handleStateFilterChange, handleSearchChange
}) {
  const classes = cssClasses();

  const BootstrapButton = styled(Button)({
    textTransform: 'none',
    fontSize: '13px',
    height: '25px',
  });

  return (
  <div style={{ display: 'flex', alignItems: 'center', maxWidth: '100%' }}>
    <div
      className={`${classes.pluginHeading}`}
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: '20px',
        marginBottom: '16px',
        flexWrap: 'wrap',
      }}
    >
      {/* Button Group */}
      <ButtonGroup
        variant="outlined"
        aria-label="Sprint button group"
        style={{
          fontWeight: 'bold',
          fontSize: '13px',
          textTransform: 'lowercase',
          marginBottom: '15px',
        }}
      >
        <BootstrapButton
          style={{
            color: isMyIncidents ? 'white' : 'black',
            backgroundColor: isMyIncidents ? '#13225F' : 'inherit',
          }}
          onClick={handleMyIncidentsClick}
        >
          My Incidents
        </BootstrapButton>
        <BootstrapButton
          style={{
            color: isMyIncidents ? 'black' : 'white',
            backgroundColor: !isMyIncidents ? '#13225F' : 'inherit',
          }}
          onClick={handleAllIncidentsClick}
        >
          All Incidents
        </BootstrapButton>
      </ButtonGroup>

      {/* Priority Filter */}
      <p className={`${classes.priorityOption}`}>
        Priority
      </p>

      <FormControl
        variant="outlined"
      >

        <Select
          labelId="priority-filter-label"
          id="priority-filter"
          value={Object.keys(priorityMapping).find(
          key => priorityMapping[key] === priorityFilter,
          )} 
          onChange={e => handlePriorityFilterChange(e.target.value)}
            className={`${classes.priorityFilterBox}`}
          >
            <MenuItem value="0">None</MenuItem>
            <MenuItem value="1">1</MenuItem>
            <MenuItem value="2">2</MenuItem>
            <MenuItem value="3">3</MenuItem>
            <MenuItem value="4">4</MenuItem>
        </Select>
      </FormControl>

      {/* State Filter */}
                  
      <p
        className={`${classes.stateOption}`}
      >
        State
      </p>

      <FormControl
        variant="outlined"
      >
        <Select
          labelId="state-filter-label"
          id="state-filter"
          value={Object.keys(statesMapping).find(
          key => statesMapping[key] === stateFilter,
          )} 
          onChange={e => handleStateFilterChange(e.target.value)}
          className={`${classes.stateFilterBox}`}
        >
          <MenuItem value="None"> None </MenuItem>
          <MenuItem value="New">New</MenuItem>
          <MenuItem value="In Progress">In Progress</MenuItem>
          <MenuItem value="On Hold">On Hold</MenuItem>
          <MenuItem value="Resolved">Resolved</MenuItem>
          <MenuItem value="Closed">Closed</MenuItem>
        </Select>
      </FormControl>

      <TextField
        variant="outlined"
        placeholder="Search..."
        size="small"
        InputProps={{
          className: `${classes.searchBox}`,
        }}
        onChange={e => handleSearchChange(e.target.value)}
      />
        <BsSearch style={{ 
          color: 'rgb(186 186 190)',                   
          marginTop: -15,
          marginLeft: -42
        }} />

      <div className={`${classes.pluginVersion}`}>
        <PluginVersion />
      </div>
    </div>
  </div>
  );
};

function ServiceNowIncidentTableSection({ paginationData, instanceUrl, configurationItem }) {
  const classes = cssClasses();

  return (
    <table className={`table table-bordered ${classes.tableStriped1}`}>
      <thead>
        <tr>
          <th>Incident</th>
          <th>Category</th>
          <th>Configuration Item</th>
          <th>Short Description</th>
          <th>Priority</th>
          <th>State</th>
          <th>Assigned To</th>
        </tr>
      </thead>
      <tbody>
        {paginationData.length > 0 ? (
          paginationData.map(value => (
            <tr key={value.incidentNumber}>
              <td>
                <a
                  href={
                    `${instanceUrl}incident.do?sys_id=` + value.incidentNumber
                  }
                  className={`${classes.linkStyle}`}
                  target="_blank"
                >
                  {value.incidentNumber}
                </a>
              </td>
              <td>{value.category}</td>
              <td>{configurationItem}</td>
              <td>{value.shortDescription}</td>
              <td>{value.priority}</td>
              <td>{stateMapping[value.state]}</td>
              <td>{value.assignedTo}</td>
            </tr>
          ))
        ) : (
          <tr>
            <td colSpan="7" style={{ textAlign: 'center' }}>
              No incidents available for this filter criteria specified.
            </td>
          </tr>
        )}
      </tbody>
    </table>
  );
};

function ServiceNowNavBarSection({ currentPage, pagesToShow, totalPages, pagesArray, handlePageChange }) {
  
  const classes = cssClasses();

  // Function to calculate pagination start and end pages
  const calculatePagination = (currentPage, pagesToShow, totalPages) => {
    let startPage = 1;
    let endPage = Math.min(pagesToShow, totalPages);
  
    if (currentPage > pagesToShow - 2) {
      startPage = currentPage - Math.floor(pagesToShow / 2);
      endPage = Math.min(currentPage + Math.floor(pagesToShow / 2), totalPages);
    }
  
    return { startPage, endPage };
  };
  
  // Calculate the start and end page numbers for pagination
  const { startPage, endPage } = calculatePagination(
    currentPage,
    pagesToShow,
    totalPages,
  );
  
  const isPreviousDisabled = currentPage === 1;
  const isNextDisabled = currentPage === totalPages;

  const getPageItemClass = isDisabled => isDisabled ? 'page-item disabled' : 'page-item';

  return (
    <nav aria-label="Page navigation example">
      <ul
        className={`pagination justify-content-end ${classes.ulCss} ${classes.customPagination}`}
      >
        <li className={getPageItemClass(isPreviousDisabled)}>
          <a
            aria-label="Previous"
            className="page-link"
            href="#"
            tabIndex="-1"
            onClick={() => handlePageChange(currentPage - 1)}
          >
            <span aria-hidden="true">&laquo;</span>
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
              className={`page-link ${
                index + 1 === currentPage ? 'Mui-selected' : ''
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
        <li className={getPageItemClass(isNextDisabled)}>
          <a
            href="#"
            className="page-link"
            onClick={() => handlePageChange(currentPage + 1)}
            aria-label="Next"
          >
            <span aria-hidden="true">&raquo;</span>
          </a>
        </li>
      </ul>
    </nav>
  );
};

function ServiceNowErrorPage ({ error }) {
  return (
    <div className={`col-lg-12`}>
      <div className={`card`}>
        <div className={`card-body`}>
          <div className="card ms-0 me-2 mb-2 mt-2">
            <div className="card-header">
              <h6 className="mb-0">Error</h6>
            </div>
            <div className="card-body">
              <div className="alert alert-danger mt-2 mb-2" role="alert">
                {error}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

function ServiceNowAnnotationsMissingPage({ isKindEnvironment }) {

  return (
    <div className="mt-3 ms-2 me-2 mb-3">
      <EntitySwitch>
        <EntitySwitch.Case>
          <EmptyState
            title={ isKindEnvironment ? "Service Now Environment page is not available for this entity." 
              : "Service Now Incident page is not available for this entity."
            }
            missing="info"
            description={ isKindEnvironment ? "Required annotations have to be added to the component if you want to see the Service Now Environment page."
              : "You need to add an annotation to your component if you want to see Service Now incident's page for it."
            }
          />
        </EntitySwitch.Case>
      </EntitySwitch>
    </div>
  );

};

export default ServiceNowPage;
