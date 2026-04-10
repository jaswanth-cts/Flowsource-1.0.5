import React, { useState, useEffect, lazy, Suspense } from 'react';
import cssClasses from './InfraProvisionCss';
import Typography from '@material-ui/core/Typography';
import { 
  Paper, CardHeader, Divider, CardContent, Alert,
} from '@mui/material';

import { identityApiRef, fetchApiRef , configApiRef, useApi } from '@backstage/core-plugin-api';
import { Routes, Route , Link } from 'react-router-dom';

import ConfigurePage from './ConfigurePage';
import { cardSubRouterRef, configSubRouterRef } from '../../routes'; // Assuming routes are defined elsewhere
import { Grid , Card, Table, TableHead, TableBody, TableRow, TableCell, IconButton } from '@material-ui/core';

import {
  Page,
  Header,
  Content,
} from '@backstage/core-components';

import addIcon from './icons/add_icon.png';
import refreshButton from './icons/refresh_Table_Icon.png';

import { COMPONENT_HEADER, COMPONENT_PAGE_HEADER_PROVISION, COMPONENT_ROOT_PATH } from '../../constants';
import CardsPage from './CardsPage';
import ServerLink from './serverLink';
import PluginVersion from '../PluginVersion/PluginVersion';

const options = {}
const Spacer = () => <div className="mb-4" />; 

