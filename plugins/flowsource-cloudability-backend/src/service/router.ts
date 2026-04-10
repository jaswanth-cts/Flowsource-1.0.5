import { errorHandler } from '@backstage/backend-common';
import { LoggerService } from '@backstage/backend-plugin-api';
import { Config } from '@backstage/config';
import express from 'express';
import Router from 'express-promise-router';
import { CloudabilityService } from './cloudability.service';
import xss from 'xss';

import backEndPackageJson from '../../package.json';

export interface RouterOptions {
  logger: LoggerService;
  config: Config;
}

export async function createRouter(
  options: RouterOptions,
): Promise<express.Router> {
  const { config, logger } = options;

  const router = Router();
  router.use(express.json());

  const cloudabiltyToken = config.getOptionalString('cloudability.token') || '';
  const cloudabilityBaseUrlConfig = config.getOptionalString('cloudability.baseUrl');
  const cloudabilityBaseUrl = cloudabilityBaseUrlConfig ? (cloudabilityBaseUrlConfig.endsWith('/') ? cloudabilityBaseUrlConfig.replace(/\/+$/, '') : cloudabilityBaseUrlConfig) : '';

  if (!cloudabiltyToken || !cloudabilityBaseUrlConfig) {
    router.use((_req, res) => {
      res.status(503).send({
        success: false,
        error: 'This plugin has not been configured with the required values. Please ask your administrator to configure it'
      });
    });
    return router;
  }

  const cloudabilityService = new CloudabilityService(cloudabiltyToken, cloudabilityBaseUrl, logger);

  router.get('/total-cost', async (request, response) => {
    const dimensionEnv: string = xss((request.query.dimensionEnv as string));
    const dimensionAppId: string = xss((request.query.dimensionAppId as string));
    const envType: string = xss((request.query.envType as string));
    const appId: string = xss((request.query.appId as string));
    const view: string = xss((request.query.view as string));


    try {
      let output = await cloudabilityService.getTotalCost(dimensionEnv, dimensionAppId, envType, appId, view);
      output = sanitizeObject(output);
      return response.status(200).send(output);
    }
    catch (error: any) {
      logger.error('Error in getTotalCost - ', error as Error);
      switch (error.status) {
        case 401:
          return response.status(401).send({
            success: false,
            error: 'Unauthorized: fetch error'
          });
        case 403:
          return response.status(403).send({
            success: false,
            error: 'Forbidden: fetch error'
          });
        case 404:
          return response.status(404).send({
            success: false,
            error: 'Not Found: fetch error'
          });
        case 500:
          return response.status(500).send({
            success: false,
            error: 'Internal Server Error: fetch error'
          });
        default:
          // For all other errors, respond with a 500 Internal Server Error
          return response.status(500).send({
            success: false,
            error: 'Unexpected Error'
          });
      }
    }
  });

  router.get('/cost-savings', async (request, response) => {
    const dimensionEnv: string = xss((request.query.dimensionEnv as string));
    const dimensionAppId: string = xss((request.query.dimensionAppId as string));
    const envType: string = xss((request.query.envType as string));
    const appId: string = xss((request.query.appId as string));
    const view: string = xss((request.query.view as string));
    const cloudProvider: string | null = xss((request.query.cloudProvider as string)) ? xss((request.query.cloudProvider as string)) : null;
    const kindType: string = xss((request.query.kindType as string));

    try {
      let output = await cloudabilityService.getTotalCostSavings(dimensionEnv, dimensionAppId, envType, appId, view, cloudProvider, kindType);
      output = sanitizeObject(output);
      return response.status(200).send(output);
    }
    catch (error: any) {
      logger.error('Error in getTotalCostSavings - ', error as Error);
      switch (error.status) {
        case 401:
          return response.status(401).send({
            success: false,
            error: 'Unauthorized: fetch error'
          });
        case 403:
          return response.status(403).send({
            success: false,
            error: 'Forbidden: fetch error'
          });
        case 404:
          return response.status(404).send({
            success: false,
            error: 'Not Found: fetch error'
          });
        case 500:
          return response.status(500).send({
            success: false,
            error: 'Internal Server Error: fetch error'
          });
        default:
          // For all other errors, respond with a 500 Internal Server Error
          return response.status(500).send({
            success: false,
            error: 'Unexpected Error'
          });
      }
    }
  });

  router.get('/adhoc-cost', async (request, response) => {
    const dimensionDeploymentType: string = xss((request.query.dimensionDeploymentType as string));
    const dimensionAppId: string = xss((request.query.dimensionAppId as string));
    const appId: string = xss((request.query.appId as string));
    const view: string = xss((request.query.view as string));

    try {
      let output = await cloudabilityService.getAdhocCost(dimensionDeploymentType, dimensionAppId, appId, view);
      output = sanitizeObject(output);
      return response.status(200).send(output);
    }
    catch (error: any) {
      logger.error('Error in getAdhocCost - ', error as Error);
      switch (error.status) {
        case 401:
          return response.status(401).send({
            success: false,
            error: 'Unauthorized: fetch error'
          });
        case 403:
          return response.status(403).send({
            success: false,
            error: 'Forbidden: fetch error'
          });
        case 404:
          return response.status(404).send({
            success: false,
            error: 'Not Found: fetch error'
          });
        case 500:
          return response.status(500).send({
            success: false,
            error: 'Internal Server Error: fetch error'
          });
        default:
          // For all other errors, respond with a 500 Internal Server Error
          return response.status(500).send({
            success: false,
            error: 'Unexpected Error'
          });
      }
    }
  });
  router.get('/budgeted-cost', async (request, response) => {
    const budgetName: string = xss(request.query.budgetName as string);

    try {
      // Call your service method to get budgeted cost by name
      const output = await cloudabilityService.getBudgetedCost(budgetName);
      const sanitizedOutput = sanitizeObject(output);
      return response.status(200).send({ amount: sanitizedOutput });
    }
    catch (error: any) {
      logger.error('Error in getBudgetedCost - ', error as Error);
      switch (error.status) {
        case 401:
          return response.status(401).send({
            success: false,
            error: 'Unauthorized: fetch error'
          });
        case 403:
          return response.status(403).send({
            success: false,
            error: 'Forbidden: fetch error'
          });
        case 404:
          return response.status(404).send({
            success: false,
            error: 'Not Found: fetch error'
          });
        case 500:
          return response.status(500).send({
            success: false,
            error: 'Internal Server Error: fetch error'
          });
        default:
          return response.status(500).send({
            success: false,
            error: 'Unexpected Error'
          });
      }
    }
  });

  //get totalcost for any environment for current month
  router.get('/env-cost-current-month', async (request, response) => {
    const dimensionEnv: string = xss(request.query.dimensionEnv as string);
    const dimensionAppId: string = xss(request.query.dimensionAppId as string);
    const env: string = xss(request.query.env as string);
    const appId: string = xss(request.query.appId as string);
    const view: string = xss(request.query.view as string); // convert to number

    try {
      const output = await cloudabilityService.getEnvTotalCost(
        dimensionEnv,
        dimensionAppId,
        env,
        appId,
        view
      );
      return response.status(200).send({ envTotalCostCurrentMonth: output });
    } catch (error: any) {
      logger.error('Error in getProdCostCurrentMonth - ', error as Error);
      switch (error.status) {
        case 401:
          return response.status(401).send({
            success: false,
            error: 'Unauthorized: fetch error'
          });
        case 403:
          return response.status(403).send({
            success: false,
            error: 'Forbidden: fetch error'
          });
        case 404:
          return response.status(404).send({
            success: false,
            error: 'Not Found: fetch error'
          });
        case 500:
          return response.status(500).send({
            success: false,
            error: 'Internal Server Error: fetch error'
          });
        default:
          return response.status(500).send({
            success: false,
            error: 'Unexpected Error'
          });
      }
    }
  });

  router.get('/view-id', async (request, response) => {
    const view: string = xss((request.query.view as string));
    try {
      let output = await cloudabilityService.getViewId(view);
      output = sanitizeObject(output);
      return response.status(200).send(output);
    }
    catch (error: any) {
      logger.error('Error in getViewId - ', error as Error);
      switch (error.status) {
        case 401:
          return response.status(401).send({
            success: false,
            error: 'Unauthorized: fetch error'
          });
        case 403:
          return response.status(403).send({
            success: false,
            error: 'Forbidden: fetch error'
          });
        case 404:
          return response.status(404).send({
            success: false,
            error: 'Not Found: fetch error'
          });
        case 500:
          return response.status(500).send({
            success: false,
            error: 'Internal Server Error: fetch error'
          });
        default:
          // For all other errors, respond with a 500 Internal Server Error
          return response.status(500).send({
            success: false,
            error: 'Unexpected Error'
          });
      }
    }
  });
  function sanitizeObject(obj: any): any {
    if (typeof obj === 'string') {
      return xss(obj);
    } else if (Array.isArray(obj)) {
      return obj.map(item => sanitizeObject(item));
    } else if (typeof obj === 'object' && obj !== null) {
      return Object.fromEntries(
        Object.entries(obj).map(([key, value]) => [key, sanitizeObject(value)])
      );
    } else {
      return obj;
    }
  }

  router.get('/plugin-versions', async (_request, response) => {

    const backendVersionJson = "{\"version\": \"" + backEndPackageJson.version + "\"}";

    return response.status(200).send(backendVersionJson);

  });

  router.use(errorHandler());
  return router;
}