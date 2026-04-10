import React from 'react';
import { createDevApp } from '@backstage/dev-utils';
import { flowsourceZephyrPlugin, FlowsourceZephyrPage } from '../src/plugin';

createDevApp()
  .registerPlugin(flowsourceZephyrPlugin)
  .addPage({
    element: <FlowsourceZephyrPage />,
    title: 'Root Page',
    path: '/flowsource-zephyr',
  })
  .render();
