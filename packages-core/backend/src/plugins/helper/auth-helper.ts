import { DEFAULT_NAMESPACE, stringifyEntityRef } from '@backstage/catalog-model';
import { RoleMappingDatabaseService } from '../database/roleMappingDatabase.service';
import { columns } from '../database/roleMappingColumns';
import { EmailToRoleMappingDatabaseService } from '../database/emailToRoleMappingDatabase.service';

//Note: The role entity is changed to Group
const DEFAULT_USER_REF = stringifyEntityRef({
  kind: 'Group',
  name: 'default-group',
  namespace: DEFAULT_NAMESPACE,  
});

export async function getUpdatedUserRefs(roleList: string[], authProvider: string, roleMappingDatabaseService: RoleMappingDatabaseService): Promise<string[]> {
  let userRefs: Set<string> = new Set([]);
  // Get the flowsource roles from the role mapping database service for the given auth provider
  const roleMap: Record<string, string[] > = await getRoleMappingsForAuthProvider(authProvider, roleMappingDatabaseService);

  // Iterate over the role names from the Auth provider and get the corresponding role names from the role map and add them to the userRefs
  roleList.forEach(roleInProvider => {

    if (!roleMap[roleInProvider]) {
      return;
    }
    const roleArray: string [] = roleMap[roleInProvider];
    let userRef: string = '';

    roleArray.forEach( (element) => {
       userRef = stringifyEntityRef({
        kind: 'Group',
        name: element,
        namespace: DEFAULT_NAMESPACE,  
      });
      userRefs.add(userRef);
  });
    userRefs.add(userRef);
  });
    userRefs.add(DEFAULT_USER_REF);
  // Return the updated user references
  return Array.from(userRefs);
}

//Note: The role entity is changed to Group
// Function to get the role map from the database
// Function to get the role map from the database
async function getRoleMappingsForAuthProvider(authProvider: string, roleMappingDatabaseService: RoleMappingDatabaseService) {
  const roleMappings = await roleMappingDatabaseService.getRoleMappingsForAuthProvider(authProvider);
  const roleMap: Record<string, string[]> = {};
  let roleArray: string [] = new Array<string>();
  roleMappings.forEach((roleMapping: any) => {
    if (roleMap[roleMapping[columns.authProviderRole]] == null || roleMap[roleMapping[columns.authProviderRole]] == undefined) {
      roleArray = new Array<string>();
    } else {
      roleArray = roleMap[roleMapping[columns.authProviderRole]];
    }
    roleArray.push(roleMapping[columns.flowsourceRole]);
    roleMap[roleMapping[columns.authProviderRole]] = roleArray;
  });
  return roleMap;
}

//Note: The role entity is changed to Group
// Function to get the roles of the user from the database
export async function getUserRoles(email: string, emailToRoleMappingDatabaseService: EmailToRoleMappingDatabaseService) {
  const userRoles = await emailToRoleMappingDatabaseService.getUserRoles(email);
  return userRoles.map((userRole: any) => userRole[columns.authProviderRole]);
}