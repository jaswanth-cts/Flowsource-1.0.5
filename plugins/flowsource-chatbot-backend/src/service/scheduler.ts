import { PluginDatabaseManager } from '@backstage/backend-common';
import { Knex } from 'knex';
import { PluginTaskScheduler } from '@backstage/backend-tasks';
import { Config } from '@backstage/config';
import { AuthService, LoggerService } from '@backstage/backend-plugin-api';
import { CatalogClient } from '@backstage/catalog-client';
import { ScmIntegrations } from '@backstage/integration';
import { CatalogServiceHelper } from './helper/catalog-helper.service';
import { chatbotService } from './chatbot.service';

// Method to create the scheduler
export async function createScheduler(
    env: {
        logger: LoggerService;
        config: Config,
        database: PluginDatabaseManager,
        catalogClient: CatalogClient,
        scheduler: PluginTaskScheduler,
        auth: AuthService,
    },
) {
    const { logger, config, database, catalogClient, scheduler, auth } = env;

    const chatbotEnabled = config.getOptionalBoolean('chatbot.enabled');  
    if (!chatbotEnabled) {
        logger.warn(`Chatbot is not enabled. Hence, not creating scheduler for uploading files to chatbot for training`);
        return;
    }

    // Get the configurations required for the scheduler
    const refreshIntervalConfig = config.getOptionalConfig('chatbot.scheduler.refreshInterval');
    const initialDelayConfig = config.getOptionalConfig('chatbot.scheduler.initialDelay');
    const timeoutConfig = config.getOptionalConfig('chatbot.scheduler.timeout');

    const hours = refreshIntervalConfig && refreshIntervalConfig.has('hours') ? refreshIntervalConfig.getNumber('hours') : 1;
    const minutes = refreshIntervalConfig && refreshIntervalConfig.has('minutes') ? refreshIntervalConfig.getNumber('minutes') : 0;
    const seconds = refreshIntervalConfig && refreshIntervalConfig.has('seconds') ? refreshIntervalConfig.getNumber('seconds') : 0;
    
    const timeoutHours = timeoutConfig && timeoutConfig.has('hours') ? timeoutConfig.getNumber('hours') : 0;
    const timeoutMinutes = timeoutConfig && timeoutConfig.has('minutes') ? timeoutConfig.getNumber('minutes') : 30;
    const timeoutSeconds = timeoutConfig && timeoutConfig.has('seconds') ? timeoutConfig.getNumber('seconds') : 0;

    const initialDelayHours = initialDelayConfig && initialDelayConfig.has('hours') ? initialDelayConfig.getNumber('hours') : 0;
    const initialDelayMinutes = initialDelayConfig && initialDelayConfig.has('minutes') ? initialDelayConfig.getNumber('minutes') : 1;
    const initialDelaySeconds = initialDelayConfig && initialDelayConfig.has('seconds') ? initialDelayConfig.getNumber('seconds') : 0;

    // Create a scheduled task runner with the given configuration
    const schedule = scheduler.createScheduledTaskRunner({
        frequency: { hours, minutes, seconds },
        timeout: { hours: timeoutHours, minutes: timeoutMinutes, seconds: timeoutSeconds },
        initialDelay: { hours: initialDelayHours, minutes: initialDelayMinutes, seconds: initialDelaySeconds },
        scope: 'global',
    });

    // Run the task
    schedule.run({
        id: 'upload-files-to-chatbot-for-training',
        fn: async () => {
          try {
            // Function to be executed
            await checkAndUploadToChatbotIfNecessary(logger, database, catalogClient, config, auth);
          } catch (error) {
            logger.error(`Error in uploading files to chatbot for training - ${error}`);
          }
        },
        signal: undefined, // Pass a signal to cancel the task, if needed
    });

    logger.info('Scheduler for uploading files to chatbot for training is created');
}

// Method to check and upload to chatbot if necessary for all the catalog items
async function checkAndUploadToChatbotIfNecessary(logger: LoggerService, database: PluginDatabaseManager, catalogClient: CatalogClient, config: Config, auth: AuthService) {
    // Initialize the necessary services and helpers
    const catalogHelperSvc = new CatalogServiceHelper(logger);
    const db: Knex = await database.getClient();
    const chatbotAccessToken:string = config.getOptionalString('chatbot.accessToken') || '';
    const chatbotSvc = new chatbotService(db, logger, chatbotAccessToken);
    const { token } = await auth.getPluginRequestToken({
        onBehalfOf: await auth.getOwnServiceCredentials(),
        targetPluginId: 'catalog',
    });

    // Initialize the necessary configurations
    const chatbotUrl = config.getOptionalString('chatbot.url') || '';
    const integrations = ScmIntegrations.fromConfig(config);
    const githubToken = integrations.github.byHost('github.com')?.config?.token as string;

    // Fetch the appids from catalog items
    logger.debug('Fetching all the appid from catalog items');
    const appids = await catalogHelperSvc.getEntitiesAppId(catalogClient, token);
    logger.debug(`Fetched all the appid from catalog items - ${appids}`);

    // Check and upload to chatbot if necessary for all the catalog items
    logger.info('Checking and uploading to chatbot if necessary for all the catalog items');
    for (const appid of appids) {
        try {
            const status = await chatbotSvc.getChatbotStatusAndUpdateIfNecessary(chatbotUrl, appid, catalogClient, githubToken, token);
            logger.debug(`Status of the upload to chatbot, for appid ${appid} is "${status}"`);
        } catch(error) {
            logger.error(`Error in getting status of the upload for appid ${appid} from chatbot - ${error}`);
        }
    }
}
