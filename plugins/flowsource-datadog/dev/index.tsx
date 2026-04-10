import React from 'react';
import { createDevApp } from '@backstage/dev-utils';
import { flowsourceDatadogPlugin, FlowsourceDatadogPage } from '../src/plugin';

createDevApp()
  .registerPlugin(flowsourceDatadogPlugin)
  .addPage({
    element: <FlowsourceDatadogPage />,
    title: 'Root Page',
    path: '/flowsource-datadog'
  })
  .render();
