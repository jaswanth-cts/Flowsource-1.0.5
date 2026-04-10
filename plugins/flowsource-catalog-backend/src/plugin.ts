import {
  coreServices,
  createBackendPlugin,
} from '@backstage/backend-plugin-api';
import { CatalogClient } from '@backstage/catalog-client';

import { createScheduler } from './service/scheduler';

/**
 * flowsourceCatalogBackendPlugin backend plugin
 *
 * @public
 */
export const flowsourceCatalogBackendPlugin = createBackendPlugin({
  pluginId: 'flowsource-catalog-scheduler',
  register(env) {
    env.registerInit({
      deps: {
        logger: coreServices.logger,
        config: coreServices.rootConfig,
        discovery: coreServices.discovery,
        scheduler: coreServices.scheduler,
        auth: coreServices.auth,
      },

      async init({
        logger,
        config,
        discovery,
        scheduler,
        auth,
      }) {
        const catalogClient = new CatalogClient({ discoveryApi: discovery, });
        await createScheduler({
          logger,
          config,
          catalogClient: catalogClient,
          scheduler,
          auth,
        });

      },
    });
  },
});
