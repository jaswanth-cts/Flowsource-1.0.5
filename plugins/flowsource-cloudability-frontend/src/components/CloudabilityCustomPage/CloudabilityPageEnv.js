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
import PluginVersion from '../PluginVersion/PluginVersion';
import { Link } from '@material-ui/core';
import OpenInNewIcon from '@material-ui/icons/OpenInNew';
import log from 'loglevel';
import { EntitySwitch } from '@backstage/plugin-catalog';
import { EmptyState } from '@backstage/core-components';
import down_arrow from './Icons/down_arrow.png';
import up_arrow from './Icons/up_arrow.png';
const Spacer = () => <div className="mb-4" />;

const CloudabilityPageEnv = () => {
  const classes = cssClasses();
  const { fetch } = useApi(fetchApiRef);
  const [totalCost, setTotalCost] = useState({});
  const [costDiff, setCostDiff] = useState({});
  const [costSavings, setCostSavings] = useState({});
  const [loadingTotalCost, setLoadingTotalCost] = useState(true);
  const [loadingCostSavings, setLoadingCostSavings] = useState(true);
  const [totalCostError, setTotalCostError] = useState(null);
  const [costSavingsError, setCostSavingsError] = useState(null);
  const [loadingBudgetedCost, setLoadingBudgetedCost] = useState(true);
  const [budgetedCostError, setBudgetedCostError] = useState(null);

  const config = useApi(configApiRef);
  const backendBaseApiUrl =
    config.getString('backend.baseUrl') + '/api/flowsource-cloudability/';
  const entity = useEntity();
  const dimensionEnv =
    entity.entity.metadata.annotations['flowsource/cloudability-dimension-env'];
  const dimensionAppId =
    entity.entity.metadata.annotations['flowsource/cloudability-dimension-appid'];
  const envType =
    entity.entity.metadata.annotations['flowsource/cloudability-env-tag'];
  const appId =
    entity.entity.metadata.annotations['flowsource/cloudability-appid'];
  const view =
    entity.entity.metadata.annotations['flowsource/cloudability-view'];
  const cloudProvider =
    entity.entity.metadata.annotations['flowsource/cloud-provider'];
  const [viewId, setViewId] = useState(null);
  const projectUrl = config.getString('cloudability.projectUrl');
  const budgetName = entity.entity.metadata.annotations['flowsource/cloudability-budget-name'];
  const kindType = entity.entity.kind;
  const cloudabilityProjectUrl =
    projectUrl +
    `/cloudability#/reports/report?category=Cost+Allocation&custom=true&dimensions=year_month&dimensions=${dimensionEnv}&dimensions=${dimensionAppId}&end_date=23%3A59%3A59&filters=${dimensionEnv}%21%3D%28not+set%29&filters=${dimensionAppId}%3D%3D${appId}&filters=${dimensionEnv}%3D%3D${envType}&id=${viewId}&limit=50&metrics=unblended_cost&order=desc&owned_by_user=true&shared=false&shared_with_organization=false&sort_by=year_month&star=false&start_date=1st`;
  const [error, setError] = useState(null);
  const [budgetedCost, setBudgetedCost] = useState(null);
  async function fetchViewId() {
    try {
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
      const costRes = await fetch(
        backendBaseApiUrl +
        'env-cost-current-month?dimensionEnv=' +
        dimensionEnv +
        '&dimensionAppId=' +
        dimensionAppId +
        '&env=' +
        envType +
        '&appId=' +
        appId +
        '&view=' +
        view,
      );

      if (costRes.ok) {
        const cost = await costRes.json();
        setTotalCost(cost.envTotalCostCurrentMonth.total_cost_current_month);
        setCostDiff(cost.envTotalCostCurrentMonth.costDiff);
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
        const envType = Object.keys(costSavings)[0];
        const value = costSavings[envType];
        setCostSavings(value);
      } else if (costSavingRes.status === 503) {
        log.error('Service unavailable:', costSavingRes.statusText);
        setError(
          'This plugin has not been configured with the required values. Please ask your administrator to configure it.',
        );
      } else {
        setCostSavingsError(
          `Error fetching cost saving data, with status code ${costSavingRes.status} `,
        );
      }

      setLoadingCostSavings(false);
    } catch (error) {
      log.error('Error:', error);
      setLoadingCostSavings(false);
      setCostSavingsError(error.message);
    }
  }
  async function fetchBudgetedCost() {
    try {
      const budgetedCostRes = await fetch(
        backendBaseApiUrl +
        'budgeted-cost?budgetName=' +
        encodeURIComponent(budgetName),
      );

      if (budgetedCostRes.ok) {
        const budgetedCost = await budgetedCostRes.json();
        // Get the last month's threshold
        const months = budgetedCost.amount?.months || [];
        // Define the current date
        const now = new Date();
        // Add isCurrent, isPast, and isFuture properties
        const processedMonths = months.map(month => {
          const monthDate = new Date(month.month + "-01"); // Convert to a valid date (e.g., "2023-10-01")
          return {
            ...month,
            isCurrent: monthDate.getFullYear() === now.getFullYear() && monthDate.getMonth() === now.getMonth(),
            isPast: monthDate < now,
            isFuture: monthDate > now
          };
        });

        const currentMonth = processedMonths.find((month) => month.isCurrent);
        const pastMonth = processedMonths
          .reverse()
          .find((month) => month.isPast); // Reverse to prioritize the most recent past month
        const futureMonth = processedMonths.find((month) => month.isFuture);

        const budgetCost =
          currentMonth?.threshold || pastMonth?.threshold || futureMonth?.threshold;
        const budgetMonth =
          currentMonth?.month || pastMonth?.month || futureMonth?.month;
        // Set the budgeted cost and month
        setBudgetedCost({ cost: budgetCost, month: budgetMonth });
      } else if (budgetedCostRes.status === 503) {
        log.error('Service unavailable:', budgetedCostRes.statusText);
        setError(
          'This plugin has not been configured with the required values. Please ask your administrator to configure it.',
        );
      } else {
        setBudgetedCostError(
          `Error fetching budgeted cost, with status code ${budgetedCostRes.status} `,
        );
      }

      setLoadingBudgetedCost(false);
    } catch (error) {
      log.error('Error:', error);
      setLoadingBudgetedCost(false);
      setBudgetedCostError(error.message);
    }
  }

  useEffect(() => {
    fetchTotalCost();
    fetchCostSavingsOpportunity();
    fetchViewId();
    fetchBudgetedCost();
    // eslint-disable-next-line
  }, []);

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
      {costSavings !== undefined ? costSavings : '-'}
      <img
        src={dollar}
        className={`${classes.cardsDollarIcon}`}
        alt="Dollar Icon"
      />
    </p>
  );

  const renderBudgetedCost = () => {
    if (budgetedCost?.cost !== undefined && budgetedCost?.cost !== null) {
      return (
        <div className="row">
          {/* Left side: Budgeted Cost */}
          <div className="col-7">
            <p className={`${classes.cardsValueText}`}>
              {budgetedCost.cost}
              <img
                src={dollar}
                className={`${classes.cardsDollarIcon}`}
                alt="Dollar Icon"
              />
            </p>
          </div>

          {/* Right side: Month */}
          <div className="col-5 d-flex align-items-end justify-content-end">
            <p className={`${classes.budgetCostMonth}`}>
              (Month: {budgetedCost.month ? budgetedCost.month.split('-').reverse().join('-') : 'N/A'})
            </p>
          </div>
        </div>
      );
    } else {
      return (
        <p className={`${classes.cardsValueText}`}>
          -
          <img
            src={dollar}
            className={`${classes.cardsDollarIcon}`}
            alt="Dollar Icon"
          />
        </p>
      );
    }
  };

  const getArrow = env => {
    if (costDiff[env].sign === '+') {
      return up_arrow;
    } else if (costDiff[env].sign === '-') {
      return down_arrow;
    } else {
      return null;
    }
  };
  const renderTotalCost = (cost, type) => (
    <>
      <p className={`${classes.cardsValueText}`}>
        {totalCost !== undefined ? totalCost : '-'}
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
            className={`${classes.cardsArrowIconEnv}`}
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

  const renderTotalCostEnv = () => {
    if (loadingTotalCost) {
      return renderLoading();
    } else if (totalCostError) {
      return renderErrorCard();
    } else {
      return renderTotalCost(totalCost, envType);
    }
  };
  const renderCostSavingsProd = () => {
    if (loadingCostSavings) {
      return renderLoading();
    } else if (costSavingsError) {
      return renderErrorCard();
    } else {
      return renderCostSavings(costSavings);
    }
  };

  const renderBudgetedCostProd = () => {
    if (loadingBudgetedCost) {
      return renderLoading();
    } else if (budgetedCostError) {
      return renderErrorCard();
    } else {
      return renderBudgetedCost();
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
                    {/* <p> {title} </p> */}
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
                          <p><b>Payment {envType.toUpperCase()} Environment</b></p>
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
                          {renderTotalCostEnv()}
                        </div>
                      </Card>
                      <Card
                        variant="outlined"
                        className={`${classes.cards}`}
                        style={{ backgroundColor: '#FFFFFF' }}
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
                      <Card
                        variant="outlined"
                        className={`${classes.cards}`}
                        style={{ backgroundColor: '#FFFFFF' }}
                      >
                        <div className={`${classes.cardsTitle}`}>
                          <img
                            src={total_savings_icon}
                            className={`${classes.cardsTitleImg}`}
                          ></img>
                          <Typography className={`${classes.cardsTitleText}`}>
                            Total Budgeted Cost
                          </Typography>
                        </div>
                        <div>
                          {renderBudgetedCostProd()}
                        </div>
                      </Card>
                    </div>
                  </div>
                  <Spacer />
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

export default CloudabilityPageEnv;