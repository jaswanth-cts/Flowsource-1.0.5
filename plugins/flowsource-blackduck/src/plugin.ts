import {
  createPlugin,
  createRoutableExtension,
} from '@backstage/core-plugin-api';

import { rootRouteRef } from './routes';

export const flowsourceBlackduckPlugin = createPlugin({
  id: 'flowsource-blackduck',
  routes: {
    root: rootRouteRef,
  },
});

export const FlowsourceBlackduckPage = flowsourceBlackduckPlugin.provide(
  createRoutableExtension({
    name: 'FlowsourceBlackduckPage',
    component: () =>
      import('./components/Blackduck-Component').then(m => m.BlackduckComponent),
    mountPoint: rootRouteRef,
  }),
);
