import React from 'react';
import { createDevApp } from '@backstage/dev-utils';
import { flowsourceDoraMetricsPlugin, FlowsourceDoraMetricsPage } from '../src/plugin';

createDevApp()
  .registerPlugin(flowsourceDoraMetricsPlugin)
  .addPage({
    element: <FlowsourceDoraMetricsPage />,
    title: 'Root Page',
    path: '/flowsource-dora-metrics'
  })
  .render();
