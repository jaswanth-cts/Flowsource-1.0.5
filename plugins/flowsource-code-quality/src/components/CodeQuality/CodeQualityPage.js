import { useState, useEffect } from 'react';

import { Card, Grid, Typography,Link } from "@material-ui/core";

import cssClasses from './CodeQualityPageCss';

import bugsIcon from './Icons/Bug-Icon.svg';
import coverageIcon from './Icons/Coverage-Icon.svg';
import vulnerabilitiesIcon from './Icons/Vulnerabilities-Icon.svg';
import codeSmellsIcon from './Icons/CodeSmell-Icon.svg';
import duplicationIcon from './Icons/Duplication-Icon.svg';
import hotspotsReviewedIcon from './Icons/HotspotReviewed-Icon.svg';
import OpenInNewIcon from '@material-ui/icons/OpenInNew';

import QualityGradeTrendChart from './QualityGradeTrendChart';
import ActivityChart from './ActivityChart';
import { configApiRef, useApi, fetchApiRef } from '@backstage/core-plugin-api';
import { useEntity } from '@backstage/plugin-catalog-react';
import 'bootstrap/dist/css/bootstrap.min.css';
import {
    Paper, CardHeader, Divider, CardContent, Alert,
} from '@mui/material';
import PluginVersion from '../PluginVersion/PluginVersion';
import 'chart.js/auto';

import log from 'loglevel';

import { EntitySwitch } from '@backstage/plugin-catalog';
import { EmptyState } from '@backstage/core-components';

