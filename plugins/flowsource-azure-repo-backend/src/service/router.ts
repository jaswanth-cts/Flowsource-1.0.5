
import { errorHandler } from '@backstage/backend-common';
import express from 'express';
import Router from 'express-promise-router';
import { LoggerService } from '@backstage/backend-plugin-api';
import AuthService from './authService';
import AzureRepoService from './AzureRepoService';
import { Config } from '@backstage/config';
import backEndPackageJson from '../../package.json';
import xss from 'xss';
import AzureRepoPRMetricsService from './AzureRepoPRMetricsService';
export interface RouterOptions {
  logger: LoggerService;
  config: Config;
}
export async function createRouter(
  options: RouterOptions,
): Promise<express.Router> {
   const { logger, config } = options;
  // const azurePRMetricsService = new AzureRepoPRMetricsService(logger);
  const authService = new AuthService(config);
  const azureRepoBaseUrlConfig = config.getOptionalString('azureDevOps.baseUrl');
  const azureRepoBaseUrl = azureRepoBaseUrlConfig?.endsWith('/') ? azureRepoBaseUrlConfig.slice(0, -1) : azureRepoBaseUrlConfig || '';
  const orgName = config.getOptionalString('azureDevOps.organization') || '';
  const azureRepoService = new AzureRepoService(logger, authService, azureRepoBaseUrl, orgName);
  
  const azureRepoPRMetricsService = new AzureRepoPRMetricsService(azureRepoService);
  
  let durationConfig = config.has('flowsource.dataPullDuration') ? config.getNumber('flowsource.dataPullDuration') : 60;

  const router = Router();
  router.use(express.json());
  
  if (!azureRepoBaseUrl || !orgName) {
    router.use((_req, res) => {
        res.status(503).send({
            success: false,
            error: 'This plugin has not been configured with the required values. Please ask your administrator to configure it'
        });
    });
    return router;
}

  router.get('/health', (_, response) => {
    logger.info('PONG!');
    response.json({ status: 'ok' });
  });

  const prCycleTimeMinConfig = config.getOptionalNumber('pullRequestCycleTime.PRCycleTimeMin');
  const prCycleTimeMaxConfig = config.getOptionalNumber('pullRequestCycleTime.PRCycleTimeMax');
  const prReviewCycleTimeMinConfig = config.getOptionalNumber('pullRequestCycleTime.PRReviewCycleTimeMin');
  const prReviewCycleTimeMaxConfig = config.getOptionalNumber('pullRequestCycleTime.PRReviewCycleTimeMax');
  const prMergeCycleTimeMinConfig = config.getOptionalNumber('pullRequestCycleTime.PRMergeCycleTimeMin');
  const prMergeCycleTimeMaxConfig = config.getOptionalNumber('pullRequestCycleTime.PRMergeCycleTimeMax');

// Route to fetch PR metrics
router.get('/azurePRMetrics', async (request, response) => {
  logger.info('Fetching Azure Repo PR metrics!');
  const projectName = request.query.projectName as any;
  const repositoryName = request.query.repositoryName as any;
  azureRepoService.setProjectDetails(projectName, repositoryName);
  
  const prCycleTimeMinCatalog = Number(request.query.prCycleTimeMin);
  const prCycleTimeMaxCatalog = Number(request.query.prCycleTimeMax);
  const prReviewCycleTimeMinCatalog = Number(request.query.prReviewCycleTimeMin);
  const prReviewCycleTimeMaxCatalog = Number(request.query.prReviewCycleTimeMax);
  const prMergeCycleTimeMinCatalog = Number(request.query.prMergeCycleTimeMin);
  const prMergeCycleTimeMaxCatalog = Number(request.query.prMergeCycleTimeMax);


  const prCycleTimeMin = prCycleTimeMinCatalog || prCycleTimeMinConfig;
  const prCycleTimeMax = prCycleTimeMaxCatalog || prCycleTimeMaxConfig;
  const prReviewCycleTimeMin = prReviewCycleTimeMinCatalog || prReviewCycleTimeMinConfig;
  const prReviewCycleTimeMax = prReviewCycleTimeMaxCatalog || prReviewCycleTimeMaxConfig;
  const prMergeCycleTimeMin = prMergeCycleTimeMinCatalog || prMergeCycleTimeMinConfig;
  const prMergeCycleTimeMax = prMergeCycleTimeMaxCatalog || prMergeCycleTimeMaxConfig;
  const MAX_DURATION_DAYS = 365; // Maximum limit for durationDays
  try {
    // Calculate durationDays based on user input or default to 60 days.
    // Restrict the value to a maximum of MAX_DURATION_DAYS (365 days) to ensure the range is limited to 1 year.
    const durationDays = Math.min(Number(request.query.durationDays) || 60, MAX_DURATION_DAYS);
    const metrics = await azureRepoPRMetricsService.fetchPRMetrics(
      projectName,
      repositoryName,
      {
        prCycleTimeMin,
        prCycleTimeMax,
        prReviewCycleTimeMin,
        prReviewCycleTimeMax,
        prMergeCycleTimeMin,
        prMergeCycleTimeMax,
      },
      durationDays,
    );
    
    const sanitizedOutput = xss(JSON.stringify(metrics));
    return response.send(sanitizedOutput);
  } catch (error: any) {
    logger.error('Error fetching Azure Repo PR metrics:', error);
    switch (error.status) {
      case 503:
        return response.status(503).send({
          success: false,
          error: 'Service unavailable, missing values credentials in azureServer',
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
        return response.status(500).send({
          success: false,
          error: 'Unexpected Error',
        });
    }
  }
});

  router.get('/azurePullRequests', async (request, response) => {
    const projectName = request.query.projectName as any;
    const repositoryName = request.query.repositoryName as any;  
    const state = request.query.state as string; 
    azureRepoService.setProjectDetails(projectName, repositoryName);
    let durationDaysCatalog: number = Number(request.query.durationDaysCatalog);
    const durationInDays = durationDaysCatalog || durationConfig;

    try {
        const data = await azureRepoService.fetchPullRequests(durationInDays, state);
        return response.json(data);
    } catch (error: any) {
        logger.error(error as any);
        if ((error as any).status === 503) {
          return response.status(503).send((error as any).message);
        } else if(error.status === 404) { 
          return response.status(404).send({
            success: false,
            error: error.message
        });
        }
        else {
          return response.status(500).send('Server Error');
        }
    }
});

  router.get('/azurePullRequests/:id', async (request, response) => {
    const projectName = request.query.projectName as any;
    const repositoryName = request.query.repositoryName as any;
    azureRepoService.setProjectDetails(projectName, repositoryName);
    const id = request.params.id;
    try {
      const data = await azureRepoService.fetchPullRequestById(id);
      const sanitizedData = xss(JSON.stringify(data));
      response.json(JSON.parse(sanitizedData));
    } catch (error) {
      logger.error(error as any);
      response.status(500).send('Server Error');
    }
  });
  
  router.get('/azureGraphData', async (request, response) => {
    const projectName = request.query.projectName as any;
    const repositoryName = request.query.repositoryName as any;
    azureRepoService.setProjectDetails(projectName, repositoryName);
    try{
      const data = await azureRepoService.fetchGraphData();
      response.json(data);
    }catch(error){
      logger.error(error as any);
      response.status(500).send('Server Error');
    }
  });
      

  router.get('/plugin-versions', async (_request, response) => {
    const backendVersionJson = "{\"version\": \"" + backEndPackageJson.version + "\"}";
    return response.status(200).send(backendVersionJson);
  });
  router.use(errorHandler());
  return router;
}