const InfraProvision = () => {

  const config = useApi(configApiRef);
  const identityApi = useApi(identityApiRef);
  const backendUrl = config.getString('backend.baseUrl');

  const [instances, setInstances] = useState([]);
  const [apiError, SetApiError] = useState('');
  const [authToken, setAuthToken] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  const { fetch } = useApi(fetchApiRef);

  const isEnvMappingEnabled = ( () => {
    return config.getOptionalBoolean('morpheus.environment.enableServiceNowEnvMapping') || false;
  }) ();

  useEffect(() => {
    async function initialize() {
      try {
        const authTok = await identityApi.getCredentials();
        setAuthToken(authTok.token);
      } catch (err) {
        SetApiError(err.message);
      }
    }
    initialize();
  }, []);


  useEffect(() => {
    async function initialize() {
      setIsLoading(true);
      let reponse = undefined;
      try {
        const resp = await fetch(backendUrl + '/api/flowsource-morpheus/my-orders');

        if (resp.ok) {
         const response = await resp.json();
         // Handle both possible response structures:
        const instancesData = response.items || response;
        setInstances(Array.isArray(instancesData) ? instancesData : []);
        }else if (resp.status === 503) {
          setError('This plugin has not been configured with the required values. Please ask your administrator to configure it.');
         } else {
          SetApiError(resp.statusText);
        }
      } catch (err) {
        SetApiError(err.message);
      }
      finally {
        setIsLoading(false); 
      }
    }
    initialize();
  }, [authToken])


  const classes = cssClasses();
  const status = {
    'running': 'Green',
    'provisioning': 'Amber',
    'suspending': 'Amber',
    'cloning': 'Amber',
    'removing': 'Amber',
    'resizing': 'Amber',
    'starting': 'Amber',
    'restarting': 'Amber',
    'restoring': 'Amber',
    'pending Delete Approval': 'Amber',
    'pending Reconfigure Approval': 'Amber',
    'Pending Removal': 'Amber',
    'Cancelled': 'Red',
    'Denied': 'Red',
    'failed': 'Red',
    'stopping': 'Amber',
    'stopped': 'Red',
    'Suspended': 'Red',
    'Unknown': 'Red',
    'Warning': 'Red',
    'unknown': 'Red',
  };

  const refreshIcon = async () => {
    try {
      setIsLoading(true);

      const resp = await fetch(backendUrl + '/api/flowsource-morpheus/my-orders');
      if (resp.ok) {
        const response = await resp.json();
        const instancesData = response.items || response;
        setInstances(Array.isArray(instancesData) ? instancesData : []);
      } else if (response.status === 503) {
        setError('This plugin has not been configured with the required values. Please ask your administrator to configure it.');
      }else {
        SetApiError(resp.statusText);
      }
    } catch (err) {
      SetApiError(err.message);
    }finally {
      setIsLoading(false);
    }
  };

  const currentURL = window.location.href;
  let infraURL = currentURL.split('/').pop();
  //When table page number change happens in ServiceNow, '#' gets appended to the infra provision URL. 
  // So we need to remove it. Otherwise, page will be rendered blank as url is wrong.
  if(infraURL === "flowsource-infra-provision#"){
    infraURL = infraURL.split('#')[0];
  }

  function renderInfraProvisionPage() {
    if(error) {
      return (
        <Page themeId="home">
          <Header title={COMPONENT_HEADER} />
          <Content>
            <Grid container>
              <Grid item md={12}>
                <div className="card ms-0 me-0 mb-0 mt-0">
                  <div className="card-header">
                    <h6 className="mb-0">Error</h6>
                  </div>
                  <div className="card-body">
                    <div className="alert alert-danger mt-2 mb-2" role="alert">
                      {error}
                    </div>
                  </div>
                </div>
              </Grid>
              {isEnvMappingEnabled && (
                <Grid item md={12}>
                  <Suspense fallback={<div>Loading...</div>}>
                    <ServiceNowProvisionOrder />
                  </Suspense>
                </Grid>
              )}
            </Grid>
          </Content>
        </Page>
      );
    } else {
      return (
        <Page themeId="home">
          <Header title={COMPONENT_HEADER} />
          <Content>
            <Grid container>
              <Grid item md={12}>
                <Grid
                  container
                  spacing={1}
                  alignItems="center"
                  className={`${classes.conGrid}`}
                >
                  <Grid item xs={8} md={8}>
                    <h2 className={`${classes.title}`}>
                      {COMPONENT_PAGE_HEADER_PROVISION}
                    </h2>
                  </Grid>


                  {/* Add Button */}
                  <Grid item  className={`${classes.buttonGrid}`}>
                    <Link to={`cards`}>
                      <IconButton
                        color="inherit"
                        className={`${classes.addButton}`}
                      >
                        <img className={`${classes.addButtonImg}`} src={addIcon} alt="button icon" />
                      </IconButton>
                    </Link>
                  </Grid>

                  {/* Server Link */}
                  <Grid item>
                    <ServerLink
                      onClick={async e => {
                        e.preventDefault();
                        try {
                          const resp = await fetch(
                            backendUrl + '/api/flowsource-morpheus/host-url',
                          );

                          const response = await resp.json();
                          const targetServerUrl = response.hostUrl;

                          window.open(targetServerUrl, '_blank');
                        } catch (err) {
                          alert(err.message);
                        }
                      }}
                    />
                  </Grid>

                  {/* Plugin Version */}
                  <Grid item>
                    <PluginVersion />
                  </Grid>

                </Grid>
              </Grid>
              <Grid item md={12}>
                <Grid container>
                  <Grid item xs={12} md={12}>
                    <div className={`card ${classes.table}`}>
                      <Table
                        className="infra provision"
                        aria-label=" infra provision Data"
                      >
                        <TableHead className={` ${classes.tableHeader} pt-2`}>
                          <TableRow>
                            <TableCell
                              key={0}
                              className={` ${classes.tableHeader} pt-2`}
                            >
                              {'Instance Name'}
                            </TableCell>
                            <TableCell
                              key={1}
                              className={` ${classes.tableHeader} pt-2`}
                            >
                              {'Catalog Name'}
                            </TableCell>
                            <TableCell
                              key={2}
                              className={` ${classes.tableHeader} pt-2`}
                            >
                              {'Created Date'}
                            </TableCell>
                            <TableCell
                              key={3}
                              align="center"
                              className={` ${classes.tableHeader} pt-2`}
                            >
                              {'Status'}
                            </TableCell>
                            <TableCell
                              align="center"
                              className={` ${classes.tableHeader} `}
                            >
                              <IconButton onClick={refreshIcon} color="inherit">
                                <img src={refreshButton} alt="button icon" />
                              </IconButton>
                            </TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {instances && instances.length > 0 ? (
                            instances.map(row => (
                              <TableRow key={row.id}>
                                <TableCell
                                  key={0}
                                  className={` ${classes.tableRow} pt-2`}
                                >
                                  {' '}
                                  {row.name}{' '}
                                </TableCell>
                                <TableCell
                                  key={1}
                                  className={` ${classes.tableRow} pt-2`}
                                >
                                  {' '}
                                  {row.type.name}{' '}
                                </TableCell>
                                <TableCell
                                  key={2}
                                  className={` ${classes.tableRow} pt-2`}
                                >
                                  {' '}
                                  {new Date(row.dateCreated).toLocaleDateString(
                                    'en-IN',
                                    {
                                      day: '2-digit',
                                      month: '2-digit',
                                      year: 'numeric',
                                    },
                                  )}{' '}
                                </TableCell>
                                <TableCell
                                  align="center"
                                  key={3}
                                  className={` ${classes.tableRow} pt-2`}
                                >
                                  <button
                                    className={`${
                                      classes[
                                        status[
                                          row.instance.status.toLowerCase()
                                        ]
                                      ] || classes.defaultClass
                                    }`}
                                    style={{
                                      width: '140px',
                                      height: '2.1rem',
                                      fontSize: '0.9rem',
                                      cursor: 'pointer',
                                      border: '#1F292C',
                                      borderRadius: '5px',
                                    }}
                                  >
                                    {row.instance.status
                                      .charAt(0)
                                      .toUpperCase() +
                                      row.instance.status.slice(1)}
                                  </button>
                                </TableCell>
                                <TableCell
                                  key={0}
                                  className={` ${classes.tableRow} pt-2`}
                                ></TableCell>
                              </TableRow>
                            ))
                          ) : (
                            <TableRow key={0}>
                              <TableCell colSpan={5} align="center">
                                {apiError
                                  ? 'Error occured when fetching the data.'
                                  : 'No data'}
                              </TableCell>
                            </TableRow>
                          )}
                        </TableBody>
                      </Table>
                    </div>
                  </Grid>
                </Grid>
                {isEnvMappingEnabled && (
                  <Grid item md={12}>
                    <Suspense fallback={<div>Loading...</div>}>
                      <ServiceNowProvisionOrder />
                    </Suspense>
                  </Grid>
                )}
              </Grid>
            </Grid>
          </Content>
        </Page>
      );
    }
  };

  return (
    <div>
      {isLoading ? (
        <div className={`App p-3 ${classes.isLoading}`} >
          Loading...
        </div>
      ) : (
        <>
          <Routes>
            <Route path={`${COMPONENT_ROOT_PATH}`} element={<InfraProvision />} />
            <Route path={`/${cardSubRouterRef.path}`} element={<CardsPage />} />
            <Route path={`/${configSubRouterRef.path}`} element={<ConfigurePage />} />
          </Routes>

          {infraURL === 'flowsource-infra-provision' ? (
            <>
              { renderInfraProvisionPage() }
            </>
          ) : null}
        </>
      )}
    </div>
  );
};
export default InfraProvision;

  // Function will load the Service Now Provision Orders component dynamically with error handling.
  // This is specifically for the ServiceNow Provision Order component.
  const ServiceNowProvisionOrder = lazy(() =>
    import(
      '@flowsource/plugin-flowsource-service-now/src/components/EnvironmentServiceNow/ServiceNowRequestComponents/SnProvisionOrderInfraProvisionPage.js'
    ).then(
      m => ({ default: m.default }),
      err => {
        log.error('Error loading ServiceNow Provision orders page: ', err);
        return { default: () => <div></div> };
      },
    )
  );

