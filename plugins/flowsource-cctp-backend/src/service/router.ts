import { MiddlewareFactory } from '@backstage/backend-defaults/rootHttpRouter';
import { LoggerService } from '@backstage/backend-plugin-api';
import { Config } from '@backstage/config';
import express from 'express';
import Router from 'express-promise-router';
import { CctpBackendService } from './cctpBackend.service';
import { Readable } from 'stream';

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

  router.get('/health', async (_, response) => {
    logger.info('PONG!');
    response.json({ status: 'ok' });
  });

  const cctpBaseUrl = config.getOptionalString('cctpProxy.target') || '';
  const cctpUsername = config.getOptionalString('cctpProxy.username') || '';
  const cctpPassword = config.getOptionalString('cctpProxy.password') || '';
  const staticMaxRobotCount = config.getOptionalNumber('cctpProxy.staticMaxRobotCount') || '';
  const dynamicMaxRobotCount = config.getOptionalNumber('cctpProxy.dynamicMaxRobotCount') || '';

  if (!cctpBaseUrl || !cctpUsername || !cctpPassword) {
    router.use((_req, res) => {
      res.status(503).send({
        success: false,
        error: 'This plugin has not been configured with the required values. Please ask your administrator to configure it'
      });
    });
    return router;
  }

   router.all('/cctp-proxy*', async (request, response) => {
    let requestMethod = request.method;
    const uri = request.url.replace('/cctp-proxy', '');
    const cctpBackendService = new CctpBackendService(cctpBaseUrl, cctpUsername, cctpPassword, logger);
    const responseData = await cctpBackendService.getCctpProxy(uri, requestMethod, request.body);

    if(null != responseData.headers.get('content-type') && responseData.headers.get('content-type').trim() == 'application/json'){ 
      const resp = await responseData.json();  
      // const sanitizedResp = xss(JSON.stringify(resp));
      const sanitizedResp = JSON.stringify(resp);
      response.status(responseData.status).send(sanitizedResp);
    } else if(null != responseData.headers.get('content-type') && responseData.headers.get('content-type').trim() == 'application/octet-stream') {
      response.set('Content-Disposition', responseData.headers.get('Content-Disposition'));
      const nodeStream = Readable.fromWeb(responseData.body);
      nodeStream.pipe(response);
    } else {
      response.status(responseData.status).send();
    }
  });

  router.get('/cctp-config', async (_request, response) => {
    const cctpConfig = "{\"url\": \"" + cctpBaseUrl + "\", \"staticMaxRobotCount\": \"" + staticMaxRobotCount + "\", \"dynamicMaxRobotCount\": \"" + dynamicMaxRobotCount + "\"}";
    return response.status(200).send(cctpConfig);
  });

  const middleware = MiddlewareFactory.create({ logger, config });
  router.use(middleware.error());
  return router;
}
