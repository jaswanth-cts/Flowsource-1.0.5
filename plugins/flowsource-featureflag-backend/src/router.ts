import express from 'express';
import Router from 'express-promise-router';
import { Config } from '@backstage/config';
import { LoggerService } from '@backstage/backend-plugin-api';
import backEndPackageJson from '../package.json';
import FeatureFlagService from './services/FeatureFlagService';
import xss from 'xss';

export interface RouterOptions {
  logger: LoggerService;
  config: Config;
}

export async function createRouter(
  options: RouterOptions,
): Promise<express.Router> {
  const { logger, config } = options;

  const unleashBaseUrl = config.getOptionalString('unleash.unleashBaseUrl') || '';
  const unleashToken = config.getOptionalString('unleash.unleashToken') || '';
  logger.debug(`unleashToken: ${unleashToken}`);
  logger.debug(`unleashBaseUrl: ${unleashBaseUrl}`);

  const featureFlagService = new FeatureFlagService(
    unleashBaseUrl,
    unleashToken,
    logger,
  );

  const router = Router();
  router.use(express.json());

  // Check if the required configurations are present
  if (!unleashBaseUrl || !unleashToken) {
    router.use((_req, res) => {
      res.status(503).send({
        success: false,
        error:
          'This plugin has not been configured with the required values. Please ask your administrator to configure it',
      });
    });
    return router;
  }

  // Get the feature flag details
  router.get('/details', async (req, res) => {
    const { projectId, appName } = req.query;

    if (!projectId) {
      return res.status(400).send({
        success: false,
        error: 'Project ID and App Name are required',
      });
    }

    try {
      const flags = await featureFlagService.getAllFeatureFlagsDetails(
        projectId as string,
        appName as string,
      );

      const sanitizedFlags = JSON.parse(xss(JSON.stringify(flags)));
      return res.status(200).send({ success: true, flags: sanitizedFlags });
    } catch (error) {
      logger.error(`Error fetching feature flag details: ${error as any}`);
      return res.status(500).send({ success: false, error: error as any });
    }
  });

  // enable or disable a feature flag for a specific environment
  router.post('/toggle', async (req, res) => {
      // Sanitize all request body fields
      const projectId = xss(req.body.projectId);
      const flagName = xss(req.body.flagName);
      const environment = xss(req.body.environment);
      const enabled = xss(req.body.enabled);

    try {
      const result = await featureFlagService.toggleFeatureFlag(
        projectId,
        flagName,
        environment,
        enabled,
      );

      logger.info(result.message);

      const sanitizedMessage = xss(result.message);
      return res
        .status(result.status)
        .send({ 
          success: true, 
          message: sanitizedMessage 
        });
    } catch (error) {
      logger.error(`Error toggling feature flag: ${error as any}`);
      return res.status(500).send({ success: false, error: 'Internal server error' });
    }
  });

  router.get('/plugin-versions', async (_req, res) => {
    const backendVersionJson =
      '{"version": "' + backEndPackageJson.version + '"}';
    return res.status(200).send(backendVersionJson);
  });

  return router;
}
