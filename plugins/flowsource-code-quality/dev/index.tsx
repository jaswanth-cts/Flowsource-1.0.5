import React from 'react';
import { createDevApp } from '@backstage/dev-utils';
import { flowsourceCodeQualityPlugin, FlowsourceCodeQualityPage } from '../src/plugin';

createDevApp()
  .registerPlugin(flowsourceCodeQualityPlugin)
  .addPage({
    element: <FlowsourceCodeQualityPage />,
    title: 'Root Page',
    path: '/flowsource-code-quality'
  })
  .render();
