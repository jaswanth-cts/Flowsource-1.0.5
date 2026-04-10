import React from 'react';
import { createDevApp } from '@backstage/dev-utils';
import { flowsourceDynatracePlugin, FlowsourceDynatracePage } from '../src/plugin';

createDevApp()
  .registerPlugin(flowsourceDynatracePlugin)
  .addPage({
    element: <FlowsourceDynatracePage />,
    title: 'Root Page',
    path: '/flowsource-dynatrace',
  })
  .render();
