import { createAwsCodeCommitPublishAction } from '@aws/aws-core-plugin-for-backstage-scaffolder-actions';
import { DefaultAwsCredentialsManager } from '@backstage/integration-aws-node';
import { scaffolderActionsExtensionPoint } from '@backstage/plugin-scaffolder-node';
import { createBackendModule, coreServices } from '@backstage/backend-plugin-api';
import { createAzurePipelineAction } from '@flowsource/plugin-scaffolder-backend-module-azure-pipeline-trigger';
import { triggerAwsCodePipelineAction } from '@flowsource/backstage-plugin-scaffolder-backend-module-aws-pipeline-trigger'
export const scaffolderModuleCustomExtensions = createBackendModule({
  pluginId: 'scaffolder', // name of the plugin that the module is targeting
  moduleId: 'custom-extensions',
  register(env) {
    env.registerInit({
      deps: {
        scaffolder: scaffolderActionsExtensionPoint,
        config: coreServices.rootConfig,
        logger: coreServices.logger,
      },
      async init({ scaffolder, config, logger }) {
        // Here you have the opportunity to interact with the extension
        // point before the plugin itself gets instantiated
        const credsManager = DefaultAwsCredentialsManager.fromConfig(config);
        const awsCodeCommitAction: any = createAwsCodeCommitPublishAction({ credsManager });
        scaffolder.addActions(awsCodeCommitAction);
        const azurePipelineAction: any = createAzurePipelineAction({ config, logger });
        scaffolder.addActions(azurePipelineAction);
        const awsCodePipelineAction: any = triggerAwsCodePipelineAction({ config, logger });
        scaffolder.addActions(awsCodePipelineAction);
      },
    });
  },
});
