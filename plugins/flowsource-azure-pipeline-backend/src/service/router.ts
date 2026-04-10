import { errorHandler } from '@backstage/backend-common';
import express from 'express';
import Router from 'express-promise-router';
import { LoggerService } from '@backstage/backend-plugin-api';
import { Config } from '@backstage/config';
import { AzurePipelineService } from './azurePipeline.service';
import xss from 'xss';

import backEndPackageJson from '../../package.json';

export interface RouterOptions {
  logger: LoggerService;
  config: Config;
}

export async function createRouter(
  options: RouterOptions,
): Promise<express.Router> {
  const { logger } = options;
  const { config } = options;

  const router = Router();
  router.use(express.json());

  router.get('/health', (_, response) => {
    logger.info('PONG!');
    response.json({ status: 'ok' });
  });

  const token = config.getOptionalString('azureDevOps.token') || '';
  const baseUrlConfig = config.getOptionalString('azureDevOps.baseUrl');
  const baseUrl = baseUrlConfig?.endsWith('/')
    ? baseUrlConfig.slice(0, -1)
    : baseUrlConfig || '';
  const orgName = config.getOptionalString('azureDevOps.organization') || '';
  let durationConfig = config.has('flowsource.dataPullDuration')
    ? config.getNumber('flowsource.dataPullDuration')
    : 60;

  if (!token || !baseUrl || !orgName) {
    router.use((_req, res) => {
      res.status(503).send({
        success: false,
        error:
          'This plugin has not been configured with the required values. Please ask your administrator to configure it',
      });
    });
    return router;
  }

  router.post('/trigger-pipeline', async (request, response) => {
    let projectName: string = xss(request.query.projectName as string);
    let pipelineId: number = Number(xss(request.query.pipelineId as string));
    let branchName: string = xss(request.query.branchName as string);
    let variableName: string = xss(request.query.variableName as string);
    let variableValue: string = xss(request.query.variableValue as string);
    let stagesToRuns: string = xss(request.query.stagesToRuns as string);
    const service = new AzurePipelineService(baseUrl, logger, token, orgName);

    try {
      // Call the service to trigger the pipeline
      const triggerResult = await service.triggerPipeline(
        projectName,
        pipelineId,
        branchName,
        variableValue,
        variableName,
        stagesToRuns,
      );

      // Sanitize the response
      const sanitizedTriggerResult = JSON.parse(
        xss(JSON.stringify(triggerResult)),
      );

      return response
        .status(200)
        .send({ success: true, triggerResult: sanitizedTriggerResult });
    } catch (error: any) {
      logger.error('Error in triggering pipeline', error);
      switch (error.status) {
        case 400:
          return response.status(400).send({
            success: false,
            error: 'Bad Request',
          });
        case 401:
          return response.status(401).send({
            success: false,
            error: 'Unauthorized: trigger error',
          });
        case 403:
          return response.status(403).send({
            success: false,
            error: 'Forbidden: trigger error',
          });
        case 404:
          return response.status(404).send({
            success: false,
            error: 'Not Found: trigger error',
          });
        case 500:
          return response.status(500).send({
            success: false,
            error: 'Internal Server Error: trigger error',
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

  router.get('/fetch-variables', async (request, response) => {
    let projectName: string = xss(request.query.projectName as string);
    let pipelineId: number = Number(xss(request.query.pipelineId as string));
    let runId: string = xss(request.query.runId as string);
    const service = new AzurePipelineService(baseUrl, logger, token, orgName);

    try {
      // Call the service to trigger the pipeline
      const triggerResult = await service.getPipelineVariables(
        projectName,
        pipelineId,
        runId,
      );

      // Sanitize the response
      const sanitizedTriggerResult = JSON.parse(
        xss(JSON.stringify(triggerResult)),
      );

      return response
        .status(200)
        .send({ success: true, triggerResult: sanitizedTriggerResult });
    } catch (error: any) {
      logger.error('Error in triggering pipeline', error);
      switch (error.status) {
        case 400:
          return response.status(400).send({
            success: false,
            error: 'Bad Request',
          });
        case 401:
          return response.status(401).send({
            success: false,
            error: 'Unauthorized: trigger error',
          });
        case 403:
          return response.status(403).send({
            success: false,
            error: 'Forbidden: trigger error',
          });
        case 404:
          return response.status(404).send({
            success: false,
            error: 'Not Found: trigger error',
          });
        case 500:
          return response.status(500).send({
            success: false,
            error: 'Internal Server Error: trigger error',
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

  router.get('/pipeline-data', async (request, response) => {
    let projectName: string = xss(request.query.projectName as string);
    let pipelineNames: string = xss(request.query.pipelineNames as string);
    const maxPipelineLimit: string = xss(
      request.query.maxPipelineLimit as string,
    );
    const service = new AzurePipelineService(baseUrl, logger, token, orgName);

    try {
      let { matchingPipelinesArray, errorArray } =
        await service.getPipelineDetails(
          projectName,
          pipelineNames,
          parseInt(maxPipelineLimit),
        );

      // Sanitize matchingPipelinesArray
      matchingPipelinesArray = JSON.parse(
        xss(JSON.stringify(matchingPipelinesArray)),
      );

      // Sanitize errorArray
      errorArray = JSON.parse(xss(JSON.stringify(errorArray)));

            return response.status(200).send({
                matchingPipelinesArray,
                errorArray
            });
        }
        catch (error: any) {
            logger.error('Error in fetching pipeline data', error);
            switch (error.status) {
                case 400:
                    return response.status(400).send({
                        success: false,
                        error: 'Bad Request'
                    });
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

  router.get('/run-data', async (request, response) => {
    let projectName: string = xss(request.query.projectName as string);
    let pipelineId: number = Number(xss(request.query.pipelineId as string));
    let durationDaysCatalog: number = Number(
      xss(request.query.durationDaysCatalog as string),
    );

    const service = new AzurePipelineService(baseUrl, logger, token, orgName);

    try {
      let { pipelineRunDetails, pipelineRunCount } =
        await service.getRunDetails(
          projectName,
          pipelineId,
          durationDaysCatalog,
          durationConfig,
        );

      // Sanitize pipelineRunDetails
      pipelineRunDetails = JSON.parse(xss(JSON.stringify(pipelineRunDetails)));

      // Sanitize totalRunCount
      pipelineRunCount = JSON.parse(xss(JSON.stringify(pipelineRunCount)));

      return response
        .status(200)
        .send({ pipelineRunDetails, pipelineRunCount });
    } catch (error: any) {
      logger.error('Error in fetching pipeline run data', error);
      switch (error.status) {
        case 400:
          return response.status(400).send({
            success: false,
            error: 'Bad Request',
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

  router.get('/build-data', async (request, response) => {
    let projectName: string = xss(request.query.projectName as string);
    let runDetails: [] = JSON.parse(xss(request.query.runDetails as string));

    const service = new AzurePipelineService(baseUrl, logger, token, orgName);

    try {
      let buildDetails = await service.getBuildDetails(projectName, runDetails);

      // Sanitize buildDetails
      buildDetails = JSON.parse(xss(JSON.stringify(buildDetails)));

      return response.status(200).send(buildDetails);
    } catch (error: any) {
      logger.error('Error in fetching pipeline build data', error);
      switch (error.status) {
        case 400:
          return response.status(400).send({
            success: false,
            error: 'Bad Request',
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

  router.get('/plugin-versions', async (_request, response) => {
    const backendVersionJson =
      '{"version": "' + backEndPackageJson.version + '"}';

    return response.status(200).send(backendVersionJson);
  });

  router.use(errorHandler());
  return router;
}
