import React from 'react';
import { createDevApp } from '@backstage/dev-utils';
import { flowsourceCicdAwsPlugin, FlowsourceCicdAwsPage } from '../src/plugin';

createDevApp()
  .registerPlugin(flowsourceCicdAwsPlugin)
  .addPage({
    element: <FlowsourceCicdAwsPage />,
    title: 'Root Page',
    path: '/flowsource-cicd-aws',
  })
  .render();
