import { createPlugin, createRoutableExtension } from '@backstage/core-plugin-api';

import { rootRouteRef } from './routes';

export const flowsourceCheckmarxPlugin = createPlugin({
  id: 'flowsource-checkmarx',
  routes: {
    root: rootRouteRef,
  },
});

export const FlowsourceCheckmarxPage = flowsourceCheckmarxPlugin.provide(
  createRoutableExtension({
    name: 'FlowsourceCheckmarxPage',
    component: () =>
      import('./components/CheckmarxComponent').then(m => m.CheckmarxComponent),
    mountPoint: rootRouteRef,
  }),
);
