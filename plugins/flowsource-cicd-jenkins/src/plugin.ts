import { createPlugin, createRoutableExtension } from '@backstage/core-plugin-api';

import { rootRouteRef } from './routes';

export const flowsourceCicdJenkinsPlugin = createPlugin({
  id: 'flowsource-cicd-jenkins',
  routes: {
    root: rootRouteRef,
  },
});

export const FlowsourceCicdJenkinsPage = flowsourceCicdJenkinsPlugin.provide(
  createRoutableExtension({
    name: 'FlowsourceCicdJenkinsPage',
    component: () =>
      import('./components/CicdJenkinsCustomPageComponent').then(m => m.CicdJenkinsCustomPageComponent),
    mountPoint: rootRouteRef,
  }),
);
