import React from 'react';
import { createDevApp } from '@backstage/dev-utils';
import { flowsourceCicdJenkinsPlugin, FlowsourceCicdJenkinsPage } from '../src/plugin';

createDevApp()
  .registerPlugin(flowsourceCicdJenkinsPlugin)
  .addPage({
    element: <FlowsourceCicdJenkinsPage />,
    title: 'Root Page',
    path: '/flowsource-cicd-jenkins'
  })
  .render();
