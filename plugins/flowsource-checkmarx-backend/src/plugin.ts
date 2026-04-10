import {
    coreServices,
    createBackendPlugin,
  } from '@backstage/backend-plugin-api';
  import { createRouter } from './service/router';
  
  /**
   * flowsourceCheckmarxBackendPlugin backend plugin
   *
   * @public
   */
  export const flowsourceCheckmarxBackendPlugin = createBackendPlugin({
    pluginId: 'flowsource-checkmarx',
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
  