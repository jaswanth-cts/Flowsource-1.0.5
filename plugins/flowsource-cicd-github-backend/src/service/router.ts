import { errorHandler } from '@backstage/backend-common';
import { LoggerService } from '@backstage/backend-plugin-api';
import { Config } from '@backstage/config';
import { ScmIntegrations } from '@backstage/integration';
import express from 'express';
import Router from 'express-promise-router';
import xss from 'xss';
import { GithubActionsService } from './githubActions.service';

import backEndPackageJson from '../../package.json';

// Define the RouterOptions interface
export interface RouterOptions {
  logger: LoggerService;
  config: Config;
}

// Async function to create and configure the router
export async function createRouter(
  options: RouterOptions,
): Promise<express.Router> {
  const { config, logger } = options;

  // Initialize the router
  const router = Router();
  router.use(express.json()); // Use express.json() middleware for parsing JSON

  // Setup GitHub integrations with tokens & github apps
  const baseUrl = config
    .getOptionalString('githubActions.baseUrl')
    ?.endsWith('/')
    ? config.getOptionalString('githubActions.baseUrl')?.slice(0, -1)
    : config.getOptionalString('githubActions.baseUrl');
  const gitBaseUrl = baseUrl || '';

  function getGithubActionsService(
    config: Config,
    host: string,
  ): GithubActionsService {
    try {
      const integrations = ScmIntegrations.fromConfig(config);
      const gitToken =
        integrations.github.byHost(host as string)?.config?.token || '';
      const gitAppsToken =
        integrations.github.byHost(host as string)?.config?.apps || '';

      if ((!gitToken && !gitAppsToken) || !gitBaseUrl) {
        const error = new Error(
          `Github Copilot failed with error 503, missing values in githubActions`,
        );
        (error as any).status = 503; // Attach status code to error object
        throw error;
      }

      let tokenToUse;
      if (gitToken) {
        tokenToUse = gitToken;
      } else {
        tokenToUse = {
          appId: gitAppsToken ? gitAppsToken[0]?.appId : undefined,
          clientId: gitAppsToken ? gitAppsToken[0]?.clientId : undefined,
          clientSecret: gitAppsToken
            ? gitAppsToken[0]?.clientSecret
            : undefined,
          privateKey: gitAppsToken ? gitAppsToken[0]?.privateKey : undefined,
        };
      }

      return new GithubActionsService(tokenToUse, gitBaseUrl, logger);
    } catch (error) {
      logger.error('Error in getGithubActionsService', error as Error);
      throw error;
    }
  }

  //route for getting failure details
  router.get('/failure-details', async (request, response) => {
    // Sanitize input to prevent XSS attacks
    let gitOwner: string = request.query.gitOwner as string;
    let gitRepo: string = request.query.gitRepo as string;
    let runID: number = Number(request.query.runId);
    const hostFromCatalog = request.query.hostFromCatalog;
    const host = String(hostFromCatalog || 'github.com');

    try {
      // Fetch failure details from the GitHub Actions service
      let failureDetails = await getGithubActionsService(
        config,
        host,
      ).getFailureDetails(gitOwner, gitRepo, runID);

      // Sanitize the failure details object
      failureDetails = sanitizeObject(failureDetails);

      // Send the sanitized response
      return response.status(200).send({
        failureDetails,
      });
    } catch (error: any) {
      // Handle errors and send appropriate HTTP status codes
      logger.error('Error in fetching failure details', error as Error);
      switch (error.status) {
        case 503:
          return response.status(503).send({
            success: false,
            error:
              'Github CICD failed with error 503, missing values in githubActions',
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

  // Route for getting workflows
  router.get('/workflows', async (request, response) => {
    // Sanitize input to prevent XSS attacks
    let gitOwner: string = xss(request.query.gitOwner as string);
    let gitRepo: string = xss(request.query.gitRepo as string);
    let workflowNames: string = xss(request.query.workflowNames as string);

    const maxWorkflowLimit: string = xss(
      request.query.maxWorkflowLimit as string,
    );
    const hostFromCatalog = request.query.hostFromCatalog;
    const host = String(hostFromCatalog || 'github.com'); // Ensure host is of type string

    try {
      let { matchingWorkflowsArray, errorArray } =
        await getGithubActionsService(config, host).getMatchingWorkflowNames(
          gitOwner,
          gitRepo,
          workflowNames,
          parseInt(maxWorkflowLimit),
        );

      matchingWorkflowsArray = sanitizeObject(matchingWorkflowsArray);
      errorArray = sanitizeObject(errorArray);

      // Send the sanitized response
      return response.status(200).send({
        matchingWorkflowsArray,
        errorArray,
      });
    } catch (error: any) {
      // Handle errors and send appropriate HTTP status codes
      logger.error('Error in fetching workflow names', error as Error);
      switch (error.status) {
        case 503:
          return response.status(503).send({
            success: false,
            error:
              'Github CICD failed with error 503, missing values in githubActions',
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
          if(error.message && error.message.includes('Incorrect git owner or repo')) {
            return response.status(404).send({
              success: false,
              error: error.message
            });
          } else {
            return response.status(404).send({
              success: false,
              error: 'Not Found: fetch error',
            });
          }
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

  // Route for getting workflow runs
  router.get('/workflow-runs', async (request, response) => {
    // Extract and sanitize query parameters
    let gitOwner: string = request.query.gitOwner as string;
    let gitRepo: string = request.query.gitRepo as string;
    let workflowId: number = Number(request.query.workflowId);
    let durationDaysCatalog: number = Number(request.query.durationDaysCatalog);
    let durationConfig = config.has('flowsource.dataPullDuration')
      ? config.getNumber('flowsource.dataPullDuration')
      : 60; // Default to 60 if not specified
    let pageNumber = Number(request.query.pageNumber);
    let pageSize = Number(request.query.pageSize);
    const hostFromCatalog = request.query.hostFromCatalog;
    const host = String(hostFromCatalog || 'github.com'); // Ensure host is of type string

    try {
      // Fetch workflow run details and sanitize the response
      let workflowRunDetails = await getGithubActionsService(
        config,
        host,
      ).getWorkflowRunDetails(
        gitOwner,
        gitRepo,
        workflowId,
        durationDaysCatalog,
        durationConfig,
        pageNumber,
        pageSize,
      );

      workflowRunDetails = sanitizeObject(workflowRunDetails);

      // Send the sanitized response
      return response.status(200).send(workflowRunDetails);
    } catch (error: any) {
      // Handle errors and send appropriate HTTP status codes
      logger.error('Error in fetching workflow run details', error);
      switch (error.status) {
        case 503:
          return response.status(503).send({
            success: false,
            error:
              'Github CICD failed with error 503, missing values in githubActions',
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

  // Utility function to recursively sanitize objects, arrays, and strings
  function sanitizeObject(obj: any): any {
    if (typeof obj === 'string') {
      return xss(obj);
    } else if (Array.isArray(obj)) {
      return obj.map(item => sanitizeObject(item));
    } else if (typeof obj === 'object' && obj !== null) {
      return Object.fromEntries(
        Object.entries(obj).map(([key, value]) => [key, sanitizeObject(value)]),
      );
    } else {
      return obj;
    }
  }

  router.get('/plugin-versions', async (_request, response) => {
    const backendVersionJson =
      '{"version": "' + backEndPackageJson.version + '"}';
    return response.status(200).send(backendVersionJson);
  });

  // Use the errorHandler middleware for handling errors
  router.use(errorHandler());
  return router; // Return the configured router
}
