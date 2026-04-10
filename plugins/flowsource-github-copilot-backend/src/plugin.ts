import {
    coreServices,
    createBackendPlugin,
  } from '@backstage/backend-plugin-api';
  import { createRouter } from './service/router';
  
  /**
   * flowsourceGithubCopilotBackendPlugin backend plugin
   *
   * @public
   */
  export const flowsourceGithubCopilotBackendPlugin = createBackendPlugin({
    pluginId: 'flowsource-github-copilot',
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
  