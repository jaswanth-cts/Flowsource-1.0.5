import React from 'react';
import { createDevApp } from '@backstage/dev-utils';
import { flowsourceChatbotPlugin, FlowsourceChatbotPage } from '../src/plugin';

createDevApp()
  .registerPlugin(flowsourceChatbotPlugin)
  .addPage({
    element: <FlowsourceChatbotPage />,
    title: 'Root Page',
    path: '/flowsource-chatbot'
  })
  .render();
