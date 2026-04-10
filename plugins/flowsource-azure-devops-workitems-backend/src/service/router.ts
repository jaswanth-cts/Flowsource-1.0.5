import { errorHandler } from '@backstage/backend-common';
import express from 'express';
import Router from 'express-promise-router';
import { LoggerService } from '@backstage/backend-plugin-api';
import { DevopsWorkitemsBackendService } from './devopsWorkitemsBackend.service';
import { Config } from '@backstage/config';
import xss from 'xss';
import helmet from 'helmet';
import { decodeJwt } from 'jose';

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
  router.use(
    helmet.hsts({
      maxAge: 31536000, // One year in seconds
      includeSubDomains: true,
      preload: true,
    }),
  );
  router.use(express.json());

  const devopsAccessKey = config.getOptionalString('azureDevOps.token') || '';
  const devopsBaseUrlConfig = config.getOptionalString('azureDevOps.baseUrl');
  const devopsBaseUrl = devopsBaseUrlConfig?.endsWith('/')
    ? devopsBaseUrlConfig.slice(0, -1)
    : devopsBaseUrlConfig || '';
  const orgName = config.getOptionalString('azureDevOps.organization') || '';
  const durationConfig = config.has('flowsource.dataPullDuration')
    ? config.getNumber('flowsource.dataPullDuration')
    : 60;

  if (!devopsAccessKey || !devopsBaseUrl || !orgName) {
    router.use((_req, res) => {
      res.status(503).send({
        success: false,
        error:
          'This plugin has not been configured with the required values. Please ask your administrator to configure it',
      });
    });
    return router;
  }

  const devopsBackendService = new DevopsWorkitemsBackendService(
    devopsAccessKey,
    devopsBaseUrl,
    orgName,
    logger, // Add the logger argument here
  );

  router.get('/projectDetails', async (request, response) => {
    const projectName: string = request.query.projectName
      ? xss(request.query.projectName as string)
      : '';
    const pageNumber: string = request.query.pageNumber as string;
    const pageSize: string = request.query.pageSize as string;
    const status: string = request.query.status as string;
    const workitemType: string = request.query.workitemType as string;
    const checkAllStories: string = request.query.checkAllStories as string;
    const azureDevopsFilterFieldKey = request.query.azureDevopsFilterFieldKey as string;
    const azureDevopsFilterFieldValue = request.query.azureDevopsFilterFieldValue as string;
    const currentSprintDetails: string = request.query
      .currentSprintDetails as string;
    const currentSprintTeamName: string = request.query
      .currentSprintTeamName as string;
    const queryId: string = request.query.queryId as string;
    const durationDaysCatalog: number = Number(
      request.query.durationDaysCatalog,
    );
    const durationInDays = durationDaysCatalog || durationConfig;

    try {
      const token = request.headers.authorization?.split(' ')[1] || '';
      const decodedToken: any = decodeJwt(token);
      const userEmail = decodedToken.upn || null;
      const assigneeToMe: string =
        request.query.assigneeToMe === 'true' ? userEmail : '';
      let output = await devopsBackendService.getProjectDetails(
        projectName,
        pageNumber,
        pageSize,
        durationInDays,
        status,
        workitemType,
        assigneeToMe,
        currentSprintDetails,
        currentSprintTeamName,
        queryId,
        checkAllStories,
        azureDevopsFilterFieldKey,
        azureDevopsFilterFieldValue,
      );
      output = JSON.parse(xss(JSON.stringify(output)));
      return response.status(200).send(output);
    } catch (error: any) {
      logger.error('Error in getProjectDetails - ', error);
      switch (error.status) {
        case 400:
          return response.status(400).send({
            success: false,
            error: 'Bad Request',
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
  
  router.get('/workitemTypes', async (request, response) => {
    const projectName: string = xss(request.query.projectName as string);

    try {
      let output = await devopsBackendService.getWorkitemTypesData(projectName);
      output = JSON.parse(xss(JSON.stringify(output)));
      return response.status(200).send(output);
    } catch (error: any) {
      logger.error('Error in getStatusData - ', error);
      switch (error.status) {
        case 400:
          return response.status(400).send({
            success: false,
            error: 'Bad Request',
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

  router.get('/statuses', async (request, response) => {
    const projectName: string = xss(request.query.projectName as string);

    try {
      let output = await devopsBackendService.getStatusData(projectName);
      output = JSON.parse(xss(JSON.stringify(output)));
      return response.status(200).send(output);
    } catch (error: any) {
      logger.error('Error in getStatusData routes- ', error);
      
      switch (error.status) {
        case 400:
          return response.status(400).send({
            success: false,
            error: 'Bad Request',
          });
        case 401:
          if(error.message.includes('Request failed with status code 401')) {
            return response.status(401).send({
              success: false,
              error: error.message,
            });
          } else {
            return response.status(401).send({
              success: false,
              error: 'Unauthorized: fetch error',
            });
          }
        case 403:
          return response.status(403).send({
            success: false,
            error: 'Forbidden: fetch error',
          });
        case 404:
          if(error.message.includes(`Project '${projectName}' not found.`)) 
          {
            return response.status(404).send({
              success: false,
              error: error.message,
            });
          } 
          else 
          {
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

  router.get('/graphData', async (request, response) => {
    const projectName: string = xss(request.query.projectName as string);
    const queryId: string = request.query.queryId as string;
    const azureDevopsFilterFieldKey = request.query.azureDevopsFilterFieldKey as string;
    const azureDevopsFilterFieldValue = request.query.azureDevopsFilterFieldValue as string;
    const durationDaysCatalog: number = Number(
      request.query.durationDaysCatalog,
    );
    const durationInDays = durationDaysCatalog || durationConfig;

    try {
      let output = await devopsBackendService.getGraphData(
        projectName,
        durationInDays,
        queryId,
        azureDevopsFilterFieldKey,
        azureDevopsFilterFieldValue,
      );
      output = JSON.parse(xss(JSON.stringify(output)));
      return response.status(200).send(output);
    } catch (error: any) {
      logger.error('Error in getGraphData - ', error);
      switch (error.status) {
        case 400:
          return response.status(400).send({
            success: false,
            error: 'Bad Request',
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

  router.get('/plugin-versions', async (_request, response) => {
    const backendVersionJson =
      '{"version": "' + backEndPackageJson.version + '"}';

    return response.status(200).send(backendVersionJson);
  });

  router.use(errorHandler());
  return router;
}