function renderChartContent(error, classes, qltyGrdChrtVal, activityChartVal,scanStatus) {
    return () => {
        return (
            <div>
                {!error && (
                    <div className={`${classes.allScanTextSection}`}>
                        <div className={`${classes.allScanTextSection}`}>
                            <Typography className={`${classes.allScanText}`}>All Scans</Typography>
                        </div>
                        <div className={`row`}>
                            <div className={`col-6`}>
                                <Card variant="outlined">
                                    <Typography variant="body1" className={`${classes.chartCardHeading}`}>
                                        Quality Gate Trend
                                    </Typography>
                                    {!error && qltyGrdChrtVal && qltyGrdChrtVal.length > 0 && (
                                        <QualityGradeTrendChart chartData={qltyGrdChrtVal} />
                                    )}
                                </Card>
                            </div>
                            <div className={`col-6`}>
                                <Card variant="outlined">
                                    <Typography variant="body1" className={`${classes.chartCardHeading}`}>
                                    {scanStatus.showUpdatedLabels ? 'Reliability - Maintainability - Security Trend Chart' : 'Bugs - Code Smells - Vulnerabilities Trend Chart'}
                                    </Typography>
                                    {!error && activityChartVal && activityChartVal.length > 0 && (
                                        <ActivityChart chartData={activityChartVal} showUpdatedLabels={scanStatus.showUpdatedLabels}/>
                                    )}
                                </Card>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        );
    };
}

function renderCardInfoContent(error, classes, scanStatus,sonarQubeProjectUrl) {
    
    return () => {
        const setStatusColor = (status) => {
            const statusLower = status ? status.toLowerCase() : '';
            return (statusLower === "passed") ? "#42C023" : "#F85D5D";
        };



        const renderError = () => (
            <div className="card me-1 mb-1 mt-2">
                <div className="card-header">
                    <h6 className="mb-0">Error</h6>
                </div>
                <div className="card-body">
                    <div className="alert alert-danger mt-2 mb-2" role="alert" style={{ 'white-space': 'pre-wrap' }}>
                        {error}
                    </div>
                </div>
            </div>
        );
        const StatusCard = generateStatusCard(classes);



        return (
            <div>
                {error ? renderError() : (
                    <>
                        <div className={`${classes.scanStatusSection}`}>
                            <Typography className={`${classes.scanDateText}`}>Last Scan Date {scanStatus.date}</Typography>
                            <div className={`${classes.qualityGateStatus}`}>
                                <Link href={sonarQubeProjectUrl} target="_blank" rel="noopener noreferrer" className={classes.sonarQubeLink}>
                                    <b>SonarQube Project <OpenInNewIcon fontSize="small" /></b>
                                </Link>
                                <div>
                                    <Typography className={`${classes.qgsText}`}>QUALITY GATE STATUS</Typography>
                                </div>
                                <div>
                                    <Card variant="outlined" className={`${classes.statusTextBox}`}
                                        style={{ backgroundColor: setStatusColor(scanStatus.status) }}>
                                        <Typography variant="body1"
                                            style={{ color: "white", paddingLeft: '1rem', paddingTop: '0.5rem' }}>
                                            {scanStatus.status}
                                        </Typography>
                                        <Typography variant="caption"
                                            style={{ color: "white", paddingLeft: '1rem' }}>
                                            {scanStatus.statusMessage}</Typography>
                                    </Card>
                                </div>
                            </div>
                        </div>
                        <div>
                            <Card variant="outlined" className={`${classes.infoContCard}`}>
                                <div className={`${classes.infoContPrjItems}`}>
                                    <StatusCard icon={bugsIcon} title={scanStatus.showUpdatedLabels ? "Reliability" : "Bugs"} value={scanStatus.bugs} color="#7BDEEA" />
                                    <StatusCard icon={coverageIcon} title="Coverage" value={scanStatus.coverage} color="#8FDBF9" />
                                    <StatusCard icon={vulnerabilitiesIcon} title={scanStatus.showUpdatedLabels ? "Security" : "Vulnerabilities"} value={scanStatus.vulnerabilities} color="#70C5F8" />
                                    <StatusCard icon={codeSmellsIcon} title={scanStatus.showUpdatedLabels ? "Maintainability" : "Code Smells"} value={scanStatus.codeSmells} color="#FCA7C6" />
                                    <StatusCard icon={duplicationIcon} title="Duplications" value={scanStatus.duplication} color="#FBB8BE" />
                                    <StatusCard icon={hotspotsReviewedIcon} title="Hotspots Reviewed" value={scanStatus.hotspots} color="#FFC48B" />
                                </div>
                            </Card>
                        </div>
                    </>
                )}
            </div>
        );
    };
}

const CodeQualityPage = () => {

    const classes = cssClasses();
    const { fetch } = useApi(fetchApiRef);
    const [scanStatus, setScanStatus] = useState({});

    const config = useApi(configApiRef);
    const backendBaseApiUrl = config.getString('backend.baseUrl') + '/api/code-quality/';
    const { entity } = useEntity();

    const projectKey = entity.metadata.annotations['flowsource/sonarqube-project-key'];

    const sonarQubeProjectUrl = config.getOptionalString('sonarqube.projectUrl')+'/dashboard?id='+ projectKey;

    const [isLoading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isAnnotationMissing, setAnnotationMissing] = useState(false);

    async function getScanStatus() {
        try {
            const response = await fetch(backendBaseApiUrl + 'code-quality-details', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ projectKey }),
            });

            if(!response.ok) {
                if (response.status === 503) {
                    log.error('Service unavailable:', response.statusText);
                    // Display the 503 status message
                    setError('This plugin has not been configured with the required values. Please ask your administrator to configure it.');
                    return;
                } else if (response.status === 404) {
                    const errorData = await response.json();

                    if(errorData.error.includes("Project not found")) {
                        setError(`No project could be found with key "${projectKey}" in SonarQube. Please check the project key and try again.`);
                    } else {
                        setError(`Error fetching SonarQube details, with status code ${response.status}: ${response.statusText}`);
                    }
                }
                else {
                    setError(`Error fetching SonarQube details, with status code ${response.status}: ${response.statusText}`);
                }
            };

            const apiResponse = await response.json();

            setScanStatus(apiResponse);
        } catch (error) {
            log.error('Error:', error);
        }
    }


    const [qltyGrdChrtVal, setQltyGrdChrtVal] = useState([]);

    async function getQualityGradeTradeChartData() {
        let defaultQualityGradeData = [
            {
                date: '',
                passedData: '',
                failedData: '',
            },
            {
                date: '',
                passedData: '',
                failedData: '',
            },
            {
                date: '',
                passedData: '',
                failedData: '',
            },
            {
                date: '',
                passedData: '',
                failedData: '',
            },
            {
                date: '',
                passedData: '',
                failedData: '',
            },
        ];

        try {
            const response = await fetch(backendBaseApiUrl + 'code-quality-details', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ projectKey }),
            });

            if (response.ok) {
                const apiResponse = await response.json();
                setQltyGrdChrtVal(apiResponse.qualityGradeData);
            } else if (response.status === 503) {
                log.error('Service unavailable:', response.statusText);
                setError('Service Unavailable: Please contact your administrator to configure the plugin.');
                setQltyGrdChrtVal(defaultQualityGradeData);
                return;
            } else {
                log.error('Error fetching quality grade trade chart data:', response.statusText);
                setQltyGrdChrtVal(defaultQualityGradeData);
            }
        } catch (error) {
            log.error('Error:', error);
            setQltyGrdChrtVal(defaultQualityGradeData);
        }
    }


    const [activityChartVal, setActivityChartVal] = useState([]);

    async function getActivityChartData() {
        try {
            const response = await fetch(backendBaseApiUrl + 'code-quality-details', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ projectKey }),
            });

            let activityChartData = [
                {
                    date: '',
                    bugsData: '',
                    codeSmellData: '',
                    vulnerabilityData: ''
                },
                {
                    date: '',
                    bugsData: '',
                    codeSmellData: '',
                    vulnerabilityData: ''
                },
                {
                    date: '',
                    bugsData: '',
                    codeSmellData: '',
                    vulnerabilityData: ''
                },
                {
                    date: '',
                    bugsData: '',
                    codeSmellData: '',
                    vulnerabilityData: ''
                },
                {
                    date: '',
                    bugsData: '',
                    codeSmellData: '',
                    vulnerabilityData: ''
                },
                {
                    date: '',
                    bugsData: '',
                    codeSmellData: '',
                    vulnerabilityData: ''
                }
            ];

            if (response.ok) {
                const apiResponse = await response.json();
                if (apiResponse && apiResponse.activityChartData) {
                    setActivityChartVal(apiResponse.activityChartData);
                } else if (response.status === 503) {
                    log.error('Service unavailable:', response.statusText);
                    setError('This plugin has not been configured with the required values. Please ask your administrator to configure it.');
                    setLoading(false);
                } else {
                    setActivityChartVal(activityChartData);
                }
                setLoading(false);

            } else {
                log.error('Error fetching activity chart data:', response.statusText);
                setActivityChartVal(activityChartData);
                setLoading(false);
            }
        } catch (error) {
            log.error('Error:', error);
            setActivityChartVal(activityChartData);
            setLoading(false);
        }
    }


    useEffect(() => {

        if(projectKey === undefined || projectKey === null || projectKey.length === 0) {
            setAnnotationMissing(true);
            setLoading(false);
        } else {
            getScanStatus();
            getQualityGradeTradeChartData();
            getActivityChartData();
        }

    }, []);


    const CardInfoContent = renderCardInfoContent(error, classes, scanStatus,sonarQubeProjectUrl)

    const ChartContent = renderChartContent(error, classes, qltyGrdChrtVal, activityChartVal, scanStatus)

    function renderCodeQuality() {
        if (isLoading) {
            return (
                <div className="App p-3" style={{ display: 'flex', justifyContent: 'center', alignItems: 'flex-start', height: '100vh', paddingTop: '30%' }}>
                    Loading...
                </div>
            );
        } else if(isAnnotationMissing) {
            return <NoAnnotationTag />;
        } else {
            return (
                <div>
                    <Grid container >
                        <Grid item md={12}>
                            <div className={`${classes.pluginHeading}`}>
                                <div>
                                    <Typography variant="h4" display="block">SonarQube</Typography>
                                </div>
                                <div>
                                    <PluginVersion />
                                </div>
                            </div>
                        </Grid>
                        <Grid item md={12}>
                            <CardInfoContent />
                        </Grid>
                        <Grid item md={12}>
                            <ChartContent />
                        </Grid>
                    </Grid>
                </div>
            );
        }
    };

    return (
        <>
            { renderCodeQuality() }
        </>
    );

};

export default CodeQualityPage;


function generateStatusCard(classes) {
    return ({ icon, title, value, color }) => (
        <Card variant="outlined" className={classes.infoContPrjItemsCards} style={{ backgroundColor: color }}>
            <div className={classes.infoContPrjIcon}>
                <img src={icon} style={{ width: '40px', height: '40px' }} alt={title} />
                <Typography className={classes.cardIconName}>{title}</Typography>
            </div>
            <p className={value === "No Data Found" ? classes.cardIconValueIfNoData : classes.cardIconValue}>
                {value}
            </p>
        </Card>
    );
};

const NoAnnotationTag = () => {
    return (
        <div className='mt-2 ms-4 me-4 mb-4'>
            <EntitySwitch>
                <EntitySwitch.Case>
                    <EmptyState
                        title="No Code Quality page is available for this entity"
                        missing="info"
                        description="Need to add missing annotations to your component if you want to see the Code Quality page."
                    />
                </EntitySwitch.Case>
            </EntitySwitch>
        </div>
    );
};

