
import { Typography, Card, Paper, CardHeader, Divider, CardContent, Alert,} from '@mui/material';
import 'bootstrap/dist/css/bootstrap.min.css';
import cssClasses from './AzureDevopsWoorkitemPageCss';
import PluginVersion from '../PluginVersion/PluginVersion';

const Spacer = () => <div className="mb-4" />;

const AzureDevopsInfoContent = ({ graphDataError, projectDetailsError, workitemCountError, workitemCounts, issuesBarChart, reqByPriBarChart, projectName}) => {
    const classes = cssClasses();
        return (
          <div className={`${classes.jiraInfoContent}`}>
            {graphDataError && projectDetailsError && workitemCountError && (
              <div>
                <Card>
                  <CardHeader
                    title={<Typography variant="h6">Error</Typography>}
                  />
                  <Divider />
                  <CardContent>
                    <Paper role="alert" elevation={0}>
                      <Alert severity="error">{graphDataError}</Alert>
                      <Alert severity="error">{workitemCountError}</Alert>
                      <Alert severity="error">{projectDetailsError}</Alert>
                    </Paper>
                  </CardContent>
                </Card>
                <Spacer />
              </div>
            )}
            {graphDataError && !projectDetailsError && !workitemCountError && (
              <div>
                <Card>
                  <CardHeader
                    title={<Typography variant="h6">Error</Typography>}
                  />
                  <Divider />
                  <CardContent>
                    <Paper role="alert" elevation={0}>
                      <Alert severity="error">{graphDataError}</Alert>
                    </Paper>
                  </CardContent>
                </Card>
                <Spacer />
              </div>
            )}
            {!graphDataError && !workitemCountError && projectDetailsError && (
              <div>
                <Card>
                  <CardHeader
                    title={<Typography variant="h6">Error</Typography>}
                  />
                  <Divider />
                  <CardContent>
                    <Paper role="alert" elevation={0}>
                      <Alert severity="error">{projectDetailsError}</Alert>
                    </Paper>
                  </CardContent>
                </Card>
                <Spacer />
              </div>
            )}
            {!graphDataError && !projectDetailsError && workitemCountError && (
              <div>
                <Card>
                  <CardHeader
                    title={<Typography variant="h6">Error</Typography>}
                  />
                  <Divider />
                  <CardContent>
                    <Paper role="alert" elevation={0}>
                      <Alert severity="error">{workitemCountError}</Alert>
                    </Paper>
                  </CardContent>
                </Card>
                <Spacer />
              </div>
            )}
            {!graphDataError && !projectDetailsError && !workitemCountError && (
              <div className={`${classes.infoContPrjName}`}>
                <div>
                  <Typography
                    variant="h6"
                    className={`${classes.infoContPrjNameContent}`}
                  >
                    Azure DevOps Project Name: {projectName}
                  </Typography>
                </div>
                <div>
                  <PluginVersion />
                </div>
              </div>
            )}
          </div>
        );
    }
export default AzureDevopsInfoContent;
