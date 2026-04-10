import { createPlugin, createRoutableExtension } from '@backstage/core-plugin-api';

import { rootRouteRef } from './routes';

export const flowsourceCodeQualityPlugin = createPlugin({
  id: 'flowsource-code-quality',
  routes: {
    root: rootRouteRef,
  },
});

export const FlowsourceCodeQualityPage = flowsourceCodeQualityPlugin.provide(
  createRoutableExtension({
    name: 'FlowsourceCodeQualityPage',
    component: () =>
      import('./components/CodeQualityComponent').then(m => m.CodeQualityComponent),
    mountPoint: rootRouteRef,
  }),
);
