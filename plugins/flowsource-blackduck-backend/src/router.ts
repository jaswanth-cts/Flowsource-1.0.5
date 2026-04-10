import { errorHandler } from '@backstage/backend-common';
import express from 'express';
import Router from 'express-promise-router';
import { LoggerService } from '@backstage/backend-plugin-api';
import { RootConfigService } from '@backstage/backend-plugin-api';

import BlackduckService from './blackduck.service';
import xss from 'xss';
import BlackduckCredentials from './services/model/BlackduckCredentials';
import backEndPackageJson from '../package.json';

export interface RouterOptions {
  logger: LoggerService;
  config: RootConfigService;
}

export async function createRouter(
    options: RouterOptions,
  ): Promise<express.Router> {
    const { logger, config } = options;
    const blackduckAuthToken = config.getOptionalString('blackduck.blackduckAuthToken') || '';
    const blackduckBaseUrl = config.getOptionalString('blackduck.blackduckBaseUrl') || '';
    const blackduckMaxRetries = config.getOptionalNumber('blackduck.blackduckMaxRetries') || 60;

    const BlackduckCredential = new BlackduckCredentials(blackduckAuthToken, blackduckBaseUrl, blackduckMaxRetries);

    const router = Router();
    router.use(express.json());

    router.use((_req, res, next) => {
      try {
        new URL(blackduckBaseUrl);
      } catch (_) {
        return res.status(503).send({
          success: false,
          error: 'Invalid Blackduck URL. Please ask your administrator to configure it'
        });
      }

    if (!blackduckAuthToken || !blackduckBaseUrl ) {
      router.use((_, res, next) => {
        res.status(503).send('This plugin has not been configured with the required values. Please ask your administrator to configure it');
        next();
      });
    }

      next();
      return;
    });

    const BlackduckSvc = new BlackduckService(logger,BlackduckCredential);

    router.get('/blackduck-scan-overview', async (request, response) => {
      const projectName = xss(request.query.projectName as string);
      logger.info("received request for project details of project: "+ projectName);
      const output = await BlackduckSvc.getProjectOverview(projectName);  
      const sanitizedOutput = xss(JSON.stringify(output));   
      response.send(sanitizedOutput); 
    });
    
  router.get('/blackduck-components', async (request, response) => {
    try {
      const projectId = xss(request.query.projectId as string);
      const versionId = xss(request.query.versionId as string);
  
      if (!projectId || !versionId) {
        response.status(400).send({
          success: false,
          error: 'Missing required query parameters: projectId and versionId',
        });
        return;
      }
  
      logger.info(
        `Fetching components data for projectId: ${projectId}, versionId: ${versionId}`,
      );
      const {componentsData, totalBomEntries}= await BlackduckSvc.fetchComponentsData(projectId, versionId);
        console.log('Components data fetched successfully:', componentsData);
      response.status(200).send({
        componentsData: JSON.parse(xss(JSON.stringify(componentsData))),
        totalBomEntries: totalBomEntries
      });
      } catch (error) {
        logger.error('Error fetching components data:', error as Error);
        response.status(500).send({
          success: false,
          error: 'Failed to fetch components data',
        });
      }
    });
    
    router.get('/blackduck-graph', async (request, response) => {
      try {
        const projectId = xss(request.query.projectId as string);
        const versionId = xss(request.query.versionId as string);
    
        if (!projectId || !versionId) {
          response.status(400).send({
            success: false,
            error: 'Missing required query parameters: projectId and versionId',
          });
          return;
        }
    
        logger.info(
          `Fetching graph data for projectId: ${projectId}, versionId: ${versionId}`,
        );
    
        const {
          issueDistribution,
          riskaging,
          lastScanDate,
          versionPhase,
          versionDistribution,
          lastBomUpdateDate,
        } = await BlackduckSvc.fetchGraphData(projectId, versionId);

        response.status(200).send({
          issueDistribution: JSON.parse(xss(JSON.stringify(issueDistribution))),
          riskaging: JSON.parse(xss(JSON.stringify(riskaging))),
          lastScanDate: lastScanDate, 
          versionPhase: xss(versionPhase),
          versionDistribution: JSON.parse(xss(JSON.stringify(versionDistribution))),
          lastBomUpdateDate: lastBomUpdateDate,
        });
      } catch (error) {
        logger.error('Error fetching graph data:', error as Error);
        response.status(500).send({
          success: false,
          error: 'Failed to fetch graph data',
        });
      }
    });

    router.get('/blackduck-vulnerabilities', async (request, response) => {
      try {
        const projectId = xss(request.query.projectId as string);
        const versionId = xss(request.query.versionId as string);
        const componentId = xss(request.query.componentId as string);
        const componentVersionId = xss(request.query.componentVersionId as string);
        const originId = xss(request.query.originId as string);
    
        if (!projectId || !versionId || !componentId || !componentVersionId || !originId) {
          response.status(400).send({
            success: false,
            error: 'Missing required query parameters: projectId, versionId, componentId, componentVersionId, and originId',
          });
          return;
        }
    
        logger.info(
          `Fetching vulnerabilities for projectId: ${projectId}, versionId: ${versionId}, componentId: ${componentId}, componentVersionId: ${componentVersionId}, originId: ${originId}`,
        );
    
        const vulnerabilities = await BlackduckSvc.fetchVulnerabilitiesData(
          projectId,
          versionId,
          componentId,
          componentVersionId,
          originId,
        );

        response.status(200).send(JSON.parse(xss(JSON.stringify(vulnerabilities))));
      } catch (error) {
        logger.error('Error fetching vulnerabilities:', error as Error);
        response.status(500).send({
          success: false,
          error: 'Failed to fetch vulnerabilities',
        });
      }
    });
    
    router.get('/plugin-versions', async (_request, response) => {
        const backendVersionJson = "{\"version\": \"" + backEndPackageJson.version + "\"}";
        return response.status(200).send(backendVersionJson);
    });
  
    router.get('/blackduck-report', async (request, response) => {
      const versionId = xss(request.query.versionId as string);
      const projectId = xss(request.query.projectId as string);
      logger.info('received request for project details of app: '+ versionId);
      const reportStream = await BlackduckSvc.generateAndDownloadReport(versionId, projectId);      
      response.setHeader('Content-Type', 'application/octet-stream');
      response.setHeader('Content-Disposition', 'attachment; filename="blackduck-report.zip"'); 
      reportStream.pipe(response);
      
    });
    
    router.get('/blackduck-sbom-report', async (request, response) => {
      const versionId = xss(request.query.versionId as string);
      const projectId = xss(request.query.projectId as string);
  
      logger.info('Received request for SBOM report of app: ' + versionId);
  
      // Call the service to generate and download the SBOM report
      const sbomReportStream = await BlackduckSvc.generateAndDownloadSbomReport(versionId, projectId);
      // Set headers for file download
      response.setHeader('Content-Type', 'application/octet-stream');
      response.setHeader('Content-Disposition', 'attachment; filename="sbom-report.json"');
  
      // Pipe the Node.js stream to the HTTP response
      sbomReportStream.pipe(response);
    });
    router.use(errorHandler());
    return router;
}