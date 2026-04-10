import {
  createPlugin,
  createRoutableExtension,
} from '@backstage/core-plugin-api';

import { rootRouteRef } from './routes';

export const flowsourceTestingPlugin = createPlugin({
  id: 'flowsource-testing',
  routes: {
    root: rootRouteRef,
  },
});

export const FlowsourceTestingPage = flowsourceTestingPlugin.provide(
  createRoutableExtension({
    name: 'FlowsourceTestingPage',
    component: () =>
      import('./components/TestingComponent').then(m => m.TestingComponent),
    mountPoint: rootRouteRef,
  }),
);
