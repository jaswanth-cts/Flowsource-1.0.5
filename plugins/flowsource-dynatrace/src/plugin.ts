import {
  createPlugin,
  createRoutableExtension,
} from '@backstage/core-plugin-api';

import { rootRouteRef } from './routes';

export const flowsourceDynatracePlugin = createPlugin({
  id: 'flowsource-dynatrace',
  routes: {
    root: rootRouteRef,
  },
});

export const FlowsourceDynatracePage = flowsourceDynatracePlugin.provide(
  createRoutableExtension({
    name: 'FlowsourceDynatracePage',
    component: () =>
      import('./components/Dynatrace').then(m => m.DynatraceComponents),
    mountPoint: rootRouteRef,
  }),
);
