import {
  coreServices,
  createBackendPlugin,
} from '@backstage/backend-plugin-api';
import { createRouter } from './router';
import { initDatabase } from './services/database/initDatabase.service';

/**
 * maintenanceRequestsPlugin backend plugin
 *
 * @public
 */
export const maintenanceRequestsPlugin = createBackendPlugin({
  pluginId: 'flowsource-environment-reservation',
  register(env) {
    env.registerInit({
      deps: {
        logger: coreServices.logger,
        auth: coreServices.auth,
        httpAuth: coreServices.httpAuth,
        httpRouter: coreServices.httpRouter,
        database: coreServices.database,
      },
      async init({ logger, httpRouter, database }) {

        // Initialize the database
        await initDatabase({ logger, database });

        httpRouter.use(
          await createRouter({
            logger,
            database,
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
