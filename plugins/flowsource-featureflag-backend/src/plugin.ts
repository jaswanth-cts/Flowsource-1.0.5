import {
  coreServices,
  createBackendPlugin,
} from '@backstage/backend-plugin-api';
import { createRouter } from './router';

/**
 * flowsourceFeatureflagPlugin backend plugin
 *
 * @public
 */
export const flowsourceFeatureflagPlugin = createBackendPlugin({
  pluginId: 'flowsource-featureflag',
  register(env) {
    env.registerInit({
      deps: {
        httpRouter: coreServices.httpRouter,
        logger: coreServices.logger,
        config: coreServices.rootConfig,
      },
      async init({ httpRouter, logger, config }) {
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
