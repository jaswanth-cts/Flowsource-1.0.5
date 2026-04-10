import React from 'react';
import { createDevApp } from '@backstage/dev-utils';
import { flowsourceCicdBitbucketPlugin, FlowsourceCicdBitbucketPage } from '../src/plugin';

createDevApp()
  .registerPlugin(flowsourceCicdBitbucketPlugin)
  .addPage({
    element: <FlowsourceCicdBitbucketPage />,
    title: 'Root Page',
    path: '/flowsource-cicd-bitbucket'
  })
  .render();
