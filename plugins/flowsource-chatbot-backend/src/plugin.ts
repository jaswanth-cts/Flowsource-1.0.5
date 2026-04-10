import {
    coreServices,
    createBackendPlugin,
  } from '@backstage/backend-plugin-api';
import { createRouter } from './service/router';
import { initDatabase } from './service/database/initDatabase.service';
import { CatalogClient } from '@backstage/catalog-client';
import { createScheduler } from './service/scheduler';

export const flowsourceChatbotBackendPlugin = createBackendPlugin({
  pluginId: 'chatbot',
  register(env) {
    env.registerInit({
      deps: {
        httpRouter: coreServices.httpRouter,
        logger: coreServices.logger,
        config: coreServices.rootConfig,
        database: coreServices.database,
        discovery: coreServices.discovery,
        scheduler: coreServices.scheduler,
        auth: coreServices.auth,
      },

      async init({ httpRouter, config, logger, database, discovery, scheduler, auth }) {

        // Initialize/create the database
        await initDatabase({
            logger,
            database,
        });

        const catalogClient = new CatalogClient({discoveryApi: discovery,});

        // Create the scheduler
        createScheduler({
            logger,
            config,
            database,
            catalogClient,
            scheduler,
            auth,
        });

        // Create the router
        httpRouter.use(
            await createRouter({
                logger,
                config,
                database,
                catalogClient,
                auth,
            }),
        );

        // Add an auth policy
        httpRouter.addAuthPolicy({
            path: '/health',
            allow: 'unauthenticated',
        });
      },
    });
  },
});