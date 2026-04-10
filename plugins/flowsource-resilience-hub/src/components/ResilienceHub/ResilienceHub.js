import { useState, useEffect, React } from 'react';
import { useApi, configApiRef, fetchApiRef } from '@backstage/core-plugin-api';
import { useEntity } from '@backstage/plugin-catalog-react';
import cssClasses from './ResilienceHubCss.js';
import { Typography, Card, Paper, CardHeader, Divider, CardContent, Alert, } from '@mui/material';
import {
    EntitySwitch,
} from '@backstage/plugin-catalog';
import { EmptyState } from '@backstage/core-components';
import PluginVersion from '../PluginVersion/PluginVersion';

import log from 'loglevel';


const Spacer = () => <div className="mb-4" />;
const ResilienceHub = () => {
    const classes = cssClasses();
    const { fetch } = useApi(fetchApiRef);
    const [isLoading, setLoading] = useState(true);
    const [data, setData] = useState(null);
    const [resiliencyScore, setResiliencyScore] = useState(null);
    const [resiliencyScoreData, setResiliencyScoreData] = useState([]);
    const [alarmRecommendationData, setAlarmRecommendationData] = useState([]);
    const [sopRecommendationData, setSopRecommendationData] = useState([]);
    const [testRecommendationData, setTestRecommendationData] = useState(null);
    const [resiliencyRecommendationData, setResiliencyRecommendationData] = useState(null);
    const [componentComplianceData, setComponentComplianceData] = useState(null);
    const [versionAndAssessmentName, setVersionAndAssessmentName] = useState(null);
    const config = useApi(configApiRef);
    const backendBaseApiUrl = config.getString('backend.baseUrl') + '/api/flowsource-resilience-hub/';
    const entity = useEntity();

    const [policyError, setPolicyError] = useState(null);
    const [resiliencyScoreError, setResiliencyScoreError] = useState(null);
    const [alarmError, setAlarmError] = useState(null);
    const [sopError, setSopScoreError] = useState(null);
    const [testRecommError, settestRecommError] = useState(null);
    const [resiliencyError, setResiliencyError] = useState(null);
    const [complainceError, setComplainceError] = useState(null);
    const [assessmentNameError, setAssessmentNameError] = useState(null);
    const [Error, setError] = useState(null);

    const applicationName = entity.entity.metadata.annotations?.["flowsource/aws-resiliencehub-appname"];
    const awsRegion = entity.entity.metadata.annotations?.["flowsource/aws-resiliencehub-region"];
    const handleError = (response, setError, setSpecificError, specificErrorMessage) => {
        if (response.status === 503) {
            setError('This plugin has not been configured with the required values. Please ask your administrator to configure it');
        }else if (response.status === 404) {
            setError('No data found for the given application name and region');
        } else {
            setSpecificError(`${specificErrorMessage}, with status code ${response.status}`);
        }
    };


    const fetchAllData = async () => {
        try {
            const endpoints = [
                { url: 'policy-details', setData: setData, setError: setPolicyError, errorMsg: 'Error fetching policy details' },
                { url: 'app-resiliency-score-details', setData: (result) => { setResiliencyScoreData(result.componentScore); setResiliencyScore(result.score); }, setError: setResiliencyScoreError },
                { url: 'alarm-recommendations', setData: (result) => setAlarmRecommendationData(result.alarmRecommendations), setError: setAlarmError},
                { url: 'sop-recommendations', setData: (result) => setSopRecommendationData(result.sopRecommendations), setError: setSopScoreError},
                { url: 'test-recommendations', setData: (result) => setTestRecommendationData(result.testRecommendations), setError: settestRecommError},
                { url: 'resiliency-recommendations', setData: setResiliencyRecommendationData, setError: setResiliencyError},
                { url: 'resiliency-component-compliances', setData: setComponentComplianceData, setError: setComplainceError},
                { url: 'version-assessmentname', setData: setVersionAndAssessmentName, setError: setAssessmentNameError}
            ];

            const fetchPromises = endpoints.map(endpoint =>
                fetch(`${backendBaseApiUrl}${endpoint.url}?applicationName=${applicationName}&awsRegion=${awsRegion}`)
                    .then(response => {
                        if (!response.ok) throw response;
                        return response.json();
                    })
                    .then(result => endpoint.setData(result))
                    .catch(error => {
                        log.error(`Error fetching ${endpoint.url}:`, error);
                        handleError(error, setError, endpoint.setError, error.statusText);
                    })
            );

            await Promise.all(fetchPromises);
            setLoading(false);
        } catch (error) {
            log.error('Error:', error);
        }
    };

    useEffect(() => {
        fetchAllData();
    }, []);
    const secondsToHours = (seconds) => {
        const hours = Math.round(seconds / 3600);
        return `${hours}h`;
    }

    const findCurrentComplianceStatus = (componentName) => {
        return componentComplianceData.find((entry) => entry.appComponentName === componentName).status;
    }


    if (isLoading) {
        return <div className={`App p-3`}>Loading...</div>;
    }
    return (
        <div>
            {(applicationName !== undefined && applicationName !== null && awsRegion !== undefined && awsRegion !== null) ? (
                <div>
                    {(policyError || resiliencyScoreError || alarmError || sopError || testRecommError
                        || resiliencyError || complainceError || assessmentNameError || Error) && (
                            <div>
                                <Card>
                                    <CardHeader title={<Typography variant="h6">Error</Typography>} />
                                    <Divider />
                                    <CardContent>
                                        <Paper role="alert" elevation={0}>
                                            {policyError && <Alert severity="error">{policyError}</Alert>}
                                            {resiliencyScoreError && <Alert severity="error">{resiliencyScoreError}</Alert>}
                                            {alarmError && <Alert severity="error">{alarmError}</Alert>}
                                            {sopError && <Alert severity="error">{sopError}</Alert>}
                                            {testRecommError && <Alert severity="error">{testRecommError}</Alert>}
                                            {resiliencyError && <Alert severity="error">{resiliencyError}</Alert>}
                                            {complainceError && <Alert severity="error">{complainceError}</Alert>}
                                            {assessmentNameError && <Alert severity="error">{assessmentNameError}</Alert>}
                                            {Error && <Alert severity="error">{Error}</Alert>}
                                        </Paper>
                                    </CardContent>
                                </Card>
                                <Spacer />
                            </div>)}
                    {(!policyError && !resiliencyScoreError && !alarmError && !sopError && !testRecommError &&
                        !resiliencyError && !complainceError && !assessmentNameError && !Error) && (
                            <div className={`w-100`}>
                                <div className={`row`}>
                                    <div className={`${classes.pluginHeading}`}>
                                        <div>
                                            <h6>
                                                <span className={`me-1`}>Application Name:</span>
                                                <span className={`me-2`}><b>{applicationName}</b></span>
                                                <span className={`me-1`}>Version:</span>
                                                <span><b>{versionAndAssessmentName.appVersion}</b></span>
                                            </h6>
                                        </div>
                                        <div>
                                            <PluginVersion />
                                        </div>
                                    </div>
                                    <div className={`col-sm-4`}>
                                        <div className={`row`}>
                                            <div className={`card`}>
                                                <div className={`card-body`}>
                                                    <h6 className={`card-title mt-3 mb-4`}>
                                                        <span className={`${classes.pnTitle} me-2`}>Policy name
                                                        </span>
                                                        <span className={`${classes.pnTarget}`}><b>{data?.policyName}</b></span>
                                                    </h6>
                                                    {/* Content for the first card */}
                                                    <div className={`table-responsive`}>
                                                        <table className={`table ${classes.tableStriped1} table-bordered`}>
                                                            <thead>
                                                                <tr>
                                                                    <th>Type</th>
                                                                    <th className={`text-center`}>RTO</th>
                                                                    <th className={`text-center`}>RPO</th>
                                                                </tr>
                                                            </thead>
                                                            <tbody>
                                                                {data &&
                                                                    Object.entries(data.policy).map(([category, values]) => (
                                                                        <tr key={category}>
                                                                            <td>{category}</td>
                                                                            <td className={`text-center`}>{secondsToHours(values.rpoInSecs)}</td>
                                                                            <td className={`text-center`}>{secondsToHours(values.rtoInSecs)}</td>
                                                                        </tr>
                                                                    ))}
                                                            </tbody>
                                                        </table>
                                                    </div>

                                                </div>
                                            </div>

                                        </div>
                                        <div className={`row mt-4`}>
                                            <div className={`card`}>
                                                <div className={`card-body`}>
                                                    <h6 className={`mt-3 mb-4`}>
                                                        <span className={`${classes.rsTitle} me-2`}>Resiliency Score</span>
                                                        <span className={`${classes.pnSubText}`}>
                                                            <b>
                                                                <span className={`${classes.rsTopText}`}>{(resiliencyScore * 100)}</span>
                                                                /100
                                                            </b>
                                                        </span>
                                                    </h6>

                                                    {/* Content for the second card */}
                                                    <div className={`table-responsive`}>
                                                        <table className={`table table-bordered ${classes.tableStriped1}`}>
                                                            <tbody>
                                                                <tr>
                                                                    <td>RTO/RPO Compliance</td>
                                                                    <td className={`text-center`}>{(resiliencyScoreData.Compliance.score * 100)}/{(resiliencyScoreData.Compliance.possibleScore * 100)}</td>
                                                                </tr>
                                                                <tr>
                                                                    <td>Alarms implemented</td>
                                                                    <td className={`text-center`}>{(resiliencyScoreData.Alarm.score * 100)}/{(resiliencyScoreData.Alarm.possibleScore * 100)}</td>
                                                                </tr>
                                                                <tr>
                                                                    <td>SOPS implemented</td>
                                                                    <td className={`text-center`}>{(resiliencyScoreData.Sop.score * 100)}/{(resiliencyScoreData.Sop.possibleScore * 100)}</td>
                                                                </tr>
                                                                <tr>
                                                                    <td>FIS Experiments implemented</td>
                                                                    <td className={`text-center`}>{(resiliencyScoreData.Test.score * 100)}/{(resiliencyScoreData.Test.possibleScore * 100)}</td>
                                                                </tr>
                                                            </tbody>
                                                        </table>
                                                    </div>

                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    {/* Second Column */}
                                    <div className={`col-sm-8`}>
                                        <div className={`card`}>
                                            <div className={`card-body`}>
                                                <p className={`card-title mb-1`}>
                                                    <span>Recommendations </span>
                                                    <span >
                                                        <b>{versionAndAssessmentName.latestAssessmentName}</b>
                                                    </span>
                                                </p>
                                                <p className={`${classes.orTitle} mb-2`}><b>Operational Recommendations</b></p>
                                                <div className={`table-responsive`}>
                                                    <table className={`table table-bordered ${classes.tableStriped1}`}>
                                                        <thead>
                                                            <tr>
                                                                <th>Type</th>
                                                                <th>Name</th>
                                                                <th>State</th>
                                                                <th>Description</th>
                                                                <th>AppComponents</th>
                                                            </tr>
                                                        </thead>
                                                        <tbody>

                                                            {alarmRecommendationData.map(
                                                                entry => <tr key={entry.id}>
                                                                    <td>
                                                                        Alarm
                                                                    </td>
                                                                    <td>
                                                                        {entry.name}
                                                                    </td>
                                                                    <td>
                                                                        {entry.recommendationStatus}
                                                                    </td>
                                                                    <td>
                                                                        {entry.description}
                                                                    </td>
                                                                    <td>
                                                                        {entry.appComponentName}
                                                                    </td>
                                                                </tr>
                                                            )}
                                                            {sopRecommendationData.map(
                                                                entry => <tr key={entry.id}>
                                                                    <td>
                                                                        SOP
                                                                    </td>
                                                                    <td>
                                                                        {entry.name}
                                                                    </td>
                                                                    <td>
                                                                        {entry.recommendationStatus}
                                                                    </td>
                                                                    <td>
                                                                        {entry.description}
                                                                    </td>
                                                                    <td>
                                                                        {entry.appComponentName}
                                                                    </td>
                                                                </tr>
                                                            )}
                                                            {testRecommendationData.map(
                                                                entry => <tr key={entry.id}>
                                                                    <td>
                                                                        FIS
                                                                    </td>
                                                                    <td>
                                                                        {entry.name}
                                                                    </td>
                                                                    <td>
                                                                        {entry.recommendationStatus}
                                                                    </td>
                                                                    <td>
                                                                        {entry.description}
                                                                    </td>
                                                                    <td>
                                                                        {entry.appComponentName}
                                                                    </td>
                                                                </tr>
                                                            )}
                                                        </tbody>
                                                    </table>
                                                </div>

                                            </div>

                                            <div className={`card-body pt-0`}>

                                                <p className={`${classes.rrTitle} mb-2`}><b>Resiliency Recommendations</b></p>
                                                <div className={`table-responsive`}>
                                                    <table className={`table table-bordered ${classes.tableStriped1} }`}>
                                                        <thead>
                                                            <tr>
                                                                <th>Component Name</th>
                                                                <th>Type</th>
                                                                <th>Current Compliance</th>
                                                                <th>Recommended compliance</th>
                                                            </tr>
                                                        </thead>
                                                        <tbody>
                                                            {
                                                                resiliencyRecommendationData.map(
                                                                    entry =>
                                                                        <tr key={entry.id}>
                                                                            <td>
                                                                                {entry.appComponentName}
                                                                            </td>
                                                                            <td>

                                                                            </td>
                                                                            <td>
                                                                                {findCurrentComplianceStatus(entry.appComponentName)}
                                                                            </td>
                                                                            <td>
                                                                                {entry.recommendationStatus}
                                                                            </td>
                                                                        </tr>
                                                                )
                                                            }
                                                        </tbody>
                                                    </table>
                                                </div>

                                            </div>

                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                </div>
            )
                :
                (
                    <div className='mt-3 ms-2 me-2 mb-3'>
                        <EntitySwitch>
                            <EntitySwitch.Case>
                                <EmptyState
                                    title="No Resilience Hub Dashboard page is available for this entity"
                                    missing="info"
                                    description="You need to add an annotation to your component if you want to see Resilience Hub Dashboard page for it."
                                />
                            </EntitySwitch.Case>
                        </EntitySwitch>
                    </div>
                )}
        </div>
    );
};

export default ResilienceHub;