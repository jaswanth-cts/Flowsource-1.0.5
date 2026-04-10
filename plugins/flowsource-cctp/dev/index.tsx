import React from 'react';
import { createDevApp } from '@backstage/dev-utils';
import { flowsourceCctpPlugin, FlowsourceCctpPage } from '../src/plugin';

createDevApp()
  .registerPlugin(flowsourceCctpPlugin)
  .addPage({
    element: <FlowsourceCctpPage />,
    title: 'Root Page',
    path: '/flowsource-cctp',
  })
  .render();
