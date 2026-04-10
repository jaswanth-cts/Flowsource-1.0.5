import React, { useState, useEffect } from 'react';


import { fetchApiRef, useApi, configApiRef } from '@backstage/core-plugin-api';

import cssClasses from './CSPDetailsOneCss.js';
import { Grid, Typography } from '@material-ui/core';

import CSPPageOneBarGraph from './CSPDetailsOneBarGraph.js';
import CSPPageOneTable from './CSPDetailsOneTable.js';

import log from 'loglevel';

const CSPDetailsOne = (props) => {

  const classes = cssClasses();

  const { fetch } = useApi(fetchApiRef);
  const config = useApi(configApiRef);
  const backendBaseApiUrl = config.getString('backend.baseUrl') + '/api/flowsource-cctp/';

  const [isLoading, setLoading] = useState(true);

  //Used to show HTTP error message.
  const [httpError, setHttpError] = useState(null);

  //Need to set variable to false when data is not available for the chart.
  const [performaceChartDataAvailable, setPerformaceChartDataAvailable] = useState(true);
  const [performaceBarChartData, setPerformaceBarChartData] = useState([]);

  const [tansactionsTableData, setTansactionsTableData] = useState([]);

  function setPerformanceTestCaseGraphData(response, performance) {
    try
    {
      if (performance !== null && performance !== undefined && performance.length > 0) 
      {
        let barData = [];
        performance.forEach(function (item, index) 
        {
          Object.keys(item).forEach(function (key)
          {
            const entry = { barName: key, barValue: item[key] };
            barData.push(entry);
          });
        });

        setPerformaceBarChartData(barData);
      } 
      else
      {
        log.info('Error: data.performance is null or undefined. API returned: ' + response.status);
        setPerformaceChartDataAvailable(false);
      }
    } catch (error) {
      log.info('Error: Exception: ' + error);
      setPerformaceChartDataAvailable(false);
    }
  }

  function setTansactionsTableDataFromResp(response, transaction) {
    try
    {
      if (transaction !== null && transaction !== undefined && transaction.length > 0) 
      {
        let tableData = [];
        transaction.forEach(function (item, index) {
          const entry = { testCaseName: item.testCaseName, testStepName: item.testStepName, pageSize: item.pageSize, loadTime: item.loadTime };
          tableData.push(entry);
        });

        setTansactionsTableData(tableData);
      } else {
        log.info('error: data.transaction is null or undefined. API returned: ' + response.status);
      }
    } catch (error) {
      log.info('Error: Exception: ' + error);
    }
  }

  async function getCSPDataFromBackend() {
    try 
    {
      const testCaseId = props.testCaseId;
      const response = await fetch(`${backendBaseApiUrl}cctp-proxy/flowsource/performance-report/${testCaseId}`);

      if (response.ok) 
      {
        const data = await response.json();
        if (data !== null && data !== undefined) 
        {
          //In this section we are getting the graph data for performance testcases.
          setPerformanceTestCaseGraphData(response, data.performance);

          //In this section we are getting the table data for Transactions.
          setTansactionsTableDataFromResp(response, data.transaction);

        } else {
          log.info('error: Data is null or undefined. API returned: ' + response.status);
          setPerformaceChartDataAvailable(false);
        }

      } else {
        log.info('error: API returned: ' + response.status + ' - ' + response.statusText);
        const errorText = await response.text();
        // Format the error message
        const formattedError = `HTTP error! status: ${response.status}, message: ${errorText}`;
        // Set the error state with the formatted error message
        setHttpError(formattedError);

        setPerformaceChartDataAvailable(false);
      }

      setLoading(false);

    } catch (error) {
      log.info('error: exception: ' + error);
      setPerformaceChartDataAvailable(false);
      setLoading(false);
    }
  };

  useEffect(() => {
    getCSPDataFromBackend();
  }, []);

  if (isLoading) {
    return(
      <div className={`App p-3 ${classes.isLoadingStyle}`}>
        Loading...
      </div>
    );
  }

  if (httpError) {
    let displayError = httpError;
    try {
        const errorObj = JSON.parse(httpError.split('message: ')[1]);
        const statusCode = errorObj.response.statusCode;
        displayError = `HTTP error: status: ${statusCode}, message: Application error occured.`;
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

  return (
    <div>
      <Grid container>
        <Grid item xs={12} sm={12} md={12}>
          <Typography className={`${classes.barChartHeading}`}>Performance Testcase Hotspot</Typography>
        </Grid>
        <Grid item xs={12} sm={12} md={12}>
          {performaceChartDataAvailable === false ? (<NoDataTag />) : (
            <CSPPageOneBarGraph performaceBarChartData={performaceBarChartData} />)}
        </Grid>
        <Grid item xs={12} sm={12} md={12}>
          <Typography className={`${classes.barChartHeading}`}>Transactions</Typography>
        </Grid>
        <Grid item xs={12} sm={12} md={12}>
          <CSPPageOneTable tansactionsTableData={tansactionsTableData} props={props} />
        </Grid>
      </Grid>
    </div>
  );
};

export default CSPDetailsOne;


const NoDataTag = () => {

    const classes = cssClasses();

    return (
      <div className={`${classes.noDataMain}`}>
        <div className={`card`}>
          <div className={`card-text ms-2 mt-2`}>
            <div className={`mt-1 ms-2 ${classes.noDataHeading}`}>
              <b>Application Error Details</b>
            </div>
            <div className={`${classes.noDataMessage}`}>
              <b>No data is available to show the graph.</b>
            </div>
          </div>
        </div>
      </div>
    );
  }