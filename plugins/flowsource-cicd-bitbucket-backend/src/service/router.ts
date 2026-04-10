import { errorHandler } from '@backstage/backend-common';
import express from 'express';
import Router from 'express-promise-router';
import { LoggerService } from '@backstage/backend-plugin-api';
import { Config } from '@backstage/config';
import xss from 'xss';
import AuthService from './authService';
import BitbucketPipelineService from './bitbucketPipeline.service';
import backEndPackageJson from '../../package.json';
import { ScmIntegrations } from '@backstage/integration';

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
  const integrations = ScmIntegrations.fromConfig(config);
  const authService = new AuthService(logger);
  const bitbucketPipelineService = new BitbucketPipelineService(logger);
  const durationConfig = config.has('flowsource.dataPullDuration') ? config.getNumber('flowsource.dataPullDuration') : 60;

  // Helper that resolves an auth token and baseUrl. Delegates to AuthService which
  // expects the full Backstage `Config` and the `ScmIntegrations` instance.
  async function getAuthTokenAndBaseUrl(hostFromCatalog: string | undefined): Promise<{ authToken: string; baseUrl: string }> {
    const { token, baseUrl } = await authService.getAuthToken(config, integrations, hostFromCatalog);
    return { authToken: token, baseUrl };
  }

  router.get('/health', (_, response) => {
    logger.info('PONG!');
    response.json({ status: 'ok' });
  });

  router.get('/bitbucket-workflow', async (request, response) => {
    const { repoName, repoOwner, pipelineNames, hostFromCatalog } = request.query;
    
  const { authToken, baseUrl: updatedBaseUrl } = await getAuthTokenAndBaseUrl(hostFromCatalog as string);

    if (!authToken || !updatedBaseUrl) {
      return response.status(503).send({
        success: false,
        error:
          'This plugin has not been configured with the required values. Please ask your administrator to configure it',
      });
    }
    try {
      let { matchingPipelinesArray, errorArray } = await bitbucketPipelineService.getData(repoName, repoOwner, pipelineNames, updatedBaseUrl, authToken);
      // Sanitize matchingPipelinesArray
      matchingPipelinesArray = JSON.parse(xss(JSON.stringify(matchingPipelinesArray)));
      // Sanitize errorArray
      errorArray = JSON.parse(xss(JSON.stringify(errorArray)));

      return response.status(200).send({
        matchingPipelinesArray,
        errorArray
      });
    }
    catch (error: any) {
      logger.error('Error in fetching pipeline details', error);
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

  router.get('/bitbucket-build', async (request, response) =>{
    const {repoName, repoOwner, pipelineName, durationDaysCatalog, hostFromCatalog, pageNumber, pageLength } = request.query;

    const durationInDays: number = Number(durationDaysCatalog) || Number(durationConfig);

  const { authToken, baseUrl: updatedBaseUrl } = await getAuthTokenAndBaseUrl(hostFromCatalog as string);

    if (!authToken || !updatedBaseUrl) {
      return response.status(503).send({
        success: false,
        error:
          'This plugin has not been configured with the required values. Please ask your administrator to configure it',
      });
    }

    try {
      let buildDetails = await bitbucketPipelineService.getBuildData(repoName, repoOwner, pipelineName, updatedBaseUrl, authToken, pageNumber, pageLength, durationInDays);
      buildDetails = JSON.parse(xss(JSON.stringify(buildDetails)));
      return response.status(200).send(buildDetails);

    } catch (error: any) {
      logger.error('Error in fetching build details', error);
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
  })

  router.get('/plugin-versions', async (_request, response) => {

    const backendVersionJson = "{\"version\": \"" + backEndPackageJson.version + "\"}";

    return response.status(200).send(backendVersionJson);

  });
  
  router.use(errorHandler());
  return router;
}