import React from 'react';
import { createDevApp } from '@backstage/dev-utils';
import { flowsourceTestingPlugin, FlowsourceTestingPage } from '../src/plugin';

createDevApp()
  .registerPlugin(flowsourceTestingPlugin)
  .addPage({
    element: <FlowsourceTestingPage />,
    title: 'Root Page',
    path: '/flowsource-testing',
  })
  .render();
