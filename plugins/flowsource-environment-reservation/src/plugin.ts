import {
  createPlugin,
  createRoutableExtension,
} from '@backstage/core-plugin-api';

import { rootRouteRef } from './routes';

export const environmentReservationPlugin = createPlugin({
  id: 'flowsource-environment-reservation',
  routes: {
    root: rootRouteRef,
  },
});

export const EnvironmentReservationPage = environmentReservationPlugin.provide(
  createRoutableExtension({
    name: 'EnvironmentReservationPage',
    component: () =>
      import('./components/EnvironmentReservationComponent').then(m => m.EnvironmentReservationComponent),
    mountPoint: rootRouteRef,
  }),
);
