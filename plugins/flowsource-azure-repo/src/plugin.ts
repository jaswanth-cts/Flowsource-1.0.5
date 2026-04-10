import { createPlugin, createRoutableExtension } from '@backstage/core-plugin-api';

import { rootRouteRef } from './routes';

export const flowsourceAzureRepoPlugin = createPlugin({
  id: 'flowsource-azure-repo',
  routes: {
    root: rootRouteRef,
  },
});

export const FlowsourceAzureRepoPage = flowsourceAzureRepoPlugin.provide(
  createRoutableExtension({
    name: 'FlowsourceAzureRepoPage',
    component: () =>
      import('./components/AzureRepoComponent').then(m => m.AzureRepoComponent),
    mountPoint: rootRouteRef,
  }),
);
