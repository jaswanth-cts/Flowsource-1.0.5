import { createPlugin, createRoutableExtension } from '@backstage/core-plugin-api';

import { rootRouteRef } from './routes';

export const flowsourceBitbucketPlugin = createPlugin({
  id: 'flowsource-bitbucket',
  routes: {
    root: rootRouteRef,
  },
});

export const FlowsourceBitbucketPage = flowsourceBitbucketPlugin.provide(
  createRoutableExtension({
    name: 'FlowsourceBitbucketPage',
    component: () =>
      import('./components/BitbucketData').then(m => m.BitbucketRepoComponent),
    mountPoint: rootRouteRef,
  }),
);
