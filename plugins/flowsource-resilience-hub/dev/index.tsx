import React from 'react';
import { createDevApp } from '@backstage/dev-utils';
import { flowsourceResilienceHubPlugin, FlowsourceResilienceHubPage } from '../src/plugin';

createDevApp()
  .registerPlugin(flowsourceResilienceHubPlugin)
  .addPage({
    element: <FlowsourceResilienceHubPage />,
    title: 'Root Page',
    path: '/flowsource-resilience-hub'
  })
  .render();
