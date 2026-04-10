import {
  createPlugin,
  createRoutableExtension,
} from '@backstage/core-plugin-api';

import { rootRouteRef } from './routes';

export const flowsourceCicdGcpPlugin = createPlugin({
  id: 'flowsource-cicd-gcp',
  routes: {
    root: rootRouteRef,
  },
});

export const FlowsourceCicdGcpPage = flowsourceCicdGcpPlugin.provide(
  createRoutableExtension({
    name: 'FlowsourceCicdGcpPage',
    component: () =>
      import('./components/CicdCustomPageComponent').then(m => m.CicdCustomPageComponent),
    mountPoint: rootRouteRef,
  }),
);
