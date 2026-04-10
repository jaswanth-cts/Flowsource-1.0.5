import { PluginTaskScheduler } from '@backstage/backend-tasks';
import { Config } from '@backstage/config';
import { AuthService, LoggerService } from '@backstage/backend-plugin-api';
import { CatalogClient } from '@backstage/catalog-client';
import { s3Service } from './s3Service';
import { getEntities } from './catalogDetails';
import { AzureStorageService } from './azureStorageService';
import { GcsService } from './gcsService';

// Method to create the scheduler
export async function createScheduler(
  env: { logger: LoggerService,
    config: Config,
    catalogClient: CatalogClient,
    scheduler: PluginTaskScheduler, 
    auth: AuthService,
  },
) {
    const { logger, config, catalogClient, scheduler, auth } = env;
    let lastExecutionTime: Date | undefined;

    logger.info('Initializing task scheduler...');
 
  let isFirstRun = true;
 
  // Initial delay in milliseconds
  const initialDelayMs = 10 * 1000; // 10 seconds
 
  try {
    // Execute initial task after initial delay
    setTimeout(async () => {
      try {
        isFirstRun = false;
        await updateDataToCloud(logger, catalogClient, config, auth);
      } catch (error:any) {
        logger.error('Initial run - Error:', error);
      }
    }, initialDelayMs);
 
    setupScheduler();
  } catch (error:any) {
    logger.error('Error during scheduler initialization:', error);
  }

  function setupScheduler() {
    // Get the configurations required for the scheduler
    const refreshIntervalConfig = config.getOptionalConfig('catalogExtended.scheduler.refreshInterval');
    const timeoutConfig = config.getOptionalConfig('catalogExtended.scheduler.timeout');

    const hours = refreshIntervalConfig && refreshIntervalConfig.has('hours') ? refreshIntervalConfig.getNumber('hours') : 0;
    const minutes = refreshIntervalConfig && refreshIntervalConfig.has('minutes') ? refreshIntervalConfig.getNumber('minutes') : 10;
    const seconds = refreshIntervalConfig && refreshIntervalConfig.has('seconds') ? refreshIntervalConfig.getNumber('seconds') : 0;

    const timeoutHours = timeoutConfig && timeoutConfig.has('hours') ? timeoutConfig.getNumber('hours') : 0;
    const timeoutMinutes = timeoutConfig && timeoutConfig.has('minutes') ? timeoutConfig.getNumber('minutes') : 1;
    const timeoutSeconds = timeoutConfig && timeoutConfig.has('seconds') ? timeoutConfig.getNumber('seconds') : 0;
    
    // Create a scheduled task runner with the given configuration
    const schedule = scheduler.createScheduledTaskRunner({
        frequency: { hours, minutes, seconds },
        timeout: { hours: timeoutHours, minutes: timeoutMinutes, seconds: timeoutSeconds },
        scope: 'global',
    });
    // Run the task
    schedule.run({
        id: 'update-s3-with-catalog-items',
        fn: async () => { 
          if(!isFirstRun){
          const now = new Date();
             // Check if the task was recently executed
          if (lastExecutionTime && (now.getTime() - lastExecutionTime.getTime()) < (7 * 1000)) {
            logger.info('Task was recently executed. Skipping this run.');
                  return;
                }
          const startTime = new Date();
          logger.info(`Task started at: ${startTime.toISOString()}`);
          try {
            // Function to be executed
            await updateDataToCloud(logger, catalogClient, config, auth);
          } catch (error:any) {
            logger.error('An error occurred while updating cloud with catalog items', error);
          }
          const endTime = new Date();
          logger.info(`Task completed at: ${endTime.toISOString()}`);
        }
        },
        signal: undefined, // Pass a signal to cancel the task, if needed
    });

    logger.info('Scheduler started');
  }
}

async function updateDataToCloud(logger: LoggerService, catalogClient: CatalogClient, config: Config, auth: AuthService) {  
  const { token } = await auth.getPluginRequestToken({
    onBehalfOf: await auth.getOwnServiceCredentials(),
    targetPluginId: 'catalog',
  });
  const cloudProvider:string = config.getOptionalString('catalogInfo.cloudProvider')??'defaultCloudProvider';
   // Fetch the catalog items
   logger.info('Fetching catalog items after token authentication');
   const items = await getEntities(catalogClient, token);
   
   logger.debug(`Fetched catalog items json - ${JSON.stringify(items)}`);
  if(cloudProvider.trim() !== '' && cloudProvider.toLowerCase()==='aws'){
    updateS3WithCatalogItems(logger,  config, items);
  }else if(cloudProvider.trim() !== '' && cloudProvider.toLowerCase()==='azure'){
    updateAzureBlobStorageWithCatalogItems(logger,  config,  items);
  }else if(cloudProvider.trim() !== '' && cloudProvider.toLowerCase()==='googlegcs'){
    updateGoogleCloudStorageWithCatalogItems(logger,  config,  items);
  }else{
    logger.error('Invalid catalogInfo cloudProvider configuration. Please provide  azure, aws or googleGCS configuration.');
  }
}

