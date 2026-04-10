import { errorHandler } from '@backstage/backend-common';
import { LoggerService } from '@backstage/backend-plugin-api';
import { Config } from '@backstage/config';
import express from 'express';
import Router from 'express-promise-router';
import helmet from 'helmet';
import xss from 'xss';
import { AWSCodePipelineService } from './aws.service';
import { AwsAuthenticator } from './awsAuth.service';

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
  // router fetching the failure reason of the pipeline
  router.get('/fetchFailureReason', async (request, response) => {
    try {
      const region = request.query.region as string;
      const pipelineName = request.query.pipelineName as string;
      const pipelineExecutionId = request.query.pipelineExecutionId as string;

      if (!region || !pipelineName || !pipelineExecutionId) {
        return response.status(400).send({ success: false, error: 'Missing required query parameters: region, pipelineName, pipelineExecutionId' });
      }

      const authService = new AwsAuthenticator(config, region, logger);
      const awsBackendSvc = new AWSCodePipelineService(authService, region, logger);
      const failureDetails = await awsBackendSvc.fetchFailureReason(pipelineName, pipelineExecutionId);

      return response.status(200).send({ success: true, data: failureDetails });
    } catch (err: any) {
      logger.info('Router err', err as Error);
      if (err.toString().includes('503')) {
        return response
          .status(503)
          .send({ success: false, error: 'AWS CICD credentials configurations are not set, missing config value in awsCodePipeline' });
      } else if (err.toString().includes('403')) {
        return response
          .status(403)
          .send({ success: false, error: 'Check your AWS credentials.' });
      }
      return response
        .status(500)
        .send({ success: false, error: 'Error fetching failure reason.' });
    }
  });
  // This router will be used to fetch the pipelines from the AWS CodePipeline.
  router.get('/listPipeline', async (request, response) => {
    try {
      const region = request.query.region as string;
      const pipelineName = request.query.pipelineNames as string;
      const authService = new AwsAuthenticator(config, region, logger);
      const awsBackendSvc = new AWSCodePipelineService(authService, region, logger);
      const output = await awsBackendSvc.fetchPipelines(pipelineName);
      const sanitizedOutput = xss(JSON.stringify(output));
      return response.status(200).send(sanitizedOutput);
    } catch (err: any) {
      logger.info('Router err', err as Error);
      if (err.toString().includes('503')) {
        return response
          .status(503)
          .send({ success: false, error: 'AWS CICD credentials configurations are not set, missing config value in awsCodePipeline' });
      } else if (err.toString().includes('403')) {
        return response
          .status(403)
          .send({ success: false, error: 'Check your AWS credentials.' });
      } 
      else if(err.toString().includes('AWS Hostname could not be resolved.')) {
        return response.status(404).send({ success: false, error: err.message });
      } 
      else if (err.toString().includes('ResourceNotFoundException')) {
        return response
          .status(404)
          .send({ success: false, error: 'No project found.' });
      }
      return response
        .status(500)
        .send({ success: false, error: 'Error loading data.' });
    }
  });
  // This router will be used to fetch the pipelines details from the AWS CodePipeline.
  router.get('/pipelineDetails', async (request, response) => {
    try {
      const region = request.query.region as string;
      const durationDaysCatalog: number = Number(
        request.query.durationDaysCatalog,
      );
      let durationConfig = config.has('flowsource.dataPullDuration')
        ? config.getNumber('flowsource.dataPullDuration')
        : 60;
      const durationInDays = durationDaysCatalog || durationConfig;
      const durationInMilliseconds = durationInDays * 24 * 60 * 60 * 1000;
      const durationDate = new Date(Date.now() - durationInMilliseconds);
      const pipelineName = request.query.pipelineName as string;
      const page = Number(request.query.page) || 1;
      const limit = Number(request.query.limit) || 8; // Default to 8 items per page if not provided
      const authService = new AwsAuthenticator(config, region, logger);
      const awsBackendSvc = new AWSCodePipelineService(authService, region, logger);
      const output = await awsBackendSvc.pipelineDetails(
        pipelineName,
        durationDate,
        page,
        limit
      );
      const sanitizedOutput = xss(JSON.stringify(output));
      return response.status(200).send(sanitizedOutput);
    } catch (err: any) {
      logger.info('Router err', err as Error);
      if (err.toString().includes('503')) {
        return response
          .status(503)
          .send({ success: false, error: 'AWS CICD credentials configurations are not set, missing config value in awsCodePipeline' });
      } else if (err.toString().includes('403')) {
        return response
          .status(403)
          .send({ success: false, error: 'Check your AWS credentials.' });
      }
      return response
        .status(500)
        .send({ success: false, error: 'Error loading data.' });
    }
  });

  // This router will be used to fetch the pipeline variables from AWS CodePipeline.
  router.get('/pipelineVariables', async (request, response) => {
    try {
      const region = request.query.region as string;
      const pipelineName = request.query.pipelineName as string;

      // Check if enableTrigger is configured and allowed
      const enableTrigger = config.getOptionalBoolean('aws.awsCodePipeline.enableTrigger') ?? false;
      if (!enableTrigger) {
        return response.status(403).send({ error: 'Triggering pipeline is not enabled.' });
      }

      const authService = new AwsAuthenticator(config, region, logger);
      const awsBackendSvc = new AWSCodePipelineService(authService, region, logger);
      const output = await awsBackendSvc.getPipelineVariables(pipelineName);
      const sanitizedOutput = xss(JSON.stringify(output));
      return response.status(200).send(sanitizedOutput);
    } catch (err: any) {
      logger.info('Router err', err as Error);
      if (err.toString().includes('503')) {
        return response
          .status(503)
          .send({ success: false, error: 'AWS CICD credentials configurations are not set, missing config value in awsCodePipeline' });
      } else if (err.toString().includes('403')) {
        return response
          .status(403)
          .send({ success: false, error: 'Check your AWS credentials.' });
      }
      return response
        .status(500)
        .send({ success: false, error: 'Error loading data.' });
    }
  });

  // This router will be used to trigger the pipeline execution.
  router.post('/triggerPipeline', async (request, response) => {
    try {
      const region = request.query.region as string;
      const pipelineName = request.query.pipelineName as string;

      // Check if enableTrigger is configured and allowed
      const enableTrigger = config.getOptionalBoolean('aws.awsCodePipeline.enableTrigger') ?? false;
      if (!enableTrigger) {
        return response.status(403).send({ error: 'Triggering pipeline is not enabled.' });
      }
  
      const authService = new AwsAuthenticator(config, region, logger);
      const awsBackendSvc = new AWSCodePipelineService(authService, region, logger);
      const output = await awsBackendSvc.triggerPipelineExecution(pipelineName);
      const sanitizedOutput = xss(JSON.stringify(output));
      return response.status(200).send(sanitizedOutput);
    } catch (err: any) {
      logger.info('Router err', err as Error);
      if (err.toString().includes('503')) {
        return response
          .status(503)
          .send({ success: false, error: 'AWS CICD credentials configurations are not set, missing config value in awsCodePipeline' });
      } else if (err.toString().includes('403')) {
        return response
          .status(403)
          .send({ success: false, error: 'Check your AWS credentials.' });
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
