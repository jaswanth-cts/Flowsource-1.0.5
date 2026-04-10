import {
    coreServices,
    createBackendPlugin,
  } from '@backstage/backend-plugin-api';
  import { createRouter } from './service/router';
  
  /**
   * flowsourceMorpheusBackendPlugin backend plugin
   *
   * @public
   */
  export const flowsourceMorpheusBackendPlugin = createBackendPlugin({
    pluginId: 'flowsource-morpheus',
    register(env) {
      env.registerInit({
        deps: {
          httpRouter: coreServices.httpRouter,
          logger: coreServices.logger,
          config: coreServices.rootConfig,
          database: coreServices.database,
          httpAuth: coreServices.httpAuth,
          userInfo: coreServices.userInfo,
        },
        async init({
          httpRouter,
          logger,
          config,
          database,
          httpAuth,
          userInfo
        }) {
          httpRouter.use(
            await createRouter({
              logger,
              config,
              database,
              httpAuth,
              userInfo
            }),
          );
        },
      });
    },
  });
  