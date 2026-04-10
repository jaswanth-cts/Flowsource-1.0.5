import {
  coreServices,
  createBackendModule,
} from '@backstage/backend-plugin-api';
import { catalogProcessingExtensionPoint } from '@backstage/plugin-catalog-node/alpha';
import { EnvironmentEntitiesProcessor } from './processor/EnvironmentEntitiesProcessor';

export const catalogModuleEnvironmentEntitiesProcessor = createBackendModule({
  pluginId: 'catalog',
  moduleId: 'environment',
  register(env) {
    env.registerInit({
      deps: {
        catalog: catalogProcessingExtensionPoint,
        logger: coreServices.logger
      },
      async init({ catalog, logger }) {
        logger.info('Registering custom EnvironmentEntitiesProcessor for catalog module');
        catalog.addProcessor(new EnvironmentEntitiesProcessor());
      },
    });
  },
});

export default catalogModuleEnvironmentEntitiesProcessor;