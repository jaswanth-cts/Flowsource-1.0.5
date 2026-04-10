import { errorHandler } from '@backstage/backend-common';
import { LoggerService } from '@backstage/backend-plugin-api';
import { Config } from '@backstage/config';
import express from 'express';
import Router from 'express-promise-router';
import helmet from 'helmet';
import xss from 'xss';
import { AzureBlobService } from './playwrightAzureService';
import { AzureAuthenticator } from './playwrightAzureAuthService';
import backEndPackageJson from '../../package.json';
import { AwsAuthenticator } from './playwrightAwsAuthService';
import { AWSS3Service } from './playwrightAwsService';
import { GCSAuthenticator } from './playwrightGcsAuthService';
import { GCSService } from './playwrightGcsService';

export interface RouterOptions {
  logger: LoggerService;
  config: Config;
}

export async function createRouter(
  options: RouterOptions,
): Promise<express.Router> {
  const { logger, config } = options;

  const router = Router();
  router.use(
    helmet.hsts({
      maxAge: 31536000, // One year in seconds
      includeSubDomains: true,
      preload: true,
    }),
  );
  router.use(express.json());

  router.get('/health', (_, response) => {
    logger.info('PONG!');
    response.json({ status: 'ok' });
  });
 
// This router is used to fetch data from AWS S3
router.get('/fetchS3FileData', async (request, response) => {
  try {
    const fileName = request.query.fileName as string;
    const path = request.query.path as string;
    const bucketName =
      config.getOptionalString('playwright.awsS3Bucket.bucketName') || '';

    if (!bucketName) {
      logger.error('AWS S3 bucket name is not configured in app-config.yaml');
      return response.status(400).send({
        success: false,
        error: 'AWS S3 bucket name is not configured in app-config.yaml',
      });
    }

    const authService = new AwsAuthenticator(config, logger);
    const awsBackendSvc = new AWSS3Service(authService, logger);
    const output = await awsBackendSvc.fetchTestResultsFromS3(
      bucketName,
      fileName,
      path,
    );
    const sanitizedOutput = xss(JSON.stringify(output));
    return response.status(200).send(sanitizedOutput);
  } catch (err: any) {
    logger.error(`Router error on route /fetchS3Data`, err);
    if (err.toString().includes('503')) {
      return response.status(503).send({
        success: false,
        error:
          'AWS S3 credentials configurations are not set, missing config value in AWS S3',
      });
    } else if (err.toString().includes('403')) {
      return response
        .status(403)
        .send({ success: false, error: 'Check your AWS credentials.' });
    } else if (err.toString().includes('ResourceNotFoundException')) {
      return response
        .status(404)
        .send({ success: false, error: 'No project found.' });
    }else if (err.toString().includes('The specified key does not exist.')) {
      return response
        .status(404)
        .send({ success: false, error: 'File not found, incorrect fileName or path' });
    }
    return response
      .status(500)
      .send({ success: false, error: 'Error loading data.' });
  }
});

// This router is used to fetch data from Google Cloud Storage
router.get('/fetchGCSFileData', async (request, response) => {
  try {
    const bucketName =
      config.getOptionalString('playwright.gcsBucket.bucketName') || '';
    const fileName = request.query.fileName as string;
    const path = request.query.path as string;

    if (!bucketName) {
      logger.error('GCS bucket name is not configured in app-config.yaml');
      return response.status(400).send({
        success: false,
        error: 'GCS bucket name is not configured in app-config.yaml',
      });
    }

    const authService = new GCSAuthenticator(config);
    const gcsService = new GCSService(authService);
    const output = await gcsService.getTestResultFileFromGCS(
      bucketName,
      fileName,
      path,
    );
    const sanitizedOutput = xss(JSON.stringify(output));
    return response.status(200).send(sanitizedOutput);
  } catch (err: any) {
    logger.error('Router error', err);
    if (err.toString().includes('404')) {
      return response
        .status(404)
        .send({ success: false, error: 'File not found in GCS.' });
    } 
    else if (err.toString().includes('File not found')) {
      return response
        .status(404)
        .send({ success: false, error: 'File not found, incorrect fileName or path' });
    }
    return response
      .status(500)
      .send({ success: false, error: 'Error loading data from GCS.' });
  }
});


  // This router is used to fetch data from Azure Blob Storage
  router.get('/fetchAzureData', async (request, response) => {
    try {
      const azurefileName = request.query.fileName as string;
      const azureAccountName =
        config.getOptionalString('playwright.azureStorage.azureStorageAccountName') || '';      
      const azure_secret_key =
        config.getOptionalString('playwright.azureStorage.azure_secret_key') || '';
      const azure_client_id =
        config.getOptionalString('playwright.azureStorage.azure_client_id') || '';
      const azure_tenant_id =
        config.getOptionalString('playwright.azureStorage.azure_tenant_id') || '';
      const azureContainerName =
        config.getOptionalString('playwright.azureStorage.azureContainerName') || '';
      const azureStorageAccountName =
        config.getOptionalString('playwright.azureStorage.azureStorageAccountName') || '';

     
      if (!azureContainerName || !azureAccountName ) {
        return response.status(503).send({
          success: false,
          error:
            'Azure Blob Storage credentials configurations are not set, missing config values in azureBlobStorage',
        });
      }

      const authAzureService = new AzureAuthenticator();

      const azureBackendSvc = new AzureBlobService(authAzureService, azure_client_id, azure_tenant_id, azure_secret_key, azureStorageAccountName);
      const output = await azureBackendSvc.fetchAzureBlobs(
        azureContainerName,
        azurefileName,
      );
      const sanitizedOutput = xss(JSON.stringify(output));
      return response.status(200).send(sanitizedOutput);
    } catch (err: any) {
      logger.error('Router error', err);
      if (err.toString().includes('503')) {
        return response
          .status(503)
          .send({
            success: false,
            error:
              'Azure blob storage credentials configurations are not set, missing config value in azure blob storage',
          });
      } else if (err.toString().includes('403')) {
        return response
          .status(403)
          .send({ success: false, error: 'Check your Azure credentials.' });
      } else if (err.toString().includes('ResourceNotFoundException')) {
        return response
          .status(404)
          .send({ success: false, error: 'No project found.' });
      }else if (err.toString().includes('The specified blob does not exist')) {
        return response
          .status(404)
          .send({ success: false, error: 'File not found, incorrect fileName or path' });
      }
      return response
        .status(500)
        .send({ success: false, error: 'Error loading data.' });
    }
  });


  router.get('/plugin-versions', async (_request, response) => {
    const backendVersionJson =
      '{"version": "' + backEndPackageJson.version + '"}';
    return response.status(200).send(backendVersionJson);
  });
  router.use(errorHandler());
  return router;
}