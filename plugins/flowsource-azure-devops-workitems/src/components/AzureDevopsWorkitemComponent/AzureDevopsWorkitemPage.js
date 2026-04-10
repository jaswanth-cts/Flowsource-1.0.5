import { useState, useEffect } from 'react';
import { configApiRef, useApi, fetchApiRef } from '@backstage/core-plugin-api';

import {
  Grid,
  Typography,
  Card,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from '@mui/material';
import 'bootstrap/dist/css/bootstrap.min.css';
import cssClasses from './AzureDevopsWoorkitemPageCss';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { useEntity } from '@backstage/plugin-catalog-react';
import IssueStatusBarChart from './IssueStatusBarChart';
import RequestByPriorityBarChart from './RequestByPriorityBarChart';
import AzureDevopsTableContent from './AzureDevopsTableContent';
import AzureDevopsInfoContent from './AzureDevopsInfoContent';
import PluginVersion from '../PluginVersion/PluginVersion';

import log from 'loglevel';

const Spacer = () => <div className="mb-4" />;

const AzureDevopsWorkitemPage = () => {
  const classes = cssClasses();
  const { fetch } = useApi(fetchApiRef);
  const config = useApi(configApiRef);
  const backendBaseApiUrl =
    config.getString('backend.baseUrl') + '/api/devopsworkitems/';
  const entity = useEntity();
  const projectName =
    entity.entity.metadata.annotations['flowsource/azure-devops-project-key'];
  const durationDaysCatalog =
    entity.entity.metadata.annotations['flowsource/durationInDays'];
  const queryId =
    entity.entity.metadata.annotations?.['flowsource/azure-devops-queryId'] ??
    '';
  const azureDevopsFilterFieldKey =
    entity.entity.metadata.annotations?.[
      'flowsource/azure-devops-Filter-Field-Key'
    ] ?? '';
  const azureDevopsFilterFieldValue =
    entity.entity.metadata.annotations?.[
      'flowsource/azure-devops-Filter-Field-value'
    ] ?? '';

  const [workitemCounts, setWorkitemCounts] = useState([]);
  const [issuesBarChart, setIssuesBarChart] = useState([
    {
      statusName: '',
      count: 0,
    },
  ]);
  const [reqByPriBarChart, setReqByPriBarChart] = useState([
    {
      type: '',
      typeValues: [],
    },
  ]);

  const [graphDataError, setGraphDataError] = useState(null);
  const [workitemCountError, setWorkitemCountError] = useState(null);
  const [, setTypeDetailsError] = useState(null);
  const [isLoading, setLoading] = useState(true);
  const [isGraphLoading, setGraphLoading] = useState(true);
  const [workItemStates, setWorkItemStates] = useState([]);
  const [workItemTypes, setWorkItemTypes] = useState([]);
  const [expanded, setExpanded] = useState(false);

  const [isAzureDevOpsPageError, setAzureDevOpsPageError] = useState(false);
  const [azureDevOpsPageErrMessgae, setAzureDevOpsPageErrMessage] = useState('');

  async function fetchGraphData() {
    // fetch graph data
    const workitemDetails = await fetch(
      `${backendBaseApiUrl}graphData?projectName=${projectName}&durationDaysCatalog=${durationDaysCatalog}&queryId=${queryId}&azureDevopsFilterFieldKey=${azureDevopsFilterFieldKey}&azureDevopsFilterFieldValue=${azureDevopsFilterFieldValue}`,
    );

    if (workitemDetails.ok) {
      const workitemDetailsResponse = await workitemDetails.json();
      setIssuesBarChart(workitemDetailsResponse.workItemTypeCountByStatus);
      setReqByPriBarChart(workitemDetailsResponse.workItemTypeCountByPriority);
      setGraphDataError(workitemDetailsResponse.error);

      // set workitem count details
      const totalWorkItems = [];
      let totalWorkItemCount = 0;
      workitemDetailsResponse.workItemTypeCountByPriority.forEach(element => {
        const workItemCount = element.typeValues.reduce(
          (total, current) => total + current,
        );
        totalWorkItemCount += workItemCount;
        totalWorkItems.push({ key: element.type, value: workItemCount });
      });
      setWorkitemCounts(totalWorkItems);
      setWorkitemCountError(workitemDetailsResponse.error);
      setGraphLoading(false);
    } else if (workitemDetails.status === 503) {
      setGraphDataError(
        `This plugin has not been configured with the required values. Please ask your administrator to configure it.`,
      );
      setGraphLoading(false);
    } else {
      log.error('Error fetching graph data:', workitemDetails.statusText);
      setGraphDataError(
        `Error fetching graph data, with status code ${workitemDetails.status} `,
      );
      setGraphLoading(false);
    }

    getCardItemAlignment();
  }

  async function fetchTableData() {
    // fetch status details
    const statusDetails = await fetch(
      `${backendBaseApiUrl}statuses?projectName=${projectName}`,
    );

    if (statusDetails.ok) {
      const result = await statusDetails.json();

      setWorkItemStates(result.workItemStates);
      setLoading(false);
    }
    else if (statusDetails.status === 404) {
      const errorText = await statusDetails.text();

      if (errorText.includes(`Project '${projectName}' not found.`))
      {
        setLoading(false);

        setAzureDevOpsPageError(true);
        setAzureDevOpsPageErrMessage("No project could be found with name \"" + projectName + "\" in Azure-DevOps. Please check the project key and try again.");
        return;
      }
    }
    else {
      log.error('Error fetching status data:', statusDetails.statusText);
      setLoading(false);
    }

    const typeDetails = await fetch(
      `${backendBaseApiUrl}workitemTypes?projectName=${projectName}`,
    );

    if (typeDetails.ok) {
      const result = await typeDetails.json();

      setWorkItemTypes(result.workItemTypes);
      setTypeDetailsError(result.error);
      setLoading(false);
    } else if (statusDetails.status === 503) {
      setTypeDetailsError(
        `This plugin has not been configured with the required values. Please ask your administrator to configure it.`,
      );
      setLoading(false);
    } else {
      log.error('Error fetching status data:', statusDetails.statusText);
      setTypeDetailsError(
        `Error fetching status data, with status code ${statusDetails.status} `,
      );
      setLoading(false);
    }
  }

  const [alignCardItems, setalignCardItems] = useState('col-2');

  const getCardItemAlignment = () => {
    if (workitemCounts.length == 3) {
      setalignCardItems('col-4');
    } else if (workitemCounts.length == 4) {
      setalignCardItems('col-3');
    } else if (workitemCounts.length == 5) {
      setalignCardItems('col-3');
    } else if (workitemCounts.length == 6) {
      setalignCardItems('col-2');
    } else {
      setalignCardItems('col-2');
    }
  };

  useEffect(async () => {
    fetchTableData();
  }, []);

  const handleAccordionChange = (event, isExpanded) => {
    setExpanded(isExpanded);
    if (isExpanded) {
      fetchGraphData(); // Fetch graph data only when accordion is expanded
    }
  };

  const AzureDevopsGraphContent = generateGraphContent({
    classes,
    graphDataError,
    workitemCountError,
    workitemCounts,
    alignCardItems,
    issuesBarChart,
    reqByPriBarChart,
  });

  function renderAzureDevOpsPage() {
    if (isLoading) {
      return (
        <div className={`App p-3 ${classes.isLoadingStyle}`} >
          Loading...
        </div>
      );
    } else if(isAzureDevOpsPageError) {
      return (
        <>
          <AzureDevOpsHeadingComponet projectName={projectName} />
          <AzureErrorPage azureDevOpsPageErrMessgae={azureDevOpsPageErrMessgae} />
        </>
      );
    } else {
      return (
        <div className={`${classes.devopsMainCointainer}`}>
          <Grid container>
            <Grid item md={12}>
              <AzureDevopsInfoContent
                graphDataError={graphDataError}
                workitemCountError={workitemCountError}
                workitemCounts={workitemCounts}
                issuesBarChart={issuesBarChart}
                reqByPriBarChart={reqByPriBarChart}
                projectName={projectName}
              />
            </Grid>
            <Grid item md={12}>
              <AzureDevopsTableContent workItemStates={workItemStates} workItemTypes={workItemTypes} />
              <Spacer />
            </Grid>
            <Grid item md={12}>
              <Accordion expanded={expanded} onChange={handleAccordionChange}>
                <AccordionSummary
                  style={{ backgroundColor: '#92bbe6' }}
                  expandIcon={<ExpandMoreIcon />}
                  aria-controls="panel1-content"
                  id="panel1-header"
                >
                  <Typography>Workitem Metrics</Typography>
                </AccordionSummary>
                <AccordionDetails>
                  {isGraphLoading ? (
                    <Typography
                      variant="body1"
                      style={{
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'flex-start',
                      }}
                    >
                      Loading...
                    </Typography>
                  ) : (
                    expanded &&
                    // selectedAzureDevopsProj &&
                    // Object.keys(selectedAzureDevopsProj).length > 0 && (
                    <AzureDevopsGraphContent />
                    // )
                  )}
                </AccordionDetails>
              </Accordion>
            </Grid>
          </Grid>
        </div>
      );
    }
  }

  return (
    <>
      { renderAzureDevOpsPage() }
    </>
  );
};

export default AzureDevopsWorkitemPage;

// Group related parameters into an object
function generateGraphContent({
  classes,
  graphDataError,
  workitemCountError,
  workitemCounts,
  alignCardItems,
  issuesBarChart,
  reqByPriBarChart,
}) {
  return () => {
    const setColor = index => {
      index = index % 6; //Reseting the index to 0,1,2...
      if (index === 0) {
        return '#ff7b7b';
      } else if (index === 1) {
        return '#e7b2fe';
      } else if (index === 2) {
        return '#3f4ef0';
      } else if (index === 3) {
        return '#fcbf09';
      } else if (index === 4) {
        return '#37CBB0';
      } else if (index === 5) {
        return '#7cb943';
      }
    };
    let arrayIndexCounter = 0;
    return (
      <div className={`${classes.jiraInfoContent}`}>
        {!graphDataError && !workitemCountError && (
          <div>
            {/* ------------ Total count cards------------ */}
            <div className={`${classes.infoContPrjItems}`}>
              <div className={`row`}>
                {workitemCounts.map((card, index) => (
                  <div className={`${alignCardItems}`} key={"Total Count of cards" + arrayIndexCounter++}>
                  <Card
                      variant="outlined"
                      className={`${classes.infoContPrjItemsCards}`}
                    >
                      <div className={`${classes.infoContPrjIcon}`}>
                        <div
                          style={{
                            backgroundColor: setColor(index),
                            width: '15%',
                          }}
                        />
                        <div className={`${classes.infoContPrjIconContent}`}>
                          <Typography className={`${classes.devopsIconName}`}>
                            {card.key}
                          </Typography>
                          <p className={`${classes.devopsIconIconValue}`}>
                            {card.value}
                          </p>
                        </div>
                      </div>
                    </Card>
                  </div>
                ))}
              </div>
            </div>

            {/* ------------ Graphs ------------ */}
            <div className={`row`}>
              <div className={`col-6`}>
                <Card variant="outlined" className={`${classes.chartCards}`}>
                  <Typography
                    variant="body1"
                    className={`${classes.chartCardHeading}`}
                  >
                    Workitems by Status
                  </Typography>
                  <IssueStatusBarChart values={issuesBarChart} />
                </Card>
              </div>
              <div className={`col-6`}>
                <Card variant="outlined" className={`${classes.chartCards}`}>
                  <Typography
                    variant="body1"
                    className={`${classes.chartCardHeading}`}
                  >
                    Workitems by Priority
                  </Typography>
                  <RequestByPriorityBarChart values={reqByPriBarChart} />
                </Card>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };
}

const AzureDevOpsHeadingComponet = ({ projectName }) => {

  const classes = cssClasses();

  return (
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
  );
};

const AzureErrorPage = ({ azureDevOpsPageErrMessgae }) => {

  return (
    <div className="card ms-0 me-0 mb-2 mt-2">
      <div className="card-header">
        <h6 className="mb-0">Error</h6>
      </div>
      <div className="card-body">
        <div className="alert alert-danger mt-2 mb-2" role="alert">
          { azureDevOpsPageErrMessgae }
        </div>
      </div>
    </div>
  );
};