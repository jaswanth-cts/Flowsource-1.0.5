import { errorHandler } from '@backstage/backend-common';
import express from 'express';
import Router from 'express-promise-router';
import { LoggerService , RootConfigService } from '@backstage/backend-plugin-api';

import xss from 'xss';
import { resilienceHubBackendService } from './resilienceHubBackend.service';

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

  const accessKeyId = config.getOptionalString('resilience-hub.aws.access_key_id');
  const secretAccessKey = config.getOptionalString('resilience-hub.aws.secret_access_key');

  if (!accessKeyId || !secretAccessKey) {
    router.use((_, res, next) => {
      res.status(503).send('This plugin has not been configured with the required values. Please ask your administrator to configure it');
      next();
    });
  }

  function sanitizeOutput(output: any) {
    return output.alarmRecommendations.map((recommendation: any) => {
      // Sanitize only the fields that need to be sanitized
      return {
        ...recommendation,
        description: xss(recommendation.description),
        prerequisite: xss(recommendation.prerequisite) // Only sanitize fields with potential HTML content
      };
    });
  }

  router.get('/health', (_, response) => {
    logger.info('PONG!');
    response.json({ status: 'ok' });
  });

  router.get('/policy-details',async (request, response) => {
    try {
      logger.info('received request for policy details of app - ' + request.query.applicationName);
      const resilienceBackendSvc = new resilienceHubBackendService(request.query.awsRegion as string, logger, accessKeyId || '', secretAccessKey || '');
      const output = await resilienceBackendSvc.getResiliencePolicyInfoForAppName(request.query.applicationName, request.query.awsRegion);
      const sanitizedOutput = xss(JSON.stringify(output));
      logger.info(sanitizedOutput);
      return response.status(200).send(sanitizedOutput);
    } catch (err:any) {
      if(err.toString().includes('403')) {
        return response.status(403).send({ success: false, error: 'Check your AWS credentials.' });
      }
      else {
        return response.status(500).send({ success: false, error: 'Error loading data.' });
      }
    }
    
  });

  router.get('/app-resiliency-score-details', async (request, response) => {
    try {
      logger.info('received request for policy details of app - ' + request.query.applicationName);
      let awsRegion = request.query.awsRegion as string;
      awsRegion = xss(awsRegion);
      const resilienceBackendSvc = new resilienceHubBackendService(awsRegion, logger, accessKeyId || '', secretAccessKey || '');
      const output = await resilienceBackendSvc.getResiliencyScoreDetailsForAppName(request.query.applicationName, awsRegion);
   return response.status(200).send(xss(JSON.stringify(output)));
    } catch (err:any) {
      if(err.toString().includes('403')) {
        return response.status(403).send({ success: false, error: 'Check your AWS credentials.' });
      }
      else {
        return response.status(500).send({ success: false, error: 'Error loading data.' });
      }
    }
    
  });


  router.get('/alarm-recommendations', async (request, response) => {
    try {
        logger.info('received request for policy details of app - ' + request.query.applicationName);
        let awsRegion = request.query.awsRegion as string;
        awsRegion = xss(awsRegion);
        const resilienceBackendSvc = new resilienceHubBackendService(awsRegion, logger, accessKeyId || '', secretAccessKey || '');
        const output = await resilienceBackendSvc.getAlarmRecommendationsForApplicationName(request.query.applicationName, awsRegion);

    let sanitizedOutput = {
    alarmRecommendations: sanitizeOutput(output)
    };
        return response.status(200).send(sanitizedOutput);
    } catch (err:any) {
      if(err.toString().includes('403')) {
        return response.status(403).send({ success: false, error: 'Check your AWS credentials.' });
      }
      else {
        return response.status(500).send({ success: false, error: 'Error loading data.' });
      }
    }
  });


