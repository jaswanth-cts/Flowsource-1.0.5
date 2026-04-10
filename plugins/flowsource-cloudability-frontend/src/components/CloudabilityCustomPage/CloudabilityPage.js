
import React, { useState, useEffect } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import cssClasses from './CloudabilityPageCss';

import { configApiRef, useApi, fetchApiRef } from '@backstage/core-plugin-api';
import { useEntity } from '@backstage/plugin-catalog-react';
import {
  Paper,
  Card,
  CardHeader,
  Typography,
  Divider,
  CardContent,
  Alert,
} from '@mui/material';
import dollar from './Icons/dollar.svg';
import total_cost_icon from './Icons/total_cost_icon.png';
import total_savings_icon from './Icons/total_savings_icon.png';
import up_arrow from './Icons/up_arrow.png';
import down_arrow from './Icons/down_arrow.png';
import { EntitySwitch } from '@backstage/plugin-catalog';
import { EmptyState } from '@backstage/core-components';
import PluginVersion from '../PluginVersion/PluginVersion';
import { Link } from '@material-ui/core';
import OpenInNewIcon from '@material-ui/icons/OpenInNew';

import log from 'loglevel';

const Spacer = () => <div className="mb-4" />; // Spacer component

const CloudabilityPage = () => {
  const classes = cssClasses();
  const { fetch } = useApi(fetchApiRef);
  const title = 'Apptio Cloudability';
  const [totalCost, setTotalCost] = useState({});
  const [costDiff, setCostDiff] = useState({});
  const [costSavings, setCostSavings] = useState({});
  const [adhocCost, setAdhocCost] = useState();
  const [loadingTotalCost, setLoadingTotalCost] = useState(true);
  const [loadingCostSavings, setLoadingCostSavings] = useState(true);
  const [loadingAdhocCost, setLoadingAdhocCost] = useState(true);
  const [totalCostError, setTotalCostError] = useState(null);
  const [costSavingsError, setCostSavingsError] = useState(null);
  const [adhocCostError, setAdhocCostError] = useState(null);

  const config = useApi(configApiRef);
  const backendBaseApiUrl =
    config.getString('backend.baseUrl') + '/api/flowsource-cloudability/';
  const entity = useEntity();
  const dimensionEnv =
    entity.entity.metadata.annotations['flowsource/cloudability-dimension-env'];
  const dimensionAppId =
    entity.entity.metadata.annotations[
    'flowsource/cloudability-dimension-appid'
    ];
  const dimensionDeploymentType =
    entity.entity.metadata.annotations[
    'flowsource/cloudability-dimension-deploymentType'
    ];
  const envType =
    entity.entity.metadata.annotations['flowsource/cloudability-prod-tag'];
  const appId =
    entity.entity.metadata.annotations['flowsource/cloudability-appid'];
  const view =
    entity.entity.metadata.annotations['flowsource/cloudability-view'];
  const cloudProvider =
    entity.entity.metadata.annotations['flowsource/cloud-provider'];
  const [viewId, setViewId] = useState(null);
  const projectUrl = config.getString('cloudability.projectUrl');
  const kindType = entity.entity.kind;
  const cloudabilityProjectUrl =
    projectUrl +
    `/cloudability#/reports/report?category=Cost+Allocation&custom=true&dimensions=year_month&dimensions=${dimensionEnv}&dimensions=${dimensionAppId}&end_date=23%3A59%3A59&filters=${dimensionEnv}%21%3D%28not+set%29&filters=${dimensionAppId}%3D%3D${appId}&filters=${dimensionEnv}%3D%3D${envType}&id=${viewId}&limit=50&metrics=unblended_cost&order=desc&owned_by_user=true&shared=false&shared_with_organization=false&sort_by=year_month&star=false&start_date=1st`;
  const [error, setError] = useState(null);
  //get viewId
  async function fetchViewId() {
    try {
      // Fetch viewId data
      const viewIdRes = await fetch(backendBaseApiUrl + 'view-id?view=' + view);
      if (viewIdRes.ok) {
        const viewId = await viewIdRes.json();
        log.info('viewId', viewId);
        setViewId(viewId.viewId);
      }
    } catch (error) {
      log.error('Error:', error);
    }
  }

  async function fetchTotalCost() {
    try {
      // Fetch total cost data
      const costRes = await fetch(
        backendBaseApiUrl +
        'total-cost?dimensionEnv=' +
        dimensionEnv +
        '&dimensionAppId=' +
        dimensionAppId +
        '&envType=' +
        envType +
        '&appId=' +
        appId +
        '&view=' +
        view,
      );

      if (costRes.ok) {
        const cost = await costRes.json();
        setTotalCost(cost.total_cost_current_month); //total cost for current month
        setCostDiff(cost.costDiff); //cost difference between current month and previous month
      } else if (costRes.status === 503) {
        log.error('Service unavailable:', costRes.statusText);
        setError(
          'This plugin has not been configured with the required values. Please ask your administrator to configure it.',
        );
      } else {
        setTotalCostError(
          `Error fetching in total cost, with status code ${costRes.status} `,
        );
      }

      setLoadingTotalCost(false);
    } catch (error) {
      log.error('Error:', error);
      setTotalCost(error.message);
    }
  }

  async function fetchCostSavingsOpportunity() {
    try {
      // Fetch total cost savings data
      const costSavingRes = await fetch(
        backendBaseApiUrl +
        'cost-savings?dimensionEnv=' +
        dimensionEnv +
        '&dimensionAppId=' +
        dimensionAppId +
        '&envType=' +
        envType +
        '&appId=' +
        appId +
        '&view=' +
        view +
        '&cloudProvider=' +
        cloudProvider +
        '&kindType=' +
        kindType,
      );

      if (costSavingRes.ok) {
        const costSavings = await costSavingRes.json();

        setCostSavings(costSavings); //total cost saving opportunity
      } else if (costSavingRes.status === 503) {
        log.error('Service unavailable:', costSavingRes.statusText);
        setError(
          'This plugin has not been configured with the required values. Please ask your administrator to configure it.',
        );
      } else {
        setCostSavingsError(
          ...`Error fetching cost saving data, with status code ${costSavingRes.status} `,
        );
      }

      setLoadingCostSavings(false);
    } catch (error) {
      log.error('Error:', error);
      setLoadingCostSavings(false);
      setCostSavingsError(error.message);
    }
  }

  async function fetchAdhocCost() {
    try {
      // Fetch adhoc cost data
      const adhocCostRes = await fetch(
        backendBaseApiUrl +
        'adhoc-cost?dimensionDeploymentType=' +
        dimensionDeploymentType +
        '&dimensionAppId=' +
        dimensionAppId +
        '&appId=' +
        appId +
        '&view=' +
        view,
      );

      if (adhocCostRes.ok) {
        const adhocCost = await adhocCostRes.json();

        setAdhocCost(adhocCost); //adhoc cost
      } else if (adhocCostRes.status === 503) {
        log.error('Service unavailable:', adhocCostRes.statusText);
        setError(
          'This plugin has not been configured with the required values. Please ask your administrator to configure it.',
        );
      } else {
        setAdhocCostError(
          ...`Error fetching adhoc cost data, with status code ${adhocCostRes.status} `,
        );
      }

      setLoadingAdhocCost(false);
    } catch (error) {
      log.error('Error:', error);
      setLoadingAdhocCost(false);
      setAdhocCostError(error.message);
    }
  }

  useEffect(async () => {
    fetchTotalCost();
    fetchCostSavingsOpportunity();
    fetchAdhocCost();
    fetchViewId();
  }, []);

  const getArrow = env => {
    if (costDiff[env].sign === '+') {
      return up_arrow;
    } else if (costDiff[env].sign === '-') {
      return down_arrow;
    } else {
      return null;
    }
  };

  const renderError = () => (
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
  );
  const areDimensionsValid = () => {
    return [dimensionEnv, dimensionAppId, envType, appId, view].every(
      value => value !== undefined && value !== null,
    );
  };

  const renderLoading = () => (
    <p className={`${classes.loadingText}`}>Loading...</p>
  );

  const renderErrorCard = () => (
    <p className={`${classes.cardsValueText}`}>-</p>
  );

  const renderCostSavings = savings => (
    <p className={`${classes.cardsValueText}`}>
      {savings !== undefined ? savings : '-'}
      <img
        src={dollar}
        className={`${classes.cardsDollarIcon}`}
        alt="Dollar Icon"
      />
    </p>
  );

  const renderTotalCost = (cost, type) => (
    <>
      <p className={`${classes.cardsValueText}`}>
        {cost !== undefined ? cost : '-'}
        <img
          src={dollar}
          className={`${classes.cardsDollarIcon}`}
          alt="Dollar Icon"
        />
      </p>
      {costDiff[type] && costDiff[type].value !== undefined ? (
        <>
          <img
            src={getArrow(type)}
            className={`${classes.cardsArrowIcon}`}
            alt="Arrow Icon"
          />
          <p className={`${classes.cardsCostDiffText}`}>
            {costDiff[type].value}$
          </p>
        </>
      ) : (
        <p className={`${classes.cardsCostDiffText}`}>-</p>
      )}
    </>
  );

  // Helper methods
  const renderTotalCostProd = () => {
    if (loadingTotalCost) {
      return renderLoading();
    } else if (totalCostError) {
      return renderErrorCard();
    } else {
      return renderTotalCost(totalCost['prod'], 'prod');
    }
  };

  const renderCostSavingsProd = () => {
    if (loadingCostSavings) {
      return renderLoading();
    } else if (costSavingsError) {
      return renderErrorCard();
    } else {
      return renderCostSavings(costSavings['prod']);
    }
  };

  const renderTotalCostNonProd = () => {
    if (loadingTotalCost) {
      return renderLoading();
    } else if (totalCostError) {
      return renderErrorCard();
    } else {
      return renderTotalCost(totalCost['non-prod'], 'non-prod');
    }
  };

  const renderCostSavingsNonProd = () => {
    if (loadingCostSavings) {
      return renderLoading();
    } else if (costSavingsError) {
      return renderErrorCard();
    } else {
      return renderCostSavings(costSavings['non-prod']);
    }
  };

  const renderAdhocCost = () => {
    if (loadingAdhocCost) {
      return renderLoading();
    } else if (adhocCostError) {
      return renderErrorCard();
    } else {
      return (
        <p className={`${classes.cardsValueText}`}>
          {adhocCost !== undefined ? adhocCost : '-'}
          <img
            src={dollar}
            className={`${classes.cardsDollarIcon}`}
            alt="Dollar Icon"
          />
        </p>
      );
    }
  };

  return (
    <div>
      {error ? (
        renderError()
      ) : (
        <>
          {areDimensionsValid() ? (
            <div>
              <div className={`row`}>
                <div className={`col-12 ${classes.headingDiv}`}>
                  <h5>
                    <p> {title} </p>
                  </h5>
                  <div className={`${classes.headingLink}`}>
                    <Link
                      href={cloudabilityProjectUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={classes.cloudabilityLink}
                    >
                      <b>
                        View Report <OpenInNewIcon fontSize="small" />
                      </b>
                    </Link>
                    <PluginVersion />
                  </div>
                </div>
              </div>
              <div>
                <div>
                  <div>
                    <div className={`row`}>
                      <div className={`col-12`}>
                        <h5>
                          <p>Production</p>
                        </h5>
                      </div>
                    </div>
                    <div className={`${classes.cardItems}`}>
                      <Card
                        variant="outlined"
                        className={`${classes.cards}`}
                        style={{ backgroundColor: '#FFFFFF' }}
                      >
                        <div className={`${classes.cardsTitle}`}>
                          <img
                            src={total_cost_icon}
                            className={`${classes.cardsTitleImg}`}
                            alt="Total Cost Icon"
                          />
                          <Typography className={`${classes.cardsTitleText}`}>
                            Total Cost
                          </Typography>
                        </div>
                        <div className={`${classes.cardsValue}`}>
                          {renderTotalCostProd()}
                        </div>
                      </Card>
                      <Card
                        variant="outlined"
                        className={`${classes.cards}`}
                        style={{ backgroundColor: '#FFFFFF', marginLeft: '8%' }}
                      >
                        <div className={`${classes.cardsTitle}`}>
                          <img
                            src={total_savings_icon}
                            className={`${classes.cardsTitleImg}`}
                          ></img>
                          <Typography className={`${classes.cardsTitleText}`}>
                            Total Cost Savings Opportunity
                          </Typography>
                        </div>
                        <div className={`${classes.cardsValue}`}>
                          {renderCostSavingsProd()}
                        </div>
                      </Card>
                    </div>
                  </div>
                  <Spacer />
                  <div>
                    <div className={`row`}>
                      <div className={`col-12`}>
                        <h5>
                          <p>Non Prod</p>
                        </h5>
                      </div>
                    </div>
                    <div className={`${classes.cardItems}`}>
                      <Card
                        variant="outlined"
                        className={`${classes.cards}`}
                        style={{ backgroundColor: '#FFFFFF' }}
                      >
                        <div className={`${classes.cardsTitle}`}>
                          <img
                            src={total_cost_icon}
                            className={`${classes.cardsTitleImg}`}
                            alt="Total Cost Icon"
                          />
                          <Typography className={`${classes.cardsTitleText}`}>
                            Total Cost
                          </Typography>
                        </div>
                        <div className={`${classes.cardsValue}`}>
                          {renderTotalCostNonProd()}
                        </div>
                      </Card>
                      <Card
                        variant="outlined"
                        className={`${classes.cards}`}
                        style={{ backgroundColor: '#FFFFFF', marginLeft: '8%' }}
                      >
                        <div className={`${classes.cardsTitle}`}>
                          <img
                            src={total_savings_icon}
                            className={`${classes.cardsTitleImg}`}
                          ></img>
                          <Typography className={`${classes.cardsTitleText}`}>
                            Total Cost Savings Opportunity
                          </Typography>
                        </div>
                        <div className={`${classes.cardsValue}`}>
                          {renderCostSavingsNonProd()}
                        </div>
                      </Card>
                    </div>
                  </div>
                  <Spacer />
                  <div>
                    <div className={`row`}>
                      <div className={`col-12`}>
                        <h5>
                          <p>Adhoc</p>
                        </h5>
                      </div>
                    </div>
                    <div className={`${classes.cardItems}`}>
                      <Card
                        variant="outlined"
                        className={`${classes.cards}`}
                        style={{ backgroundColor: '#FFFFFF' }}
                      >
                        <div className={`${classes.cardsTitle}`}>
                          <img
                            src={total_cost_icon}
                            className={`${classes.cardsTitleImg}`}
                          ></img>
                          <Typography className={`${classes.cardsTitleText}`}>
                            ADHOC Cost
                          </Typography>
                        </div>
                        <div className={`${classes.cardsValue}`}>
                          {renderAdhocCost()}
                        </div>
                      </Card>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="mt-3 ms-2 me-2 mb-3">
              <EntitySwitch>
                <EntitySwitch.Case>
                  <EmptyState
                    title="No Finops page is available for this entity"
                    missing="info"
                    description="You need to add an annotation to your component if you want to see Finops page for it."
                  />
                </EntitySwitch.Case>
              </EntitySwitch>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default CloudabilityPage;
