import React from 'react';
import { createDevApp } from '@backstage/dev-utils';
import { flowsourceAzurePipelinePlugin, FlowsourceAzurePipelinePage } from '../src/plugin';

createDevApp()
  .registerPlugin(flowsourceAzurePipelinePlugin)
  .addPage({
    element: <FlowsourceAzurePipelinePage />,
    title: 'Root Page',
    path: '/flowsource-azure-pipeline'
  })
  .render();
