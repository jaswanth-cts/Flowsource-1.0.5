import { createPlugin, createRoutableExtension } from '@backstage/core-plugin-api';

import { rootRouteRef } from './routes';

export const flowsourceDoraMetricsPlugin = createPlugin({
  id: 'flowsource-dora-metrics',
  routes: {
    root: rootRouteRef,
  },
});

export const FlowsourceDoraMetricsPage = flowsourceDoraMetricsPlugin.provide(
  createRoutableExtension({
    name: 'FlowsourceDoraMetricsPage',
    component: () =>
      import('./components/DoraMetricsComponent').then(m => m.DoraMetricsComponent),
    mountPoint: rootRouteRef,
  }),
);
