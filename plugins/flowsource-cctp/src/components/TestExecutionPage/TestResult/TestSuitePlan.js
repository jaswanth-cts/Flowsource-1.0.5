import { React } from 'react';
import { useEntity } from '@backstage/plugin-catalog-react';
import {  EmptyState } from '@backstage/core-components';
import { Accordion, AccordionDetails, AccordionSummary, Grid, Typography } from '@material-ui/core';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import cssClasses from '../TestingMainPageCSS.js';
import TestingExecutionMainPage from './TestingExecutionMainPage.js'
import MaintenanceReportMainPage from '../MaintenanceReport/MaintenanceReportMainPage.js';
import FailureTrendAnalysis from '../FailureTrendAnalysis/FailureTrendAnalysis.js';
import ClientSidePerformanceAccessibilityMain from '../ClientSidePerformanceAccessibility/ClientSidePerformanceAccessibilityMain.js';

import {
    EntitySwitch,
} from '@backstage/plugin-catalog';
import Chart from 'chart.js/auto';

const TestSuitePlan = () => {
    const classes = cssClasses();

    const entity = useEntity();
    const annotations = entity.entity.metadata.annotations;

    // Check if the specific annotation for CCTP exists
    const shouldRenderCCTPPage = !!annotations && 'flowsource/CCTP-project-name' in annotations
        && annotations['flowsource/CCTP-project-name'].trim().length > 0;

    return (
        <div>
            {shouldRenderCCTPPage ? (
                <>
                    <Accordion>
                        <AccordionSummary className={`${classes.accordianSummary}`}
                            style={{
                                minHeight: '52px',
                            }}
                            sx={{
                                '&.Mui-expanded': {
                                    minHeight: '52px !important',
                                },
                            }}
                            expandIcon={<ExpandMoreIcon />} aria-controls="panel1a-content" id="panel1a-header" >
                            <Typography style={{ fontSize: '0.90rem', color: '#13215E', fontWeight: '550' }}>TEST RESULT</Typography>
                        </AccordionSummary>
                        <AccordionDetails className={`${classes.accordianDisplay}`}>
                            <Typography>
                                <Grid container>
                                    <Grid item sm={12}>
                                        <TestingExecutionMainPage />
                                    </Grid>
                                </Grid>
                            </Typography>
                        </AccordionDetails>
                    </Accordion>
                    <Accordion>
                        <AccordionSummary className={`${classes.accordianSummary}`}
                            expandIcon={<ExpandMoreIcon />} aria-controls="panel1a-content" id="panel1a-header">
                            <Typography style={{ fontSize: '0.90rem', color: '#13215E', fontWeight: '550' }}>MAINTENANCE REPORT</Typography>
                        </AccordionSummary>
                        <AccordionDetails className={`${classes.accordianDisplay}`}>
                            <Typography>
                                <Grid container>
                                    <Grid item sm={12}>
                                        < MaintenanceReportMainPage />
                                    </Grid>
                                </Grid>
                            </Typography>
                        </AccordionDetails>
                    </Accordion>
                    <Accordion>
                        <AccordionSummary className={`${classes.accordianSummary}`}
                            expandIcon={<ExpandMoreIcon />} aria-controls="panel1a-content" id="panel1a-header">
                            <Typography style={{ fontSize: '0.90rem', color: '#13215E', fontWeight: '550' }}>FAILURE TREND ANALYSIS</Typography>
                        </AccordionSummary>
                        <AccordionDetails className={`${classes.accordianDisplay}`}>
                            <Typography>
                                <Grid container>
                                    <Grid item sm={12}>
                                        <FailureTrendAnalysis />
                                    </Grid>
                                </Grid>
                            </Typography>
                        </AccordionDetails>
                    </Accordion>
                    <Accordion>
                        <AccordionSummary className={`${classes.accordianSummary}`}
                            style={{ minHeight: '52px' }}
                            sx={{ '&.Mui-expanded': { minHeight: '52px !important', } }}
                            expandIcon={<ExpandMoreIcon />} aria-controls="panel1a-content" id="panel1a-header" >
                            <Typography style={{ fontSize: '0.90rem', color: '#13215E', fontWeight: '550' }}>CLIENT SIDE PERFORMANCE & ACCESSIBILITY</Typography>
                        </AccordionSummary>
                        <AccordionDetails className={`${classes.accordianDisplay}`}>
                            <Grid container>
                                <Grid item sm={12}>
                                    <ClientSidePerformanceAccessibilityMain />

                                </Grid>
                            </Grid>
                        </AccordionDetails>
                    </Accordion>
                </>
            ) : (
                <div className='mt-3 ms-3 me-3 mb-4'>
                    <EntitySwitch>
                        <EntitySwitch.Case>
                            <EmptyState
                                title="No Reports page is available for this entity."
                                missing="info"
                                description="You need to add an annotation to your component if you want to see CCTP Reports page for it."
                            />
                        </EntitySwitch.Case>
                    </EntitySwitch>
                </div>
            )}
        </div>
    );
};

export default TestSuitePlan;