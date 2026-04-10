import { errorHandler } from '@backstage/backend-common';
import express from 'express';
import Router from 'express-promise-router';
import { LoggerService } from '@backstage/backend-plugin-api';
import { doraMetricsService } from './dora-metrics.service';
import { Config } from '@backstage/config';
import helmet from 'helmet';
import xss from 'xss';
import {sanitizeInputName} from './Utils'

import backEndPackageJson from '../../package.json';

export interface RouterOptions {
  logger: LoggerService;
  config: Config;
}

export async function createRouter(options: RouterOptions,): Promise<express.Router> {

  const { logger, config } = options;
  let dbDetails: any;
  const router = Router();

  const cloudProvider:string = config.getOptionalString('dora.insights.cloudProvider')??'';
  const lastMonthsLimit = config.getOptionalNumber('dora.insights.lastMonthsLimit')??4;  
  if (!cloudProvider) {
  router.use((_req, res) => {
    res.status(503).send({
      success: false,
      error: 'This plugin has not been configured with the required values for dora metrics. Please ask your administrator to configure it'
    });
  });
  return router;
  }

  if(cloudProvider.trim() !== '' && cloudProvider.toLowerCase()==='aws'){
    const database = config.getOptionalString('dora.insights.aws.database')??'';
    const schema = config.getOptionalString('dora.insights.aws.schema')??'';
    const region = config.getOptionalString('dora.insights.aws.region')??'';
    const credentials = {
      accessKeyId: config.getOptionalString('dora.insights.aws.accessKeyId')??'',
      secretAccessKey: config.getOptionalString('dora.insights.aws.secretAccessKey')??''
    };
  
    let clusterIdentifier = config.getOptionalString('dora.insights.aws.clusterIdentifier')??'';
    let dbUser = config.getOptionalString('dora.insights.aws.dbUser')??'';
    let workgroupName = config.getOptionalString('dora.insights.aws.workgroupName')??'';
    let secretArn = config.getOptionalString('dora.insights.aws.secretArn')??''; 

    if(!database || !schema || !region || !credentials.accessKeyId || !credentials.secretAccessKey || !dbUser
      || (!clusterIdentifier && (!workgroupName || !secretArn))) {
      logger.error('This plugin has not been configured with the required values for aws cloudProvider. Please ask your administrator to configure it');
      router.use((_req, res) => {
        res.status(503).send({
          success: false,
          error: 'This plugin has not been configured with the required values for dora metrics. Please ask your administrator to configure it'
        });
      });
      return router;
    } else if (typeof clusterIdentifier === 'string' && clusterIdentifier.trim() !== '' && clusterIdentifier.trim() !== 'defaultClusterIdentifier' &&
        typeof dbUser === 'string' && dbUser.trim() !== '' && dbUser.trim() !== 'defaultDbUser') {
      // Redshift specific configuration
      logger.info('Redshift specific configuration');
      dbDetails = { database, dbUser, schema, clusterIdentifier, region, credentials };

    } else if (typeof workgroupName === 'string' && workgroupName.trim() !== ''  && workgroupName.trim() !== 'defaultWorkgroupName' &&
              typeof secretArn === 'string' && secretArn.trim() !== '' && secretArn.trim() !== 'defaultSecretArn') {
      // Redshift Serverless specific configuration
      logger.info('Redshift Serverless specific configuration');
      dbDetails = { database, schema, workgroupName, region, credentials, secretArn };

    } else {
      logger.error('Invalid database configuration. Please provide either Redshift or Redshift Serverless configuration.');
      throw new Error('Invalid database configuration. Please provide either Redshift or Redshift Serverless configuration.');
    }
  }else if(cloudProvider.trim() !== '' && cloudProvider.toLowerCase()==='azure'){
    const database = config.getOptionalString('dora.insights.azure.database')??'';
    const host = config.getOptionalString('dora.insights.azure.host')??'';
    const port = config.getOptionalString('dora.insights.azure.port')??'';
    const user = config.getOptionalString('dora.insights.azure.user')??'';
    const password = config.getOptionalString('dora.insights.azure.password')??'';
    const schema = config.getOptionalString('dora.insights.azure.schema')??'';
    if(!database || !host || !port || !user || !password || !schema){
      logger.error('This plugin has not been configured with the required values for azure cloudProvider. Please ask your administrator to configure it');
      router.use((_req, res) => {
        res.status(503).send({
          success: false,
          error: 'This plugin has not been configured with the required values for dora metrics. Please ask your administrator to configure it'
        });
      });
      return router;
    }else{
      dbDetails = { database, host, port, user, password, schema};
    }
  }else if(cloudProvider.trim() !== '' && cloudProvider.toLowerCase() === 'gcp'){
    const datasetName = config.getOptionalString('dora.insights.gcp.dataset_name')??'';
    const projectId = config.getOptionalString('dora.insights.gcp.projectId')??'';
    const client_email = config.getOptionalString('dora.insights.gcp.client_email');
    const private_key = config.getOptionalString('dora.insights.gcp.private_key');

    if(!datasetName|| !projectId ){
      logger.error('This plugin has not been configured with the required values for gcp cloudProvider. Please ask your administrator to configure it');
      router.use((_req, res) => {
        res.status(503).send({
          success: false,
          error: 'This plugin has not been configured with the required values for dora metrics. Please ask your administrator to configure it'
        });
      });
      return router;
    }else{
      dbDetails = {
        datasetName,
        projectId,
        ...(client_email ? { client_email } : {}),
        ...(private_key ? { private_key: private_key.replace(/\\n/g, '\n') } : {})
      };
    }
  }else{
    logger.error('Invalid Dora Insights  cloudProvider configuration. Please provide either azure, aws, or gcp configuration.');
    throw new Error('Invalid Dora Insights  cloudProvider configuration. Please provide either azure, aws, or gcp configuration.');
  }

  logger.debug('cloudProvider : ' + cloudProvider + ' and condition : ' + (cloudProvider==='aws'));

  const doraMetricsSvc = new doraMetricsService(logger, dbDetails,cloudProvider,lastMonthsLimit);  

  logger.debug('Dora Metrics Service object created for database : ' + dbDetails.database + ' and clusterIdentifier : ' + dbDetails.clusterIdentifier);

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


  router.get('/deploymentFrequency', async (request, response) => {
    const appid = sanitizeInputName(request.query.appid as string);
    logger.info('Deployment frequency request received for service - ' + appid);
    let output: any = await doraMetricsSvc.getDeploymentSuccessFrequency(appid);
    output = xss(JSON.stringify(output));
    response.status(200).send(String(output));
  });

  router.get('/deploymentTrend', async (request, response) => {
    const appid = sanitizeInputName(request.query.appid as string);
    logger.info('Deployment frequency trend request received for service - ' + appid);
    let output: any = await doraMetricsSvc.getDeploymentSuccessTrend(appid);
    output = xss(JSON.stringify(output));
    logger.info('Deployment frequency trend response received for service - ' + appid);
    response.status(200).send(output);
  });

  router.get('/leadTimeForChanges', async (request, response) => {
    const appid = sanitizeInputName(request.query.appid as string);
    logger.info('Lead time for changes request received for service - ' + appid);
    let output: any = await doraMetricsSvc.getLeadTimeForChanges(appid);
    output = xss(JSON.stringify(output));
    logger.info('Lead time for changes response received for service - ' + appid);
    response.status(200).send(String(output));
  });

  router.get('/leadTimeTrend', async (request, response) => {
    const appid = sanitizeInputName(request.query.appid as string);
    logger.info('Lead Time for changes Trend request received for service - ' + appid);
    let output: any = await doraMetricsSvc.getLeadTimeForChangesTrend(appid);
    output = xss(JSON.stringify(output));
    logger.info('Lead Time for changes Trend response received for service - ' + appid);
    response.status(200).send(output);
  });

  router.get('/meanTimeToRecover', async (request, response) => {
    const appid = sanitizeInputName(request.query.appid as string);
    logger.info('Mean Time to Recover request received for service - ' + appid);
    let output: any = await doraMetricsSvc.getMeanTimeToRecover(appid);
    output = xss(JSON.stringify(output));
    logger.info('Mean Time to Recover response received for service - ' + appid);
    response.status(200).send(String(output));
  });

  router.get('/meanTimeTrend', async (request, response) => {
    const appid = sanitizeInputName(request.query.appid as string);
    logger.info('Mean Time to Recover Trend request received for service - ' + appid);
    let output: any = await doraMetricsSvc.getMeanTimeToRecoverTrend(appid);
    output = xss(JSON.stringify(output));
    logger.info('Mean Time to Recover Trend response received for service - ' + appid);
    response.status(200).send(output);
  });

  router.get('/changeFailureRate', async (request, response) => {
    const appid = sanitizeInputName(request.query.appid as string);
    logger.info('Change Failure Rate request received for service - ' + appid);
    let output: any = await doraMetricsSvc.getChangeFailureRate(appid);
    output = xss(JSON.stringify(output));
    logger.info('Change Failure Rate response received for service - ' + appid);
    response.status(200).send(String(output));
  });

  router.get('/changeFailureTrend', async (request, response) => {
    const appid = sanitizeInputName(request.query.appid as string);
    logger.info('Change Failure Rate Trend request received for service - ' + appid);
    let output: any = await doraMetricsSvc.getChangeFailureRateTrend(appid);
    output = xss(JSON.stringify(output));
    logger.info('Change Failure Rate Trend response received for service - ' + appid);
    response.status(200).send(output);
  });

  router.get('/plugin-versions', async (_request, response) => {

    const backendVersionJson = "{\"version\": \"" + backEndPackageJson.version + "\"}";

    return response.status(200).send(backendVersionJson);

  });
  
  router.use(errorHandler());
  return router;
}
