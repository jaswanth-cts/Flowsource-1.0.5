import { errorHandler } from '@backstage/backend-common';
import { LoggerService } from '@backstage/backend-plugin-api';
import { Config } from '@backstage/config';
import express from 'express';
import Router from 'express-promise-router';
import { Dynatrace } from './dynatrace.service';
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

  const clientId = config.getString('dynatrace.clientId');
  const clientSecret = config.getString('dynatrace.clientSecret');
  const resource = config.getString('dynatrace.resource');
  const environmentId = config.getString('dynatrace.environmentId');
  const dataUrl = `https://${environmentId}.apps.dynatrace.com/platform/storage/query/v1/query:execute?enrich=metric-metadata`;
  let durationConfig = config.has('dynatrace.duration') ? config.getNumber('dynatrace.duration') : 4;

  router.get('/dynatrace', async (request, response) => {
    const { deploymentName, clusterName } = request.query;
    const dynatraceService = new Dynatrace(clientId, clientSecret, resource, dataUrl, durationConfig, logger);

    try {
      let output = await dynatraceService.fetchDetails(deploymentName, clusterName, durationConfig);
      output =JSON.parse(xss(JSON.stringify(output)));

      return response.status(200).send(output);
    } catch (error: any) {
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
          case 400:
            return response.status(400).send({
              success: false,
              error: 'Bad Request: fetch error'
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

  // const middleware = MiddlewareFactory.create({ logger, config });

  router.get('/plugin-versions', async (_request, response) => {

    const backendVersionJson = "{\"version\": \"" + backEndPackageJson.version + "\"}";

    return response.status(200).send(backendVersionJson);

  });

  router.use(errorHandler());
  return router;
}
