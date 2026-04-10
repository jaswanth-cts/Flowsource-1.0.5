import React from 'react';
import { createDevApp } from '@backstage/dev-utils';
import { flowsourceVeracodePlugin, FlowsourceVeracodePage } from '../src/plugin';

createDevApp()
  .registerPlugin(flowsourceVeracodePlugin)
  .addPage({
    element: <FlowsourceVeracodePage />,
    title: 'Root Page',
    path: '/flowsource-veracode',
  })
  .render();
