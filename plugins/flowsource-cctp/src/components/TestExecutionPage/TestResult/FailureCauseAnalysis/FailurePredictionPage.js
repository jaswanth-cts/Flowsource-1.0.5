import React, { useState, useEffect } from "react";
import { fetchApiRef, useApi, configApiRef } from '@backstage/core-plugin-api';
import cssClasses from './FailureCausePageCss.js';

import log from 'loglevel';

const FailurePredictionPage = (props) => {

    const classes = cssClasses();
    const { fetch } = useApi(fetchApiRef);
    const config = useApi(configApiRef);
    const backendBaseApiUrl = config.getString('backend.baseUrl') + '/api/flowsource-cctp/';

    const [isLoading, setLoading] = useState(true);
    const [tableData, setTableData] = useState([]);
    const [error, setError] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const ITEMS_PER_PAGE = 5;
    const totalPages = Math.ceil(tableData.length / ITEMS_PER_PAGE);
    const handlePageChange = (pageNumber) => {
        setCurrentPage(pageNumber);
    };

    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    const currentTableData = tableData.slice(startIndex, endIndex);
    const pagesToShow = 3;
    const pagesArray = [...Array(totalPages).keys()];

    let startPage = 1;
    let endPage = Math.min(pagesToShow, totalPages);

    startPage = currentPage > pagesToShow - 2 ? currentPage - Math.floor(pagesToShow / 2) : startPage;
    endPage = currentPage > pagesToShow - 2 ? Math.min(currentPage + Math.floor(pagesToShow / 2), totalPages) : endPage;
    const isPreviousDisabled = currentPage === 1;
    const isNextDisabled = currentPage === totalPages;

  async function getFailurePredictionData() {
    try {
      const response = await fetch(`${backendBaseApiUrl}cctp-proxy/flowsource/failureCauseAnalysis/prediction/${props.failureId}?tag=${props.tagName}`);
      // Check if the response is not OK
      if (!response.ok) {
        // Read the error message from the response
        const errorText = await response.text();
        // Format the error message
        const formattedError = `HTTP error! status: ${response.status}, message: ${errorText}`;
        // Set the error state with the formatted error message
        setError(formattedError);
      } else {
        const data = await response.json();
        setTableData(data);
      }
    } catch (error) {
      // Log the error to the log level
      log.error('Error fetching data from backend:', error);
      // Set a generic error message if the error is not an HTTP error
      if (!error.message.includes('HTTP error!')) {
        setError(`Error fetching data: ${error.message}`);
      }
    } finally {
      // Set loading to false after the fetch operation is complete
      setLoading(false);
    }
  }

    useEffect(async () => {
        getFailurePredictionData();
    }, []);

  if (isLoading) {
    return (
      <div className={`App p-3 ${classes.loadingContainer}`}>
        Loading...
      </div>
    );
  }

  if (error) {
    let displayError = error;
    try {
      const errorObj = JSON.parse(error.split('message: ')[1]);
      const statusCode = errorObj.response.statusCode;
      displayError = `HTTP error! status: ${statusCode}, message: Application error occured.`;
    } catch (e) {
      log.error('Error parsing error message:', e);
    }

    return (
      <div className="card ms-2 me-2 mb-2 mt-2">
        <div className="card-header">
          <h6>Error</h6>
        </div>
        <div className="card-body">
          <div className="alert alert-danger" role="alert">
            {displayError}
          </div>
        </div>
      </div>
    );
  }

  let execptionAllCounter = 0;
  let exceptionCounter = 0;

  return (
    <div>
      <div>
        <div className="table-wrapper">
          <table className={`table table-bordered ${classes.predictionTable}`}>
            <thead className={`${classes.tableHead}`}>
              <tr>
                <th>TYPE</th>
                <th>EXCEPTION</th>
              </tr>
            </thead>
            <tbody className={`${classes.predictionTableBody}`}>
              {currentTableData.map((exception, index) => {
                if (props.tagName === "all") {
                  return (
                    <tr key={"ExceptionAll" + execptionAllCounter++} 
                      className={`${classes.predictionTableTr}`}
                    >
                      <td className={`${classes.predictionTableTd1}`}>
                        {exception.prediction}
                      </td>
                      <td className={`${classes.predictionTableTd2}`}>
                        {exception.exceptionStacktrace}
                      </td>
                    </tr>
                  );
                }
                return (
                  <tr key={"excecption" + exceptionCounter++} className={`${classes.predictionTableTr}`}>
                    <td className={`${classes.predictionTableTd1}`}>{props.tagName}</td>
                    <td className={`${classes.predictionTableTd2}`}>
                      {exception}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {tableData.length === 0 ? (
            <p className={`${classes.dataUnavailable}`}>
              <b>No Data Available</b>
            </p>) :
            <div className='d-flex align-items-center mt-3 justify-content-end'>
              <nav aria-label="Page navigation example justify-content-end">
                <ul className={`pagination justify-content-end ${classes.ulCss} ${classes.customPagination}`}>
                  <li className={`page-item ${isPreviousDisabled ? 'disabled' : ''}`}>
                    <a aria-label="Previous" className="page-link"
                      href="#"
                      tabIndex="-1"
                      onClick={() => handlePageChange(currentPage - 1)}>
                      <span aria-hidden="true">«</span>
                    </a>
                  </li>
                  {startPage > 1 && (
                    <li className="page-item disabled">
                      <span className="page-link">...</span>
                    </li>
                  )}
                  {pagesArray.slice(startPage - 1, endPage).map((index) => (
                    <li
                      key={index}
                      className={`page-item ${classes.numCss}`}>
                      <a className={`page-link  ${index + 1 === currentPage ? 'Mui-selected' : ''}`} href="#" onClick={() => handlePageChange(index + 1)}>
                        {index + 1}
                      </a>
                    </li>
                  ))}
                  {endPage < totalPages && (
                    <li className="page-item disabled">
                      <span className="page-link">...</span>
                    </li>
                  )}
                  <li className={`page-item ${isNextDisabled ? 'disabled' : ''}`}>
                    <a href="#" className="page-link" onClick={() => handlePageChange(currentPage + 1)} aria-label="Next">
                      <span aria-hidden="true">»</span>
                    </a>
                  </li>
                </ul>
              </nav>
            </div>
          }
        </div>
      </div>
    </div>
  );
};

export default FailurePredictionPage;