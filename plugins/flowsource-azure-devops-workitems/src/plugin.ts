import { createPlugin, createRoutableExtension } from '@backstage/core-plugin-api';

import { rootRouteRef } from './routes';

export const flowsourceAzureDevopsWorkitemsPlugin = createPlugin({
  id: 'flowsource-azure-devops-workitems',
  routes: {
    root: rootRouteRef,
  },
});

export const FlowsourceAzureDevopsWorkitemsPage = flowsourceAzureDevopsWorkitemsPlugin.provide(
  createRoutableExtension({
    name: 'FlowsourceAzureDevopsWorkitemsPage',
    component: () =>
      import('./components/AzureDevopsWorkitemComponent/AzureDevopsWorkitemComponent').then(m => m.AzureDevopsWorkitemComponent),
    mountPoint: rootRouteRef,
  }),
);
