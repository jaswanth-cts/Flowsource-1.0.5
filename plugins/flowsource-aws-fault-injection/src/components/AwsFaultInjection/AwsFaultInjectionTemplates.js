import { React, useState, useEffect } from 'react';
import cssClasses from './AwsFaultInjectionCss.js';
import { Typography, Card, Paper, CardHeader, Divider, CardContent, Alert, } from '@mui/material';
import { useEntity } from '@backstage/plugin-catalog-react';
import { useApi, configApiRef , fetchApiRef } from '@backstage/core-plugin-api';

import log from 'loglevel';

const Spacer = () => <div className="mb-4" />;

const AwsFaultInjectionTemplates = () => {
    const config = useApi(configApiRef);
    const entity = useEntity();
    const { fetch } = useApi(fetchApiRef);

    const backendBaseApiUrl = config.getString('backend.baseUrl') + '/api/flowsource-aws-fault-injection/';
    const AWSREGION = 'flowsource/fis-aws-region';
    const awsRegion = entity.entity.metadata.annotations?.[AWSREGION]+'';
    const applicationId = entity.entity.metadata.appid;

    const [fisExpTemplateData, setFisExpTemplateData] = useState([]);
    const [isLoading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchAllData = async () => {
        try {
            //Load AWS FIS Templates
            const fis_experiments_templates = await fetch(backendBaseApiUrl + 'fis-list-experiment-templates?awsRegion='+awsRegion+'&applicationId=' + applicationId);
            if (fis_experiments_templates.ok) {
                const result = await fis_experiments_templates.json();
                setFisExpTemplateData(result.experimentTemplates);
                setLoading(false);
            } else {
                log.error('Error fetching data:', fis_experiments_templates.status);
                if (fis_experiments_templates.status === 503) {
                    setError('This plugin has not been configured with the required values. Please ask your administrator to configure it');
                }
                else if(fis_experiments_templates.status === 403) {
                    setError('Invalid AWS credentials. Please check your AWS credentials and permissions.');
                }
                else if(fis_experiments_templates.status === 404) 
                {
                    const errorData = await fis_experiments_templates.json();

                    if(errorData.error.includes("AWS Hostname could not be resolved.")) {
                        setError("AWS hostname could not be resolved. Please validate your aws-region annotation, which is \"" + awsRegion + "\" or check your network connection and retry.");
                    }
                    else if(errorData.error.includes("No Templates found for the application id")) {
                        setError("1. No Template could be found with id \"" + applicationId + "\" in AWS FIS. Please check the appid in config.\n" 
                        + "2. AWS FIS tag must have this key \"application_id\" and value same as appid from config and try again.");
                    }
                    else {
                        setError(`Error fetching data, with status code ${fis_experiments_templates.status} `);
                    }
                }
                else {
                    setError(`Error fetching data, with status code ${fis_experiments_templates.status} `);
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
        fetchAllData();
    }, []);
    const classes = cssClasses();
    if (isLoading) {
        return <div className={`App p-3`}>Loading...</div>;
    }

    return (
        <div>
            {(error) && (
                <div className="card ms-1 me-1 mb-1 mt-2">
                    <div className="card-header">
                        <h6 className="mb-0">Error</h6>
                    </div>
                    <div className="card-body">
                        <div className="alert alert-danger mt-2 mb-2" role="alert" style={{ 'white-space': 'pre-wrap' }}>
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
                            <th>Experiment Template ID</th>
                            <th>Description</th>
                            <th>Tags</th>
                            <th>Creation Time</th>
                            <th>Last Updated</th>
                        </tr>
                    </thead>
                    <tbody>
                        {fisExpTemplateData.map((value) => (
                            <tr key={value.id}>
                                <td>
                                    <a href={value.url} target="_blank" className={`${classes.linkStyle}`}>
                                        {value.id}
                                    </a>
                                </td>
                                <td>
                                    {value.description}
                                </td>
                                <td>
                                    {value.tags}
                                </td>
                                <td>
                                    {value.creationTime}
                                </td>
                                <td>
                                    {value.lastUpdateTime}
                                </td>
                            </tr>))}
                    </tbody>
                </table>
            </div>
            )}
        </div>
    );
}

export default AwsFaultInjectionTemplates;