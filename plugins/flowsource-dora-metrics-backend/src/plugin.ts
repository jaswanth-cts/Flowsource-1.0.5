import {
    coreServices,
    createBackendPlugin,
  } from '@backstage/backend-plugin-api';
import { createRouter } from './service/router';

export const flowsourceDoraMetricsBackendPlugin = createBackendPlugin({
  pluginId: 'flowsource-dora-metrics',
  register(env) {
    env.registerInit({
      deps: {
          httpRouter: coreServices.httpRouter,
          logger: coreServices.logger,
          config: coreServices.rootConfig,
      },
      async init({ httpRouter, config, logger }) {
          httpRouter.use(
              await createRouter({
                  logger,
                  config,
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