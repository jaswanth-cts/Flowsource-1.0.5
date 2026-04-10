import { errorHandler } from '@backstage/backend-common';
import express from 'express';
import Router from 'express-promise-router';
import GithubPullRequestService from './api/githubPullRequest.service';
import GithubPRMetricsService from './api/GithubPRMetricsService';
import xss from 'xss';
import { LoggerService , RootConfigService } from '@backstage/backend-plugin-api';

import { ScmIntegrations } from '@backstage/integration';
import backEndPackageJson from '../../package.json';

// Defines the structure for router options including logger and config services.
export interface RouterOptions {
  logger: LoggerService;
  config: RootConfigService;
}

// Creates an express router with routes for GitHub pull requests and health checks.
export async function createRouter(
  options: RouterOptions,
): Promise<express.Router> {
  const { logger, config } = options;
  const githubPullRequestService = new GithubPullRequestService( logger);
  const githubPRMetricsService = new GithubPRMetricsService(logger);
  const integrations = ScmIntegrations.fromConfig(config);
  // Retrieves the data pull duration from the config, defaulting to 60 if not set.
  let durationConfig = config.has('flowsource.dataPullDuration')
    ? config.getNumber('flowsource.dataPullDuration')
    : 60;

  const prCycleTimeMinConfig = config.getOptionalNumber('githubPRCycleTime.PRCycleTimeMin');
  const prCycleTimeMaxConfig = config.getOptionalNumber('githubPRCycleTime.PRCycleTimeMax');
  const prReviewCycleTimeMinConfig = config.getOptionalNumber('githubPRCycleTime.PRReviewCycleTimeMin');
  const prReviewCycleTimeMaxConfig = config.getOptionalNumber('githubPRCycleTime.PRReviewCycleTimeMax');
  const prMergeCycleTimeMinConfig = config.getOptionalNumber('githubPRCycleTime.PRMergeCycleTimeMin');
  const prMergeCycleTimeMaxConfig = config.getOptionalNumber('githubPRCycleTime.PRMergeCycleTimeMax');
  
  const router = Router();
  router.use(express.json());

  // Health check route.
  router.get('/health', (_, response) => {
    logger.info('PONG!');
    response.json({ status: 'ok' });
  });

  function handleError(error: any, response: any) {
    logger.error('Error fetching GitHub PRs:', error as Error);
    switch (error.status) {
      case 503:
        return response.status(503).send({
          success: false,
          error: 'Service unavailable, missing values credentials in GitHub'
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
        if(error.message && error.message.includes('Incorrect git owner or repo')) {
          return response.status(404).send({
            success: false,
            error: error.message
          });
        } else {
          return response.status(404).send({
            success: false,
            error: 'Not Found: fetch error'
          });
        }
      case 500:
        return response.status(500).send({
          success: false,
          error: 'Internal Server Error: fetch error'
        });
      default:
        return response.status(500).send({
          success: false,
          error: 'Unexpected Error'
        });
    }
  }

  // Route to fetch GitHub pull requests based on state.
  router.get('/githubPullRequests', async (request, response) => {
    logger.info('Fetching open GitHub PRs list!');
    const repoName = request.query.repoName;
    const repoOwner = request.query.repoOwner;
    const state = request.query.state;
    const durationDaysCatalog = Number(request.query.durationDaysCatalog);
    const hostFromCatalog = request.query.hostFromCatalog;
    const host = hostFromCatalog || 'github.com';
    const githubToken = integrations.github.byHost(host as string)?.config?.token;
  
    try {
      const githubAppsToken = integrations.github.byHost(host as string)?.config?.apps;
  
      if (!githubToken && !githubAppsToken) {
        const error = new Error('GitHub Copilot failed with error 503, missing values in githubActions');
        (error as any).status = 503; // Attach status code to error object
        throw error;
      }
  
      const tokenToUse = githubToken || {
        appId: githubAppsToken ? githubAppsToken[0]?.appId : undefined,
        clientId: githubAppsToken ? githubAppsToken[0]?.clientId : undefined,
        clientSecret: githubAppsToken ? githubAppsToken[0]?.clientSecret : undefined,
        privateKey: githubAppsToken ? githubAppsToken[0]?.privateKey : undefined,
      };
  
      // Fetches pull request list based on state and sanitizes the output before sending.
      const PRs = await githubPullRequestService.getGithubPullRequestList(
        repoName,
        repoOwner,
        tokenToUse,
        durationDaysCatalog,
        durationConfig,
        state
      );
  
      const sanitizedOutput = xss(JSON.stringify(PRs));
      return response.send(sanitizedOutput);
    } catch (error: any) {
      return handleError(error, response);
    }
  });
  
  // Route to fetch full pull requests for Pr Trend & PR Aging Calculation
  router.get('/githubGraphPullRequests', async (request, response) => {
    logger.info('Fetching GitHub PRs list!');
    const repoName = request.query.repoName;
    const repoOwner = request.query.repoOwner;
    const hostFromCatalog = request.query.hostFromCatalog;
    const host = hostFromCatalog || 'github.com';
    const githubToken = integrations.github.byHost(host as string)?.config?.token;
  
    try {
      const githubAppsToken = integrations.github.byHost(host as string)?.config?.apps;
  
      if (!githubToken && !githubAppsToken) {
        const error = new Error('GitHub Copilot failed with error 503, missing values in githubActions');
        (error as any).status = 503; // Attach status code to error object
        throw error;
      }
  
      const tokenToUse = githubToken || {
        appId: githubAppsToken ? githubAppsToken[0]?.appId : undefined,
        clientId: githubAppsToken ? githubAppsToken[0]?.clientId : undefined,
        clientSecret: githubAppsToken ? githubAppsToken[0]?.clientSecret : undefined,
        privateKey: githubAppsToken ? githubAppsToken[0]?.privateKey : undefined,
      };
  
      const fullPRs = await githubPullRequestService.getGithubPRCalculation(
        repoName,
        repoOwner,
        tokenToUse,
        'full'
      );
  
      const sanitizedOutput = xss(JSON.stringify(fullPRs));
      return response.send(sanitizedOutput);
    } catch (error: any) {
      return handleError(error, response);
    }
  });

  // Route to fetch PR metrics
  router.get('/githubPRMetrics', async (request, response) => {
    logger.info('Fetching GitHub PR metrics!');
    const repoName = request.query.repoName as string;
    const repoOwner = request.query.repoOwner as string;
    const prCycleTimeMinCatalog = Number(request.query.prCycleTimeMin);
    const prCycleTimeMaxCatalog = Number(request.query.prCycleTimeMax);
    const prReviewCycleTimeMinCatalog = Number(request.query.prReviewCycleTimeMin);
    const prReviewCycleTimeMaxCatalog = Number(request.query.prReviewCycleTimeMax);
    const prMergeCycleTimeMinCatalog = Number(request.query.prMergeCycleTimeMin);
    const prMergeCycleTimeMaxCatalog = Number(request.query.prMergeCycleTimeMax);
    const durationDaysCatalog = Number(request.query.durationDaysCatalog);
    const hostFromCatalog = request.query.hostFromCatalog;
    const host = hostFromCatalog || 'github.com';
    const githubToken = integrations.github.byHost(host as string)?.config?.token;
    
    const prCycleTimeMin = prCycleTimeMinCatalog || prCycleTimeMinConfig;
    const prCycleTimeMax = prCycleTimeMaxCatalog || prCycleTimeMaxConfig;
    const prReviewCycleTimeMin = prReviewCycleTimeMinCatalog || prReviewCycleTimeMinConfig;
    const prReviewCycleTimeMax = prReviewCycleTimeMaxCatalog || prReviewCycleTimeMaxConfig;
    const prMergeCycleTimeMin = prMergeCycleTimeMinCatalog || prMergeCycleTimeMinConfig;
    const prMergeCycleTimeMax = prMergeCycleTimeMaxCatalog || prMergeCycleTimeMaxConfig;


    try {
      const githubAppsToken = integrations.github.byHost(host as string)?.config?.apps;

      if (!githubToken && !githubAppsToken) {
        const error = new Error('GitHub PR cycle metrics failed with error 503, missing values in githubToken or githubAppsToken');
        (error as any).status = 503; // Attach status code to error object
        throw error;
      }

      const tokenToUse = githubToken || {
        appId: githubAppsToken ? githubAppsToken[0]?.appId : undefined,
        clientId: githubAppsToken ? githubAppsToken[0]?.clientId : undefined,
        clientSecret: githubAppsToken ? githubAppsToken[0]?.clientSecret : undefined,
        privateKey: githubAppsToken ? githubAppsToken[0]?.privateKey : undefined,
      };

      const metrics = await githubPRMetricsService.fetchPRMetrics(
        repoOwner,
        repoName,
        tokenToUse,
        durationDaysCatalog,
        durationConfig,
        {
          prCycleTimeMin,
          prCycleTimeMax,
          prReviewCycleTimeMin,
          prReviewCycleTimeMax,
          prMergeCycleTimeMin,
          prMergeCycleTimeMax
        }
      );
      const sanitizedOutput = xss(JSON.stringify(metrics));
      return response.send(sanitizedOutput);
    } catch (error: any) {
      return handleError(error, response);
    }
  });

  router.get('/plugin-versions', async (_request, response) => {

    const backendVersionJson = "{\"version\": \"" + backEndPackageJson.version + "\"}";

    return response.status(200).send(backendVersionJson);

  });

  // Error handling middleware.
  router.use(errorHandler());
  return router;
}
