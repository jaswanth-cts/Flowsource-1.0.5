import { errorHandler } from '@backstage/backend-common';
import express from 'express';
import Router from 'express-promise-router';
import { LoggerService } from '@backstage/backend-plugin-api';
import { Config } from '@backstage/config';
import xss from 'xss';
import helmet from 'helmet';
import   GcpService   from './gcp.service';
import GCPAuthenticator from './auth.Service';

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
  router.use(
    helmet.hsts({
      maxAge: 31536000, // One year in seconds
      includeSubDomains: true,
      preload: true,
    }),
  );
  router.use(express.json());

  router.get('/health', (_, response) => {
    logger.info('PONG!');
    response.json({ status: 'ok' });
  });

  // route added for list Pipelines
  router.get('/pipelines', async (request, response) => {
    try {
      const pipelineName = (request.query.pipelineNames as string).split(',');
      const region = request.query.region as string;
      const authService = new GCPAuthenticator(config, logger);
      const gcpBackendSvc = new GcpService(authService, logger);
      const output = await gcpBackendSvc.getBuildDetails(
        pipelineName,
        region
      );
      const sanitizedOutput = xss(JSON.stringify(output));
      return response.status(200).send(sanitizedOutput);
    } catch (err: any) {
      logger.info('Router err', err);
      if(err.toString().includes('503')) {
        return response
          .status(503)
          .send({ success: false, error: 'GCP credentials configurations are not set' });
      } else if (err.toString().includes('403')) {
        return response
          .status(403)
          .send({ success: false, error: 'Check your GCP credentials.' });
      } else if (err.toString().includes('ResourceNotFoundException')) {
        return response
          .status(404)
          .send({ success: false, error: 'No project found.' });
      } else if (err.toString().includes('Invalid GCP Region')) {
        return response
          .status(404)
          .send({ success: false, error: err.message});
      }
      return response
        .status(500)
        .send({ success: false, error: 'Error loading data.' });
    }
  });

  // route added for  Pipelines card details
  router.get('/pipline-details', async (request, response) => {
    try {
      const durationDaysCatalog: number = Number(
        request.query.durationDaysCatalog,
      );
      let durationConfig = config.has('flowsource.dataPullDuration')
        ? config.getNumber('flowsource.dataPullDuration')
        : 60;
      const durationInDays = durationDaysCatalog || durationConfig;
      const durationInMilliseconds = durationInDays * 24 * 60 * 60 * 1000;
      const durationDate = new Date(Date.now() - durationInMilliseconds);
      const pipelineId = (request.query.pipelineId as string).split(','); 
      const region = request.query.region as string;
      const authService = new GCPAuthenticator(config, logger);
      const gcpBackendSvc = new GcpService(authService, logger);
      const output = await gcpBackendSvc.getBatchBuildDetails(
        pipelineId,
        durationDate,
        region,
      );
      const sanitizedOutput = xss(JSON.stringify(output));
      return response.status(200).send(sanitizedOutput);
    } catch (err: any) {
      if(err.toString().includes('503')) {
        return response
          .status(503)
          .send({ success: false, error: 'GCP credentials configurations are not set' });
      } else if (err.toString().includes('403')) {
        return response
          .status(403)
          .send({ success: false, error: 'Check your GCP credentials.' });
      }
      return response
        .status(500)
        .send({ success: false, error: 'Error loading data.' });
    }
  });

  router.get('/plugin-versions', async (_request, response) => {

    const backendVersionJson = "{\"version\": \"" + backEndPackageJson.version + "\"}";

    return response.status(200).send(backendVersionJson);

  });
  
  router.use(errorHandler());
  return router;
}
