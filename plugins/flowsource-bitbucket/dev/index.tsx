import React from 'react';
import { createDevApp } from '@backstage/dev-utils';
import { flowsourceBitbucketPlugin, FlowsourceBitbucketPage } from '../src/plugin';

createDevApp()
  .registerPlugin(flowsourceBitbucketPlugin)
  .addPage({
    element: <FlowsourceBitbucketPage />,
    title: 'Root Page',
    path: '/flowsource-bitbucket'
  })
  .render();
