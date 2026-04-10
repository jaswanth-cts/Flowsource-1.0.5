import { errorHandler } from '@backstage/backend-common';
import express from 'express';
import Router from 'express-promise-router';
import { LoggerService, RootConfigService } from '@backstage/backend-plugin-api';
import JenkinsApiBackendService from './jenkins.service';
import xss from 'xss';
import BuildDetails from './build-details';
import { AuthService } from './auth.service';
import backEndPackageJson from '../../package.json';

export interface RouterOptions {
  logger: LoggerService;
  config: RootConfigService;
}

export async function createRouter(
  options: RouterOptions,
): Promise<express.Router> {
  const { config, logger } = options;

  const router = Router();
  router.use(express.json());

  //Jenkins Credentials
  const jenkinsBaseUrlConfig = config.getOptionalString('jenkins.baseUrl') || '';
  const jenkinsBaseUrl = jenkinsBaseUrlConfig.endsWith('/') ? jenkinsBaseUrlConfig : `${jenkinsBaseUrlConfig}/`;
  const jenkinsUsername = config.getOptionalString('jenkins.username') || '';
  const jenkinsApiKey = config.getOptionalString('jenkins.apiKey') || '';
  let durationConfig = config.has('flowsource.dataPullDuration') ? config.getNumber('flowsource.dataPullDuration') : 60;

  if (!jenkinsBaseUrl || !jenkinsUsername || !jenkinsApiKey) {
    router.use((_req, res) => {
      res.status(503).send({
        success: false,
        error: 'This plugin has not been configured with the required values. Please ask your administrator to configure it'
      });
    });
    return router;
  }
  // Initialize AuthService
  const authService = new AuthService(jenkinsUsername, jenkinsApiKey);
  const JenkinsApiBackendSvc = new JenkinsApiBackendService(jenkinsBaseUrl, authService, logger);
  const buildDetails = new BuildDetails(jenkinsBaseUrl, authService, logger);


  router.get('/pipelines-data', async (request, response) => {
    const jenkinsPipelineNames: string = request.query.jenkinsJobNames as string;

    // Split the string into an array using commas as separators
    let pipelineName: string[] = jenkinsPipelineNames.split(',');
    pipelineName = pipelineName.map(name => xss(name.trim()));
    try {
      let { matchingPipelines, errorArray, formatErrorArray } = await JenkinsApiBackendSvc.getPipelineDetailsBasedOnType(pipelineName);
      matchingPipelines = JSON.parse(xss(JSON.stringify(matchingPipelines)));
      errorArray = JSON.parse(xss(JSON.stringify(errorArray)));
      formatErrorArray = JSON.parse(xss(JSON.stringify(formatErrorArray)));
      return response.status(200).send({
        matchingPipelines,
        errorArray,
        formatErrorArray,
      });
    }
    catch (error: any) {
      logger.error('Error in fetching pipeline details', error as Error);
      switch (error.status) {
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

  router.get('/build-details', async (request, response) => {
    const pageNumber: number = Number(request.query.pageNumber);
    const pageSize: number = Number(request.query.pageSize);
    let durationDaysCatalog: number = Number(request.query.durationDaysCatalog);
    const pipelineDisplayName: string = xss(request.query.pipelineDisplayName as string);

    try {
      let totalBuildDetails: any = await buildDetails.getFolderBuildDetails(pipelineDisplayName, pageNumber, pageSize, durationDaysCatalog, durationConfig);
      totalBuildDetails = xss(JSON.stringify(totalBuildDetails));
      return response.status(200).send(totalBuildDetails);
    }
    catch (error: any) {
      logger.error('Error in fetching pipeline details', error as Error);
      switch (error.status) {
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

  router.get('/check-parameters', async (request, response) => {
    const pipelineName = request.query.pipelineName as string;
    if (!pipelineName) {
      return response.status(400).send({
        success: false,
        error: 'Bad Request: pipelineName is required',
      });
    }
    try {
      const result = await buildDetails.checkIfParameterized(pipelineName);
      // Log result before and after sanitization
      const sanitizedResult = JSON.parse(xss(JSON.stringify(result)));
      return response.status(200).send(sanitizedResult);
    } catch (error) {
      console.error('Error checking parameters:', error);
      return response.status(500).send({
        success: false,
        error: 'Failed to check pipeline parameters',
      });
    }
  });

  router.get('/get-project-type', async (req, res) => {
    const { pipelineName } = req.query;
    if (!pipelineName) {
      return res.status(400).send({
        success: false,
        error: 'Bad Request: pipelineName is required',
      });
    }
    try {
      const projectType = await buildDetails.getProjectType(pipelineName as string);
      // Log projectType before and after sanitization
      const sanitizedProjectType = xss(JSON.stringify(projectType));
      return res.status(200).send({
        success: true,
        projectType: JSON.parse(sanitizedProjectType), // Parse back to object if needed
      });
    } catch (error: any) {
      console.error('Error fetching project type:', error);
      // Handle specific HTTP errors
      if (error.status === 404) {
        return res.status(404).send({
          success: false,
          error: 'Not Found: pipeline does not exist',
        });
      }
      return res.status(500).send({
        success: false,
        error: 'Internal Server Error: Failed to fetch project type',
      });
    }
  });

  router.post('/trigger-build', async (req, res) => {
    const { pipelineName, branchName, parameters } = req.body;
    if (!pipelineName) {
      return res.status(400).send({
        success: false,
        error: 'Bad Request: pipelineName is required',
      });
    }
    try {
      if (branchName) {
        // Multibranch pipeline
        await buildDetails.triggerMultibranchPipelineBuild(pipelineName, branchName, parameters);
      } else {
        // Regular pipeline
        await buildDetails.triggerPipelineBuild(pipelineName, parameters);
      }
      return res.status(200).send({ success: true });
    } catch (error) {
      console.error('Error triggering build:', error);
      return res.status(500).send({ success: false, error: 'Failed to trigger build' });
    }
  });

  router.get('/plugin-versions', async (_request, response) => {

    const backendVersionJson = "{\"version\": \"" + backEndPackageJson.version + "\"}";

    return response.status(200).send(backendVersionJson);

  });

  router.use(errorHandler());
  return router;
}
