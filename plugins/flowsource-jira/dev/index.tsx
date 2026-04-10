import React from 'react';
import { createDevApp } from '@backstage/dev-utils';
import { flowsourceJiraPlugin, FlowsourceJiraPage } from '../src/plugin';

createDevApp()
  .registerPlugin(flowsourceJiraPlugin)
  .addPage({
    element: <FlowsourceJiraPage />,
    title: 'Root Page',
    path: '/flowsource-jira'
  })
  .render();
