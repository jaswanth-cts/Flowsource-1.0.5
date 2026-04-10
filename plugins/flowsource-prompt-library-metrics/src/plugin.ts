import { createPlugin, createRoutableExtension } from '@backstage/core-plugin-api';
import { rootRouteRef } from './routes';

export const flowsourcePromptLibraryMetricsPlugin = createPlugin({
  id: 'flowsource-prompt-library-metrics',
  routes: {
    root: rootRouteRef,
  },
});

export const FlowsourcePromptLibraryMetricsPage = flowsourcePromptLibraryMetricsPlugin.provide(
  createRoutableExtension({
    name: 'FlowsourcePromptLibraryMetricsPage',
    component: () =>
      import('./components/PromptLibraryMetrics').then(m => m.PromptLibraryMetrics),
    mountPoint: rootRouteRef,
  }),
);