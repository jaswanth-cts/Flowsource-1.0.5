import { createPlugin, createRoutableExtension } from '@backstage/core-plugin-api';

import { rootRouteRef } from './routes';

export const flowsourceDevopsGuruPlugin = createPlugin({
  id: 'flowsource-devops-guru',
  routes: {
    root: rootRouteRef,
  },
});

export const FlowsourceDevopsGuruPage = flowsourceDevopsGuruPlugin.provide(
  createRoutableExtension({
    name: 'FlowsourceDevopsGuruPage',
    component: () =>
      import('./components/DevOpsGuruComponent').then(m => m.DevOpsGuruComponent),
    mountPoint: rootRouteRef,
  }),
);
