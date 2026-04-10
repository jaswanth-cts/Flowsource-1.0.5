import React from 'react';
import { createDevApp } from '@backstage/dev-utils';
import { flowsourceAzureDevopsWorkitemsPlugin, FlowsourceAzureDevopsWorkitemsPage } from '../src/plugin';

createDevApp()
  .registerPlugin(flowsourceAzureDevopsWorkitemsPlugin)
  .addPage({
    element: <FlowsourceAzureDevopsWorkitemsPage />,
    title: 'Root Page',
    path: '/flowsource-azure-devops-workitems'
  })
  .render();
