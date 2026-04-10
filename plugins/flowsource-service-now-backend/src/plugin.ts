import {
  coreServices,
  createBackendPlugin,
} from '@backstage/backend-plugin-api';
import { createRouter } from './service/router';

/**
 * flowsourceServiceNowPlugin backend plugin
 *
 * @public
 */
export const flowsourceServiceNowPlugin = createBackendPlugin({
  pluginId: 'flowsource-service-now',
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
