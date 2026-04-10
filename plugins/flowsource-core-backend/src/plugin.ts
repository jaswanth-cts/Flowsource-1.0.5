import {
    coreServices,
    createBackendPlugin,
  } from '@backstage/backend-plugin-api';
import { createRouter } from './service/router';
import { DatabaseManager } from '@backstage/backend-common';
import { initDatabase } from './service/database/initDatabase.service';

export const flowsourceCoreBackendPlugin = createBackendPlugin({
    pluginId: 'flowsource-core',
    register(env) {
        env.registerInit({
            deps: {
                httpRouter: coreServices.httpRouter,
                logger: coreServices.logger,
                config: coreServices.rootConfig,
                httpAuth: coreServices.httpAuth,
                userInfo: coreServices.userInfo,
            },
            async init({ httpRouter, logger,config, httpAuth, userInfo}) { 
                // Initialize the auth plugin database
                const database = DatabaseManager.fromConfig(config).forPlugin('auth');
                logger.info('Database retrieved');
                // Initialize/create the database
                await initDatabase({
                    logger: logger,
                    database: database,
                });
                logger.info('Database setup completed');  
               httpRouter.use(
                    await createRouter({
                        logger, database, httpAuth, userInfo
                    }),
                );
                httpRouter.addAuthPolicy({
                    path: '/health',
                    allow: 'unauthenticated',
                });
            },
        });
    },
});
