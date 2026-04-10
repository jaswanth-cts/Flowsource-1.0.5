import React from 'react';
import { createDevApp } from '@backstage/dev-utils';
import { flowsourceGithubPlugin, FlowsourceGithubPage } from '../src/plugin';

createDevApp()
  .registerPlugin(flowsourceGithubPlugin)
  .addPage({
    element: <FlowsourceGithubPage />,
    title: 'Root Page',
    path: '/flowsource-github'
  })
  .render();
