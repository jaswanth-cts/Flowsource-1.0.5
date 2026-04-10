import {
  coreServices,
  createBackendPlugin,
} from '@backstage/backend-plugin-api';
import { createRouter } from './router';
/**
 * flowsourceAzureReleasePlugin backend plugin
 *
 * @public
 */
export const flowsourceAzureReleasePlugin = createBackendPlugin({
  pluginId: 'flowsource-azure-release',
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
