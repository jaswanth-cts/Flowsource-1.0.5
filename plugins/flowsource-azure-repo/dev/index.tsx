import React from 'react';
import { createDevApp } from '@backstage/dev-utils';
import { flowsourceAzureRepoPlugin, FlowsourceAzureRepoPage } from '../src/plugin';

createDevApp()
  .registerPlugin(flowsourceAzureRepoPlugin)
  .addPage({
    element: <FlowsourceAzureRepoPage />,
    title: 'Root Page',
    path: '/flowsource-azure-repo'
  })
  .render();
