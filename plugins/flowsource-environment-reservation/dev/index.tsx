import React from 'react';
import { createDevApp } from '@backstage/dev-utils';
import { environmentReservationPlugin, EnvironmentReservationPage } from '../src/plugin';

createDevApp()
  .registerPlugin(environmentReservationPlugin)
  .addPage({
    element: <EnvironmentReservationPage />,
    title: 'Root Page',
    path: '/maintenance-requests',
  })
  .render();
