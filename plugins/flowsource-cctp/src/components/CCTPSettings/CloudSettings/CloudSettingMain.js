import { useState, useEffect, React } from 'react';
import {  Accordion, AccordionDetails, AccordionSummary, Grid, Typography } from '@material-ui/core';

import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import cssClasses from '../../TestExecutionPage/TestingMainPageCSS.js';
import AwsPageMain from './AWS/AwsPageMain.js';
import AwsPageNew from './AWS/AwsPageNew.js';

const CloudSettingsMain = (prop) => {
    const classes = cssClasses();
    const [activeAWSComponent, setActiveAWSComponent] = useState('awsPageMain');
    const [frameworkTableData, setFrameworkTableData] = useState([]);
    const [serviceTableData, setServiceTableData] = useState([]);
    const [awsServiceId, setAwsServiceId] = useState(null);
    const [propValues, setPropValues] = useState({});
    useEffect(() => {
      prop.setActiveTab('cloudsettings');
    }, []);
    const handleTabChange = () => {
      setActiveAWSComponent('awsPageNew');
    };
  
    return (
      <div>
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
            <Typography style={{ fontSize: '0.90rem', color: '#13215E', fontWeight: '550' }}>AWS</Typography>
          </AccordionSummary>
          <AccordionDetails className={`${classes.accordianDisplay}`}>
            <Typography>
              <Grid container>
                <Grid item sm={12}>
                {activeAWSComponent === 'awsPageMain' && <AwsPageMain setActiveTab={prop.setActiveTab} setActiveAWSComponent={setActiveAWSComponent} serviceTableData={serviceTableData} setServiceTableData={setServiceTableData} setAwsServiceId={setAwsServiceId} />}
                {activeAWSComponent === 'awsPageNew' && <AwsPageNew setActiveTab={prop.setActiveTab} setActiveAWSComponent={setActiveAWSComponent} setServiceTableData={setServiceTableData} awsServiceId={awsServiceId}  />}
                </Grid>
              </Grid>
            </Typography>
          </AccordionDetails>
        </Accordion>
      </div>
    );
  };

export default CloudSettingsMain;