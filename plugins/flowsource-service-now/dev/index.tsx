import React from 'react';
import { createDevApp } from '@backstage/dev-utils';
import { flowsourceServiceNowPlugin, FlowsourceServiceNowPage } from '../src/plugin';

createDevApp()
  .registerPlugin(flowsourceServiceNowPlugin)
  .addPage({
    element: <FlowsourceServiceNowPage />,
    title: 'Root Page',
    path: '/flowsource-service-now',
  })
  .render();
