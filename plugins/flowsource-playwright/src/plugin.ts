import {
  createPlugin,
  createRoutableExtension,
} from '@backstage/core-plugin-api';

import { rootRouteRef } from './routes';

export const flowsourcePlaywrightPlugin = createPlugin({
  id: 'flowsource-playwright',
  routes: {
    root: rootRouteRef,
  },
});

export const FlowsourcePlaywrightPage = flowsourcePlaywrightPlugin.provide(
  createRoutableExtension({
    name: 'FlowsourcePlaywrightPage',
    component: () =>
      import('./components/PlaywrightComponent').then(m => m.PlaywrightComponent),
    mountPoint: rootRouteRef,
  }),
);
