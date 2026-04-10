import {
  coreServices,
  createBackendPlugin,
} from '@backstage/backend-plugin-api';
import { createRouter } from './service/router';

/**
 * flowsourceAppdynamicsPlugin backend plugin
 *
 * @public
 */
export const flowsourceAppdynamicsPlugin = createBackendPlugin({
  pluginId: 'flowsource-appdynamics',
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
        httpRouter.addAuthPolicy({
          path: '/health',
          allow: 'unauthenticated',
        });
      },
    });
  },
});
