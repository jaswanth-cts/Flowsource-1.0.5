import { errorHandler } from '@backstage/backend-common';
import express from 'express';
import Router from 'express-promise-router';
import { LoggerService , RootConfigService } from '@backstage/backend-plugin-api';

import CheckmarxCredentials from './model/CheckmarxCredentials';
import CheckmarxService from './checkmarx.service';
import xss from 'xss';
import { Readable } from 'stream';

import backEndPackageJson from '../../package.json';

export interface RouterOptions {
  logger: LoggerService;
  config: RootConfigService;
}

export async function createRouter(
  options: RouterOptions,
): Promise<express.Router> {
  const { logger, config } = options;
  const checkmarxClientId = config.getOptionalString('checkmarx.clientId') || '';
  const checkmarxClientSecert = config.getOptionalString('checkmarx.clientSecret') || '';
  const checkmarxUsername = config.getOptionalString('checkmarx.username') || '';
  const checkmarxPassword = config.getOptionalString('checkmarx.password') || '';
  const checkmarxBaseUrlConfig = config.getOptionalString('checkmarx.baseUrl') || '';
  const checkmarxBaseUrl = checkmarxBaseUrlConfig
    ? checkmarxBaseUrlConfig.endsWith('/')
      ? checkmarxBaseUrlConfig
      : checkmarxBaseUrlConfig + '/'
    : '';
  const checkmarxGrantType = config.getOptionalString('checkmarx.grantType') || '';
  const checkmarxBaseAuthUrl=checkmarxBaseUrl? checkmarxBaseUrl + 'CxRestAPI/auth/identity/connect/token' : '';
  const checkmarxCredentials = new CheckmarxCredentials(checkmarxClientId, checkmarxClientSecert, checkmarxUsername, checkmarxPassword, 
    checkmarxGrantType, checkmarxBaseUrl, checkmarxBaseAuthUrl);

  const router = Router();
  router.use(express.json());

  router.use((_req, res, next) => {
    try {
      new URL(checkmarxBaseUrl);
    } catch (_) {
      return res.status(503).send({
        success: false,
        error: 'Invalid Checkmarx URL. Please ask your administrator to configure it'
      });
    }

  if (!checkmarxClientId || !checkmarxClientSecert || !checkmarxUsername || !checkmarxPassword || !checkmarxGrantType
    || !checkmarxBaseAuthUrl) {
    router.use((_, res, next) => {
      res.status(503).send('This plugin has not been configured with the required values. Please ask your administrator to configure it');
      next();
    });
  }

    next();
    return;
  });

  const checkmarxSvc = new CheckmarxService(checkmarxCredentials, logger);

  router.get('/health', (_, response) => {
    logger.info('PONG!');
    response.json({ status: 'ok' });
  });

  router.get('/checkmarx-summary',async (request, response) => {
    try
    {
      logger.info("received request for project details of app: "+ request.query.applicationName);
      const output = await checkmarxSvc.getProjectDetails(request.query.applicationName);
      const sanitizedOutput = xss(JSON.stringify(output));
      return response.send(sanitizedOutput);
    } catch(error: any) {
      if(error.status === 403) {
        return response.status(403).send({ success: false, error: 'Invalid Credentials.' });
      }
      else if(error.status === 404) {
        return response.status(404).send({ success: false, error: error.message });
      }
      else {
        return response.status(500).send({ success: false, error: 'Error loading data.' });
      }
    }
  });

  router.get('/pdf-report', async (request, response) => {
    const scanId = request.query.scanId;
    logger.info('received request for project details of app: '+ scanId);
    const pdfOutput = await checkmarxSvc.downloadPdfReport(request.query.scanId);
    // Set appropriate headers for the response
    const fileName = `inline; filename="Report-${scanId}.pdf"`
    response.setHeader('Content-Type', 'application/pdf');
    response.setHeader('Content-Disposition', fileName);

    // Stream the PDF content to the response
    const nodeStream = Readable.fromWeb(pdfOutput);
    nodeStream.pipe(response);
  });

  router.get('/plugin-versions', async (_request, response) => {

    const backendVersionJson = "{\"version\": \"" + backEndPackageJson.version + "\"}";

    return response.status(200).send(backendVersionJson);

  });
  
  router.use(errorHandler());
  return router;
}
