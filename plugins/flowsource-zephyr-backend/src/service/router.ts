import { MiddlewareFactory } from '@backstage/backend-defaults/rootHttpRouter';
import { LoggerService } from '@backstage/backend-plugin-api';
import { Config } from '@backstage/config';
import express from 'express';
import Router from 'express-promise-router';
import backEndPackageJson from '../../package.json';
import { JiraApiService } from './jiraApi.service';
import { ZephyrApiService } from './zephyrApi.service';
import { ZephyrService } from './zephyr.service';
import xss from 'xss';
import helmet from 'helmet';

export interface RouterOptions {
  logger: LoggerService;
  config: Config;
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


  router.get('/health', (_, response) => {
    logger.info('PONG!');
    response.json({ status: 'ok' });
  });

  const baseUrl = config.getOptionalString('zephyr.baseUrl') || '';
  const accessToken = config.getOptionalString('zephyr.accessToken') || '';

  if (!baseUrl || !accessToken) {
    router.use((_req, res) => {
      res.status(503).send({
        success: false,
        error: 'This plugin has not been configured with the required values. Please ask your administrator to configure it'
      });
    });
    return router;
  }

  const jiraUserEmail = config.getOptionalString('jiracustom.jiraUserEmail') || '';
  const jiraAccessKey = config.getOptionalString('jiracustom.jiraAccessKey') || '';
  const jiraBaseUrlConfig = config.getOptionalString('jiracustom.jiraBaseUrl');
  let jiraBaseUrl = '';
  if (jiraBaseUrlConfig) {
    jiraBaseUrl = jiraBaseUrlConfig.endsWith('/') ? jiraBaseUrlConfig : `${jiraBaseUrlConfig}/`;
  }

  if (!jiraUserEmail || !jiraAccessKey || !jiraBaseUrlConfig) {
    router.use((_req, res) => {
      res.status(503).send({
        success: false,
        error: 'This plugin has not been configured with the required Jira specific values. Please ask your administrator to configure it',
      });
    });
    return router;
  }

  const durationConfig = config.has('flowsource.dataPullDuration') ? config.getNumber('flowsource.dataPullDuration') : 60;

  const jiraApiService = new JiraApiService(logger, jiraBaseUrl, jiraUserEmail, jiraAccessKey);
  const zephyrApiService = new ZephyrApiService(logger, baseUrl, accessToken);
  const zephyrService = new ZephyrService(logger, zephyrApiService, jiraApiService);

  /**
   * Handle errors and send appropriate responses.
   * @param response - The Express response object.
   * @param message - The error message.
   * @param error - The error object.
   */
  const handleError = (response: express.Response, message: string, error: any) => {
    logger.error(message, error);
    switch (error.status) {
      case 400:
        return response.status(400).send({
          success: false,
          error: `${error.message}`
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
  };

  /**
   * Log success messages and send responses.
   * @param response - The Express response object.
   * @param message - The success message.
   * @param output - The output data to send in the response.
   */
  const handleSuccess = (response: express.Response, message: string, output: any) => {
    logger.info(message);
    return response.status(200).send(xss(JSON.stringify(output)));
  };

  router.get('/testcases/count', async (request, response) => {
    logger.info('Fetching testcases count');
    const projectKey: string = xss(request.query.projectKey as string || '');
    try {
      const output = await zephyrService.getTestcasesCount(projectKey);
      return handleSuccess(response, 'Testcases count fetched successfully', output);
    } catch (error: any) {
      return handleError(response, 'Error in fetching testcases count', error);
    }
  });

  router.get('/defects/count', async (request, response) => {
    logger.info('Fetching defects count');
    const projectKey: string = xss(request.query.projectKey as string || '');
    const onlyActiveSprints = xss(request.query.onlyActiveSprints as string || 'false') === 'true';
    const durationDaysCatalog = Number(xss(request.query.durationDaysCatalog as string || ''));
    const durationInDays = durationDaysCatalog || durationConfig;
    try {
      const output = await jiraApiService.getJiraDefectsCount(projectKey, durationInDays, onlyActiveSprints);
      return handleSuccess(response, 'Defects count fetched successfully', output);
    } catch (error: any) {
      return handleError(response, 'Error in fetching defects count', error);
    }
  });

  router.get('/stories-without-testcases', async (request, response) => {
    logger.info('Fetching stories without testcases');
    const projectKey: string = xss(request.query.projectKey as string || '');
    const status = xss(request.query.status as string || '');
    const page = Number(xss(request.query.page as string || '1'));
    const maxResults = Number(xss(request.query.maxResults as string || '100'));
    const onlyActiveSprints = xss(request.query.onlyActiveSprints as string || 'false') === 'true';
    const durationDaysCatalog = Number(xss(request.query.durationDaysCatalog as string || ''));
    const durationInDays = durationDaysCatalog || durationConfig;
    try {
      const output = await zephyrService.getStoriesWithoutTestcases(projectKey, durationInDays, onlyActiveSprints, page, maxResults, status);
      return handleSuccess(response, 'Stories without testcases fetched successfully', output);
    } catch (error: any) {
      return handleError(response, 'Error in fetching stories without testcases', error);
    }
  });

  router.get('/testcycles', async (request, response) => {
    logger.info('Fetching testcycles');
    const projectKey: string = xss(request.query.projectKey as string || '');
    const page = Number(xss(request.query.page as string || '1'));
    const maxResults = Number(xss(request.query.maxResults as string || '100'));
    try {
      const output = await zephyrService.fetchTestCycles(jiraBaseUrl, projectKey, page, maxResults);
      return handleSuccess(response, 'Testcycles fetched successfully', output);
    } catch (error: any) {
      return handleError(response, 'Error in fetching testcycles', error);
    }
  });

  router.get('/testcycle/executions', async (request, response) => {
    logger.info('Fetching test cycle executions');
    const projectKey: string = xss(request.query.projectKey as string || '');
    const testCycleKey: string = xss(request.query.testCycleKey as string || '');
    try {
      const output = await zephyrService.getTestCycleExecutions(jiraBaseUrl, projectKey, testCycleKey);
      return handleSuccess(response, 'Test cycle executions fetched successfully', output);
    } catch (error: any) {
      return handleError(response, 'Error in fetching test cycle executions', error);
    }
  });

  router.get('/defects', async (request, response) => {
    logger.info('Fetching defects');
    const projectKey: string = xss(request.query.projectKey as string || '');
    const status = xss(request.query.status as string || '');
    const page = Number(xss(request.query.page as string || '1'));
    const maxResults = Number(xss(request.query.maxResults as string || '100'));
    const onlyActiveSprints = xss(request.query.onlyActiveSprints as string || 'false') === 'true';
    const durationDaysCatalog = Number(xss(request.query.durationDaysCatalog as string || ''));
    const durationInDays = durationDaysCatalog || durationConfig;
    try {
      const output = await jiraApiService.getJiraDefects(projectKey, durationInDays, maxResults, page, onlyActiveSprints, undefined, status);
      return handleSuccess(response, 'Defects fetched successfully', output);
    } catch (error: any) {
      return handleError(response, 'Error in fetching Jira defects', error);
    }
  });

  router.get('/plugin-versions', async (_request, response) => {
    const backendVersionJson = `{"version": "${backEndPackageJson.version}"}`;
    return response.status(200).send(backendVersionJson);
  });

  const middleware = MiddlewareFactory.create({ logger, config });

  router.use(middleware.error());
  return router;
}
