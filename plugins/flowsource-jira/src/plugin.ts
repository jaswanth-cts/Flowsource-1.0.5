import { createPlugin, createRoutableExtension } from '@backstage/core-plugin-api';

import { rootRouteRef } from './routes';

export const flowsourceJiraPlugin = createPlugin({
  id: 'flowsource-jira',
  routes: {
    root: rootRouteRef,
  },
});

export const FlowsourceJiraPage = flowsourceJiraPlugin.provide(
  createRoutableExtension({
    name: 'FlowsourceJiraPage',
    component: () =>
      import('./components/JiraComponent').then(m => m.JiraComponent),
    mountPoint: rootRouteRef,
  }),
);
