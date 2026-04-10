import {
  createPlugin,
  createRoutableExtension,
} from '@backstage/core-plugin-api';

import { rootRouteRef } from './routes';
//import { M } from 'msw/lib/glossary-de6278a9';

export const flowsourceDatadogPlugin = createPlugin({
  id: 'flowsource-datadog',
  routes: {
    root: rootRouteRef,
  },
});

export const FlowsourceDatadogPage = flowsourceDatadogPlugin.provide(
  createRoutableExtension({
    name: 'FlowsourceDatadogPage',
    component: () =>
      import('./components/Datadog').then(m => m.DatadogComponents),
    mountPoint: rootRouteRef,
  }),
);
