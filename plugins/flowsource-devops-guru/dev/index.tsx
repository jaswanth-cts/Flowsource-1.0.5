import React from 'react';
import { createDevApp } from '@backstage/dev-utils';
import { flowsourceDevopsGuruPlugin, FlowsourceDevopsGuruPage } from '../src/plugin';

createDevApp()
  .registerPlugin(flowsourceDevopsGuruPlugin)
  .addPage({
    element: <FlowsourceDevopsGuruPage />,
    title: 'Root Page',
    path: '/flowsource-devops-guru'
  })
  .render();
