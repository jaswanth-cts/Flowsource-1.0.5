import { scaffolderActionsExtensionPoint } from '@backstage/plugin-scaffolder-node';
import { createBackendModule , coreServices } from '@backstage/backend-plugin-api';

import triggerAwsCodePipelineAction from './actions';

export const scaffoldertriggerCodepipeline = createBackendModule({
  pluginId: 'scaffolder',
  moduleId: 'my-module',
  register(reg) {
    reg.registerInit({
      deps: {
        scaffolder: scaffolderActionsExtensionPoint,
        logger: coreServices.logger,
        config: coreServices.rootConfig,
      },
      async init({ scaffolder, config, logger }) {
        scaffolder.addActions(
          triggerAwsCodePipelineAction({
            config,
            logger,
          }),
        );
      },
    });
  },
});
