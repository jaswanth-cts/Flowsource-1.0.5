import { createPlugin, createRoutableExtension } from '@backstage/core-plugin-api';

import { rootRouteRef } from './routes';

export const flowsourceCicdBitbucketPlugin = createPlugin({
  id: 'flowsource-cicd-bitbucket',
  routes: {
    root: rootRouteRef,
  },
});

export const FlowsourceCicdBitbucketPage = flowsourceCicdBitbucketPlugin.provide(
  createRoutableExtension({
    name: 'FlowsourceCicdBitbucketPage',
    component: () =>
      import('./components/BibucketCicdComponent').then(m => m.BitbucketCicdComponent),
    mountPoint: rootRouteRef,
  }),
);
