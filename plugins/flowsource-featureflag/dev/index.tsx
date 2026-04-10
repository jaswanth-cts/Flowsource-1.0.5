import React from 'react';
import { createDevApp } from '@backstage/dev-utils';
import { flowsourceFeatureflagPlugin, FlowsourceFeatureflagPage } from '../src/plugin';

createDevApp()
  .registerPlugin(flowsourceFeatureflagPlugin)
  .addPage({
    element: <FlowsourceFeatureflagPage />,
    title: 'Root Page',
    path: '/flowsource-featureflag',
  })
  .render();
