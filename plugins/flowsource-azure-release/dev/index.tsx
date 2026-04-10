import React from 'react';
import { createDevApp } from '@backstage/dev-utils';
import { flowsourceAzureReleasePlugin, FlowsourceAzureReleasePage } from '../src/plugin';

createDevApp()
  .registerPlugin(flowsourceAzureReleasePlugin)
  .addPage({
    element: <FlowsourceAzureReleasePage />,
    title: 'Root Page',
    path: '/flowsource-azure-release',
  })
  .render();
