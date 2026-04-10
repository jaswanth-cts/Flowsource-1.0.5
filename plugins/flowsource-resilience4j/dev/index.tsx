import React from 'react';
import { createDevApp } from '@backstage/dev-utils';
import { flowsourceResilience4JPlugin, FlowsourceResilience4JPage } from '../src/plugin';

createDevApp()
  .registerPlugin(flowsourceResilience4JPlugin)
  .addPage({
    element: <FlowsourceResilience4JPage />,
    title: 'Root Page',
    path: '/flowsource-resilience4j'
  })
  .render();
