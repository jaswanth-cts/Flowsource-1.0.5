import {
  createPlugin,
  createRoutableExtension,
} from '@backstage/core-plugin-api';

import { rootRouteRef } from './routes';

export const flowsourceFeatureflagPlugin = createPlugin({
  id: 'flowsource-featureflag',
  routes: {
    root: rootRouteRef,
  },
});

export const FlowsourceFeatureflagPage = flowsourceFeatureflagPlugin.provide(
  createRoutableExtension({
    name: 'FlowsourceFeatureflagPage',
    component: () =>
      import('./components/FeatureFlagComponent').then(m => m.FeatureFlagComponent),
    mountPoint: rootRouteRef,
  }),
);