router.get('/sop-recommendations', async (request, response) => {
  try {
    logger.info('received request for policy details of app - ' + request.query.applicationName);
    let awsRegion = request.query.awsRegion as string;
    awsRegion = xss(awsRegion);
    const resilienceBackendSvc = new resilienceHubBackendService(awsRegion, logger, accessKeyId || '', secretAccessKey || '');
    const output = await resilienceBackendSvc.getSopRecommendationsForApplicationName(request.query.applicationName, awsRegion);
   
    return response.status(200).send(xss(JSON.stringify(output)));
  } catch (err:any) {
    if(err.toString().includes('403')) {
      return response.status(403).send({ success: false, error: 'Check your AWS credentials.' });
    }
    else {
      return response.status(500).send({ success: false, error: 'Error loading data.' });
    }
  }
});

router.get('/test-recommendations', async (request, response) => {
  try {
      logger.info('received request for policy details of app - ' + request.query.applicationName);
      let awsRegion = request.query.awsRegion as string;
      awsRegion = xss(awsRegion);
      const resilienceBackendSvc = new resilienceHubBackendService(awsRegion, logger, accessKeyId || '', secretAccessKey || '');
      const output = await resilienceBackendSvc.getTestRecommendationsForApplicationName(request.query.applicationName, awsRegion);
      return response.status(200).send(xss(JSON.stringify(output)));
    } catch (err:any) {
      if(err.toString().includes('403')) {
        return response.status(403).send({ success: false, error: 'Check your AWS credentials.' });
      }
      else {
        return response.status(500).send({ success: false, error: 'Error loading data.' });
      }
    }
});

router.get('/resiliency-recommendations', async (request, response) => {
  try {
    logger.info('received request for policy details of app - ' + request.query.applicationName);
    let awsRegion = request.query.awsRegion as string;
    awsRegion = xss(awsRegion);
    const resilienceBackendSvc = new resilienceHubBackendService(awsRegion, logger, accessKeyId || '', secretAccessKey || '');
    const output = await resilienceBackendSvc.getResiliencyRecommendationsForApplicationName(request.query.applicationName, awsRegion);
    return response.status(200).send(xss(JSON.stringify(output)));
  } catch (err:any) {
    if(err.toString().includes('403')) {
      return response.status(403).send({ success: false, error: 'Check your AWS credentials.' });
    }
    else {
      return response.status(500).send({ success: false, error: 'Error loading data.' });
    }
  }
});

router.get('/resiliency-component-compliances', async (request, response) => {
  try {
    logger.info('received request for policy details of app - ' + request.query.applicationName);
    let awsRegion = request.query.awsRegion as string;
    awsRegion = xss(awsRegion);
    const resilienceBackendSvc = new resilienceHubBackendService(awsRegion, logger, accessKeyId || '', secretAccessKey || '');
    const output = await resilienceBackendSvc.getComponentCompliancesForApplicationName(request.query.applicationName, awsRegion);
    return response.status(200).send(xss(JSON.stringify(output)));
  } catch (err:any) {
    if(err.toString().includes('403')) {
      return response.status(403).send({ success: false, error: 'Check your AWS credentials.' });
    }
    else {
      return response.status(500).send({ success: false, error: 'Error loading data.' });
    }
  }
});


router.get('/version-assessmentname', async (request, response) => {
  try {
    logger.info('received request for policy details of app - ' + request.query.applicationName);
    let awsRegion = request.query.awsRegion as string;
    awsRegion = xss(awsRegion);
    const resilienceBackendSvc = new resilienceHubBackendService(awsRegion, logger, accessKeyId || '', secretAccessKey || '');
    const output = await resilienceBackendSvc.getVersionAndAssessmentName(request.query.applicationName, awsRegion);
     return response.status(200).send(xss(JSON.stringify(output)));
  } catch (err:any) {
    if(err.toString().includes('403')) {
      return response.status(403).send({ success: false, error: 'Check your AWS credentials.' });
    }
    else {
      return response.status(500).send({ success: false, error: 'Error loading data.' });
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
