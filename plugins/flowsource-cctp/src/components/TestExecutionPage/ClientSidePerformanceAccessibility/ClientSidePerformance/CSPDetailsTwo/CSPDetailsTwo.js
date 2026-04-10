import React, { useState, useEffect } from 'react';


import { fetchApiRef, useApi, configApiRef } from '@backstage/core-plugin-api';

import cssClasses from './CSPDetailsTwoCss.js';
import { Grid, Typography, Card } from '@material-ui/core';

import CSPPageTwoPieGraph from './CSPDetailsTwoPieGraph.js';
import CSPPageTwoStackedBarGraph from './CSPDetailsTwoStackedBarGraph.js';

import log from 'loglevel';

const CSPDetailsTwo = (props) => {

    const classes = cssClasses();

    const { fetch } = useApi(fetchApiRef);
    const config = useApi(configApiRef);
    const backendBaseApiUrl = config.getString('backend.baseUrl') + '/api/flowsource-cctp/';

    const [isLoading, setLoading] = useState(true);
    
    //Used to show HTTP error message.
    const [httpError, setHttpError] = useState(null);

    //Need to set variable to false when data is not available for the cards.
    const [cardsDataAvailable, setCardsDataAvailable] = useState(true);
    const [cardsSummaryData, setSummaryCardsData] = useState({});

    //Need to set variable to false when data is not available for the chart.
    const [respTimeAnalysisChartAvailable, setRespTimeAnalysisChartAvailable ] = useState(true);
    const [respTimeAnalysisBarChartData, setRespTimeAnalysisBarChartData] = useState([]);
    
    //Need to set variable to false when data is not available for the chart.
    const [pageProfilingPieChartDataAvailable, setPageProfilingPieChartDataAvailable] = useState(true);
    const [pageProfilingPieChartData, setPageProfilingPieChartData] = useState([]);

    async function setSummaryCardsDataFromResp(cardData) {
        try
        {
            setSummaryCardsData({
                ttfp: cardData[0].ttfp,
                ttcp: cardData[0].ttcp,
                loadTime: cardData[0].loadTime,
                pageSize: cardData[0].pageSize,
                noOfRequest: cardData[0].requestCount
            });

        } catch (error) {
            log.info('error in setSummaryCardsDataFromResp: ' + error);
            setCardsDataAvailable(false);
        }
    }

    async function setResponseTimeAnalysisBarDataFromRes(barData) {
        try 
        {
            if (barData !== null && barData !== undefined) 
            {
                const responseData = [
                    { barName: 'Time to First Byte', barValue: barData[0].timeToFirstByte, barColor: '#689d37' },
                    { barName: 'Dom loading to complete', barValue: barData[0].domloadingtoComplete, barColor: '#97971b' },
                    { barName: 'Initial connection', barValue: barData[0].initialConnection, barColor: '#bdbdbd' },
                    { barName: 'DOM loading to loaded', barValue: barData[0].domloadingtoLoaded, barColor: '#d57119' },
                ]

                responseData.sort((a, b) => a.barValue - b.barValue);

                setRespTimeAnalysisBarChartData(responseData);
            } else {
                setRespTimeAnalysisChartAvailable(false);
            }
        } catch(error) {
            log.info('error in setResponseTimeAnalysisBarDataFromRes: ' + error);
            setRespTimeAnalysisChartAvailable(false);
        }
    }

    async function setPageProfilingPieChartDataFromRes(pieChartDataFromRes) {
        try
        {
            if(pieChartDataFromRes !== null && pieChartDataFromRes !== undefined) 
            {
                let pieData = [];

                Object.keys(pieChartDataFromRes).forEach(function (key) 
                {
                    const value = pieChartDataFromRes[key];
    
                    if(value != 0) {
                        const entry = { pieName: key, pieValue: value };
                        pieData.push(entry);
                    }
                });
    
                setPageProfilingPieChartData(pieData);
            } 
            else {
                setPageProfilingPieChartDataAvailable(false);
            }
        } catch(error) {
            log.info('error in setPageProfilingPieChartDataFromRes: ' + error);
            setPageProfilingPieChartDataAvailable(false);
        }
    }

    async function getCSPDataFromBackend() {
        try
        {
            const testCaseId = props.testCaseId;
            const testCaseName = props.testCaseName;
            
            const response = await fetch(`${backendBaseApiUrl}cctp-proxy/flowsource/performance-report/transaction/${testCaseId}?${testCaseName}`);
            
            if (response.ok) 
            {
                const data = await response.json();

                if(data !== null && data !== undefined) 
                {
                    //This is the main section where data for cards and graphs are being set.
                    if(data.performanceMatrics !== null && data.performanceMatrics !== undefined) 
                    {
                        //In this section we are getting data for the Summary Cards.
                        setSummaryCardsDataFromResp(data.performanceMatrics);

                        //In this section we are getting data for the Stacked Bar Graph.
                        const stackedBarDataFromRes = data.performanceMatrics[0].performancesTimeAnalysisResponse;
                        setResponseTimeAnalysisBarDataFromRes(stackedBarDataFromRes);

                        //In this section we are getting data for the Pie Chart.
                        const pieChartDataFromRes = data.performanceMatrics[0].pageProfiling;
                        setPageProfilingPieChartDataFromRes(pieChartDataFromRes);

                    } else {
                        log.info('error: data.performanceMatrics is null or undefined. API returned: ' + response.status);
                        setCardsDataAvailable(false);
                        setRespTimeAnalysisChartAvailable(false);
                        setPageProfilingPieChartDataAvailable(false);
                    }
                } else {
                    log.info('error: Data is null or undefined. API returned: ' + response.status);
                    setCardsDataAvailable(false);
                    setRespTimeAnalysisChartAvailable(false);
                    setPageProfilingPieChartDataAvailable(false);
                }
            } else {
                log.info('error: API returned: ' + response.status + ' - ' + response.statusText);
                const errorText = await response.text();
                // Format the error message
                const formattedError = `HTTP error! status: ${response.status}, message: ${errorText}`;
                // Set the error state with the formatted error message
                setHttpError(formattedError);

                setCardsDataAvailable(false);
                setRespTimeAnalysisChartAvailable(false);
                setPageProfilingPieChartDataAvailable(false);
            }

            setLoading(false);

        } catch (error) {
            log.info('error: ' + error);
            setCardsDataAvailable(false);
            setRespTimeAnalysisChartAvailable(false);
            setPageProfilingPieChartDataAvailable(false);

            setLoading(false);
        }
    }

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
                    <Typography className={`${classes.barChartHeading}`}>Summary</Typography>
                </Grid>
                <Grid item xs={12} sm={12} md={12}>
                    <SummaryCardsSection cardsSummaryData={cardsSummaryData} cardsDataAvailable={cardsDataAvailable}/>
                </Grid>
                <Grid item xs={12} sm={12} md={12}>
                    <Typography className={`${classes.barChartHeading}`}>Response Time Analysis</Typography>
                </Grid>
                <Grid item xs={12} sm={12} md={12}>
                    { respTimeAnalysisChartAvailable === false ? (<NoDataTag />) : (
                        <CSPPageTwoStackedBarGraph respTimeAnalysisBarChartData={respTimeAnalysisBarChartData}/> ) }
                    <InfoTableSection />     
                </Grid>
                <Grid item xs={12} sm={12} md={12}>
                    <Typography className={`${classes.barChartHeading}`}>Page Profiling</Typography>
                </Grid>
                <Grid item xs={12} sm={12} md={12}>
                    { pageProfilingPieChartDataAvailable === false ? (<NoDataTag />) : (
                        <CSPPageTwoPieGraph pageProfilingPieChartData={pageProfilingPieChartData} />) }
                </Grid>
            </Grid>
        </div>
    );

};

