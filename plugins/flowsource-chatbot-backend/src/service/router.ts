import { PluginDatabaseManager, errorHandler } from '@backstage/backend-common';
import express from 'express';
import Router from 'express-promise-router';
import { AuthService, LoggerService } from '@backstage/backend-plugin-api';
import { chatbotService } from './chatbot.service';
import helmet from 'helmet';
import { Config } from '@backstage/config';
import xss from 'xss';
import { Knex } from 'knex';
import { CatalogClient } from '@backstage/catalog-client';
import { ScmIntegrations } from '@backstage/integration';

export interface RouterOptions {
  logger: LoggerService;
  config: Config;
  database: PluginDatabaseManager;
  catalogClient: CatalogClient;
  auth: AuthService;
}

export async function createRouter(
  options: RouterOptions,
): Promise<express.Router> {
  const { logger, config, database, catalogClient, auth } = options;

  const db: Knex = await database.getClient();
  const chatbotAccessToken:string = config.getOptionalString('chatbot.accessToken') || '';
  const chatbotUrl = config.getOptionalString('chatbot.url');
  const chatbotEnabled = config.getOptional('chatbot.enabled');  
  const integrations = ScmIntegrations.fromConfig(config);
  const githubToken = integrations.github.byHost('github.com')?.config?.token as string;
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

  // Sample request body: `{ "question": "What is deployment frequency?" }`
  // router.post('/requestAnswer', async (request, response) => {
  //   const question = request.body.question;
  //   logger.info('Request received with question - ' + question);
  //   const answer = chatbotSvc.getAnswerForQuestion(question.toLowerCase());
  //   logger.info('Answer ' + answer);
  //   response.status(200).send(String(answer));
  // });

  router.post('/requestAnswer', async (request, response) => {
    if (!chatbotAccessToken || !chatbotUrl || !chatbotEnabled || !githubToken) {
        response.status(503).send('Chatbot plugin failed with error 503, missing values in chatbot.');
        return;
    }


    if (!chatbotEnabled) { 
      response.status(400).send('Chatbot is disabled.');
      return;
    }

    const chatbotSvc = new chatbotService(db, logger, chatbotAccessToken);

    const { token } = await auth.getPluginRequestToken({
      onBehalfOf: await auth.getOwnServiceCredentials(),
      targetPluginId: 'catalog',
    });
    const question = xss(request.body.question);
    const appid = xss(request.body.appid); 
    let answer = await chatbotSvc.getAnswerForQuestion(question.toLowerCase(), appid, chatbotUrl, catalogClient, githubToken, token);
    answer = xss(answer);
    response.status(200).send(String(answer));
  });

  router.get('/chatbotEnabled', (_, response) => {
    if (!chatbotAccessToken || !chatbotUrl || !chatbotEnabled || !githubToken) {
      response.status(503).send('Chatbot plugin failed with error 503, missing values in chatbot.');
      return;
    }
    
    response.json({ chatbotEnabled });
  });

  /*
  * To get the document upload status from chatbot and trigger the upload if necessary
  * Example Request: GET /apps/123/docs-status
  */
  router.get('/apps/:appid/docs-status', async (request, response) => {   
    if (!chatbotAccessToken || !chatbotUrl || !chatbotEnabled || !githubToken) {
      response.status(503).send('Chatbot plugin failed with error 503, missing values in chatbot..');
      return;
    }
    const chatbotSvc = new chatbotService(db, logger, chatbotAccessToken);

    const appid = xss(request.params.appid);
    if (!chatbotEnabled) { 
      response.status(400).send('Chatbot is disabled.');
      return;
    }
    const { token } = await auth.getPluginRequestToken({
      onBehalfOf: await auth.getOwnServiceCredentials(),
      targetPluginId: 'catalog',
    });

    try {
      logger.info(`Request received to get status of the request from chatbot for app - ${appid}`);
      let status = await chatbotSvc.getChatbotStatusAndUpdateIfNecessary(chatbotUrl, appid, catalogClient, githubToken, token);
      status =  xss(status);
      logger.info(`Status of the request from chatbot for app - ${appid} is - ${status}`);
      response.status(200).send(status);
    } catch(error) {
      logger.error(`Error in chatbot status request - ${error}`);
      response.status(500).send(`Error in chatbot status request - ${error}`);
    }
  });

  router.use(errorHandler());

  return router;
}
