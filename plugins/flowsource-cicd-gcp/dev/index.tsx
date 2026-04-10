import React from 'react';
import { createDevApp } from '@backstage/dev-utils';
import { flowsourceCicdGcpPlugin, FlowsourceCicdGcpPage } from '../src/plugin';

createDevApp()
  .registerPlugin(flowsourceCicdGcpPlugin)
  .addPage({
    element: <FlowsourceCicdGcpPage />,
    title: 'Root Page',
    path: '/flowsource-cicd-gcp',
  })
  .render();
