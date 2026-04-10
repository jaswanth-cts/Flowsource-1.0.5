import {
  createPlugin,
  createRoutableExtension,
} from '@backstage/core-plugin-api';

import { rootRouteRef } from './routes';

export const flowsourceSeleniumPlugin = createPlugin({
  id: 'flowsource-selenium',
  routes: {
    root: rootRouteRef,
  },
});

export const FlowsourceSeleniumPage = flowsourceSeleniumPlugin.provide(
  createRoutableExtension({
    name: 'FlowsourceSeleniumPage',
    component: () =>
      import('./components/SeleniumComponent').then(m => m.SeleniumComponent),
    mountPoint: rootRouteRef,
  }),
);
