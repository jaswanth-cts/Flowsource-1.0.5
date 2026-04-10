import { createPlugin, createRoutableExtension } from '@backstage/core-plugin-api';

import { rootRouteRef } from './routes';

export const flowsourceResilience4JPlugin = createPlugin({
  id: 'flowsource-resilience4j',
  routes: {
    root: rootRouteRef,
  },
});

export const FlowsourceResilience4JPage = flowsourceResilience4JPlugin.provide(
  createRoutableExtension({
    name: 'FlowsourceResilience4JPage',
    component: () =>
      import('./components/Resilience4jComponent').then(m => m.Resilience4jComponent),
    mountPoint: rootRouteRef,
  }),
);
