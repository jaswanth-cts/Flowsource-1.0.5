import {
  createPlugin,
  createRoutableExtension,
} from '@backstage/core-plugin-api';

import { rootRouteRef } from './routes';

export const flowsourceVeracodePlugin = createPlugin({
  id: 'flowsource-veracode',
  routes: {
    root: rootRouteRef,
  },
});

export const FlowsourceVeracodePage = flowsourceVeracodePlugin.provide(
  createRoutableExtension({
    name: 'FlowsourceVeracodePage',
    component: () =>
      import('./components/VeracodeComponent').then(m => m.VeracodeComponent),
    mountPoint: rootRouteRef,
  }),
);
