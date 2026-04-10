import { createBackendModule , coreServices } from '@backstage/backend-plugin-api';
import { scaffolderActionsExtensionPoint } from '@backstage/plugin-scaffolder-node';

import { triggerGcpCiPipelineAction } from '../../actions';

/**
 * A backend module that registers the action into the scaffolder
 */
export const scaffolderGcpCiTriggerPipeline = createBackendModule({
  moduleId: 'gcp-ci-pipeline-trigger',
  pluginId: 'scaffolder',
  register({ registerInit }) {
    registerInit({
      deps: {
        scaffolderActions: scaffolderActionsExtensionPoint,
        logger: coreServices.logger,
        config: coreServices.rootConfig,
      },
      async init({ scaffolderActions, config, logger }) {
        scaffolderActions.addActions(
          triggerGcpCiPipelineAction({ config, logger }),
        );
      },
    });
  },
});
