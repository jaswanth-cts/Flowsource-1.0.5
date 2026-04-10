import {
  createPlugin,
  createRoutableExtension,
} from '@backstage/core-plugin-api';

import { rootRouteRef } from './routes';

export const flowsourceZephyrPlugin = createPlugin({
  id: 'flowsource-zephyr',
  routes: {
    root: rootRouteRef,
  },
});

export const FlowsourceZephyrPage = flowsourceZephyrPlugin.provide(
  createRoutableExtension({
    name: 'FlowsourceZephyrPage',
    component: () =>
      import('./components/ZephyrComponent').then(m => m.ZephyrComponent),
    mountPoint: rootRouteRef,
  }),
);
