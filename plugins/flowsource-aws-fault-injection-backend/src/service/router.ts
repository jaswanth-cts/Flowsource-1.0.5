import { errorHandler } from '@backstage/backend-common';
import express from 'express';
import Router from 'express-promise-router';
import { LoggerService , RootConfigService } from '@backstage/backend-plugin-api';

import xss from 'xss';
import helmet from 'helmet';
import { awsFaultInjectionBackendService } from './awsFaultInjectionBackend.service';

import backEndPackageJson from '../../package.json';

export interface RouterOptions {
  logger: LoggerService;
  config: RootConfigService;
}

export async function createRouter(
  options: RouterOptions,
): Promise<express.Router> {
  const { logger, config } = options;

  const router = Router();
  router.use(helmet.hsts({
    maxAge: 31536000, // One year in seconds
    includeSubDomains: true,
    preload: true
  }));
  router.use(express.json());

  const accessKeyId = config.getOptionalString('aws-fault-injection.aws.access_key_id');
  const secretAccessKey = config.getOptionalString('aws-fault-injection.aws.secret_access_key');

  if (!accessKeyId || !secretAccessKey) {
    router.use((_, res, next) => {
      res.status(503).send('This plugin has not been configured with the required values. Please ask your administrator to configure it');
      next();
    });
  }

  router.get('/health', (_, response) => {
    logger.info('PONG!');
    response.json({ status: 'ok' });
  });

  //route added for AWS FIS Experiments
  router.get('/fis-list-experiments', async (request, response) => {
    try {
      logger.info('received request for FIS experiment details of app - ' + request.query.applicationName);
      const awsFaultInjectionBackendSvc = new awsFaultInjectionBackendService(request.query.awsRegion as string, logger, accessKeyId || '', secretAccessKey || '');
      const output = await awsFaultInjectionBackendSvc.getAWSFisExperiments(request.query.awsRegion, request.query.applicationId);
      const sanitizedOutput = xss(JSON.stringify(output));
      return response.status(200).send(sanitizedOutput);
    } catch (err:any) {

      if(err.status === 403) {
        return response.status(403).send({ success: false, error: 'Invalid AWS credentials.' });
      }
      else if(err.status === 404) {
        return response.status(404).send({ success: false, error: err.message });
      }
      else {
        return response.status(500).send({ success: false, error: 'Error loading data.' });
      }
    }
    
  });
  //route added for AWS FIS Templates
  router.get('/fis-list-experiment-templates', async (request, response) => {
    try {
      logger.info('received request for FIS experiment details of app - ' + request.query.applicationName);
      const awsFaultInjectionBackendSvc = new awsFaultInjectionBackendService(request.query.awsRegion as string, logger, accessKeyId || '', secretAccessKey || '');
      const output = await awsFaultInjectionBackendSvc.getAWSFisExperimentTemplates(request.query.awsRegion, request.query.applicationId);
      const sanitizedOutput = xss(JSON.stringify(output));
      return response.status(200).send(sanitizedOutput);
    } catch (err:any) {
      if(err.status === 403) {
        return response.status(403).send({ success: false, error: 'Invalid AWS credentials.' });
      }
      else if(err.status === 404) {
        return response.status(404).send({ success: false, error: err.message });
      }
      else {
        return response.status(500).send({ success: false, error: 'Error loading data.' });
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
