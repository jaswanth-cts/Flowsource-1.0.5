import React from 'react';
import { createDevApp } from '@backstage/dev-utils';
import { flowsourceDashboardPlugin, FlowsourceDashboardPage } from '../src/plugin';

createDevApp()
  .registerPlugin(flowsourceDashboardPlugin)
  .addPage({
    element: <FlowsourceDashboardPage />,
    title: 'Root Page',
    path: '/flowsource-dashboard',
  })
  .render();