async function updateGoogleCloudStorageWithCatalogItems(logger: LoggerService, config: Config, items: any) {
  logger.info('Fetching config for Google Storage');
  const bucketName = config.getOptionalString('catalogInfo.googleGcs.gcs_bucket_name') ?? 'defaultBucketName';
  const gcsUploadPath = config.getOptionalString('catalogInfo.googleGcs.gcs_upload_path') ?? 'defaultGcsUploadPath';
  const projectId = config.getOptionalString('catalogInfo.googleGcs.gcs_projectId') ?? 'defaultProjectId';
  const client_email = config.getOptionalString('catalogInfo.googleGcs.client_email');
  const private_key = config.getOptionalString('catalogInfo.googleGcs.private_key');

  if (
    bucketName === 'defaultBucketName' ||
    gcsUploadPath === 'defaultGcsUploadPath' ||
    projectId === 'defaultProjectId'
  ) {
    logger.error('This plugin has not been configured with the required values for googleGCS cloudProvider. Please ask your administrator to configure it');
  } else {
    logger.info('Updating GCS with catalog items');
    const credentials =
      client_email && private_key
        ? { client_email, private_key: private_key.replace(/\\n/g, '\n') }
        : undefined;
    const gcsService = new GcsService(bucketName, gcsUploadPath, projectId, logger, credentials);
    await gcsService.sendDetailsToGCS(items);
    logger.info('Updated GCS with catalog items');
  }
}

async function updateAzureBlobStorageWithCatalogItems(logger: LoggerService, config: Config,  items: any) {  
  logger.info('Fetching config  for Azure Blob Storage');
   //fetch Azure Storage details
   const storageAccount = config.getOptionalString('catalogInfo.azure.storage_account_name')??'defaultStorageAccount';
   const containerName = config.getOptionalString('catalogInfo.azure.blob_container_name')??'deafultContainerName';
   const folderName = config.getOptionalString('catalogInfo.azure.blob_folder_name')??'defaultFolderName';
   const clientId = config.getOptionalString('catalogInfo.azure.azure_client_id')??'defaultClientId';
   const tenantId = config.getOptionalString('catalogInfo.azure.azure_tenant_id')??'defaultTenantId';
   const secretKey = config.getOptionalString('catalogInfo.azure.azure_secret_key')??'defaultSecretKey';
   if (storageAccount === 'defaultStorageAccount' || containerName === 'deafultContainerName' || folderName === 'defaultFolderName' 
   || clientId === 'defaultClientId' || tenantId === 'defaultTenantId'|| secretKey === 'defaultSecretKey' ) {
    logger.error('This plugin has not been configured with the required values for azure cloudProvider. Please ask your administrator to configure it');
  }else{
   logger.info('Updating Azure Storage with catalog items');
   // sending catalog items data to Azure Storage
   const azureStorageService = new AzureStorageService(storageAccount, containerName, folderName, clientId, tenantId, secretKey, logger);
   await azureStorageService.sendDetailsToAzureStorage(items); 
   logger.info('Updated Azure Storage with catalog items');
  }
}

// Method to update the s3 with the catalog items
async function updateS3WithCatalogItems(logger: LoggerService, config: Config,  items: any) {
  logger.info('Fetching config items for S3');
  //fetch aws s3 credentials
  const bucketName = config.getOptionalString('catalogInfo.awsS3.s3_bucket_name')??'defaultBucketName';
  const region = config.getOptionalString('catalogInfo.awsS3.s3_region')??'defaultRegion';
  const accessKeyId = config.getOptionalString('catalogInfo.awsS3.access_key_id')??'defaultAccessKeyId';
  const secretAccessKey = config.getOptionalString('catalogInfo.awsS3.secret_access_key')??'defaultSecretAccessKey';
  const s3UploadPath = config.getOptionalString('catalogInfo.awsS3.s3_upload_path')??'defaultS3UploadPath';
  if (bucketName === 'defaultBucketName' || region === 'defaultRegion' || accessKeyId === 'defaultAccessKeyId' 
  || secretAccessKey === 'defaultSecretAccessKey' || s3UploadPath === 'defaultS3UploadPath') {
   logger.error('This plugin has not been configured with the required values for aws cloudProvider. Please ask your administrator to configure it');
 }else{
  logger.info('Updating s3 with catalog items');
  // sending catalog items data to s3
  const s3Svc = new s3Service(bucketName, region, accessKeyId, secretAccessKey,s3UploadPath,logger);
  await s3Svc.sendDetailsToS3(items);
  logger.info('Updated s3 with catalog items');
 }
}