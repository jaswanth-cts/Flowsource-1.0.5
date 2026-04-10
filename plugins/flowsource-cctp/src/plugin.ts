import {
  createPlugin,
  createRoutableExtension,
} from '@backstage/core-plugin-api';

import { rootRouteRef, testExecutionSubRouterRef } from './routes';

export const flowsourceCctpPlugin = createPlugin({
  id: 'flowsource-cctp',
  routes: {
    root: rootRouteRef,
    Editsuite: testExecutionSubRouterRef,
  },
});

export const FlowsourceCctpPage = flowsourceCctpPlugin.provide(
  createRoutableExtension({
    name: 'FlowsourceCctpPage',
    component: () =>
      import('./components/CCTPComponent').then(m => m.CCTPComponent),
    mountPoint: rootRouteRef,
  }),
);

export const FlowsourceCctpSettingsPage = flowsourceCctpPlugin.provide(
  createRoutableExtension({
    name: 'FlowsourceCctpSettingsPage',
    component: () =>
      import('./components/CCTPComponent').then(m => m.CCTPSettingsComponent),
    mountPoint: rootRouteRef,
  }),
);
