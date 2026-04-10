import { errorHandler } from '@backstage/backend-common';
import { LoggerService } from '@backstage/backend-plugin-api';
import { Config } from '@backstage/config';
import express from 'express';
import Router from 'express-promise-router';
import { VeracodeService } from './veracode.service';
import xss from 'xss';

import backEndPackageJson from '../../package.json';

export interface RouterOptions {
  logger: LoggerService;
  config: Config;
}

export async function createRouter(
  options: RouterOptions,
): Promise<express.Router> {
  const { logger, config } = options;

  const router = Router();
  router.use(express.json());

  router.get('/health', (_, response) => {
    logger.info('PONG!');
    response.json({ status: 'ok' });
  });

  const apiId = config.getOptionalString('veracode.apiId') || '';
  const apiKey = config.getOptionalString('veracode.apiKey') || '';

  if (!apiId || !apiKey) {
    router.use((_req, res) => {
      res.status(503).send({
        success: false,
        error: 'This plugin has not been configured with the required values. Please ask your administrator to configure it'
      });
    });
    return router;
  }

  router.get('/getSummaryReportInfo', async (request, response) => {
    const appName = request.query.appName as any;
    const veracodeService = new VeracodeService(logger);
    try {
      const output = await veracodeService.getSummaryReport(appName, apiId, apiKey);
      logger.info("Fetched the summary report info for the application: " + appName);
      const processedOutput = veracodeService.processOutputSummaryReport(output);
      return response.status(200).send(xss(JSON.stringify(processedOutput)));
    } catch (error: any) {
      logger.error('Error in fetching application GUID ', error);
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
          case 400:
          return response.status(400).send({
            success: false,
            error: error.message
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

  router.get('/plugin-versions', async (_request, response) => {

    const backendVersionJson = "{\"version\": \"" + backEndPackageJson.version + "\"}";

    return response.status(200).send(backendVersionJson);

  });

  router.use(errorHandler());
  return router;
}
