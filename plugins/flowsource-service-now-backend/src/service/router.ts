import { errorHandler } from '@backstage/backend-common';
import { LoggerService } from '@backstage/backend-plugin-api';
import { Config } from '@backstage/config';
import express from 'express';
import { ServiceNowService } from './serviceNow.service';
import Router from 'express-promise-router';
import xss from 'xss';
import { decodeJwt } from 'jose';


import backEndPackageJson from '../../package.json';

export interface RouterOptions {
  logger: LoggerService;
  config: Config;
}

export async function createRouter(
  options: RouterOptions,
): Promise<express.Router> {
  const { logger, config } = options;

  const snowUsername = config.getOptionalString('serviceNow.username') || '';
  const snowPassword = config.getOptionalString('serviceNow.password') || '';
  const snowInstance = config.getOptionalString('serviceNow.instanceUrl') || '';
  logger.info(`Service Now snowInstance: ${snowInstance}`);

  const router = Router();
  router.use(express.json());

  router.use((_req, res, next) => {
    
    if (!snowUsername || !snowPassword || !snowInstance) {
      return res.status(503).send({
        success: false,
        error: 'This plugin has not been configured with the username, password or instance URL for ServiceNow. Please ask the administrator to configure it.',
      });
    } 
    else 
    {
      try {
        new URL(snowInstance);
      } catch (_) {
        return res.status(503).send({
          success: false,
          error: 'Invalid ServiceNow URL. Please ask the administrator to configure the correct URL.'
        });
      };
    }

    next();
    return;
  });

  router.get('/health', (_, response) => {
    logger.info('PONG!');
    response.json({ status: 'ok' });
  });

  router.get('/snow-incidents', async (request, response) => {
    logger.info('Fetching the list of incidents from service-now');

    const token = request.headers.authorization?.split(' ')[1] || '';
    const decodedToken = decodeJwt(token);
    const userEmail: string =
      decodedToken.sub?.split(' ')[0]?.split('/')[1] || '';
    const serviceNowHelper = new ServiceNowService(logger);

    const configurationItem = xss(request.query.configurationItem as string);
    let priorityFilter: string = xss(request.query.priorityFilter as string);
    let stateFilter: string = xss(request.query.stateFilter as string);
    let searchFilter: string = xss(request.query.searchQuery as string);
    logger.info(`Service Now configurationItem: ${searchFilter}`);
    let myIncidents: string = xss(request.query.myIncidents as string);
    let pageNumber: string = xss(request.query.pageNumber as string);
    let pageSize: string = xss(request.query.pageSize as string);
    try 
    {
      const output = await serviceNowHelper.getIncidentsList(configurationItem, pageNumber, pageSize, snowInstance, snowUsername, snowPassword, priorityFilter, stateFilter, myIncidents, userEmail, searchFilter);
      logger.info('Fetched the incident details from ServiceNow');     

      return response.status(200).send(xss(JSON.stringify(output)));
    } catch (error: any) {
      logger.error('Error in fetching incident details', error);

      switch (error.status) {
        case 503:
          return response.status(503).send({
            success: false,
            error: 'Service unavailable, missing values credentials in ServiceNow',
          });
        case 401:
          return response.status(401).send({
            success: false,
            error: 'Unauthorized: fetch error',
          });
        case 403:
          return response.status(403).send({
            success: false,
            error: 'Forbidden: fetch error',
          });
        case 404:
          return response.status(404).send({
            success: false,
            error: 'Not Found: fetch error',
          });
        case 500:
          return response.status(500).send({
            success: false,
            error: 'Internal Server Error: fetch error',
          });
        default:
          // For all other errors, respond with a 500 Internal Server Error
          return response.status(500).send({
            success: false,
            error: 'Unexpected Error',
          });
      }
    }
  });

  router.get('/snow-service-request', async (request, response) => {
    try 
    {
      logger.info('Fetching the list of Service-Request from service-now');
      
      const serviceNowHelper = new ServiceNowService(logger);

      const serviceNowParams = {
        configurationItem: xss(request.query.configurationItem as string),
        OrderTypeField: config.getOptionalString('serviceNow.environment.orderTypeField') as string,
        ServiceTypeValue: config.getOptionalString('serviceNow.environment.serviceTypeValue') as string
      };

      if(!serviceNowParams.OrderTypeField || !serviceNowParams.ServiceTypeValue) {
        const error = new Error(`Missing orderTypeField or serviceTypeValue for ServiceNow. Please ask the administrator to configure it.`);
        (error as any).status = 503;
        (error as any).message = `Missing orderTypeField or serviceTypeValue for ServiceNow. Please ask the administrator to configure it.`;
        throw error;
      };

      let pageNumber: string = request.query.pageNumber as string;
      let pageSize: string = request.query.pageSize as string;

      const output = await serviceNowHelper.getServiceOrderRequests(
        serviceNowParams,
        pageNumber,
        pageSize,
        snowInstance,
        snowUsername,
        snowPassword,
      );

      return response.status(200).send(xss(JSON.stringify(output)));
    } catch (error: any) {
      logger.error('Error in fetching incident details', error as Error);
      
      const status = error?.status || error?.response?.status || 500;
      return response
        .status(status)
        .json({
          success: false,
          error: error?.message || 'Failed to retrive Service Request from ServiceNow.',
        });
    }
  });

  router.get('/snow-orders', async (request, response) => {
    try 
    {
      logger.info('Fetching the list of Order-Request from service-now');
      
      const serviceNowHelper = new ServiceNowService(logger);

      const serviceNowParams = {
        configurationItem: xss(request.query.configurationItem as string),
        OrderTypeField: config.getOptionalString('serviceNow.environment.orderTypeField') as string,
        OrderTypeValue: config.getOptionalString('serviceNow.environment.orderTypeValue') as string
      };

      if(!serviceNowParams.OrderTypeField || !serviceNowParams.OrderTypeValue) {
        const error = new Error(`Missing orderTypeField or orderTypeValue for ServiceNow. Please ask the administrator to configure it.`);
        (error as any).status = 503;
        (error as any).message = `Missing orderTypeField or orderTypeValue for ServiceNow. Please ask the administrator to configure it.`;
        throw error;
      };

      let pageNumber: string = request.query.pageNumber as string;
      let pageSize: string = request.query.pageSize as string;

      const output = await serviceNowHelper.getOrderRequests(serviceNowParams, pageNumber,
        pageSize, snowInstance, snowUsername, snowPassword);

      return response.status(200).send(xss(JSON.stringify(output)));
    } catch (error: any) {
      logger.error('Error in fetching order details', error as Error);

      const status = error?.status || error?.response?.status || 500;
      return response
        .status(status)
        .json({
          success: false,
          error: error?.message || 'Failed to retrive Orders from ServiceNow.',
        });
    }
  });

  router.get('/snow-provision-orders', async (request, response) => {
    try 
    {
      logger.info('Fetching the list of Provision-Request from service-now');
      const serviceNowHelper = new ServiceNowService(logger);

      const serviceNowParams = {
        configurationItem: xss(request.query.configurationItem as string),
        OrderTypeField: config.getOptionalString('serviceNow.environment.orderTypeField') as string,
        provisionTypeValue: config.getOptionalString('serviceNow.environment.provisionTypeValue') as string
      };

      if(!serviceNowParams.OrderTypeField || !serviceNowParams.provisionTypeValue) {
        const error = new Error(`Missing orderTypeField or provisionTypeValue for ServiceNow. Please ask the administrator to configure it.`);
        (error as any).status = 503;
        (error as any).message = `Missing orderTypeField or provisionTypeValue for ServiceNow. Please ask the administrator to configure it.`;
        throw error;
      };

      let pageNumber: string = request.query.pageNumber as string;
      let pageSize: string = request.query.pageSize as string;

      const output = await serviceNowHelper.getProvisionOrdersBasedOnConfigItem(serviceNowParams, pageNumber,
        pageSize, snowInstance, snowUsername, snowPassword);

      return response.status(200).send(xss(JSON.stringify(output)));
    } catch (error: any) {
      logger.error('Error in fetching incident details', error as Error);
      
      const status = error?.status || error?.response?.status || 500;
      return response
        .status(status)
        .json({
          success: false,
          error: error?.message || 'Failed to retrive Provision Orders from ServiceNow.',
        });
    }
  });

  router.get('/get-provision-order-config', async (_request, response) => {
    try 
    {
      logger.info('Fetching Provision order config values from service-now');

      const serviceNowParams = {
        OrderTypeField: config.getOptionalString('serviceNow.environment.orderTypeField') as string,
        provisionTypeValue: config.getOptionalString('serviceNow.environment.provisionTypeValue') as string
      };

      if(!serviceNowParams.OrderTypeField || !serviceNowParams.provisionTypeValue) {
        const error = new Error(`Missing orderTypeField or provisionTypeValue for ServiceNow. Please ask the administrator to configure it.`);
        (error as any).status = 503;
        (error as any).message = `Missing orderTypeField or provisionTypeValue for ServiceNow. Please ask the administrator to configure it.`;
        throw error;
      };

      const output = { success: true, serviceNowParams };

      return response.status(200).send(xss(JSON.stringify(output)));
    } catch (error: any) {
      logger.error('Error in fetching get-provision-order-config details', error as Error);
      
      const status = error?.status || error?.response?.status || 500;
      return response
        .status(status)
        .json({
          success: false,
          error: error?.message || 'Failed to retrive Provision Orders from ServiceNow.',
        });
    }
  });

  router.get('/infraprovision-snow-provision-orders', async (request, response) => {
    try 
    {
      logger.info('Fetching the list of Provision-Request from service-now for InfraTab.');
      const serviceNowHelper = new ServiceNowService(logger);

      const serviceNowParams = {
        OrderTypeField: config.getOptionalString('serviceNow.environment.orderTypeField') as string,
        provisionTypeValue: config.getOptionalString('serviceNow.environment.provisionTypeValue') as string
      };

      if(!serviceNowParams.OrderTypeField || !serviceNowParams.provisionTypeValue) {
        const error = new Error(`Missing orderTypeField or provisionTypeValue for ServiceNow. Please ask the administrator to configure it.`);
        (error as any).status = 503;
        (error as any).message = `Missing orderTypeField or ProvisionTypeValue for ServiceNow. Please ask the administrator to configure it.`;
        throw error;
      };

      let pageNumber: string = request.query.pageNumber as string;
      let pageSize: string = request.query.pageSize as string;

      const output = await serviceNowHelper.getAllProvisionOrdersForInfraTab(serviceNowParams, pageNumber,
        pageSize, snowInstance, snowUsername, snowPassword);

      return response.status(200).send(xss(JSON.stringify(output)));
    } catch (error: any) {
      logger.error('Error in fetching incident details', error as Error);

      const status = error?.status || error?.response?.status || 500;
      return response
        .status(status)
        .json({
          success: false,
          error: error?.message || 'Failed to retrive Provision Orders from ServiceNow.',
        });
    }
  });

  router.get('/plugin-versions', async (_request, response) => {

    const backendVersionJson = "{\"version\": \"" + backEndPackageJson.version + "\"}";

    return response.status(200).send(backendVersionJson);

  });

  router.use(errorHandler());
  return router;
}
