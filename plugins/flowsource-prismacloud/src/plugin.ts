import { createPlugin, createRoutableExtension } from '@backstage/core-plugin-api';

import { rootRouteRef } from './routes';

export const flowsourcePrismacloudPlugin = createPlugin({
  id: 'flowsource-prismacloud',
  routes: {
    root: rootRouteRef,
  },
});

export const FlowsourcePrismacloudPage = flowsourcePrismacloudPlugin.provide(
  createRoutableExtension({
    name: 'FlowsourcePrismacloudPage',
    component: () =>
      import('./components/PrismaCloudComponent').then(m => m.PrismaCloudComponent),
    mountPoint: rootRouteRef,
  }),
);
