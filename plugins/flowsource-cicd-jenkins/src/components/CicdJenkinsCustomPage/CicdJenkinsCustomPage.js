import React, { useState , useEffect } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import cssClasses from './CicdJenkinsCustomPageCss';

import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

import { configApiRef, useApi, fetchApiRef } from '@backstage/core-plugin-api';
import { useEntity } from '@backstage/plugin-catalog-react';

import {
    Paper, Card, CardHeader, Typography, Divider, CardContent, Alert,
    Accordion, AccordionSummary, AccordionDetails
} from '@mui/material';

import CiCdCardComponent from './CicdCardComponent';
import PluginVersion from '../PluginVersion/PluginVersion';

import log from 'loglevel';

const Spacer = () => <div className="mb-4" />; // Spacer component

// ...existing code...
const CicdJenkinsCustomPage = () => {
    const classes = cssClasses();
    const { fetch } = useApi(fetchApiRef);
    const [error, setError] = useState(null);
    const [errorDetail, setErrorDetail] = useState(null);
    const [formatError, setFormatError] = useState(null);
    const [exceedingLimit, setExceedingLimit] = useState(null);
    const [isLoading, setLoading] = useState(true);
    const [expandedAccordion, setExpandedAccordion] = useState(null);
    const [ciPipelines, setCiPipelines] = useState([]);
    const [cdPipelines, setCdPipelines] = useState([]);
    const [dataPipelines, setDataPipelines] = useState([]);
    const [otherPipelines, setOtherPipelines] = useState([]);
    const [packageNameOptions, setPackageNameOptions] = useState([]);
    const config = useApi(configApiRef);
    const backendBaseApiUrl = config.getString('backend.baseUrl') + '/api/flowsource-cicd-jenkins/';
    const entity = useEntity();
    const durationDaysCatalog = entity.entity.metadata.annotations['flowsource/durationInDays'];
    const [releasePackageName, setReleasePackageName] = useState('') //need to fetch package info from pipeline 
    // Annotations
    const genericAnnotation = entity.entity.metadata.annotations?.['flowsource/jenkins-pipelines'] || '';
    const ciAnnotation = entity.entity.metadata.annotations?.['flowsource/jenkins-pipelines-ci'] || '';
    const cdAnnotation = entity.entity.metadata.annotations?.['flowsource/jenkins-pipelines-cd'] || '';
    const dataAnnotation = entity.entity.metadata.annotations?.['flowsource/jenkins-pipelines-data'] || '';

    const split = a => a.split(',').map(s => s.trim()).filter(Boolean);
    const genericNames = split(genericAnnotation);
    const ciNames = split(ciAnnotation);
    const cdNames = split(cdAnnotation);
    const dataNames = split(dataAnnotation);

    // Limit 25 per category
    const cap = arr => ({ used: arr.slice(0, 25), skipped: arr.slice(25) });
    const { used: ciFetch, skipped: ciSkip } = cap(ciNames);
    const { used: cdFetch, skipped: cdSkip } = cap(cdNames);
    const { used: dataFetch, skipped: dataSkip } = cap(dataNames);
    const { used: genericFetch, skipped: genericSkip } = cap(genericNames);

    const skippedCombined = [...ciSkip, ...cdSkip, ...dataSkip, ...genericSkip];

    function joinWithCommas(arr) {
        return arr && arr.length ? arr.map(n => `"${n}"`).join(' , ') : null;
    }

    async function fetchPipelines(pipelineName) {
        if (!pipelineName.length) return { matchingPipelines: [], errorArray: [], formatErrorArray: [] };
        const res = await fetch(
            backendBaseApiUrl + 'pipelines-data?jenkinsJobNames=' + encodeURIComponent(pipelineName.join(','))
        );
        if (!res.ok) {
            if (res.status === 503) {
                setErrorDetail('This plugin has not been configured with the required values. Please ask your administrator to configure it');
                return { matchingPipelines: [], errorArray: [], formatErrorArray: [] };
            }
            throw new Error(`Status ${res.status} fetching pipelines`);
        }
        const result = await res.json();
        result.matchingPipelines.forEach(p => { p.name = p.name.replace(/&gt;/g, '>'); });
        return result;
    }

    async function getPipelinesData() {
        try {
            const [ciRes, cdRes, dataRes, genericRes] = await Promise.all([
                fetchPipelines(ciFetch),
                fetchPipelines(cdFetch),
                fetchPipelines(dataFetch),
                fetchPipelines(genericFetch),
            ]);

            setCiPipelines(ciRes.matchingPipelines);
            setCdPipelines(cdRes.matchingPipelines);
            setDataPipelines(dataRes.matchingPipelines);

            // Other = generic not in explicit sets
            const explicit = new Set([...ciNames, ...cdNames, ...dataNames]);
            setOtherPipelines(genericRes.matchingPipelines.filter(p => !explicit.has(p.name)));

            setError(joinWithCommas([
                ...ciRes.errorArray,
                ...cdRes.errorArray,
                ...dataRes.errorArray,
                ...genericRes.errorArray,
            ].filter(Boolean)));

            setFormatError(joinWithCommas([
                ...ciRes.formatErrorArray,
                ...cdRes.formatErrorArray,
                ...dataRes.formatErrorArray,
                ...genericRes.formatErrorArray,
            ].filter(Boolean)));

            setExceedingLimit(joinWithCommas(skippedCombined));
        } catch (e) {
            log.error(e);
            setError(e.message);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        getPipelinesData();
    }, []);

    // Populate package names from CD pipelines only
    useEffect(() => {
        async function populatePackageNameOptions() {
            const itemsPerPage = 8;
            const pageNumber = 1;
            for (const pipeline of cdPipelines) {
                await getJobRunDetails(pipeline.name, pageNumber, itemsPerPage);
            }
        }
        if (cdPipelines.length) populatePackageNameOptions();
    }, [cdPipelines]);

    async function getJobRunDetails(pipelineName, pageNumber, pageSize) {
        try {
            const jobBuildRes = await fetch(
                `${backendBaseApiUrl}build-details?pipelineDisplayName=${pipelineName}&pageNumber=${pageNumber}&pageSize=${pageSize}&durationDaysCatalog=${durationDaysCatalog}`
            );
            if (jobBuildRes.ok) {
                const jobRunDetails = await jobBuildRes.json();
                const jobNames = jobRunDetails?.map(job => job.name);
                const options = jobNames?.map(jobName => releasePackageName + jobName.replace(/#/g, ''));
                setPackageNameOptions(prev => {
                    const unique = Array.from(new Set([...(prev || []), ...(options || [])]));
                    unique.sort((a, b) => {
                        const va = a.split('.').slice(-1)[0];
                        const vb = b.split('.').slice(-1)[0];
                        return Number(vb) - Number(va);
                    });
                    return unique;
                });
            } else {
                log.error(`Error fetching build details status ${jobBuildRes.status}`);
            }
        } catch (err) {
            log.error('Error:', err);
        }
    }

    const getAccordionColor = state => {
        switch (state) {
            case 'SUCCESS': return '#44b98c';
            case 'FAILURE': return '#e76c71';
            case 'in_progress': return '#F29F58';
            case 'ABORTED':
            case 'UNSTABLE':
            case 'NOT_BUILT': return '#9e9e9e';
            default: return '#e76c71';
        }
    };

    const handleAccordionChange = pipelineName => (_e, isExpanded) => {
        setExpandedAccordion(isExpanded ? pipelineName : null);
    };

    function pipelineAccordion(pipeline, index, pkgOpts = []) {
        return (
            <Accordion
                key={pipeline.name}
                expanded={expandedAccordion === pipeline.name}
                onChange={handleAccordionChange(pipeline.name)}
            >
                <AccordionSummary
                    expandIcon={<ExpandMoreIcon />}
                    aria-controls={`panel${index}-content`}
                    id={`panel${index}-header`}
                    style={{ backgroundColor: '#92bbe6' }}
                >
                    <div className={classes.flexCenter}>
                        <div
                            className={classes.statusIndicator}
                            style={{ backgroundColor: getAccordionColor(pipeline.latestBuildResult) }}
                        />
                        <Typography>{pipeline.name}</Typography>
                    </div>
                </AccordionSummary>
                <AccordionDetails>
                    {expandedAccordion === pipeline.name && (
                        pipeline.totalBuilds === 0
                            ? <Typography>No builds found.</Typography>
                            : <CiCdCardComponent currentJobData={pipeline} pipelineName={pipeline.name} packageNameOptions={pkgOpts} />
                    )}
                </AccordionDetails>
            </Accordion>
        );
    }

    return (
        <div>
            {errorDetail ? (
                <div>
                    <Card>
                        <CardHeader title={<Typography variant="h6">Error</Typography>} />
                        <Divider />
                        <CardContent>
                            <Paper role="alert" elevation={0}>
                                <Alert severity="error">{errorDetail}</Alert>
                            </Paper>
                        </CardContent>
                    </Card>
                    <Spacer />
                </div>
            ) : (

                <div className={`container`}>
                    <div className={`row`}>
                        <div className={`${classes.pluginHeading}`}>
                            <div>
                                <h5>
                                    <p>
                                        <b>Jenkins</b>
                                    </p>
                                </h5>
                            </div>
                            <div>
                                <PluginVersion />
                            </div>
                        </div>
                    </div>
                    {isLoading && (
                        <div className={`App p-3 ${classes.loadingContainer}`}>
                        Loading...
                        </div>
                    )}
                    {(error || formatError || exceedingLimit) && (
                        <div>
                            <Card>
                                <CardHeader title={<Typography variant="h6">Error</Typography>} />
                                <Divider />
                                <CardContent>
                                    <Paper role="alert" elevation={0}>
                                        {error && (
                                            <Alert severity="error">
                                                <p>The following pipeline(s) {error} in the catalog-info file were not found in Jenkins.</p>
                                            </Alert>
                                        )}
                                        {formatError && (
                                            <Alert severity="error">
                                                <p>Pipeline type 'FOLDER' or 'ORGANIZATION FOLDER' is not supported for pipeline {formatError}</p>
                                            </Alert>
                                        )}
                                        {exceedingLimit && (
                                            <Alert severity="error">
                                                <p>Max allowed workflow is 25, following pipelines are skipped {exceedingLimit}</p>
                                            </Alert>
                                        )}
                                    </Paper>
                                </CardContent>
                            </Card>
                        </div>
                    )}

                        <div>
                            {ciPipelines.length > 0 && (
                                <div className={`${classes.pipelineSection}`}>
                                    <div className={`card`}>
                                        <div className={`card-body`}>
                                            <div className={`${classes.header}`}>CI pipelines</div>
                                            <div>
                                                {ciPipelines.map((pipeline, index) => (
                                                    pipelineAccordion(pipeline, index)
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                            {cdPipelines.length > 0 && (
                                <div className={`${classes.pipelineSection}`}>
                                    <div className={`card`}>
                                        <div className={`card-body`}>
                                            <div className={`${classes.header}`}>CD pipelines</div>
                                            <div>
                                                {cdPipelines.map((pipeline, index) => (
                                                    pipelineAccordion(pipeline, index, packageNameOptions)
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                            {dataPipelines.length > 0 && (
                                <div className={`${classes.pipelineSection}`}>
                                    <div className={`card`}>
                                        <div className={`card-body`}>
                                            <div className={`${classes.header}`}>Data pipelines</div>
                                            <div>
                                                {dataPipelines.map((pipeline, index) => (
                                                    pipelineAccordion(pipeline, index)
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                            {otherPipelines.length > 0 && (
                                <div className={`${classes.pipelineSection}`}>
                                    <div className={`card`}>
                                        <div className={`card-body`}>
                                            <div className={`${classes.header}`}>Other pipelines</div>
                                            <div>
                                                {otherPipelines.map((pipeline, index) => (
                                                    pipelineAccordion(pipeline, index)
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                </div>
            )}
        </div>
    );
};

export default CicdJenkinsCustomPage;