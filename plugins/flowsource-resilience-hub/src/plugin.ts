import { createPlugin, createRoutableExtension } from '@backstage/core-plugin-api';

import { rootRouteRef } from './routes';

export const flowsourceResilienceHubPlugin = createPlugin({
  id: 'flowsource-resilience-hub',
  routes: {
    root: rootRouteRef,
  },
});

export const FlowsourceResilienceHubPage = flowsourceResilienceHubPlugin.provide(
  createRoutableExtension({
    name: 'FlowsourceResilienceHubPage',
    component: () =>
      import('./components/ResilienceHubComponent').then(m => m.ResilienceHubComponent),
    mountPoint: rootRouteRef,
  }),
);
