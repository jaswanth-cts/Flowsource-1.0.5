import { React, useState, useEffect } from 'react'
import cssClasses from './DoraMetricsCss.js'
import ChartjsTwo from './ChartjsTwo.js';
import deploymentFrequencyImage from '../../assets/DeploymentFrequency.svg';
import leadTimeImage from '../../assets/LeadTimeforChanges.svg';
import changeFailureImage from '../../assets/ChangeFailureRate.svg';
import mttrImage from '../../assets/MeanTimetoRecover.svg';
import {
    Paper,
    Card,
    CardHeader,
    Typography,
    Divider,
    CardContent,
    Alert,
  } from '@mui/material';

import { useEntity } from '@backstage/plugin-catalog-react';

import { useApi, configApiRef, fetchApiRef } from '@backstage/core-plugin-api';
import {
    fetchAndUpdateChangeFailureRate, fetchAndUpdateDeploymentFrequency,
    fetchAndUpdateLeadTimeForChanges, fetchAndUpdateMeanTimeToRecover
} from './DoraMetricsHelper.js';
import {
    EntitySwitch,
} from '@backstage/plugin-catalog';
import { EmptyState } from '@backstage/core-components';
import PluginVersion from '../PluginVersion/PluginVersion';

import log from 'loglevel';

let defaultDeploymentFrequency = "-";
let defaultLeadTimeForChanges = "-";
let defaultMeanTimeToRecover = "-";
let defaultChangeFailureRate = "-";

const Spacer = () => <div className="mb-4" />; // Spacer component

