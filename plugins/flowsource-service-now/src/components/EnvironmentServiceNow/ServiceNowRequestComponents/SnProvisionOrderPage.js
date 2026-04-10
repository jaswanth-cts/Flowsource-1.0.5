import cssClasses from './ServiceNowRequestCSS.js';
import { useState, useEffect, React } from 'react';
import { useApi, configApiRef, fetchApiRef } from '@backstage/core-plugin-api';
import 'bootstrap/dist/css/bootstrap.min.css';
import { EmptyState } from '@backstage/core-components';
import { Paper, Card, CardHeader, Typography, Divider, CardContent, Alert } from '@mui/material';
import PluginVersion from '../../PluginVersion/PluginVersion';
import log from 'loglevel';
import CreateProvisionReqButton from './CreateProvisionReqButton.js';

// Mapping of state codes to state names
const stateMapping = {
    1: 'New',
    2: 'In Progress',
    3: 'Closed'
};

const SnProvisionOrderPage = ({ configurationItem }) => {

  const classes = cssClasses();
  const { fetch } = useApi(fetchApiRef);
  const [isLoading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const config = useApi(configApiRef);
  const backendUrl = config.getString('backend.baseUrl');
  const backendBaseApiUrl = backendUrl + '/api/flowsource-service-now/';

  const [paginationData, setpaginationData] = useState([]);
  const itemsPerPage = 5;
  const [currentPage, setCurrentPage] = useState(1);
  const [hasPaginationData, hasPaginationDataSet] = useState(false);
  const [dataTotalCount, setDataTotalCount] = useState(0);

  const handlePageChange = page => {
    setLoading(true);
    fetchProvisionOrders(page, itemsPerPage);
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

  const handleCreateProvisionReqClick = async e => {
    e.preventDefault();
    try 
    {
      let orderTypeField = '';
      let provisionTypeVal = '';

      const response = await fetch(`${backendBaseApiUrl}get-provision-order-config`);

      if (response.ok) {
        const configRes = await response.json();
        if (configRes) {
          orderTypeField = configRes.serviceNowParams.OrderTypeField;
          provisionTypeVal = configRes.serviceNowParams.provisionTypeValue;
        } else {
          window.alert("Status:" + response.status + ", Error in fetching configuration values. Please re-try.");
          return;
        }
      } else {
        const errorText = await response.json();

        window.alert("HTTP Status:" + response.status + ", Message:" + errorText.error);
        return;
      }

      // sys_id=-1 opens a new record form.
      // sysparm_query pre-populates fields.
      const reqUrl = `${instanceUrl}sc_request.do?sys_id=-1&sysparm_query=${encodeURIComponent(
        `cmdb_ci=${configurationItem}^${orderTypeField}=${provisionTypeVal}`
      )}`;

      window.open(reqUrl, '_blank', 'noopener,noreferrer');
    } catch (err) {
      alert(err.message);
    }
  };

  const fetchProvisionOrders = async (pageNumber, pageSize) => {
    try 
    {
      const url = `${backendBaseApiUrl}snow-provision-orders?pageNumber=${encodeURIComponent(pageNumber)}
        &pageSize=${encodeURIComponent(pageSize)}
        &configurationItem=${encodeURIComponent(configurationItem)}`;

      const response = await fetch(url);

      if (response.ok) {
        const snowResult = await response.json();
        if (snowResult) {
          if (
            snowResult.snProvisionOrders &&
            snowResult.snProvisionOrders.length <= 0
          ) {
            setpaginationData([]);
            setCurrentPage(pageNumber);
            setDataTotalCount(snowResult.dataTotalCount);

            hasPaginationDataSet(false);
          } else {
            setpaginationData(snowResult.snProvisionOrders);
            setCurrentPage(pageNumber);
            // Set the total count of data from the api response
            setDataTotalCount(snowResult.dataTotalCount);

            hasPaginationDataSet(true);
          }
        }
      } else {
        const errorText = await response.json();

        if (response.status === 503) {
          setError(errorText.error);
        } else {
          setError(
            `HTTP Status: ${response.status}, Message: ${errorText.error}`,
          );
        }
      }
      setLoading(false);
    } catch (error) {
      setLoading(false);
      log.error('Error:', error);
      setError(error.message);
    }
  };

  useEffect(() => {
    fetchProvisionOrders(1, itemsPerPage);
  }, []);

  function renderServiceNowProvisionOrdersPage() {
    if (isLoading) {
      return (
        <div className={`${classes.isLoadingEnvStyle}`}>Loading...</div>
      );
    } else if (error) {
      return <ServiceNowErrorPage error={error} />;
    } else if (hasPaginationData) {
      return (
        <>
          <ServiceNowTableComponent
            paginationData={paginationData}
            instanceUrl={instanceUrl}
          />
          <ServiceNowTableNavComponent
            handlePageChange={handlePageChange}
            currentPage={currentPage}
            itemsPerPage={itemsPerPage}
            dataTotalCount={dataTotalCount}
          />
        </>
      );
    } else {
      return <ServiceNowNoDataFoundPage />;
    }
  }

  return (
    <div style={{ marginTop: '2rem' }}>
      <div className={`col-lg-12`}>
        <div className={`card`}>
          <div className={`card-body`}>
              <div className={`${classes.pluginHeading}`}>
                <div className={`${classes.pOrderheader}`}> Provision Orders </div>
                <div className={`${classes.pOrdHeadingIcons}`}>
                  <CreateProvisionReqButton
                    classes={classes}
                    onClick={ handleCreateProvisionReqClick }
                  />
                  <div>
                    <PluginVersion />
                  </div>
                </div>
              </div>
              { renderServiceNowProvisionOrdersPage() }
          </div>
        </div>
      </div>
    </div>
  );
};

const ServiceNowTableComponent = ({ paginationData, instanceUrl }) => {
    const classes = cssClasses();
    
    return (
      <>
        <table className={`table table-bordered ${classes.tableStriped1}`}>
          <thead>
            <tr>
              <th>Order #</th>
              <th>Category</th>
              <th>Short Description</th>
              <th>Priority</th>
              <th>State</th>
              <th>Assigned To</th>
            </tr>
          </thead>
          <tbody>
            {paginationData.map(value => (
              <tr key={value.requestNumber}>
                <td>
                  <a
                    href={
                      `${instanceUrl}sc_request.do?sys_id=` + value.requestNumber
                    }
                    className={`${classes.linkStyle}`}
                    target="_blank"
                  >
                    {' '}
                    {value.requestNumber}
                  </a>
                </td>
                <td>{value.category}</td>
                <td>{value.shortDescription}</td>
                <td>{value.priority}</td>
                <td>{stateMapping[value.state]}</td>
                <td>{value.assignedTo}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </>
    );
};

const ServiceNowTableNavComponent = ({ handlePageChange, currentPage, itemsPerPage, dataTotalCount }) => {
  const classes = cssClasses();

  const totalPages = Math.ceil(dataTotalCount / itemsPerPage);

  const pagesToShow = 4; // Number of pages to show before and after the active page
  const pagesArray = [...Array(totalPages).keys()];

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

  const getPageItemClass = isDisabled =>
    isDisabled ? 'page-item disabled' : 'page-item';

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
              className={`page-link  ${
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

const ServiceNowNoDataFoundPage = () => {
    const classes = cssClasses();
    
    return (
      <table className={`table table-bordered ${classes.tableStriped1}`}>
        <thead>
          <tr>
            <th>Order #</th>
            <th>Category</th>
            <th>Short Description</th>
            <th>Priority</th>
            <th>State</th>
            <th>Assigned To</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td colSpan="6" className={`${classes.noDataFound}`}>
              <h6>No Records Found</h6>
            </td>
          </tr>
        </tbody>
      </table>
    );
};

const ServiceNowErrorPage = ({ error }) => {
    return (
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
    );
};

export default SnProvisionOrderPage;