import {
  createPlugin,
  createRoutableExtension,
} from '@backstage/core-plugin-api';

import { rootRouteRef } from './routes';


export const flowsourceServiceNowPlugin = createPlugin({
  id: 'flowsource-service-now',
  routes: {
    root: rootRouteRef,
  },
});

export const FlowsourceServiceNowPage = flowsourceServiceNowPlugin.provide(
  createRoutableExtension({
    name: 'FlowsourceServiceNowPage',
    component: () =>
      import('./components/ServiceNowComponent').then(m => m.ServiceNowComponent),
    mountPoint: rootRouteRef,
  }),
);

export const EnvironmentServiceNowPage = flowsourceServiceNowPlugin.provide(
  createRoutableExtension({
    name: 'EnvironmentServiceNowPage',
    component: () =>
      import('./components/ServiceNowComponent').then(
        m => m.EnvironmentServiceNowComponent,
      ),
    mountPoint: rootRouteRef,
  }),
);
