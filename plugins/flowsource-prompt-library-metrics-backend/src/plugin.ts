import { createBackendPlugin,coreServices } from '@backstage/backend-plugin-api';
import { createRouter } from './router';

export const flowsourcePromptLibraryMetricsPlugin = createBackendPlugin({
  pluginId: 'flowsource-prompt-library-metrics',
  register(env) {
        env.registerInit({
          deps: {
            httpRouter: coreServices.httpRouter,
            logger: coreServices.logger,
            config: coreServices.rootConfig,
          },
          async init({
            httpRouter,
            logger,
            config,
          }) {
            httpRouter.use(
              await createRouter({
                  logger,
                  config,
              }),
            );
          },
        });
      },
    });
    