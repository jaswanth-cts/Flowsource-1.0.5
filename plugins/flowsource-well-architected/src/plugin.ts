import { createPlugin, createRoutableExtension } from '@backstage/core-plugin-api';

import { rootRouteRef } from './routes';
import 'bootstrap/dist/css/bootstrap.css';

export const flowsourceWellArchitectedPlugin = createPlugin({
  id: 'flowsource-well-architected',
  routes: {
    root: rootRouteRef,
  },
});

export const FlowsourceWellArchitectedPage = flowsourceWellArchitectedPlugin.provide(
  createRoutableExtension({
    name: 'FlowsourceWellArchitectedPage',
    component: () =>
      import('./components/WellArchitectedComponent').then(m => m.WellArchitectedComponent),
    mountPoint: rootRouteRef,
  }),
);
