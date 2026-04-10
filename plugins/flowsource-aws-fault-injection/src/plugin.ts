import { createPlugin, createRoutableExtension } from '@backstage/core-plugin-api';

import { rootRouteRef } from './routes';

export const flowsourceAwsFaultInjectionPlugin = createPlugin({
  id: 'flowsource-aws-fault-injection',
  routes: {
    root: rootRouteRef,
  },
});

export const FlowsourceAwsFaultInjectionPage = flowsourceAwsFaultInjectionPlugin.provide(
  createRoutableExtension({
    name: 'FlowsourceAwsFaultInjectionPage',
    component: () =>
      import('./components/AwsFaultInjectionComponent').then(m => m.AwsFaultInjectionComponent),
    mountPoint: rootRouteRef,
  }),
);
