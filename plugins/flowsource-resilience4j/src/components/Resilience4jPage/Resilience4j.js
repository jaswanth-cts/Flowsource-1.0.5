import { useState, React } from 'react';
import cssClasses from './Resilience4jCss';
import { Grid } from '@material-ui/core';
import Resilience4jCircuitBreaker from './Resilience4jCircuitBreaker';
import Resilience4jBulkHead from './Resilience4jBulkHead';
import Resilience4jRateLimiter from './Resilience4jRateLimiter';
import { useEntity } from '@backstage/plugin-catalog-react';
import {
    EntitySwitch,
} from '@backstage/plugin-catalog';
import { EmptyState } from '@backstage/core-components';
import PluginVersion from '../PluginVersion/PluginVersion';


const Resilience4j = () => {
    const classes = cssClasses();
    const [activeTab, setActiveTab] = useState('resilience4jCircuitBreaker');
    const entity = useEntity();
    
    const applicationName = entity.entity.metadata.annotations['flowsource/resilience4j-datadog-applicationName'];
    const durationInDays = entity.entity.metadata.annotations['flowsource/resilience4j-durationInDays'];

    return (
        <div>
            {(applicationName !== undefined && applicationName !== null && durationInDays !== undefined && durationInDays !== null ) ? (
         <Grid container>
        <Grid item alignItems="stretch" md={12}>
        <div className={`${classes.pluginHeading}`}>
        <div>
            <div className={`row justify-content-start mt-4 ms-1 pb-2`}>
                <div className={`col-auto`}>
                <div
  className={`${classes.tab} ${activeTab === 'resilience4jCircuitBreaker' ? classes.activeTab : classes.disableTab} ${classes.active}`}
  onClick={() => setActiveTab('resilience4jCircuitBreaker')}>
                <div style={{ 'font-size': '0.875rem' }}> CircuitBreaker</div>
                    </div>
                </div>
                <div className={`col-auto`}>
                    <div className={`${classes.verticalLine}`}></div>
                </div>

                <div className={`col-auto`}>
                <div
  className={`${classes.tab} ${activeTab === 'resilience4jBulkHead' ? classes.activeTab : classes.disableTab} ${classes.active}`}
  onClick={() => setActiveTab('resilience4jBulkHead')}>
                        <div style={{ 'font-size': '0.875rem' }}> BulkHead </div>
                    </div>
                </div>
                <div className={`col-auto`}>
                    <div className={`${classes.verticalLine}`}></div>
                </div>

                <div className={`col-sm-1`}>
                <div
  className={`${classes.tab} ${activeTab === 'resilience4jRateLimiter' ? classes.activeTab : classes.disableTab} ${classes.active}`}
  onClick={() => setActiveTab('resilience4jRateLimiter')}>
                        <div style={{ 'font-size': '0.875rem' }}> RateLimiter </div>
                    </div>
                    </div>
                    </div>
                    </div>
                    <div className={`${classes.pluginVersion}`}>
                        <PluginVersion />
                    </div>
        </div>
            </Grid>
            <Grid item alignItems="stretch" md={12}>
                {activeTab === 'resilience4jCircuitBreaker' && (
                    <Resilience4jCircuitBreaker />
                )}
                {activeTab === 'resilience4jBulkHead' && (
                    <Resilience4jBulkHead />
                )}
                {activeTab === 'resilience4jRateLimiter' && (
                    <Resilience4jRateLimiter />
                )}
            </Grid>
        </Grid>
    ) : (
        <div className='mt-3 ms-3 me-3 mb-4'>
        <EntitySwitch>
            <EntitySwitch.Case>
                <EmptyState
                    title="No Resilience4j page is available for this entity"
                    missing="info"
                    description="You need to add an annotation to your component if you want to see Resilience4j page for it."
                />
            </EntitySwitch.Case>
        </EntitySwitch>
    </div>
    )}
    </div>
    )
}

export default Resilience4j;