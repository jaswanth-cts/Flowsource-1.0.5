import { createPlugin, createRoutableExtension,createRouteRef } from '@backstage/core-plugin-api';

import { rootRouteRef } from './routes';

export const flowsourceCorePlugin = createPlugin({
  id: 'flowsource-core',
  routes: {
    root: rootRouteRef,
  },
});

export const FlowsourceCorePage = flowsourceCorePlugin.provide(
  createRoutableExtension({
    name: 'FlowsourceCorePage',
    component: () =>
      import('./components/downloadComponent').then(m => m.downloadComponent),
    mountPoint: rootRouteRef,
  }),
);


export const settingsRouteRef = createRouteRef({
  id: 'auth-settings',
});

export const FlowsourceCoreAuthSettingsPage = flowsourceCorePlugin.provide(
  createRoutableExtension({
    name: 'FlowsourceCoreAuthSettingsPage',
    component: () =>
      import('./components/authSettings/AuthComponent').then(m => m.AuthComponent),
    mountPoint: settingsRouteRef,
  }),
);


