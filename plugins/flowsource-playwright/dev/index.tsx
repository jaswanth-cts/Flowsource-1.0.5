import React from 'react';
import { createDevApp } from '@backstage/dev-utils';
import { flowsourcePlaywrightPlugin, FlowsourcePlaywrightPage } from '../src/plugin';

createDevApp()
  .registerPlugin(flowsourcePlaywrightPlugin)
  .addPage({
    element: <FlowsourcePlaywrightPage />,
    title: 'Root Page',
    path: '/flowsource-playwright',
  })
  .render();
