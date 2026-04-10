import { React, useState, useEffect } from 'react';
import cssClasses from './AwsFaultInjectionCss.js';
import { Typography, Card, Paper, CardHeader, Divider, CardContent, Alert, } from '@mui/material';
import { useApi, configApiRef , fetchApiRef } from '@backstage/core-plugin-api';
import { useEntity } from '@backstage/plugin-catalog-react';

import log from 'loglevel';

const Spacer = () => <div className="mb-4" />;

const AwsFaultInjectionExperiments = () => {
    const config = useApi(configApiRef);
    const entity = useEntity();
    const { fetch } = useApi(fetchApiRef);

    const backendBaseApiUrl = config.getString('backend.baseUrl') + '/api/flowsource-aws-fault-injection/';
    const AWSREGION = 'flowsource/fis-aws-region';
    const awsRegion= entity.entity.metadata.annotations?.[AWSREGION]+'';
    const applicationId = entity.entity.metadata.appid;

    const [fisExpData, setFisExpData] = useState([]);
    const [isLoading, setLoading] = useState(true);
    const [error, setError] = useState(null);


    const fetchAllData = async () => {
        try {
            //Load AWS FIS Experiments
            const fis_experiments = await fetch(backendBaseApiUrl + 'fis-list-experiments?awsRegion='+awsRegion+'&applicationId=' + applicationId);
            if (fis_experiments.ok) {
                const result = await fis_experiments.json();
                setFisExpData(result.experiments);
                setLoading(false);
            } else {
                log.error('Error fetching data:', fis_experiments.status);
                if (fis_experiments.status === 503) {
                    setError('This plugin has not been configured with the required values. Please ask your administrator to configure it');
                }
                else if(fis_experiments.status === 403) {
                    setError('Invalid AWS credentials. Please check your AWS credentials and permissions.');
                }
                else if(fis_experiments.status === 404) 
                {
                    const errorData = await fis_experiments.json();

                    if(errorData.error.includes("AWS Hostname could not be resolved.")) {
                        setError("AWS hostname could not be resolved. Please validate your aws-region annotation, which is \"" + awsRegion + "\" or check your network connection and retry.");
                    }
                    else if(errorData.error.includes("No experiments found for the application id")) {
                        setError("1. No experiments/project could be found with id \"" + applicationId + "\" in AWS FIS. Please check the appid in config.\n" 
                            + "2. AWS FIS tag must have this key \"application_id\" and value same as appid from config and try again.");
                    }
                    else {
                        setError(`Error fetching data, with status code ${fis_experiments.status} `);
                    }
                }
                else {
                    setError(`Error fetching data, with status code ${fis_experiments.status} `);
                }
                setLoading(false);
            }
        } catch (error) {
            log.error('Error:', error);
            setError(error.message);
            setLoading(false);
        }
    }

    useEffect(() => {
        log.info('use effect : AWS-FIS');
        fetchAllData();
    }, []);
    const classes = cssClasses();
    if (isLoading) {
        return <div className={`App p-3 ${classes.isLoadingStyle}`} >Loading...</div>;
    }

    return (
        <div>
            {(error) && (
                <div className="card ms-1 me-1 mb-1 mt-2">
                    <div className="card-header">
                        <h6 className="mb-0">Error</h6>
                    </div>
                    <div className="card-body">
                        <div className="alert alert-danger mt-2 mb-2" role="alert" style={{'white-space': 'pre-wrap'}}>
                            {error}
                        </div>
                    </div>
                </div>
            )}
            
            {(!error) && (
                <div className={`table-responsive p-3`}>
                <table className={`table table-bordered ${classes.tableStriped1} `}>
                    <thead>
                        <tr className={`${classes.trStyle}`}>
                            <th>Experiment ID</th>
                            <th>Experiment Template ID</th>
                            <th>State</th>
                            <th>Error Description</th>
                            <th>Tags</th>
                            <th>Creation Time</th>
                        </tr>
                    </thead>
                    <tbody>
                        {fisExpData.map((value) => (
                          <tr key={value.id}>
                                <td>
                                    <a href={value.url} target="_blank" className={`${classes.linkStyle}`}>
                                        {value.id}
                                    </a>
                                </td>
                                <td>
                                    {value.experimentTemplateId}
                                </td>
                                <td >
                                    {value.state.status}
                                </td>
                                <td >
                                    {value.state.reason}
                                </td>
                                <td >

                                    {value.tags}
                                </td>
                                <td>
                                    {value.creationTime}
                                </td>
                            </tr>))}
                    </tbody>
                </table>
            </div>
            )}
        </div>

    );
}

export default AwsFaultInjectionExperiments;