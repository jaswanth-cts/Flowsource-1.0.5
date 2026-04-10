import {
  createPlugin,
  createRoutableExtension,
} from '@backstage/core-plugin-api';

import { rootRouteRef } from './routes';

export const flowsourceCicdAwsPlugin = createPlugin({
  id: 'flowsource-cicd-aws',
  routes: {
    root: rootRouteRef,
  },
});

export const FlowsourceCicdAwsPage = flowsourceCicdAwsPlugin.provide(
  createRoutableExtension({
    name: 'FlowsourceCicdAwsPage',
    component: () =>
      import('./components/CicdCustomPageComponent').then(m => m.CicdCustomPageComponent),
    mountPoint: rootRouteRef,
  }),
);
