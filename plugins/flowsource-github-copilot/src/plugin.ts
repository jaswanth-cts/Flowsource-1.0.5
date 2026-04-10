import { createPlugin, createRoutableExtension } from '@backstage/core-plugin-api';

import { rootRouteRef } from './routes';

export const flowsourceGithubCopilotPlugin = createPlugin({
  id: 'flowsource-github-copilot',
  routes: {
    root: rootRouteRef,
  },
});

export const FlowsourceGithubCopilotPage = flowsourceGithubCopilotPlugin.provide(
  createRoutableExtension({
    name: 'FlowsourceGithubCopilotPage',
    component: () =>
      import('./components/GithubCoPilotComponent/GithubCoPilotComponent').then(m => m.GithubCoPilotComponent),
    mountPoint: rootRouteRef,
  }),
);
