import { useState, React } from 'react';
import cssClasses from './AwsFaultInjectionCss.js';
import { Grid } from '@material-ui/core';
import AwsFaultInjectionExperiments from '../AwsFaultInjection/AwsFaultInjectionExperiments';
import AwsFaultInjectionTemplates from '../AwsFaultInjection/AwsFaultInjectionTemplates';
import { useEntity } from '@backstage/plugin-catalog-react';
import {
    EntitySwitch,
} from '@backstage/plugin-catalog';
import { EmptyState } from '@backstage/core-components';
import PluginVersion from '../PluginVersion/PluginVersion';

const AwsFaultInjectionMain = () => {
    const classes = cssClasses();
    const [activeTab, setActiveTab] = useState('');
    const entity = useEntity();
    const AWSREGION = 'flowsource/fis-aws-region';
    const rawAwsRegion = entity.entity.metadata.annotations?.[AWSREGION];
    const awsRegion = rawAwsRegion ? rawAwsRegion + '' : rawAwsRegion; //Only concatenate space if rawAwsRegion is defined
    const applicationId = entity.entity.metadata.appid;

    return (
        <div>
            {((awsRegion !== undefined && awsRegion !== null && awsRegion.trim().length > 0) && 
                (applicationId !== undefined && applicationId !== null && applicationId.trim().length > 0) ) ? (
                <Grid container>
                    <Grid item md={12}>
                        <div className={`${classes.pluginHeading}`}>
                            <div>
                            <div className="row justify-content-start mt-4 ms-1 pb-2">
                        <div className="col-auto">
                                        <div
                                            className={[
                                                classes.tab,
                                                activeTab === 'fisExperiments' ? classes.activeTab : classes.disableTab,
                                                classes.active
                                            ].join(' ')}
                                            onClick={() => setActiveTab('fisExperiments')}
                                        >
                                <div style={{ fontSize: '0.875rem' }}>Experiments</div>
                                        </div>
                                    </div>
                                    <div className="col-auto">
                            <div className={classes.verticalLine}></div>
                                    </div>
                                    <div className="col-sm-1">
                                        <div
                                            className={[
                                                classes.tab,
                                                activeTab === 'fisExpTemplates' ? classes.active : classes.disableTab
                                            ].join(' ')}
                                            onClick={() => setActiveTab('fisExpTemplates')}
                                        >
                                <div style={{ fontSize: '0.875rem' }}>Templates</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className={`${classes.pluginVersion}`}>
                                <PluginVersion />
                            </div>
                        </div>
                    </Grid>
                    <Grid item md={12}>
                        {activeTab === 'fisExperiments' && (
                            <AwsFaultInjectionExperiments />
                        )}
                        {activeTab === 'fisExpTemplates' && (
                            <AwsFaultInjectionTemplates />
                        )}
                    </Grid>
                </Grid>
            ) : (
                <div className='mt-3 ms-3 me-3 mb-4'>
                    <EntitySwitch>
                        <EntitySwitch.Case>
                            <EmptyState
                                title="No AWS Fault Injection page is available for this entity"
                                missing="info"
                                description="You need to add an annotation to your component if you want to see AWS Fault Injection page for it."
                            />
                        </EntitySwitch.Case>
                    </EntitySwitch>
                </div>
            )}
        </div>
    )
}

export default AwsFaultInjectionMain;