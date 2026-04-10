import { createRouteRef,createSubRouteRef } from '@backstage/core-plugin-api';

export const rootRouteRef = createRouteRef({
  id: 'flowsource-infra-provision',
});

export const cardSubRouterRef = createSubRouteRef({
  id: '/flowsource-infra-provision/cards',
  parent: rootRouteRef,
  path: '/cards'
});

export const configSubRouterRef = createSubRouteRef({
  id: '/flowsource-infra-provision/config',
  parent: rootRouteRef,
  path: '/config'
});