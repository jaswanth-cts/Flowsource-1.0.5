import React from 'react';
import { createDevApp } from '@backstage/dev-utils';
import { flowsourceCloudabilityFrontendPlugin, FlowsourceCloudabilityFrontendPage } from '../src/plugin';

createDevApp()
  .registerPlugin(flowsourceCloudabilityFrontendPlugin)
  .addPage({
    element: <FlowsourceCloudabilityFrontendPage />,
    title: 'Root Page',
    path: '/flowsource-cloudability',
  })
  .render();
