import { errorHandler } from '@backstage/backend-common';
import express from 'express';
import Router from 'express-promise-router';
import { LoggerService } from '@backstage/backend-plugin-api';
import { Config } from '@backstage/config';
import xss from 'xss';
import AuthService from './api/authService';
import BitbucketPRMetricsService from './api/BitbucketPRMetricsService'
import { ScmIntegrations } from '@backstage/integration';
import backEndPackageJson from '../../package.json';
import { BitbucketBackendDataService } from './api/bitbucketBackendData.service';

export interface RouterOptions {
  logger: LoggerService;
  config: Config;
}

export async function createRouter(
  options: RouterOptions,
): Promise<express.Router> {
  const { config, logger } = options;
  const router = Router();
  router.use(express.json());
  const integrations = ScmIntegrations.fromConfig(config);
  const bitbucketPRMetricsService = new BitbucketPRMetricsService(logger);
  const durationConfig = config.has('flowsource.dataPullDuration') ? config.getNumber('flowsource.dataPullDuration') : 60;
  const authService = new AuthService( logger );
  const bitbucketDataService = new BitbucketBackendDataService( logger); 

  router.get('/health', (_, response) => {
    logger.info('PONG!');
    response.json({ status: 'ok' });
  });

  // New configuration for cycle time thresholds
  const prCycleTimeMinConfig = config.getOptionalNumber('pullRequestCycleTime.PRCycleTimeMin');
  const prCycleTimeMaxConfig = config.getOptionalNumber('pullRequestCycleTime.PRCycleTimeMax');
  const prReviewCycleTimeMinConfig = config.getOptionalNumber('pullRequestCycleTime.PRReviewCycleTimeMin');
  const prReviewCycleTimeMaxConfig = config.getOptionalNumber('pullRequestCycleTime.PRReviewCycleTimeMax');
  const prMergeCycleTimeMinConfig = config.getOptionalNumber('pullRequestCycleTime.PRMergeCycleTimeMin');
  const prMergeCycleTimeMaxConfig = config.getOptionalNumber('pullRequestCycleTime.PRMergeCycleTimeMax');

// Route to fetch PR metrics
router.get('/bitbucketPRMetrics', async (req, response) => {
  logger.info('Fetching Bitbucket PR metrics!');

  // Extract query parameters
  const { repoName, repoOwner, hostFromCatalog, durationInMonths } = req.query;
  const prCycleTimeMinCatalog = Number(req.query.prCycleTimeMin);
  const prCycleTimeMaxCatalog = Number(req.query.prCycleTimeMax);
  const prReviewCycleTimeMinCatalog = Number(req.query.prReviewCycleTimeMin);
  const prReviewCycleTimeMaxCatalog = Number(req.query.prReviewCycleTimeMax);
  const prMergeCycleTimeMinCatalog = Number(req.query.prMergeCycleTimeMin);
  const prMergeCycleTimeMaxCatalog = Number(req.query.prMergeCycleTimeMax);

  // Validate required parameters
  if (!repoName || !repoOwner || !durationInMonths) {
    return response.status(400).send({
      success: false,
      error: 'Missing required query parameters: repoName, repoOwner, or durationInMonths',
    });
  }

  const host = hostFromCatalog || 'bitbucket.org';
  // Resolve auth token and baseUrl via AuthService (reads config first, falls back to ScmIntegrations)
  let authToken = '';
  let baseUrl = '';
  try {
    const auth = await authService.getAuthToken(config, integrations, host as string);
    authToken = auth.token;
    baseUrl = auth.baseUrl;
  } catch (err: any) {
    logger.error('Auth resolution failed for Bitbucket PR metrics:', err);
    return response.status(err?.status || 503).send({
      success: false,
      error: err?.message || 'Service unavailable, missing values in bitbucketServer configuration',
    });
  }

  // Resolve cycle time thresholds
  const prCycleTimeMin = prCycleTimeMinCatalog || prCycleTimeMinConfig;
  const prCycleTimeMax = prCycleTimeMaxCatalog || prCycleTimeMaxConfig;
  const prReviewCycleTimeMin = prReviewCycleTimeMinCatalog || prReviewCycleTimeMinConfig;
  const prReviewCycleTimeMax = prReviewCycleTimeMaxCatalog || prReviewCycleTimeMaxConfig;
  const prMergeCycleTimeMin = prMergeCycleTimeMinCatalog || prMergeCycleTimeMinConfig;
  const prMergeCycleTimeMax = prMergeCycleTimeMaxCatalog || prMergeCycleTimeMaxConfig;

  try {
    // Fetch PR metrics
    const metrics = await bitbucketPRMetricsService.fetchPRMetrics(
      repoName as string,
      repoOwner as string,
      baseUrl,
      authToken,
      {
        prCycleTimeMin,
        prCycleTimeMax,
        prReviewCycleTimeMin,
        prReviewCycleTimeMax,
        prMergeCycleTimeMin,
        prMergeCycleTimeMax,
      },
      Number(durationInMonths) // Pass duration in months
    );

    // Sanitize and send the response
    const sanitizedOutput = xss(JSON.stringify(metrics));
    return response.send(sanitizedOutput);
  } catch (error: any) {
    logger.error('Error fetching Bitbucket PR metrics:', error);

    // Handle specific error statuses
    switch (error.status) {
      case 503:
        return response.status(503).send({
          success: false,
          error: 'Service unavailable, missing values credentials in bitbucketServer',
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

  //To fetch Pull Requests accroding to the durationInDays from the catalog or last six months PR data
  router.get('/pullrequests', async (req, response) => {

    const { repoName, repoOwner, durationDaysCatalog, hostFromCatalog, state, fetchSixMonthsData} = req.query;
    const fetchSixMonths = fetchSixMonthsData === 'true' ? true : false;
    const dataPullduration: number = Number(durationDaysCatalog) || Number(durationConfig);

    const host = hostFromCatalog || 'bitbucket.org';
    // Move credential and baseUrl resolution into AuthService
    let authToken = '';
    let baseUrl = '';
    try {
      const auth = await authService.getAuthToken(config, integrations, host as string);
      authToken = auth.token;
      baseUrl = auth.baseUrl;
    } catch (err: any) {
      // Re-throw to let the outer catch handle response mapping
      throw err;
    }
  
    try {

      // To fetch graph data for the last six months
      if (fetchSixMonths) { 
        const res = await bitbucketDataService.getGraphPullrequestData(repoName, repoOwner, baseUrl, authToken);
        const sanitizedOutput = xss(JSON.stringify(res));
        return response.send(sanitizedOutput);
      }
      
      const res = await bitbucketDataService.getPullrequestData(repoName, repoOwner, dataPullduration, baseUrl, authToken, state);
      const sanitizedOutput = xss(JSON.stringify(res));
      return response.send(sanitizedOutput);
    } catch (error: any) {
      logger.error('Error fetching Bitbucket PRs:', error);
      switch (error.status) {
        case 503:
          return response.status(503).send({
            success: false,
            error: 'Service unavailable, missing values credentials in bitbucketServer'
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

  // To fetch Pull Request details by PR ID
  router.get('/pullrequests/:id', async (req, response) => {
    const { id } = req.params;
    const { repoName, repoOwner, hostFromCatalog } = req.query;
    const host = hostFromCatalog || 'bitbucket.org';
    // Resolve auth token and baseUrl via AuthService
    let authToken = '';
    let baseUrl = '';
    try {
      const auth = await authService.getAuthToken(config, integrations, host as string);
      authToken = auth.token;
      baseUrl = auth.baseUrl;
    } catch (err: any) {
      logger.error('Auth resolution failed for Bitbucket pullrequest by id:', err);
      const error = new Error(err?.message || `Bitbucket plugin failed with error 503, missing values in bitbucketServer`);
      (error as any).status = err?.status || 503;
      throw error;
    }
    try {
      const res = await bitbucketDataService.getPullrequestDataById(id, repoName, repoOwner, baseUrl, authToken);
      const sanitizedOutput = xss(JSON.stringify(res));
      return response.send(sanitizedOutput);
    } catch (error: any) {
      logger.error('Error fetching Bitbucket PRs:', error);
      switch (error.status) {
        case 503:
          return response.status(503).send({
            success: false,
            error: 'Service unavailable, missing values credentials in bitbucketServer'
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

  router.get('/plugin-versions', async (_request, response) => {

    const backendVersionJson = "{\"version\": \"" + backEndPackageJson.version + "\"}";

    return response.status(200).send(backendVersionJson);

  });
  
  router.use(errorHandler());
  return router;
}
