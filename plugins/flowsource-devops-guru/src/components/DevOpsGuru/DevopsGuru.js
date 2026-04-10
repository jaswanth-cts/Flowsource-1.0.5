import { useState, useEffect, React } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import cssClasses from './DevopsGuruCss';
import { useApi, configApiRef, fetchApiRef } from '@backstage/core-plugin-api';
import { useEntity } from '@backstage/plugin-catalog-react';
import Moment from 'react-moment';
import {
    EntitySwitch,
} from '@backstage/plugin-catalog';
import { EmptyState } from '@backstage/core-components';
import { Typography, Card, Paper, CardHeader, Divider, CardContent, Alert,} from '@mui/material';
import PluginVersion from '../PluginVersion/PluginVersion';

import log from 'loglevel';

const Spacer = () => <div className="mb-4" />; // Spacer component

const DevopsGuru = () => {
    const classes = cssClasses();
    const { fetch } = useApi(fetchApiRef);
    const [isLoading, setLoading] = useState(true);
    const entity = useEntity();
    const [reactiveInsightsData, setReactiveInsightsData] = useState(null);
    const [proactiveInsightsData, setProactiveInsightsData] = useState(null);
    const applicationName = entity.entity.spec.system;
    log.info('Application name --- ' + applicationName);
    const config = useApi(configApiRef);
    const [reactiveInsightsDataRows, setReactiveInsightsDataRows] = useState(null);
    const [proactiveInsightsDataRows, setProactiveInsightsDataRows] = useState(null);
    const backendBaseApiUrl = config.getString('backend.baseUrl') + '/api/devops-guru/';
    const [error, setError] = useState(null);

    const fetchAllData = async () => {
        try {
            //api call to get reactive insights
            const reactiveInsightsResponse = await fetch(backendBaseApiUrl + 'reactiveinsights?applicationName=' + applicationName);
            if (reactiveInsightsResponse.ok) {
                const reactiveInsightsResult = await reactiveInsightsResponse.json();
                setReactiveInsightsData(reactiveInsightsResult.ReactiveInsights);
                if (reactiveInsightsResult.ReactiveInsights != null) {
                    setReactiveInsightsDataRows(Object.keys(reactiveInsightsResult.ReactiveInsights).length);
                }
                else if (reactiveInsightsResponse.status === 503) {
                    log.error('Service unavailable:', reactiveInsightsResponse.statusText);
                    setError('This plugin has not been configured with the required values. Please ask your administrator to configure it');
                }
                else {
                    setReactiveInsightsDataRows(0);
                }
            } else {
                log.error('Error fetching data:', reactiveInsightsResponse.statusText);
            }

            //api call to get proactive insights
            const proactiveInsightsResponse = await fetch(backendBaseApiUrl + 'proactiveinsights?applicationName=' + applicationName);
            if (proactiveInsightsResponse.ok) {
                const proactiveInsightsResult = await proactiveInsightsResponse.json();
                setProactiveInsightsData(proactiveInsightsResult.ProactiveInsights);
                if (proactiveInsightsResult.ProactiveInsights != null) {
                    setProactiveInsightsDataRows(Object.keys(proactiveInsightsResult.ProactiveInsights).length);
                } else {
                    setProactiveInsightsDataRows(0);
                }
            } else if (proactiveInsightsResponse.status === 503) {
                log.error('Service unavailable:', proactiveInsightsResponse.statusText);
                setError('This plugin has not been configured with the required values. Please ask your administrator to configure it.');
            } else {
                log.error('Error fetching data:', proactiveInsightsResponse.statusText);
            }


            setLoading(false);
        } catch (error) {
            log.error('Error:', error);
            setLoading(false);
        }
    }

    useEffect(() => {
        fetchAllData();
    }, []);


    const [activeTab, setActiveTab] = useState('reactive');
    if (isLoading) {
        return <div className={`App p-3`}>Loading...</div>;
    }

    return (
        <div>
               {error ? ( 
        <div>
          <Card>
            <CardHeader title={<Typography variant="h6">Error</Typography>} />
            <Divider />
            <CardContent>
              <Paper role="alert" elevation={0}>
                <Alert severity="error">{error}</Alert>
              </Paper>
            </CardContent>
          </Card>
          <Spacer />
        </div>
                 ) : (
                    <>
            {(applicationName !== undefined && applicationName !== null) ? (
                <div className={`${classes.mainWidth} ${classes.mainBackground} card ms-2 mt-2`}>
                     <div className={`${classes.pluginHeading}`}>
                    <div>
                    <div className={`row justify-content-start mt-4 ms-1`}>
                        <div className={`col-sm-5`}>
                                        <div
                                            className={`${classes.tab} ${activeTab === 'reactive' ? classes.activeTab : classes.disableTab} ${classes.active}`}
                                            onClick={() => setActiveTab('reactive')}
                                        >
                                            Reactive
                                        </div>
                        </div>
                        <div className={`col-auto`}>
                            <div className={`${classes.verticalLine}`}></div>
                        </div>
                        <div className={`col-sm-1`}>
                                        <div
                                            className={`${classes.tab} ${activeTab === 'proactive' ? classes.active : classes.disableTab}`}
                                            onClick={() => setActiveTab('proactive')}
                                        >
                                            Proactive
                                        </div>
                        </div>
                        </div>
                        </div>
                        <div className={`${classes.pluginVersion}`}>
                            <PluginVersion />
                        </div>
                    </div>

                    {activeTab === 'reactive' && (
                        <div className={`card-body`}>
                            <div className={`card ${classes.cardBorder}`}>
                                <div className={`card-title`}>
                                    <p className={`${classes.heading1} mt-2 ms-2`} >Reactive Insights <span className={`${classes.nStyle}`}>({reactiveInsightsDataRows}) </span><span className={`${classes.ttStyle}`}>Info</span></p>
                                </div>
                                <div className={`card-body ${classes.cardBody}`}>
                                    <div className={`${classes.tableStyle}`}>
                                        <table className={`table table-bordered ${classes.tableStriped1} }`}>
                                            <thead>
                                                <tr className={`${classes.trStyle}`}>
                                                    <th>Name</th>
                                                    <th>Status</th>
                                                    <th>Severity</th>
                                                    <th>Created Time</th>
                                                    <th>Affected Applications</th>
                                                    <th>Affected Services</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {reactiveInsightsData.map((value) => (
                                                    <tr key={value.Id}>
                                                        <td className={`tdNameStyle`}>
                                                            <a href={'https://ap-southeast-1.console.aws.amazon.com/devops-guru/insight/reactive/' + value.Id} target="_blank" className={`${classes.linkStyle}`}>
                                                                {value.Name}
                                                            </a>
                                                        </td>
                                                        {/* <td><img src={tick} className={`${classes.imageStyle}`}/>{value.status}</td> */}
                                                        <td>{value.Status}</td>
                                                        <td><span className={`${classes.sStyle}`}>
                                                            {value.Severity}</span></td>
                                                        <td><Moment unix>{value.InsightTimeRange.StartTime}</Moment></td>
                                                        <td>{value.ResourceCollection.CloudFormation.StackNames.length}</td>
                                                        <td>{value.ServiceCollection.ServiceNames.length}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </div>

                        </div>
                    )}
                    {activeTab === 'proactive' && (
                        <div className={`card-body`}>
                            <div className={`card ${classes.cardBorder}`}>
                                <div className={`card-title`}>
                                    <p className={`${classes.heading1} mt-2 ms-2`} >Proactive Insights <span className={`${classes.nStyle}`}>({proactiveInsightsDataRows}) </span><span className={`${classes.ttStyle}`}>  Info</span></p>
                                    <div className={`card-body ${classes.cardBody}`}>
                                        <div className={`${classes.tableStyle}`}>
                                            <table className={`table table-bordered ${classes.tableStriped1} }`}>
                                                <thead>
                                                    <tr className={`${classes.trStyle}`}>
                                                        <th>Name</th>
                                                        <th>Status</th>
                                                        <th>Severity</th>
                                                        <th>Created Time</th>
                                                        <th>Affected Applications</th>
                                                        <th>Affected Services</th>
                                                        <th>Predicted Impact Time</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {proactiveInsightsData?.map((value) => (
                                                        <tr key={value.name}>
                                                            <td className={`tdNameStyle`}>
                                                                <a href="link" target="_blank" className={`${classes.linkStyle}`}>
                                                                    {value.name}
                                                                </a>
                                                            </td>
                                                            {/* <td><img src={tick} className={`${classes.imageStyle}`}/>{value.status}</td> */}
                                                            <td>{value.status}</td>
                                                            <td><span className={`${classes.sStyle}`}>
                                                                {value.severity}</span></td>
                                                            <td>{value.created_time}</td>
                                                            <td>{value.affected_applications}</td>
                                                            <td>{value.affected_services}</td>
                                                            <td>{value.predicted_impact_time}</td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                </div >
            ) : (
                <div className='mt-3 ms-4 me-4 mb-4'>
                    <EntitySwitch>
                        <EntitySwitch.Case>
                            <EmptyState
                                title="No Ops Insights page is available for this entity"
                                missing="info"
                                description="You need to add an annotation to your component if you want to see Ops Insights page for it."
                            />
                        </EntitySwitch.Case>
                    </EntitySwitch>
                </div>
            )}
            </>
        )}
        </div>
    );
};
export default DevopsGuru;