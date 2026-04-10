import * as https from 'https';
import { errorHandler,PluginDatabaseManager } from '@backstage/backend-common';
import express from 'express';
import Router from 'express-promise-router';
import { LoggerService , HttpAuthService, UserInfoService } from '@backstage/backend-plugin-api';
import { Config } from '@backstage/config';
import DataService from './dataService';
import NodeCache from 'node-cache';
import { DatabaseHandler } from './databaseHandler';
import { OrderItem } from '../database/types';
import xss from 'xss';

import ApiService from './ApiService';

import backEndPackageJson from '../../package.json';

export interface RouterOptions {
  logger: LoggerService;
  config: Config;
  database: PluginDatabaseManager;
  httpAuth: HttpAuthService;
  userInfo: UserInfoService;
}

export async function createRouter(
  options: RouterOptions,
): Promise<express.Router> {
  const CACHE_KEY_AUTH_TOK = 'auth_token';
  const {
    database,
    logger,
    config,
    httpAuth,
    userInfo
  } = options;

  const router = Router();
  router.use(express.json());
  const hostUrl = config.getOptionalString('morpheus.host_url') || '';  

  let flowsourceUser = 'flowsource_dev';
  let tlsRejectUnauthorized = true;
  let tlsRejectUnauth = undefined;
  let maxInputfldLen = 255;
  let canSubmitOrder = true;
  let canSubmit = undefined

  try {
    flowsourceUser = config.getOptionalString('morpheus.user_id') || '';
  }
  catch (_) { }
  try {
    tlsRejectUnauthorized = config.getBoolean('morpheus.rejectUnauthorized');
    console.log("-----------------------tlsRejectUnauthorized-- router------------", tlsRejectUnauthorized);
    tlsRejectUnauth = 'valid';
  }
  catch (_) { tlsRejectUnauth = undefined; }
  try {
    maxInputfldLen = config.getOptionalNumber('morpheus.field_data_len') || 0;
  }
  catch (_) { }

  try {
    canSubmitOrder = config.getBoolean('morpheus.order_submission_enabled');
    canSubmit = 'valid';
  }
  catch (_) { canSubmit = undefined; }

  if (!flowsourceUser || tlsRejectUnauth === undefined || !maxInputfldLen || canSubmit === undefined) {
    router.use((_req, res) => {
        res.status(503).send({
            success: false,
            error: 'This plugin has not been configured with the required values. Please ask your administrator to configure it.'
        });
    });
    return router;
}


  const cache = new NodeCache({ stdTTL: 120 });
  const dbHandler = await DatabaseHandler.create({ database, logger });

const getAuthToken = async (): Promise<any> => {
  try {
      const clientId = config.getOptionalString('morpheus.client_id') || '';
      const grantType = config.getOptionalString('morpheus.grant_type') || '';
      const scope = config.getOptionalString('morpheus.scope') || '';
      const userId = config.getOptionalString('morpheus.morpheus_user') || '';
      const password = config.getOptionalString('morpheus.morpheus_password') || '';

      if (!hostUrl || !clientId || !grantType || !scope || !userId || !password) {
        router.use((_req, res) => {
            res.status(503).send({
                success: false,
                error: 'This plugin has not been configured with the required values. Please ask your administrator to configure it.'
            });
        });
        return router;
    }

      const url = `/oauth/token?client_id=${clientId}&grant_type=${grantType}&scope=${scope}`;
      
      // For form-urlencoded, use URLSearchParams
      const body = new URLSearchParams();
      body.append('username', userId);
      body.append('password', password);

      let options = {
          headers: {
              'Content-Type': 'application/x-www-form-urlencoded',
              'Accept': 'application/json',
          },
          agent: new https.Agent({ rejectUnauthorized: tlsRejectUnauthorized })
      }
    
      const resData = await new ApiService(hostUrl).post(url, body.toString(), options);
      cache.set(CACHE_KEY_AUTH_TOK, resData);
      return resData;
  }
  catch (err: any) {
    logger.error('Auth token error:', {
        message: err.message,
        error: err
    });
    throw err;
  }
}


  const getDataServiceClient = async (): Promise<DataService> => {
    try {
      const authToken = await getAuthToken();
      if (authToken != null) {
        const headers = {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': 'bearer ' + authToken.access_token
        }

        const options = {
          headers: headers,
          agent: new https.Agent({ rejectUnauthorized: tlsRejectUnauthorized })
        }
        return new DataService(hostUrl, options, true, maxInputfldLen, tlsRejectUnauthorized);
      } else {
        return new DataService(hostUrl, options, true, maxInputfldLen, tlsRejectUnauthorized);
      }
    } catch (err: any) {
      logger.error('DataService client creation failed:', err);
      throw err;
    }
    return new DataService(hostUrl, options, true, maxInputfldLen, tlsRejectUnauthorized);
  }

  router.get('/health', (_, response) => {
    logger.info('PONG!');
    response.json({ status: 'ok' });
  });

  router.get('/host-url', (_, response) => {
    return response.status(200).send({ 'hostUrl': hostUrl });
  });

  router.get('/can-submit-order', (_, response) => {
    return response.status(200).send({ 'canSubmitOrder': canSubmitOrder });
  });

  router.get('/catalogs', async (_, response) => {
    const client = await getDataServiceClient();

    if (client.isAuthencated()) {
      const resData = await client.listCatalog();
      return response.status(200).send(xss(JSON.stringify(resData)));
    }

    return response.status(401).send('Authendication failed');
  });

  router.get('/my-orders', async (req, response) => {

    
    if (userInfo != null && userInfo != undefined) {
      try {
        const credentials = await httpAuth.credentials(req, { allow: ['user'] });
        const user = await userInfo.getUserInfo(credentials);

        if (user != null && user != undefined) {
          if (user.userEntityRef != null && user.userEntityRef != undefined) {
            flowsourceUser = user.userEntityRef
          }
        }
      }
      catch (err: any) {
      return response.status(401).send('invalid flow source user');
      }
    }

    const client = await getDataServiceClient();

    if (client.isAuthencated()) {
      var orderDetails = await dbHandler.listOrderDetailyUser(flowsourceUser);
      const resData = await client.getMyOrders(orderDetails);
      return response.status(200).send(resData);
    }

    return response.status(401).send('failed to fetch orders');
  })


  router.get('/instance-types', async (_, response) => {
    const client = await getDataServiceClient();

    if (client.isAuthencated()) {
      const resData = await client.listInstanceTypes();
      return response.status(200).send(xss(JSON.stringify(resData)));
    }

    return response.status(401).send('Authendication failed');
  });

  router.get('/activity', async (_, response) => {
    const client = await getDataServiceClient();

    if (client.isAuthencated()) {
      const resData = await client.listActivities();
      return response.status(200).send(xss(JSON.stringify(resData)));
    }

    return response.status(401).send('Authendication failed');
  });

  router.get('/input-options', async (request, response) => {
    let catalogId = request.query.catalogId;
    
    const client = await getDataServiceClient();
    
    if (client.isAuthencated()) {
      //fetch required input config
      const resData = await client.getInputOptionFor(catalogId);
      return response.status(200).send(xss(JSON.stringify(resData)));
    }
    
    return response.status(401).send('Authendication failed');
  });

  //https://apidocs.morpheusdata.com/reference/listcatalogitems
  router.post('/order-item', async (request, response) => {

    if (userInfo != null && userInfo != undefined) {
      try {
        const credentials = await httpAuth.credentials(request, { allow: ['user'] });
        const user = await userInfo.getUserInfo(credentials);

        if (user != null && user != undefined) {
          if (user.userEntityRef != null && user.userEntityRef != undefined) {
            flowsourceUser = user.userEntityRef
          }
        }

      }
      catch (err) {
        return response.status(401).send('invalid flow source user');
      }
    }

    if (canSubmitOrder !== true) {
      return response.status(401).send('order submission disabled, please check with Administrator.');
    }

    try 
    {
      const orderConfigData = request.body;
      const client = await getDataServiceClient();

      if (client.isAuthencated() && (typeof orderConfigData.order === 'object') && orderConfigData.order['iteminputOptionConfig']) 
      {
        orderConfigData.order = JSON.parse(xss(JSON.stringify(orderConfigData.order)));

        let resData = await client.orderItem(orderConfigData.order);
        resData = JSON.parse(xss(JSON.stringify(resData)));
        
        let orderItem: OrderItem = {
          id: '',
          userId: flowsourceUser,
          orderId: resData.order.id,
          catalogId: orderConfigData.order.catalogId,
          catalogName: orderConfigData.order.catalogName,
          catalogCode: '',
          orderResponse: JSON.stringify(resData.order)
        };

        await dbHandler.createOrderItem(orderItem);
        
        return response.status(200).send(resData);
      } else {
        return response.status(401).send('Authendication failed');
      }
    }
    catch (err) {
      return response.status(400).send({ status: 'failed', message: 'something went wrong.' });
    }
  });

  router.get('/order-detail', async (request, response) => {
    let orderId: any = request.query.orderId;
    
    if (typeof orderId !== 'string') {
      orderId = String(orderId);
    }
    orderId = xss(orderId);
    
    const client = await getDataServiceClient();
    
    if (client.isAuthencated()) {
      const resData = await client.getOrderDetailById(orderId);
      return response.status(200).send(xss(JSON.stringify(resData)));
    }
    
    return response.status(200).send(orderId);
  });

  router.get('/plugin-versions', async (_request, response) => {

    const backendVersionJson = "{\"version\": \"" + backEndPackageJson.version + "\"}";

    return response.status(200).send(backendVersionJson);

  });

  router.use(errorHandler());
  
  return router;
}