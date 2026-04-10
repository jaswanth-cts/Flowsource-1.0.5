import {
  AuthorizeResult,
  PolicyDecision,
  isPermission,
  isResourcePermission,
  createPermission
} from '@backstage/plugin-permission-common';
import { PermissionPolicy, PolicyQuery } from '@backstage/plugin-permission-node';
import {
  BackstageIdentityResponse,
} from '@backstage/plugin-auth-node';
import {
  catalogEntityDeletePermission, catalogEntityReadPermission,
} from '@backstage/plugin-catalog-common/alpha';

import {
  catalogConditions,
  createCatalogConditionalDecision,
} from '@backstage/plugin-catalog-backend/alpha';
import { createBackendModule } from '@backstage/backend-plugin-api';
import { policyExtensionPoint } from '@backstage/plugin-permission-node/alpha';

class CatalogAdminPermissionPolicy implements PermissionPolicy {
  async handle(
    request: PolicyQuery,
    user?: BackstageIdentityResponse,
  ): Promise<PolicyDecision> {

    //Note: The role entity is changed to Group
    const userAdminRole='group:default/catalog-admin';
 
    //Evaluate permission of user to unregister a component
    if (isPermission(request.permission, catalogEntityDeletePermission)) {
      if (isResourcePermission(request.permission, 'catalog-entity')) {
        const permissionTestForUnregisterApp = (user?.identity.ownershipEntityRefs.includes(userAdminRole));
        if (permissionTestForUnregisterApp) {
          console.debug('User Authorized');
          return { result: AuthorizeResult.ALLOW };
        }
        return { result: AuthorizeResult.DENY };
      }
    }

    //Note: The role entity is changed to Group and the permission updated to access the entity type - Group and User
    if (isPermission(request.permission, catalogEntityReadPermission)) {
      if (isResourcePermission(request.permission, 'catalog-entity')) {
        return createCatalogConditionalDecision(
          request.permission,
          { anyOf: [
            catalogConditions.isEntityKind({
            kinds: ['Group', 'User' ],
            }),
            catalogConditions.isEntityOwner({
              claims: user?.identity .ownershipEntityRefs ?? [],
            })
          ]},
        )
        // return { result: AuthorizeResult.ALLOW };
      }
    }
    //Evaluate permission of user to create a component
    if (isPermission(request.permission, catalogEntityCreatePermission)) {
      const permissionTestForCreateComponent = (user?.identity.ownershipEntityRefs.includes(userAdminRole));
      if (permissionTestForCreateComponent) {
        console.debug('User Authorized');
        return { result: AuthorizeResult.ALLOW };
      }
      return { result: AuthorizeResult.DENY };
    }
    return { result: AuthorizeResult.ALLOW };
  }

  
}

export const catalogEntityCreatePermission = createPermission({
  name: 'catalog.entity.create',
  attributes: {
    action: 'create',
  },
});

export const customCatalogAdminPermissionPolicyBackendModule = createBackendModule({
  pluginId: 'permission',
  moduleId: 'catalog-admin-custom-policy',
  register(reg) {
    reg.registerInit({
      deps: { policy: policyExtensionPoint },
      async init({ policy }) {
        policy.setPolicy(new CatalogAdminPermissionPolicy());
      },
    });
  },
});
