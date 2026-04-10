import React from 'react';
import { createDevApp } from '@backstage/dev-utils';
import { flowsourceBlackduckPlugin, FlowsourceBlackduckPage } from '../src/plugin';

createDevApp()
  .registerPlugin(flowsourceBlackduckPlugin)
  .addPage({
    element: <FlowsourceBlackduckPage />,
    title: 'Root Page',
    path: '/flowsource-blackduck',
  })
  .render();
