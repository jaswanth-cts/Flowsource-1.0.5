import { createPlugin, createRoutableExtension } from '@backstage/core-plugin-api';

import { rootRouteRef } from './routes';

export const flowsourceChatbotPlugin = createPlugin({
  id: 'flowsource-chatbot',
  routes: {
    root: rootRouteRef,
  },
});

export const FlowsourceChatbotPage = flowsourceChatbotPlugin.provide(
  createRoutableExtension({
    name: 'FlowsourceChatbotPage',
    component: () =>
      import('./components/ChatbotComponent').then(m => m.ChatbotComponent),
    mountPoint: rootRouteRef,
  }),
);
