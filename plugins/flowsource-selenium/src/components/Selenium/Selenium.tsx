import { configApiRef, fetchApiRef, useApi } from '@backstage/core-plugin-api';
import { useEntity } from '@backstage/plugin-catalog-react';
import { EntitySwitch, } from '@backstage/plugin-catalog';
import { EmptyState } from '@backstage/core-components';
import { ArcElement, Chart as ChartJS, Tooltip } from 'chart.js';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import React, { useEffect, useState } from 'react';
import { Doughnut } from 'react-chartjs-2';
import PluginVersion from '../PluginVersion/PluginVersion';
import cssClasses from './css/SeleniumCss';

import log from 'loglevel';


ChartJS.register(ArcElement, ChartDataLabels, Tooltip);

interface BucketResponse {
  suiteTitles: string[];
  stats: {
    start: string;
    duration: number;
    passes: number;
    pending: number;
    failures: number;
  };
  suitesLength: number;
}
const missingAnnotationWarning = () => {
  return (
    <div className='mt-3 ms-3 me-3 mb-4'>
      <EntitySwitch>
        <EntitySwitch.Case>
          <EmptyState
            title="No Playwright page is available for this entity"
            missing="info"
            description="You need to add an annotation to your component if you want to see Playwright page for it."
          />
        </EntitySwitch.Case>
      </EntitySwitch>
    </div>
  );
};
const Selenium = (): JSX.Element => {
  const classes = cssClasses();
  const { fetch } = useApi(fetchApiRef);
  const [bucketData, setBucketData] = useState<BucketResponse>({
    suiteTitles: [],
    stats: {
      start: '',
      duration: 0,
      passes: 0,
      pending: 0,
      failures: 0,
    },
    suitesLength: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const config = useApi(configApiRef);
  const backendBaseApiUrl =
    config.getString('backend.baseUrl') + '/api/flowsource-selenium/';
  const entity = useEntity();
  const annotations = entity.entity.metadata.annotations;
  const fileName = annotations?.['flowsource/selenium-report-filename'] ?? '';
  const path = annotations && annotations['flowsource/selenium-report-path'] || '';
  const cloudProviderEndpoints: Record<string, string> = {
    GCS: 'fetchGCSFileData',
    AWS: 'fetchS3FileData',
    AZURE: 'fetchAzureData',
  };

  const seleniumCloudProvider = 
  annotations && annotations['flowsource/selenium-cloud-provider']?.toUpperCase() || '';

  const shouldRenderSeleniumPage = !!annotations && fileName && path;
  
  async function fetchBucketData() {
    setLoading(true);
    try 
    {
      const endpoint = cloudProviderEndpoints[seleniumCloudProvider] || '';

      if (!fileName || !path || !endpoint) {
        let info_message = '';
        if (!fileName) {
          info_message =
            'Invalid or missing fileName in annotations. Please check the fileName and try again.';
        } else if (!path) {
          info_message =
            'Invalid or missing path in annotations. Please check the path and try again. ';
        } else if (!endpoint) {
          info_message =
            'Invalid or missing cloud provider in annotations. Please check the cloud provider and try again.';
        }
        setError(info_message);
      }

      const url = backendBaseApiUrl.endsWith('/')
        ? `${backendBaseApiUrl}${endpoint}`
        : `${backendBaseApiUrl}/${endpoint}`;
      
        const bucketDataRes = await fetch(
        `${url}?fileName=${encodeURIComponent(
          fileName,
        )}&path=${encodeURIComponent(path)}`,
      );
      
      if (bucketDataRes.ok) {
        const data = await bucketDataRes.json();
        setBucketData(data);
        setError(null);
      } else if (bucketDataRes.status === 503) {
        log.error('Error fetching bucket data:', bucketDataRes.statusText);
        setError(
          'This plugin has not been configured with the required values. Please ask your administrator to configure it',
        );
      } else if (bucketDataRes.status === 404) {
        const errorData = await bucketDataRes.json();
        if ( errorData.error.includes('File not found, incorrect fileName or path')) 
        {
          setError(
            'Invalid or missing fileName or path in annotations. Please check the fileName or path and try again.',
          );
        } else {
          setError(`Error fetching bucket data: ${errorData.error}`);
        }
      } else {
        log.error('Error fetching bucket data:', bucketDataRes.statusText);
        setError(`Error fetching bucket data: ${bucketDataRes.statusText}`);
      }
    } catch (error) {
      if (error instanceof TypeError) {
        log.error('Network error or fetch failed:', error.message);
        setError('Network error occurred while fetching bucket data');
      } else if (error instanceof SyntaxError) {
        log.error('Parsing error:', error.message);
        setError('Error parsing the fetched bucket data');
      } else {
        log.error('Unexpected error:', error);
        setError('An unexpected error occurred while fetching bucket data');
        throw error; // Rethrow the error for higher-level handling
      }
    } finally {
      setLoading(false);
    }
  }

  const formatStartTime = (startTime: string) => {
    return new Date(startTime)
      .toLocaleString('en-GB', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: 'numeric',
        minute: 'numeric',
        hour12: true,
      })
      .replace(/(\d+) (\w+) (\d+)/, '$1th $2 $3');
  };

  useEffect(() => {
    fetchBucketData();
  }, []);

  if (loading) {
    return (
      <div
        className="App p-3"
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'flex-start',
          height: '30vh',
          marginTop: '5vh',
        }}
      >
        Loading...
      </div>
    );
  }

  return (
    <div className="container">
      {shouldRenderSeleniumPage ? (
        <>
          {error ? (
            <>
              <SeleniumHeadingComponent />
              <SeleniumErrorComponent error={error} />
            </>
          ) : (
            <div>
              <SeleniumHeadingComponent />
              <div
                style={{
                  marginLeft: '50px',
                  marginTop: '15px',
                  textAlign: 'left',
                }}
              >
                <p>
                  Last Start Time:{' '}
                  {bucketData.stats?.start
                    ? formatStartTime(bucketData.stats.start)
                    : 'N/A'}
                  <br></br>
                  Duration:{' '}
                  {Math.floor(Number(bucketData.stats.duration) / 3600)}hr{' '}
                  {Math.floor((Number(bucketData.stats.duration) % 3600) / 60)}
                  min {Math.floor(
                    Number(bucketData.stats.duration) % 60,
                  )}sec <br></br>
                  Number of suites: {bucketData.suitesLength}
                </p>
              </div>
              <div
                style={{
                  height: '180px',
                  width: '180px',
                  position: 'relative',
                  marginLeft: '45%',
                  marginTop: '-10%',
                }}
              >
                <Doughnut
                  data={{
                    labels: [],
                    datasets: [
                      {
                        data: [
                          bucketData.stats.passes,
                          bucketData.stats.failures,
                          bucketData.stats.pending,
                        ].map(value =>
                          Math.round(
                            (value /
                              (bucketData.stats.passes +
                                bucketData.stats.failures +
                                bucketData.stats.pending)) *
                              100,
                          ),
                        ),
                        backgroundColor: ['#22c45d', '#ef4444', '#facd13'],
                        hoverBackgroundColor: ['#22c45d', '#ef4444', '#facd13'],
                      },
                    ],
                  }}
                  options={{
                    plugins: {
                      tooltip: {
                        callbacks: {
                          label: function (context: any) {
                            return `${context.label}: ${context.raw}%`;
                          },
                        },
                      },
                      datalabels: {
                        display: true,
                        formatter: (value: number) => `${value}%`,
                        color: '#fff',
                      },
                    } as any,
                  }}
                />
                <div
                  style={{
                    position: 'absolute',
                    top: '51%',
                    left: '53%',
                    transform: 'translate(-50%, -50%)',
                    fontSize: '20px',
                    fontWeight: 'bold',
                  }}
                >
                  <span style={{ color: '#22c45d' }}>
                    {Math.round(
                      (Number(bucketData.stats.passes) /
                        (Number(bucketData.stats.passes) +
                          Number(bucketData.stats.failures) +
                          Number(bucketData.stats.pending))) *
                        100,
                    )}
                    %
                  </span>
                </div>

                <div style={{ marginLeft: '190px', marginTop: '-80%' }}>
                  <ul
                    style={{
                      listStyle: 'none',
                      padding: 0,
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'flex-start',
                    }}
                  >
                    {[
                      { color: '#22c45d', label: 'Passes' },
                      { color: '#ef4444', label: 'Failures' },
                      { color: '#facd13', label: 'Pending' },
                    ].map((item, index) => (
                      <li key={index} className={classes.legend}>
                        <span
                          className={classes.legendSpan}
                          style={{ backgroundColor: item.color }}
                        ></span>
                        {item.label}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
              <div className={`${classes.tableStyle}`}>
                <table className={`table  ${classes.tableStriped} `}>
                  <thead>
                    <tr className={`${classes.trStyle}`}>
                      <th className={`${classes.thStyle}`}>#</th>
                      <th className={`${classes.thStyles}`}>Suite Title</th>
                      <th className={`${classes.thStyle}`}>Passes</th>
                      <th className={`${classes.thStyle}`}>Failures</th>
                      <th className={`${classes.thStyle}`}>Pending</th>
                    </tr>
                  </thead>
                  <tbody className={'alignItems:center'}>
                    {bucketData.suiteTitles.map((suiteTitle, index) => (
                      <tr key={index} className={`tdNameStyleCenter`}>
                        <td>{index + 1}</td>
                        <td className={`tdNameStyleLeft`}>{suiteTitle}</td>
                        <td>{bucketData.stats.passes}</td>
                        <td>{bucketData.stats.failures}</td>
                        <td>{bucketData.stats.pending}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      ) : (
        <> {missingAnnotationWarning()} </>
      )}
    </div>
  );
};

const SeleniumHeadingComponent = (): JSX.Element => {
  
  const classes = cssClasses();
  
  return (
      <div className={`row`}>
        <div className={`${classes.pluginHeading}`}>
          <div>
            <h5>
              <p>
                <b>Selenium</b>
              </p>
            </h5>
          </div>
          <div>
            <PluginVersion />
          </div>
        </div>
      </div>
  );
};

const SeleniumErrorComponent = ({ error }: { error: string }): JSX.Element => {
  return (
    <div className="card ms-0 me-1 mb-1 mt-2">
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
export default Selenium;
