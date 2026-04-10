import { createPlugin, createRoutableExtension } from '@backstage/core-plugin-api';

import { rootRouteRef, cardSubRouterRef } from './routes';

export const flowsourceInfraProvisionPlugin = createPlugin({
  id: 'flowsource-infra-provision',
  routes: {
    root: rootRouteRef,
    cards: cardSubRouterRef,
  },
});

export const FlowsourceInfraProvisionPage = flowsourceInfraProvisionPlugin.provide(
  createRoutableExtension({
    name: 'FlowsourceInfraProvisionPage',
    component: () =>
      import('./components/InfraProvisionComponent').then(m => m.InfraProvisionComponent),
      mountPoint: rootRouteRef,
  }),
);