function DoraMetrics() {

    const classes = cssClasses();

    const { fetch } = useApi(fetchApiRef);

    const config = useApi(configApiRef);
    const backendUrl = config.getString('backend.baseUrl');

    const entity = useEntity();
    const appid = entity.entity.metadata.appid;
    const isAppIdValid = () => appid !== undefined && appid !== null;

    if (!isAppIdValid()) {
        log.error("App ID not found in entity metadata");
    }

    const [error, setError] = useState('');

    const [deploymentFrequencyValue, setDeploymentFrequencyValue] = useState(defaultDeploymentFrequency);
    const [deploymentFrequencyValueLastUpdateTime, setDeploymentFrequencyValueLastUpdateTime] = useState(defaultDeploymentFrequency);
    useEffect(() => {
        fetchAndUpdateDeploymentFrequency(fetch, backendUrl, setDeploymentFrequencyValue, setDeploymentFrequencyValueLastUpdateTime, setError, appid);
    }, [fetch, backendUrl, appid]);

    const [leadTimeForChangesValue, setLeadTimeForChangesValue] = useState(defaultLeadTimeForChanges);
    const [leadTimeForChangesValueLastUpdateTime, setLeadTimeForChangesValueLastUpdateTime] = useState(defaultLeadTimeForChanges);
    useEffect(() => {
        fetchAndUpdateLeadTimeForChanges(fetch, backendUrl, setLeadTimeForChangesValue, setLeadTimeForChangesValueLastUpdateTime, appid);
    }, [fetch, backendUrl, appid]);

    const [meanTimeToRecoverValue, setMeanTimeToRecoverValue] = useState(defaultMeanTimeToRecover);
    const [meanTimeToRecoverValueLastUpdateTime, setMeanTimeToRecoverValueLastUpdateTime] = useState(defaultMeanTimeToRecover);
    useEffect(() => {
        fetchAndUpdateMeanTimeToRecover(fetch, backendUrl, setMeanTimeToRecoverValue, setMeanTimeToRecoverValueLastUpdateTime, appid);
    }, [fetch, backendUrl, appid]);

    const [changeFailureRateValue, setChangeFailureRateValue] = useState(defaultChangeFailureRate);
    const [changeFailureRateValueLastUpdateTime, setChangeFailureRateValueLastUpdateTime] = useState(defaultChangeFailureRate);
    useEffect(() => {
        fetchAndUpdateChangeFailureRate(fetch, backendUrl, setChangeFailureRateValue, setChangeFailureRateValueLastUpdateTime, appid);
    }, [fetch, backendUrl, appid]);

    const isErrorEmpty = () => error === '';
    const isDeploymentFrequencyValid = () => deploymentFrequencyValue && deploymentFrequencyValue !== defaultDeploymentFrequency;
    const isLeadTimeForChangesValid = () => leadTimeForChangesValue && leadTimeForChangesValue !== defaultLeadTimeForChanges;
    const isMeanTimeToRecoverValid = () => meanTimeToRecoverValue && meanTimeToRecoverValue !== defaultMeanTimeToRecover;
    const isChangeFailureRateValid = () => changeFailureRateValue && changeFailureRateValue !== defaultChangeFailureRate;
    const noDataAvailable = isErrorEmpty() ? (
        <div className='mt-3 ms-2 me-2 mb-3'>
            <EntitySwitch>
                <EntitySwitch.Case>
                    <EmptyState
                        title="No Dora Metrics page is available for this entity"
                        missing="info"
                        description="You need to add an annotation to your component if you want to see Dora Metrics page for it."
                    />
                </EntitySwitch.Case>
            </EntitySwitch>
        </div>
    ) : '';
    return (
        <div>
            {error && ( // Show error if exists and no workflow data
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
        )}
            {isErrorEmpty() && isAppIdValid() ? (
                <div className={`p-3 ${classes.background}`}>
                    <div>
                        <div className={`${classes.pluginHeading}`}>
                            <div>
                                <h4 className={`text-start mx-3 pt-2 fw-bold`}>DORA Metrics</h4>
                            </div>
                            <div>
                                <PluginVersion />
                            </div>
                        </div>
                        <div className={`row p-3`}>
                            <div className={`col-sm-12 mb-3 mb-sm-0`}>
                                <div className={`row`}>
                                    <div className={`col-xxl-3 col-xl-4 col-lg-6 col-md-6 col-sm-12 mb-3 mb-sm-0`}>
                                        <div className=
                                            {`card ${classes.cardBorderRadius} text-center h-100 pb-2
                                         ${isDeploymentFrequencyValid() ? classes.cardEnabled : classes.cardDisabled}`}>
                                            <div className={`${classes.cardBody}`}>
                                                <span className={`${classes.cardDesc} ${classes.cardPadding} pt-3 pb-4`}>
                                                    <img className={`${classes.iconPlacement}`} src={deploymentFrequencyImage}></img>
                                                    {' '}Deployment Frequency
                                                </span>
                                            </div>
                                            <div className={`${classes.cardText} text-wrap ${classes.card1val} pb-2`}>
                                                {deploymentFrequencyValue}
                                                {' '}
                                                <span className={`${classes.subscript}`}>per month</span>
                                            </div>
                                            <div className={`${classes.cardFooter} position-absolute bottom-0 end-0 p-2`}>
                                                Last updated: 
                                                <span >{deploymentFrequencyValueLastUpdateTime}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className={`col-xxl-3 col-xl-4 col-lg-6 col-md-6 col-sm-12 mb-3 mb-sm-0`}>
                                        <div className=
                                            {`card ${classes.cardBorderRadius} text-center h-100 pb-2
                                        ${isLeadTimeForChangesValid() ? classes.cardEnabled : classes.cardDisabled}`}>
                                            <div className={`${classes.cardBody}`}>
                                                <span className={`${classes.cardDesc} ${classes.cardPadding} pt-3 pb-4`}>
                                                    <img className={`${classes.iconPlacement}`} src={leadTimeImage}></img>
                                                    {' '}Lead Time For Changes

                                                </span>
                                            </div>
                                            <div className={`${classes.cardText} text-wrap ${classes.card2val} pb-2`}>
                                                {leadTimeForChangesValue}{' '}
                                                {/* { leadTimeForChangesValue !== defaultLeadTimeForChanges && */}
                                                <span className={`${classes.subscript}`}>days</span>
                                                {/* } */}
                                            </div>
                                            <div className={`${classes.cardFooter} position-absolute bottom-0 end-0 p-2`}>
                                                Last updated: 
                                                <span >{leadTimeForChangesValueLastUpdateTime}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className={`col-xxl-3 col-xl-4 col-lg-6 col-md-6 col-sm-12 mb-3 mb-sm-0`}>
                                        <div className=
                                            {`card ${classes.cardBorderRadius} text-center h-100 pb-2
                                          ${isMeanTimeToRecoverValid() ? classes.cardEnabled : classes.cardDisabled}`}>
                                            <div className={`${classes.cardBody}`}>
                                                <span className={`${classes.cardDesc} ${classes.cardPadding} pt-3 pb-4`}>
                                                    <img className={`${classes.iconPlacement}`} src={mttrImage}></img>
                                                    {' '}Mean Time To Recover

                                                </span>
                                            </div>
                                            <div className={`${classes.cardText} text-wrap ${classes.card3val} pb-2`}>
                                                {meanTimeToRecoverValue}{' '}
                                                {/* { meanTimeToRecoverValue !== defaultMeanTimeToRecover && */}
                                                <span className={`${classes.subscript}`}>hours</span>
                                                {/* } */}
                                            </div>
                                            <div className={`${classes.cardFooter} position-absolute bottom-0 end-0 p-2`}>
                                                Last updated: 
                                                <span >{meanTimeToRecoverValueLastUpdateTime}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className={`col-xxl-3 col-xl-4 col-lg-6 col-md-6 col-sm-12 mb-3 mb-sm-0`}>
                                        <div className=
                                            {`card ${classes.cardBorderRadius} text-center h-100 pb-2
                                        ${isChangeFailureRateValid() ? classes.cardEnabled : classes.cardDisabled}`}>
                                            <div className={`${classes.cardBody}`}>
                                                <span className={`${classes.cardDesc} ${classes.cardPadding} pt-3 pb-4`}>
                                                    <img className={`${classes.iconPlacement}`} src={changeFailureImage}></img>
                                                    {' '}Change Failure Rate

                                                </span>
                                            </div>
                                            <div className={`${classes.cardText} text-wrap ${classes.card3val} ${classes.cardText4} pb-2`}>
                                                {changeFailureRateValue * 100}
                                                {/* { changeFailureRateValue !== defaultChangeFailureRate && */}
                                                <span className={`${classes.card3val}`} id='percent'>%</span>
                                                {/* } */}
                                            </div>
                                            <div className={`${classes.cardFooter} position-absolute bottom-0 end-0 p-2`}>
                                                Last updated: 
                                                <span >{changeFailureRateValueLastUpdateTime}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                        </div>
                        <div className={`row p-3 mb-3`}>
                            <div className={`col-xxl-6 col-xl-6 col-lg-6 col-md-12 col-sm-12 mb-4 mb-sm-0`}>
                                {/* <ChartjsOne /> */}
                                <ChartjsTwo title="Deployment Frequency" />
                            </div>
                            <div className={`col-xxl-6 col-xl-6 col-lg-6 col-md-12 col-sm-12 mb-4 mb-sm-0`}>
                                <ChartjsTwo title="Lead Time For Changes" />
                            </div>
                        </div>
                        <div className={`row p-3 mb-5`}>
                            <div className={`col-xxl-6 col-xl-6 col-lg-6 col-md-12 col-sm-12 mb-4 mb-sm-0`}>
                                <ChartjsTwo title="Mean Time To Recover" />
                            </div>
                            <div className={`col-xxl-6 col-xl-6 col-lg-6 col-md-12 col-sm-12 mb-4 mb-sm-0`}>
                                <ChartjsTwo title="Change Failure Rate" />
                            </div>
                        </div>
                        {/* <Grid container justifyContent="flex-end">
                    <Grid item style={{ position: 'fixed', bottom: '0px', right: '0px' }}>
                        <ChatbotComponent />
                    </Grid>
                </Grid> */}
                    </div>

                </div>
            )
                :
                (
                    noDataAvailable
                  )}
        </div>
    )
}

export default DoraMetrics;
