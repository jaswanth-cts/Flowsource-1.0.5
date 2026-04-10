import {
  createPlugin,
  createRoutableExtension,
} from '@backstage/core-plugin-api';

import { rootRouteRef } from './routes';

export const flowsourceAppdynamicsPlugin = createPlugin({
  id: 'flowsource-appdynamics',
  routes: {
    root: rootRouteRef,
  },
});

export const FlowsourceAppdynamicsPage = flowsourceAppdynamicsPlugin.provide(
  createRoutableExtension({
    name: 'FlowsourceAppdynamicsPage',
    component: () =>
      import('./components/AppDynamicsComponent').then(m => m.AppDynamicsComponent),
    mountPoint: rootRouteRef,
  }),
);
