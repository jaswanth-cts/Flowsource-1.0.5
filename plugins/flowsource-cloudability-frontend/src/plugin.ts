import {
  createPlugin,
  createRoutableExtension,
} from '@backstage/core-plugin-api';

import { rootRouteRef } from './routes';

export const flowsourceCloudabilityFrontendPlugin = createPlugin({
  id: 'flowsource-cloudability-frontend',
  routes: {
    root: rootRouteRef,
  },
});

export const FlowsourceCloudabilityFrontendPage = flowsourceCloudabilityFrontendPlugin.provide(
  createRoutableExtension({
    name: 'FlowsourceCloudabilityFrontendPage',
    component: () =>
      import('./components/CloudabilityComponent').then(m => m.CloudabilityComponent),
    mountPoint: rootRouteRef,
  }),
);
