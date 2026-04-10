import cssClasses from './CopilotPageCss';
import { useState, useEffect, React } from 'react';
import { useApi, configApiRef, fetchApiRef } from '@backstage/core-plugin-api';
import BarChart from './BarChart';
import LineChart from './LineChart';
import UserChart from './UserChart';

import {
  Header,
  Page,
  Content,
} from '@backstage/core-components';
import {
  Paper, Card, CardHeader, Typography, Divider, CardContent, Alert, Grid
} from '@mui/material';

import PluginVersion from '../PluginVersion/PluginVersion';
import log from 'loglevel';

const DisplayNoData = () => {
  return (
    <div className={`${classes.displayError}`}> No Data Found ! </div>
  )
}
const NoDataFound = () => {
  return (
    <>
      <DisplayNoData />
    </>
  )
};
const Spacer = () => <div className="mb-4" />; // Spacer component

function CopilotPage() {
  const { fetch } = useApi(fetchApiRef);
  const classes = cssClasses();
  const [githubCopilotData, setGithubCopilotData] = useState({});
  const [isLoading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dataAvailable, setDataAvailable] = useState(false);
  const config = useApi(configApiRef);
  const backendBaseApiUrl = config.getString('backend.baseUrl') + '/api/flowsource-github-copilot/';
  
  const fetchAllData = async () => {
    try {
      const githubCopilotResponse = await fetch(backendBaseApiUrl + 'copilot-usage');

      if (githubCopilotResponse.status === 503) {
        setLoading(false);
        setError('This plugin has not been configured with the required values. Please ask your administrator to configure it.');
        return;
      }

      const copilotResponse = await githubCopilotResponse.json();    

      setGithubCopilotData(copilotResponse);
      setLoading(false);
      setDataAvailable(true);
    } catch (error) {
      setLoading(false);
      setDataAvailable(false);
      log.error('Error:', error);

    }
  };

  useEffect(() => {
    setLoading(true);
    fetchAllData();
  }, []);


  return (
    <div>
        {error ? ( 
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
                 ) : (
                    <>
    <Page>
      <Header title='Code Companion' />
      <Content>
      <Grid container>
      <Grid item md={12} >
        <Grid container spacing={1}>
            <Grid item xs={`9`} md={12} >
              <div className={`${classes.pluginHeading}`}>
                <div>
                  <h2 className={`${classes.title}`} >Code companion usage metrics</h2>
                </div>
                <div>
                  <PluginVersion />
                </div>
              </div>
            </Grid>
        </Grid>
        </Grid>
        </Grid>
        <div>
          {(githubCopilotData && Object.keys(githubCopilotData).length !== 0 && githubCopilotData !== null && githubCopilotData !== undefined) ? (
            <div className={`w-100`}>
              <div className={`row mt-2`} style={{border: '2px'}}>
                <div className={`card ${classes.cardCss}`}>
                  <div className={`card-text ms-2 mt-2`}>
                    <div className={`ms-1 mb-2`}><b>By Language</b></div>
                    <BarChart values={githubCopilotData.langMetrics} chartType='language'/>
                  </div>
                </div>
              </div>
              <div className={`row mt-2`}>
                <div className={`card ${classes.cardCss}`}>
                  <div className={`card-text ms-2 mt-2`}>
                    <div className={`ms-1 mb-2`}><b>By Editor</b></div>
                    <BarChart values={githubCopilotData.editorMetrics} />
                  </div>
                </div>
              </div>
              <div className={`row mt-2`}>
                <div className={`w-50`}>
                  <div className={`card ${classes.cardCss}`}>
                    <div className={`card-text ms-2 mt-2`}>
                      <div className={`ms-1 mb-2`}><b>Chat Usage Trend</b></div>
                      <LineChart values={githubCopilotData.chatMetrics} trendDays='5'/>
                    </div>
                  </div>
                </div>
                <div className={`w-50`}>
                  <div className={`card ${classes.cardCss}`}>
                    <div className={`card-text ms-2 mt-2`}>
                      <div className={`ms-1 mb-2`}><b>User Trend</b></div>
                      <UserChart values={githubCopilotData.userMetrics} trendDays='5'/>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )
            : (<>
            {!isLoading && !dataAvailable && <NoDataFound />}
            {isLoading && <div>Loading...</div>}
            </>
            )}
        </div>
        
      </Content>
    </Page>
    </>
      )}
    </div>
  );
};

export default CopilotPage;