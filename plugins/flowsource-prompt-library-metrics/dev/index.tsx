import React from 'react';
import { createDevApp } from '@backstage/dev-utils';
import { flowsourcePromptLibraryMetricsPlugin, FlowsourcePromptLibraryMetricsPage } from '../src/plugin';

createDevApp()
  .registerPlugin(flowsourcePromptLibraryMetricsPlugin)
  .addPage({
    element: <FlowsourcePromptLibraryMetricsPage />,
    title: 'Root Page',
    path: '/flowsource-prompt-library-metrics',
  })
  .render();
