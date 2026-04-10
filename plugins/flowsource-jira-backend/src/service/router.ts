import { errorHandler } from '@backstage/backend-common';
import {
  LoggerService,
  RootConfigService,
} from '@backstage/backend-plugin-api';
import express from 'express';
import Router from 'express-promise-router';
import { decodeJwt } from 'jose';
import xss from 'xss';
import { JiraBackendGraphDataService } from './jiraBackendGraphData.service';
import { JiraBackendProjectDetailsService } from './jiraBackendProjectDetails.service';
import jiraBackEndPackageJson from '../../package.json';
// import multer from 'multer';
// import { JiraBot } from './jiraBot.service';

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

  const jiraUserEmail =
    config.getOptionalString('jiracustom.jiraUserEmail') || '';
  const jiraAccessKey =
    config.getOptionalString('jiracustom.jiraAccessKey') || '';
  const jiraBaseUrlConfig = config.getOptionalString('jiracustom.jiraBaseUrl');
  const jiraBaseUrl = jiraBaseUrlConfig
    ? jiraBaseUrlConfig.endsWith('/')
      ? jiraBaseUrlConfig
      : jiraBaseUrlConfig + '/'
    : '';
  const durationConfig = config.has('flowsource.dataPullDuration')
    ? config.getNumber('flowsource.dataPullDuration')
    : 60;
  const jiraStoryPointsFieldConfig = config.getString(
    'jiracustom.jiraStoryPointsField',
  );
  const jiraBotEnabled = config.getOptionalString('jiracustom.jiraBotEnabled') || '';

  if (!jiraUserEmail || !jiraAccessKey || !jiraBaseUrlConfig) {
    router.use((_req, res) => {
      res.status(503).send({
        success: false,
        error:
          'This plugin has not been configured with the required values. Please ask your administrator to configure it',
      });
    });
    return router;
  }

  const jiraBackendProjectDetailsService = new JiraBackendProjectDetailsService(jiraUserEmail, jiraAccessKey, jiraBaseUrl, logger);
  const jiraBackendGraphdataService = new JiraBackendGraphDataService(jiraUserEmail, jiraAccessKey, jiraBaseUrl, logger);
  // const jiraBot = new JiraBot('http://dummy:7007'); // TODO replace with actual bot URL


  router.get('/statuses', async (req, res) => {
    const projectName: string = req.query.projectName as string;

    try {
        const statuses = await jiraBackendGraphdataService.getStatusesForProject(projectName);
        
        if (!statuses) {
            return res.status(500).send({ error: 'Failed to fetch statuses' });
        }
        
        return res.status(200).json({ statusOptions: statuses });
        
    } catch (error: any) {
        logger.error('Error fetching statuses - ', error as Error);

        // Check for specific project not found error
        if (error.message && error.message.includes(`Project not found: ${projectName}`)) {
          return res.status(404).send({
              success: false,
              error: `No project could be found with key '${projectName}'`,
          });
        }

        // Handle other errors
        switch (error.status) {
            case 400:
                return res.status(400).send({
                    success: false,
                    error: 'Bad Request',
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
                // For all other errors, respond with a 500 Internal Server Error
                return res.status(500).send({
                    success: false,
                    error: 'Unexpected Error',
                });
        }
      }
  });

  router.get('/projectNameFromApi', async (request, response) => {
    
    let projectKey: string = request.query.projectKey as string;
    try
    {
      let output = await jiraBackendProjectDetailsService.getProjectNameFromApi(projectKey);

      output = xss(JSON.stringify(output));
      return response.status(200).send(output);

    } catch (error: any) {
      logger.error('Error in projectNameFromApi rotues - ', error as Error);
      if (error.message && error.message.includes('No project could be found with key')) {
        return response.status(404).send({
          success: false,
          error: error.message, // Send custom error message
        });
      }
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

  router.get('/storyDetails', async (request, response) => {
    let projectName: string = request.query.projectName as string;
    const durationDaysCatalog: number = Number(request.query.durationDaysCatalog);
    const nextPageToken: string = request.query.nextPageToken as string;
    const pageSize: string = request.query.pageSize as string;
    const jiraStoryPointsFieldCatalog: string = request.query
      .storyPointsFieldCatalog as string;
    const status: string = request.query.status as string;
    const jiraFilterFieldKey = request.query.filterFieldKey as string;
    const jiraFilterFieldValue = request.query.filterFieldValue as string;
    const filterId = request.query.filterFieldId as string;
    const currentSprintDetail = request.query.currentSprintDetails as string;
    // Check if projectName contains '/'
    if (projectName.includes('/')) {
      // Remove '/' from projectName
      projectName = projectName.replace('/', '');
    }
  
    try {
      const token = request.headers.authorization?.split(' ')[1] || '';
      const decodedToken = decodeJwt(token);
      const userEmail: string =
        decodedToken.sub?.split(' ')[0]?.split('/')[1] || '';
      const assigneeToMe: string =
        request.query.assigneeToMe === 'true' ? userEmail : '';
      let output = await jiraBackendProjectDetailsService.getStoryDetails(
        projectName,
        nextPageToken,
        pageSize,
        durationDaysCatalog,
        durationConfig,
        jiraStoryPointsFieldCatalog,
        jiraStoryPointsFieldConfig,
        status,
        assigneeToMe,
        jiraFilterFieldKey,
        jiraFilterFieldValue,
        filterId,
        currentSprintDetail
      );
      // Check if output is null or undefined
      if (output === null || output === undefined) {
        return response
          .status(500)
          .send({ error: 'Output is null or undefined' });
      }
      output = xss(JSON.stringify(output));
      return response.status(200).send(output);
    } catch (error: any) {
      logger.error('Error in getStoryDetails - ', error as Error);
      if (error.message && error.message.includes('Project not found')) {
        return response.status(404).send({
          success: false,
          error: error.message, // Send custom error message
        });
      }
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

  
  router.get('/graphData', async (request, response) => {
    let projectName: string = request.query.projectName as string;
    const durationDaysCatalog = Number(request.query.durationDaysCatalog);
    const jiraStoryPointsFieldCatalog: string = request.query
      .storyPointsFieldCatalog as string;
    const jiraFilterFieldKey = request.query.filterFieldKey as string;
    const jiraFilterFieldValue = request.query.filterFieldValue as string;
    const filterId = request.query.filterFieldId as string;
    const nextPageToken: string = request.query.nextPageToken as string;
    // Check if projectName contains '/'
    if (projectName.includes('/')) {
      // Remove '/' from projectName
      projectName = projectName.replace('/', '');
    }

    try {
      let output = await jiraBackendGraphdataService.getGraphData(
        projectName,
        nextPageToken,
        durationDaysCatalog,
        durationConfig,
        jiraStoryPointsFieldCatalog,
        jiraStoryPointsFieldConfig,
        jiraFilterFieldKey,
        jiraFilterFieldValue,
        filterId,
      );
      const issueTypes = await jiraBackendGraphdataService.getIssueTypesForProject(projectName);

      if (!issueTypes) {
        return response.status(404).send({
          success: false,
          error: 'Issue types not found',
        });
      }

      // Optionally, include projectId and issueTypes in the response
      output = {
        ...output,
        issueTypes,
      };
      output = xss(JSON.stringify(output));
      return response.status(200).send(output);
    } catch (error: any) {
      logger.error('Error in getGraphData - ', error as Error);

      // If the error message contains the "project not found" message, return a custom 404 error
      if (error.message && error.message.includes("Project not found")) {
        return response.status(404).send({
          success: false,
          error: error.message, // Send the exact error message to the frontend
        });
      }

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

  router.get('/jiraBotEnabled', async (_, response) => {
    if (!jiraBotEnabled) {
      return response.status(500).send({
        success: false,
        error: 'Jira Bot is not configured',
      });
    }
    // Ensure the value is either 'true' or 'false'
    const formattedJiraBotEnabled = jiraBotEnabled.toLowerCase() === 'true';
    logger.info(`Jira Bot enabled: ${formattedJiraBotEnabled}`);
    return response.status(200).send({
      success: true,
      enabled: formattedJiraBotEnabled,
    });
  });

  // Only add these routes if the bot is enabled
  if (jiraBotEnabled.toLowerCase() === 'true') {
    router.get('/jiraBotUrl', async (_, response) => {
      const jiraBotUrl = config.getOptionalString('jiracustom.jiraBotUrl') || '';

      if (!jiraBotUrl) {
        return response.status(500).send({
          success: false,
          error: 'Jira Bot URL is not configured',
        });
      }
      // Ensure the URL ends with a slash
      const formattedJiraBotUrl = jiraBotUrl.endsWith('/')
        ? jiraBotUrl
        : jiraBotUrl + '/';
      logger.debug(`Jira Bot URL: ${formattedJiraBotUrl}`);
      return response.status(200).send({
        success: true,
        jiraBotUrl: formattedJiraBotUrl,
      });
    });

  // // Multer setup for file uploads (in-memory storage)
  // const upload = multer({ storage: multer.memoryStorage() });

  // router.post('/bot/stories', upload.array('files'), async (req, res) => {
  //   const projectKey: string = req.query.projectKey as string;

  //   try {
  //     // Access uploaded files
  //     const files = req.files as Express.Multer.File[];

  //     if (!files || files.length === 0) {
  //       logger.error('No files uploaded or files array is empty');
  //       return res.status(400).json({ success: false, error: 'No files uploaded or files array is empty' });
  //     }

  //     if (files.length > 1) {
  //       logger.error('Multiple files uploaded');
  //       return res.status(400).json({ success: false, error: 'Only one file is allowed' });
  //     }

  //     const file = files[0];
  //     if (!file) {
  //       logger.error('No file found in the uploaded files');
  //       return res.status(400).json({ success: false, error: 'No file found in the uploaded files' });
  //     }

  //     logger.info(`Received file: ${file.originalname}, Size: ${file.size} bytes, Type: ${file.mimetype}`);

  //     const uploadResponse = await jiraBot.uploadFile(file.buffer, file.originalname);

  //     logger.info(`File upload response: ${JSON.stringify(uploadResponse)}`);
  //     if (!uploadResponse || !uploadResponse.success) {
  //       logger.error('File upload failed');
  //       return res.status(500).json({ success: false, error: 'File upload failed' });
  //     }

  //     return res.status(200).json({
  //       success: true,
  //       message: 'Files uploaded successfully',
  //       file: file.originalname,
  //       projectKey,
  //     });
  //   } catch (error: any) {
  //     console.error('Error handling file upload:', error);
  //     return res.status(500).json({ success: false, error: 'Internal Server Error' });
  //   }
  // });

  }

  router.get('/plugin-versions', async (_request, response) => {

    const backendVersionJson = "{\"version\": \"" + jiraBackEndPackageJson.version + "\"}";

    return response.status(200).send(backendVersionJson);

  });

  router.use(errorHandler());

  return router;
}