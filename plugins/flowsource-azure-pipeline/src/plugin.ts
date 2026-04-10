import { createPlugin, createRoutableExtension } from '@backstage/core-plugin-api';

import { rootRouteRef } from './routes';

export const flowsourceAzurePipelinePlugin = createPlugin({
  id: 'flowsource-azure-pipeline',
  routes: {
    root: rootRouteRef,
  },
});

export const FlowsourceAzurePipelinePage = flowsourceAzurePipelinePlugin.provide(
  createRoutableExtension({
    name: 'FlowsourceAzurePipelinePage',
    component: () =>
      import('./components/CicdAzurePipelineComponent').then(m => m.CicdAzurePipelineComponent),
    mountPoint: rootRouteRef,
  }),
);
