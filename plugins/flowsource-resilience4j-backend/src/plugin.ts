import {
    coreServices,
    createBackendPlugin,
  } from '@backstage/backend-plugin-api';
  import { createRouter } from './service/router';
  
  /**
   * flowsourceResilience4jBackendPlugin backend plugin
   *
   * @public
   */
  export const flowsourceResilience4jBackendPlugin = createBackendPlugin({
    pluginId: 'flowsource-resilience4j',
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
  