import { MiddlewareFactory } from '@backstage/backend-defaults/rootHttpRouter';
import { LoggerService } from '@backstage/backend-plugin-api';
import { Config } from '@backstage/config';
import express from 'express';
import Router from 'express-promise-router';
import { AppDynamicsService } from './appDynamicsService';
import { AuthService } from './auth.service';
import xss from 'xss';
import backEndPackageJson from '../../package.json';
import helmet from 'helmet';

export interface RouterOptions {
  logger: LoggerService;
  config: Config;
}

export async function createRouter(
  options: RouterOptions,
): Promise<express.Router> {
  const { logger, config } = options;

  const router = Router();
  router.use(helmet.hsts({
    maxAge: 31536000, // One year in seconds
    includeSubDomains: true,
    preload: true
  }));
  router.use(express.json());

  router.get('/health', (_, response) => {
    logger.info('PONG!');
    response.json({ status: 'ok' });
  });
  const clientId = config.getOptionalString('appDynamics.clientId');
  const clientSecret = config.getOptionalString('appDynamics.clientSecret');
  const baseUrl = config.getOptionalString('appDynamics.baseUrl');
  const duration = config.getOptionalNumber('appDynamics.duration');

  if (!clientId || !clientSecret || !baseUrl || !duration) {
    router.use((_req, res) => {
      res.status(503).send({
        success: false,
        error: 'This plugin has not been configured with the required values. Please ask your administrator to configure it'
      });
    });
    return router;
  }

  const authService = new AuthService(logger, clientId, clientSecret, baseUrl);
  const appDynamicsService = new AppDynamicsService(logger, authService, baseUrl, duration);
  router.get('/appDynamics', async (request, response) => {
    let applicationName: string = request.query.applicationName as string;

    try {
      let data = await appDynamicsService.fetchResponse(applicationName);
      data = JSON.parse(xss(JSON.stringify(data)));
  
      return response.status(200).send(data);
    } catch (error: any) {

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
          if(error.message.includes(`Invalid application id`)) 
          {
            return response.status(404).send({
              success: false,
              error: error.message
            });
          } 
          else 
          {
            return response.status(404).send({
              success: false,
              error: 'Not Found: fetch error'
            });
          }
        case 500:
          return response.status(500).send({
            success: false,
            error: 'Internal Server Error: fetch error'
          });
        case 400:
          return response.status(400).send({
            success: false,
            error: 'Bad Request: fetch error'
          });
        default:
          return response.status(500).send({
            success: false,
            error: 'Unexpected Error'
          });
      }
    }
  });
  router.get('/plugin-versions', async (_request, response) => {

    const backendVersionJson = "{\"version\": \"" + backEndPackageJson.version + "\"}";

    return response.status(200).send(backendVersionJson);

  });
  const middleware = MiddlewareFactory.create({ logger, config });

  router.use(middleware.error());
  return router;
}
