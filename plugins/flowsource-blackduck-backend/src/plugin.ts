import {
  coreServices,
  createBackendPlugin,
} from '@backstage/backend-plugin-api';
import { createRouter } from './router';

/**
 * flowsourceBlackduckPlugin backend plugin
 *
 * @public
 */
export const flowsourceBlackduckPlugin = createBackendPlugin({
  pluginId: 'flowsource-blackduck',
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
