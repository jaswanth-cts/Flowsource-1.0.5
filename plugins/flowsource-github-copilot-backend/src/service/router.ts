import { errorHandler } from '@backstage/backend-common';
import express from 'express';
import Router from 'express-promise-router';
import { Config } from '@backstage/config';
import { LoggerService } from '@backstage/backend-plugin-api';
import GithubCopilot from './api/githubCopilot.service';
import { ScmIntegrations } from '@backstage/integration';

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
  router.use(express.json());

  const integrations = ScmIntegrations.fromConfig(config);

  const environment = config.getOptionalString('auth.environment') || '';
  let organization = '';
  if(environment != ''){
   organization = config.getOptionalString('auth.providers.github.'.concat(environment).concat('.githubOrganization')) || '';
  }
  
  if (!environment || !organization) {
      router.use((_req, res) => {
          res.status(503).send({
              success: false,
              error: 'This plugin has not been configured with the required values. Please ask your administrator to configure it'
          });
      });
      return router;
  }
  const githubCopilot = new GithubCopilot( logger);

  router.get('/health', (_, response) => {
    logger.info('PONG!');
    response.json({ status: 'ok' });
  });

  router.get('/copilot-usage', async (request, response) => {
    logger.info('Fetching github copilot usage!');
    if (request.query.organization && request.query.organization !== ''){
      organization = request.query.organization as string;
    }

    const hostFromCatalog = request.query.hostFromCatalog;
    const host =  hostFromCatalog || 'github.com';
    const githubToken = integrations.github.byHost(host as string)?.config?.token;
    const githubAppsToken = integrations.github.byHost(host as string)?.config?.apps; 

    if (!githubToken && !githubAppsToken) {
      const error = new Error(`Github Copilot failed with error 503, missing values in githubActions`);
      (error as any).status = 503; // Attach status code to error object
      throw error;
    }

    let tokenToUse;
    if (githubToken) {
      tokenToUse = githubToken;
    } else {
      tokenToUse = {
        appId: githubAppsToken ? githubAppsToken[0]?.appId : undefined,
        clientId: githubAppsToken ? githubAppsToken[0]?.clientId : undefined,
        clientSecret: githubAppsToken
          ? githubAppsToken[0]?.clientSecret
          : undefined,
        privateKey: githubAppsToken
          ? githubAppsToken[0]?.privateKey
          : undefined,
      };
    }

    const copilotDetails = await githubCopilot.getGithubCopilotUsageDetails(organization, tokenToUse);
    const sanitizedOutput = JSON.stringify(copilotDetails);
    response.send(sanitizedOutput);
  });

  router.get('/plugin-versions', async (_request, response) => {

    const backendVersionJson = "{\"version\": \"" + backEndPackageJson.version + "\"}";

    return response.status(200).send(backendVersionJson);

  });

  router.use(errorHandler());
  return router;
}
