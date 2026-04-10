import React from 'react';
import { createDevApp } from '@backstage/dev-utils';
import { flowsourceCheckmarxPlugin, FlowsourceCheckmarxPage } from '../src/plugin';

createDevApp()
  .registerPlugin(flowsourceCheckmarxPlugin)
  .addPage({
    element: <FlowsourceCheckmarxPage />,
    title: 'Root Page',
    path: '/flowsource-checkmarx'
  })
  .render();
