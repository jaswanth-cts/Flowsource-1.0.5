import React from 'react';
import { createDevApp } from '@backstage/dev-utils';
import { flowsourceInfraProvisionPlugin, FlowsourceInfraProvisionPage } from '../src/plugin';

createDevApp()
  .registerPlugin(flowsourceInfraProvisionPlugin)
  .addPage({
    element: <FlowsourceInfraProvisionPage />,
    title: 'Root Page',
    path: '/flowsource-infra-provision'
  })
  .render();
