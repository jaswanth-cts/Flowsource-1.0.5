import React from 'react';
import { createDevApp } from '@backstage/dev-utils';
import { flowsourceAppdynamicsPlugin, FlowsourceAppdynamicsPage } from '../src/plugin';

createDevApp()
  .registerPlugin(flowsourceAppdynamicsPlugin)
  .addPage({
    element: <FlowsourceAppdynamicsPage />,
    title: 'Root Page',
    path: '/flowsource-appdynamics',
  })
  .render();
