import { errorHandler } from '@backstage/backend-common';
import express from 'express';
import Router from 'express-promise-router';
import { LoggerService } from '@backstage/backend-plugin-api';
import { devOpsGuruBackendService } from './devOpsGuruBackend.service';
import { Config } from '@backstage/config';
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
  const accessKeyId = config.getOptionalString('devops-guru.aws.access_key_id') || '';
  const secretAccessKey = config.getOptionalString('devops-guru.aws.secret_access_key') || '';
  const statusFilterFromTime = config.getOptionalString('devops-guru.statusFilter.startTimeRange.fromTime') || '';

  if (!accessKeyId || !secretAccessKey || !statusFilterFromTime) {
    router.use((_req, res) => {
        res.status(503).send({
            success: false,
            error: 'This plugin has not been configured with the required values. Please ask your administrator to configure it'
        });
    });
    return router;
}
  const devOpsGuruBackendSvc = new devOpsGuruBackendService(accessKeyId,secretAccessKey, statusFilterFromTime, logger);

  router.get('/health', (_, response) => {
    logger.info('PONG!');
    response.json({ status: 'ok' });
  });

  router.get('/reactiveinsights',async (_request, response) => {
    logger.info('received request for info -- ' );
    let output = await devOpsGuruBackendSvc.getReactiveInsightsFromAwsDevOpsGuru('');
    output = xss(JSON.stringify(output));
    response.send(output);
  });

  router.get('/proactiveinsights',async (_request, response) => {
    logger.info('received request for info -- ' );
    let output = await devOpsGuruBackendSvc.getReactiveInsightsFromAwsDevOpsGuru('');
    output = xss(JSON.stringify(output));
    response.send(output);
  });

  router.get('/plugin-versions', async (_request, response) => {

    const backendVersionJson = "{\"version\": \"" + backEndPackageJson.version + "\"}";

    return response.status(200).send(backendVersionJson);

  });

  router.use(errorHandler());
  return router;
}
