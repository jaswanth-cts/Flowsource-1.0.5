import {
  createPlugin,
  createRoutableExtension,
} from '@backstage/core-plugin-api';

import { rootRouteRef } from './routes';

export const flowsourceDashboardPlugin = createPlugin({
  id: 'flowsource-dashboard',
  routes: {
    root: rootRouteRef,
  },
});

export const FlowsourceDashboardPage = flowsourceDashboardPlugin.provide(
  createRoutableExtension({
    name: 'FlowsourceDashboardPage',
    component: () =>
      import('./components/dashboardComponent').then(m => m.DashboardComponent),
    mountPoint: rootRouteRef,
  }),
);
