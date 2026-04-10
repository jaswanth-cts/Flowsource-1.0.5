import { createPlugin, createRoutableExtension } from '@backstage/core-plugin-api';

import { rootRouteRef } from './routes';

export const flowsourceGithubPlugin = createPlugin({
  id: 'flowsource-github',
  routes: {
    root: rootRouteRef,
  },
});

export const FlowsourceGithubPage = flowsourceGithubPlugin.provide(
  createRoutableExtension({
    name: 'FlowsourceGithubPage',
    component: () =>
      import('./components/GitHubRepoComponent').then(m => m.GitHubRepoComponent),
    mountPoint: rootRouteRef,
  }),
);
