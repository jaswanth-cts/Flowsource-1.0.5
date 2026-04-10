import { errorHandler } from '@backstage/backend-common';
import express from 'express';
import Router from 'express-promise-router';
import { LoggerService , RootConfigService } from '@backstage/backend-plugin-api';

import CodeQualityService from './CodeQualityService';
import xss from 'xss';

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
  router.use(express.json());

  const sonarqubeUrl = config.getOptionalString('sonarqube.baseUrl') || '';
  const sonarqubeApikey = config.getOptionalString('sonarqube.apiKey') || '';
  const sonarqubeVersion = config.getOptionalString('sonarqube.version') || '';
  if (!sonarqubeUrl || !sonarqubeApikey || !sonarqubeVersion) {
    router.use((_req, res) => {
        res.status(503).send({
            success: false,
            error: 'This plugin has not been configured with the required values. Please ask your administrator to configure it'
        });
    });
    return router;
}
  const codeQualityService = new CodeQualityService(sonarqubeApikey, sonarqubeUrl, sonarqubeVersion, logger);

  router.get('/health', (_, response) => {
    logger.info('PONG!');
    response.json({ status: 'ok' });
  });

  router.post('/code-quality-details', async (request, response) => {
    try {
        const { projectKey } = request.body;
        const summaryDetails = await codeQualityService.getSummaryDetails(projectKey);
        const sanitizedOutput = xss(JSON.stringify(summaryDetails));
        return response.send(sanitizedOutput);
    } catch (error: any) {
      
      console.error('CodeQuality router error:', error);

      if(error.status === 404) { 
        return response.status(404).send({
          success: false,
          error: error.message
        });
      } else {
        return response.status(500).send('An error occurred while trying to get the summary details.');
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