import React from 'react';
import { createDevApp } from '@backstage/dev-utils';
import { flowsourceSeleniumPlugin, FlowsourceSeleniumPage } from '../src/plugin';

createDevApp()
  .registerPlugin(flowsourceSeleniumPlugin)
  .addPage({
    element: <FlowsourceSeleniumPage />,
    title: 'Root Page',
    path: '/flowsource-selenium',
  })
  .render();
