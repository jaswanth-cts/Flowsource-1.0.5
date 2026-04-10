import React from 'react';
import { createDevApp } from '@backstage/dev-utils';
import { flowsourcePrismacloudPlugin, FlowsourcePrismacloudPage } from '../src/plugin';

createDevApp()
  .registerPlugin(flowsourcePrismacloudPlugin)
  .addPage({
    element: <FlowsourcePrismacloudPage />,
    title: 'Root Page',
    path: '/flowsource-prismacloud'
  })
  .render();
