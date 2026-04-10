import React from 'react';
import { createDevApp } from '@backstage/dev-utils';
import { flowsourceWellArchitectedPlugin, FlowsourceWellArchitectedPage } from '../src/plugin';

createDevApp()
  .registerPlugin(flowsourceWellArchitectedPlugin)
  .addPage({
    element: <FlowsourceWellArchitectedPage />,
    title: 'Root Page',
    path: '/flowsource-well-architected'
  })
  .render();
