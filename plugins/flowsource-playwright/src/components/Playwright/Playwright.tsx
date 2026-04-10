import { configApiRef, fetchApiRef, useApi } from '@backstage/core-plugin-api';
import { useEntity } from '@backstage/plugin-catalog-react';
import { EntitySwitch, } from '@backstage/plugin-catalog';
import { EmptyState } from '@backstage/core-components';
import { ArcElement, Chart as ChartJS, Tooltip } from 'chart.js';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import React, { useEffect, useState } from 'react';
import { Doughnut } from 'react-chartjs-2';
import PluginVersion from '../PluginVersion/PluginVersion';
import cssClasses from './css/PlaywrightCss';
ChartJS.register(ArcElement, ChartDataLabels, Tooltip);

import log from 'loglevel';


interface BucketResponse {
  suiteTitles: string[];
  stats: {
    startTime: string;
    duration: number;
    expected: number;
    skipped: number;
    unexpected: number;
    flaky: number;
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
const Playwright = (): JSX.Element => {
  const classes = cssClasses();
  const { fetch } = useApi(fetchApiRef);
  const [bucketData, setBucketData] = useState<BucketResponse>({
    suiteTitles: [],
    stats: {
      startTime: '',
      duration: 0,
      expected: 0,
      skipped: 0,
      unexpected: 0,
      flaky: 0,
    },
    suitesLength: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const config = useApi(configApiRef);
  const backendBaseApiUrl =
    config.getString('backend.baseUrl') + '/api/flowsource-playwright/';
  const entity = useEntity();
  const annotations = entity.entity.metadata.annotations;
  const fileName = annotations && annotations['flowsource/playwright-report-filename'] || '';
  const path = annotations && annotations['flowsource/playwright-report-path'] || '';
  const cloudProviderEndpoints: Record<string, string> = {
    GCS: 'fetchGCSFileData',
    AWS: 'fetchS3FileData',
    AZURE: 'fetchAzureData',
  };

  const playwrightCloudProvider =
  annotations && annotations['flowsource/playwright-cloud-provider']?.toUpperCase();
  const endpoint =
  playwrightCloudProvider ? cloudProviderEndpoints[playwrightCloudProvider] ?? null : null;
   const shouldRenderPlaywrightPage = !!annotations && fileName && path;

    async function fetchBucketData() {
      setLoading(true);
      try {
        if(!fileName || !path || !endpoint){
          let info_message = '';
          if (!fileName ) {
            info_message = 'Invalid or missing file name in annotations. Please check the file name and try again.';
          }else if(!path){
            info_message = 'Invalid or missing path in annotations. Please check the path and try again. ';
          }else if(!endpoint){
            info_message = 'Invalid or missing cloud provider in the annotations. Please check the cloud provider and try again.';
          }
          setError(info_message,);
        }else{
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
        }else if (bucketDataRes.status === 404 ) {
          const errorData = await bucketDataRes.json();
          if(errorData.error.includes('File not found, incorrect fileName or path')){
            setError(
              'Invalid or missing file name or path in the annotations. Please check the file name or path and try again.',
            );
          }else{
            setError(`Error fetching bucket data: ${errorData.error}`);
          }
        }
        else {
          log.error('Error fetching bucket data:', bucketDataRes.statusText);
          setError(`Error fetching bucket data: ${bucketDataRes.statusText}`);
        }
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
      {shouldRenderPlaywrightPage ? (
        <>
          {error ? (
            <>
              <PlayWrightHeadingComponent />
              <PlaywrightErrorComponent error={error} />
            </>
          ) : (
            <div>
              <PlayWrightHeadingComponent />
              <div
                style={{
                  marginLeft: '50px',
                  marginTop: '15px',
                  textAlign: 'left',
                }}
              >
                <p>
                  Last Start Time:{' '}
                  {bucketData.stats?.startTime
                    ? formatStartTime(bucketData.stats.startTime)
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
                          bucketData.stats.expected,
                          bucketData.stats.unexpected,
                          bucketData.stats.skipped,
                          bucketData.stats.flaky,
                        ].map(value =>
                          Math.round(
                            (value /
                              (Object.values(bucketData.stats)
                                .slice(2)
                                .filter(value => typeof value === 'number')
                                .map(value => value as number)
                                .reduce((a: number, b: number) => a + b, 0) ||
                                1)) *
                              100,
                          ),
                        ),
                        backgroundColor: [
                          '#22c45d',
                          '#ef4444',
                          '#94a4b7',
                          '#facd13',
                        ],
                        hoverBackgroundColor: [
                          '#22c45d',
                          '#ef4444',
                          '#94a4b7',
                          '#facd13',
                        ],
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
                      (bucketData.stats.expected /
                        Object.values(bucketData.stats)
                          .slice(2)
                          .filter(value => typeof value === 'number')
                          .map(value => value as number)
                          .reduce((a, b) => a + b, 0)) *
                        100,
                    )}
                    %
                  </span>
                </div>

                <div style={{ marginLeft: '190px', marginTop: '-80%' }}>
                  <ul
                    style={{
                      listStyleType: 'none',
                      padding: 0,
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'flex-start',
                    }}
                  >
                    {[
                      { color: '#22c45d', label: 'Expected' },
                      { color: '#ef4444', label: 'Unexpected' },
                      { color: '#94a4b7', label: 'Skipped' },
                      { color: '#facd13', label: 'Flaky' },
                    ].map(({ color, label }) => (
                      <li key={label} className={`${classes.legend}`}>
                        <span
                          className={`${classes.legendSpan}`}
                          style={{ backgroundColor: color }}
                        ></span>
                        {label}
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
                      <th className={`${classes.thStyle}`}>Expected</th>
                      <th className={`${classes.thStyle}`}>Unexpected</th>
                      <th className={`${classes.thStyle}`}>Skipped</th>
                      <th className={`${classes.thStyle}`}>Flaky</th>
                    </tr>
                  </thead>
                  <tbody className={'alignItems:center'}>
                    {bucketData.suiteTitles.map((suiteTitle, index) => (
                      <tr key={index} className={`tdNameStyleCenter`}>
                        <td>{index + 1}</td>
                        <td className={`tdNameStyleLeft`}>{suiteTitle}</td>
                        <td>{bucketData.stats.expected}</td>
                        <td>{bucketData.stats.unexpected}</td>
                        <td>{bucketData.stats.skipped}</td>
                        <td>{bucketData.stats.flaky}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      ) : (
        missingAnnotationWarning()
      )}
    </div>
  );
};

const PlayWrightHeadingComponent = (): JSX.Element => {

  const classes = cssClasses();

  return (
    <div className={`row`}>
      <div className={`${classes.pluginHeading}`}>
        <div>
          <h5>
            <p>
              <b>Playwright</b>
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

const PlaywrightErrorComponent = ({ error }: { error: string }): JSX.Element => {

  return (
    <div className="card me-1 mb-1 mt-2">
      <div className="card-header">
        <h6 className="mb-0">Error</h6>
      </div>
      <div className="card-body">
        <div
          className="alert alert-danger mt-2 mb-2"
          role="alert"
          style={{ whiteSpace: 'pre-wrap' }}
        >
          {error}
        </div>
      </div>
    </div>
  );
};

export default Playwright;
