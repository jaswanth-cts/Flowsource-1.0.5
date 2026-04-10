import React from 'react';
import { createDevApp } from '@backstage/dev-utils';
import { flowsourceAwsFaultInjectionPlugin, FlowsourceAwsFaultInjectionPage } from '../src/plugin';

createDevApp()
  .registerPlugin(flowsourceAwsFaultInjectionPlugin)
  .addPage({
    element: <FlowsourceAwsFaultInjectionPage />,
    title: 'Root Page',
    path: '/flowsource-aws-fault-injection'
  })
  .render();
