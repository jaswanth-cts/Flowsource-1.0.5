import React from 'react';
import { createDevApp } from '@backstage/dev-utils';
import { flowsourceGithubCopilotPlugin, FlowsourceGithubCopilotPage } from '../src/plugin';

createDevApp()
  .registerPlugin(flowsourceGithubCopilotPlugin)
  .addPage({
    element: <FlowsourceGithubCopilotPage />,
    title: 'Root Page',
    path: '/flowsource-github-copilot'
  })
  .render();
