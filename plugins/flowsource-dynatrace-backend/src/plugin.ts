import {
  coreServices,
  createBackendPlugin,
} from '@backstage/backend-plugin-api';
import { createRouter } from './service/router';

/**
 * flowsourceDynatracePlugin backend plugin
 *
 * @public
 */
export const flowsourceDynatracePlugin = createBackendPlugin({
  pluginId: 'flowsource-dynatrace',
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
        // httpRouter.addAuthPolicy({
        //   path: '/health',
        //   allow: 'unauthenticated',
        // });
      },
    });
  },
});
