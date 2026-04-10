import { createRouteRef, createSubRouteRef} from '@backstage/core-plugin-api';

export const rootRouteRef = createRouteRef({
  id: 'flowsource-cctp',
});

export const testExecutionSubRouterRef = createSubRouteRef({
  id: '/flowsource-cctp/Editsuite',
  parent: rootRouteRef,
  path: '/Editsuite'
});