export default CSPDetailsTwo;


const SummaryCardsSection = ({ cardsSummaryData, cardsDataAvailable }) => {

    const classes = cssClasses();

    return (
        <div className={`row ms-1 me-1 mt-1 mb-1`}>
            <div className={`col`}>
                <Card variant="outlined" className={`${classes.firstCard}`}>
                    <div className={`${classes.cardContent}`}>
                        <span className={`${classes.tTFPCardColor}`}></span>
                        <div>
                            <Typography className={`${classes.cardHeading}`}>
                                TTFP
                            </Typography>
                            {cardsDataAvailable === false ? (
                                <Typography variant="h6" className={`${classes.cardValue}`}>
                                    No Data
                                </Typography>
                            ) : (
                                <Typography variant="h6" className={`${classes.cardValue}`}>
                                    {cardsSummaryData.ttfp}ms
                                </Typography>
                            )}
                        </div>
                    </div>
                </Card>
            </div>
            <div className={`col`}>
                <Card variant="outlined">
                    <div className={`${classes.cardContent}`}>
                        <span className={`${classes.tTCPCardColor}`}></span>
                        <div>
                            <Typography className={`${classes.cardHeading}`}>
                                TTCP
                            </Typography>
                            {cardsDataAvailable === false ? (
                                <Typography variant="h6" className={`${classes.cardValue}`}>
                                    No Data
                                </Typography>
                            ) : (
                                <Typography variant="h6" className={`${classes.cardValue}`}>
                                    {cardsSummaryData.ttcp}ms
                                </Typography>
                            )}
                        </div>
                    </div>
                </Card>
            </div>
            <div className={`col`}>
                <Card variant="outlined">
                    <div className={`${classes.cardContent}`}>
                        <span className={`${classes.loadTimeCardColor}`}></span>
                        <div>
                            <Typography className={`${classes.cardHeading}`}>
                                Load Time
                            </Typography>
                            {cardsDataAvailable === false ? (
                                <Typography variant="h6" className={`${classes.cardValue}`}>
                                    No Data
                                </Typography>
                            ) : (
                                <Typography variant="h6" className={`${classes.cardValue}`}>
                                    {cardsSummaryData.loadTime}ms
                                </Typography>
                            )}
                        </div>
                    </div>
                </Card>
            </div>
            <div className={`col`}>
                <Card variant="outlined">
                    <div className={`${classes.cardContent}`}>
                        <span className={`${classes.pageSizeCardColor}`}></span>
                        <div>
                            <Typography className={`${classes.cardHeading}`}>
                                Page Size
                            </Typography>
                            {cardsDataAvailable === false ? (
                                <Typography variant="h6" className={`${classes.cardValue}`}>
                                    No Data
                                </Typography>
                            ) : (
                                <Typography variant="h6" className={`${classes.cardValue}`}>
                                    {cardsSummaryData.pageSize}Mb
                                </Typography>
                            )}
                        </div>
                    </div>
                </Card>
            </div>
            <div className={`col`}>
                <Card variant="outlined" className={`${classes.lastCard}`}>
                    <div className={`${classes.cardContent}`}>
                        <span className={`${classes.noOfReqCardColor}`}></span>
                        <div>
                            <Typography className={`${classes.cardHeading}`}>
                                No Of Request
                            </Typography>
                            {cardsDataAvailable === false ? (
                                <Typography variant="h6" className={`${classes.cardValue}`}>
                                    No Data
                                </Typography>
                            ) : (
                                <Typography variant="h6" className={`${classes.cardValue}`}>
                                    {cardsSummaryData.noOfRequest}
                                </Typography>
                            )}
                        </div>
                    </div>
                </Card>
            </div>
        </div>
    );
};


