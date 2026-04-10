import {
  createPlugin,
  createRoutableExtension,
} from '@backstage/core-plugin-api';

import { rootRouteRef } from './routes';

export const flowsourceAzureReleasePlugin = createPlugin({
  id: 'flowsource-azure-release',
  routes: {
    root: rootRouteRef,
  },
});

export const FlowsourceAzureReleasePage = flowsourceAzureReleasePlugin.provide(
  createRoutableExtension({
    name: 'FlowsourceAzureReleasePage',
    component: () =>
      import('./components/AzureReleaseComponent').then(m => m.CicdReleaseComponent),
    mountPoint: rootRouteRef,
  }),
);
