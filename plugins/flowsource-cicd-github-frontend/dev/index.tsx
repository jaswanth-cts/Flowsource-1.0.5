import React from 'react';
import { createDevApp } from '@backstage/dev-utils';
import { flowsourceCicdCustomFrontendPlugin, FlowsourceCicdCustomFrontendPage } from '../src/plugin';

createDevApp()
  .registerPlugin(flowsourceCicdCustomFrontendPlugin)
  .addPage({
    element: <FlowsourceCicdCustomFrontendPage />,
    title: 'Root Page',
    path: '/flowsource-cicd-custom-frontend'
  })
  .render();
