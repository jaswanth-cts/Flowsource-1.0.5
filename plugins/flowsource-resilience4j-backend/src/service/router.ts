import { errorHandler } from '@backstage/backend-common';
import express from 'express';
import Router from 'express-promise-router';
import { LoggerService } from '@backstage/backend-plugin-api';
import { Config } from '@backstage/config';
import xss from 'xss';
import { Resilience4jCircuitBreaker } from './resilience4j-circuitBreaker';
import { Resilience4jBulkHead } from './resilience4j-bulkHead';
import { Resilience4jRateLimiter } from './resilience4j-ratelimiter';

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

  const apiKey = config.getOptionalString('datadog.api_key');
  const appKey = config.getOptionalString('datadog.app_key');
  const baseUrl = config.getOptionalString('datadog.url') || '';

  router.use((_req, res, next) => {
    try {
      new URL(baseUrl);
    } catch (_) {
      return res.status(503).send({
        success: false,
        error: 'Invalid Datadog URL. Please ask your administrator to configure it'
      });
    }

    if (!apiKey || !appKey) {
      return res.status(503).send({
        success: false,
        error: 'This plugin has not been configured with the required values. Please ask your administrator to configure it'
      });
    }

    next();
    return;
  });



  router.get('/health', (_, response) => {
    logger.info('PONG!');
    response.json({ status: 'ok' });
  });

  router.get('/resilience4jCircuitBreaker', async (request, response) => {
    try{
    const eventName = request.query.eventName as any;
    const fromdate = request.query.fromdate as any;
    const todate = request.query.todate as any;

    const resilience4jCircuitBreaker = new Resilience4jCircuitBreaker(logger, baseUrl, apiKey, appKey);
    const output = await resilience4jCircuitBreaker.getResilience4jDetails(eventName, fromdate,todate);

    const sanitizedOutput = xss(JSON.stringify(output));
    return response.status(200).send(sanitizedOutput);
    }catch (error){
      logger.error('Error loading Circuit breaker data:', error  as Error);
      if ((error as any).status === 404) {
        return response.status(404).send({ success: false, error: 'Event not found.' });
      }
      return response.status(500).send({ success: false, error: 'Error loading data.' });
    }
  });

  router.get('/resilience4jBulkHead', async (request, response) => {
    try {
      const from = request.query.from as any;
      const to = request.query.to as any;
      const applicationName = request.query.applicationName as any;
      const resilience4jBulkHead = new Resilience4jBulkHead( logger, baseUrl, apiKey, appKey);
      const output = await resilience4jBulkHead.getBulkheadDetails(from,to,applicationName);
      const sanitizedOutput = xss(JSON.stringify(output));
      return response.status(200).send(sanitizedOutput);
    } catch (error) {
      logger.error('Error loading bulkhead data:', error  as Error);
      if ((error as any).status === 404) {
        return response.status(404).send({ success: false, error: 'Application not found.' });
      }
      return response.status(500).send({ success: false, error: 'Error loading bulkhead data.' });
    }
  });

  router.get('/resilience4jRateLimiter', async (request, response) => {
    try {
      const from = request.query.from as any;
      const to = request.query.to as any;
      const applicationName = request.query.applicationName as any;
      const resilience4jRateLimiter = new Resilience4jRateLimiter(logger, baseUrl, apiKey, appKey);
      const output = await resilience4jRateLimiter.getRateLimiterDetails(from,to,applicationName);
      const sanitizedOutput = xss(JSON.stringify(output));
      return response.status(200).send(sanitizedOutput);
    } catch (error) {
      logger.error('Error loading Rate limiter data:', error as Error);
      if ((error as any).status === 404) {
        return response.status(404).send({ success: false, error: 'Application not found.' });
      }
      return response.status(500).send({ success: false, error: 'Error loading bulkhead data.' });
    }
  });

  router.get('/plugin-versions', async (_request, response) => {

    const backendVersionJson = "{\"version\": \"" + backEndPackageJson.version + "\"}";

    return response.status(200).send(backendVersionJson);

  });

  router.use(errorHandler());
  return router;
}
