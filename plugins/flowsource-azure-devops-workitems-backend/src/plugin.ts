import {
    coreServices,
    createBackendPlugin,
  } from '@backstage/backend-plugin-api';
  import { createRouter } from './service/router';
  
  /**
   * flowsourceAzureDevopsWorkitemsBackendPlugin backend plugin
   *
   * @public
   */
  export const flowsourceAzureDevopsWorkitemsBackendPlugin = createBackendPlugin({
    pluginId: 'devopsworkitems',
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
  