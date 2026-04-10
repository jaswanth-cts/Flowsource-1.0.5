import express from 'express';
import Router from 'express-promise-router';
import { LoggerService } from '@backstage/backend-plugin-api';
import AzureDevopsService from './services/azureRelease.service';
import { Config } from '@backstage/config';
import xss from 'xss';

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

  const token = config.getOptionalString('azureRelease.token') || '';
  const baseUrlConfig = config.getOptionalString('azureRelease.baseUrl');
  const baseUrl = baseUrlConfig?.endsWith('/')
    ? baseUrlConfig.slice(0, -1)
    : baseUrlConfig || '';

  if (!token || !baseUrlConfig) {
    router.use((_req, res) => {
      res.status(503).send({
        success: false,
        error: 'This plugin has not been configured with the required values. Please ask your administrator to configure it.'
      });
    });
    return router;
  }

  router.get('/releases', async (req, res) => {
    try {
      const pipelineName: string = xss(req.query.pipelineName as string || '');
      const organization: string = xss(req.query.organization as string || '');
      const project: string = xss(req.query.project as string || '');

      // Validate required parameters
      if (!pipelineName || !organization || !project) {
        return res.status(400).send({
          success: false,
          error: 'Missing required query parameters: repoName, repoOwner, or durationInMonths',
        });
      }
      const service = new AzureDevopsService(baseUrl, token, organization, project, logger);

      const releases = await service.fetchPipelineDetails(pipelineName);

      const sanitizedReleases = releases.map((release: { releaseName: string; branchName: string; buildNumber: string; releaseStatus: string; releaseCreatedOn: string; releaseStages: any[]; }) => ({
        ...release,
        releaseName: xss(release.releaseName),
        branchName: xss(release.branchName),
        buildNumber: xss(release.buildNumber),
        releaseStatus: xss(release.releaseStatus),
        releaseCreatedOn: xss(release.releaseCreatedOn),
        releaseStages: release.releaseStages.map((stage: { stageName: string; stageStatus: string; stageId: any; }) => ({
          ...stage,
          stageName: xss(stage.stageName),
          stageStatus: xss(stage.stageStatus),
          stageId: stage.stageId,
        })),
      }));

      return res.status(200).send({ success: true, data: sanitizedReleases });
    } catch (error: any) {
      logger.error('Error fetching azureRelease metrics:', error);

      // Handle specific error statuses
      switch (error.status) {
        case 503:
          return res.status(503).send({
            success: false,
            error: 'Service unavailable, missing values credentials in azureRelease',
          });
        case 401:
          return res.status(401).send({
            success: false,
            error: 'Unauthorized: fetch error',
          });
        case 403:
          return res.status(403).send({
            success: false,
            error: 'Forbidden: fetch error',
          });
        case 404:
          return res.status(404).send({
            success: false,
            error: 'Not Found: fetch error',
          });
        case 500:
          return res.status(500).send({
            success: false,
            error: 'Internal Server Error: fetch error',
          });
        default:
          return res.status(500).send({
            success: false,
            error: 'Unexpected Error',
          });
      }
    }
  });


  router.get('/stage-log', async (req, res) => {
    const releaseId = Number(req.query.releaseId);
    const organization = req.query.organization as string;
    const project = req.query.project as string;
    const service = new AzureDevopsService(baseUrl, token, organization, project, logger);

    try {
      const log = await service.fetchReleaseStagesDefinitions(releaseId);
      res.status(200).json({ success: true, data: log });
    } catch (error: any) {
      logger.error('Error fetching stage log:', error);
      res.status(500).json({
        success: false,
        error: 'Internal Server Error: failed to fetch stage log',
      });
    }
  });



  return router;
}
