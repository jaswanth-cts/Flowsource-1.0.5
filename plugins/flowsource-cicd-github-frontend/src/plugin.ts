import { createPlugin, createRoutableExtension } from '@backstage/core-plugin-api';

import { rootRouteRef } from './routes';

export const flowsourceCicdCustomFrontendPlugin = createPlugin({
  id: 'flowsource-cicd-custom-frontend',
  routes: {
    root: rootRouteRef,
  },
});

export const FlowsourceCicdCustomFrontendPage = flowsourceCicdCustomFrontendPlugin.provide(
  createRoutableExtension({
    name: 'FlowsourceCicdCustomFrontendPage',
    component: () =>
      import('./components/CicdCustomPageComponent').then(m => m.CicdCustomPageComponent),
    mountPoint: rootRouteRef,
  }),
);