const InfoTableSection = () => {
    
    const classes = cssClasses();

    return (
        <div className={`${classes.tableDiv}`}>
            <table className={`table table-bordered w-100 mb-0`}>
                <thead className={`${classes.tableHead}`}>
                    <tr>
                        <th colSpan="2" className={`${classes.tableHeadTh}`}>Metrics Description</th>
                    </tr>
                </thead>
                <tbody className={`${classes.tBody}`}>
                    <tr>
                        <td className={`${classes.tBodyTdName}`}>Fully Loaded Time</td>
                        <td className={`${classes.tBodyTdVal}`}>
                            Time taken for browser to render and complete download of resource has been complete.
                        </td>
                    </tr>
                    <tr>
                        <td className={`${classes.tBodyTdName}`}>Onload time</td>
                        <td className={`${classes.tBodyTdVal}`}>
                            Time taken for browser to render and complete execution on onload event of the HTML page.
                        </td>
                    </tr>
                    <tr>
                        <td className={`${classes.tBodyTdName}`}>Page size</td>
                        <td className={`${classes.tBodyTdVal}`}>
                            Total transfer size of page including HTML and resources.
                        </td>
                    </tr>
                    <tr>
                        <td className={`${classes.tBodyTdName}`}>Requests in page</td>
                        <td className={`${classes.tBodyTdVal}`}>
                            Total no. of requests downloaded for a page.
                        </td>
                    </tr>
                    <tr>
                        <td className={`${classes.tBodyTdName}`}>Initial Connection</td>
                        <td className={`${classes.tBodyTdVal}`}>
                            Time taken for SSL handshake, DNS resolution.
                        </td>
                    </tr>
                    <tr>
                        <td className={`${classes.tBodyTdName}`}>Time to First Byte</td>
                        <td className={`${classes.tBodyTdVal}`}>
                            Time taken for to receive the first byte of response from server.
                        </td>
                    </tr>
                    <tr>
                        <td className={`${classes.tBodyTdName}`}>DOM Loading to Loaded</td>
                        <td className={`${classes.tBodyTdVal}`}>
                            Time taken for browser to start parsing HTML document to the point when both the DOM and CSSOM is ready and there are no stylesheets that are blocking Javascript execution.
                        </td>
                    </tr>
                    <tr>
                        <td className={`${classes.tBodyTdName}`}>DOM Loading to Complete</td>
                        <td className={`${classes.tBodyTdVal}`}>
                            Time taken till page and all of it's subresources are ready.
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>
    );
};

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