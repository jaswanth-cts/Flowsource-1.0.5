import React from 'react';
import { createDevApp } from '@backstage/dev-utils';
import { flowsourceCorePlugin, FlowsourceCorePage } from '../src/plugin';

createDevApp()
  .registerPlugin(flowsourceCorePlugin)
  .addPage({
    element: <FlowsourceCorePage />,
    title: 'Root Page',
    path: '/flowsource-core'
  })
  .render();
