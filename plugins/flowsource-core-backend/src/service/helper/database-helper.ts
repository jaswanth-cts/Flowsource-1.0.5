import { RoleMappingDatabaseService } from '../database/roleMappingDatabase.service';
import { EmailToRoleMappingDatabaseService } from '../database/emailToRoleMappingDatabase.service';
import { AuditLogService } from '../database/auditLog.service';


export async function createRoleMapping(flowsourceRole: string,authProvider: string,authProviderRole: string,roleMappingDatabaseService: RoleMappingDatabaseService) {
  const roleMapping = await roleMappingDatabaseService.createRoleMapping(flowsourceRole,authProvider,authProviderRole);
  return roleMapping;
}

export async function getRoleMapping(flowsourceRole: string,authProvider: string,authProviderRole: string,roleMappingDatabaseService: RoleMappingDatabaseService) {
  const roleMapping = await roleMappingDatabaseService.getRoleMapping(flowsourceRole,authProvider,authProviderRole);
  return roleMapping;
}

export async function deleteRoleMapping(flowsourceRole: string,authProvider: string,authProviderRole: string,roleMappingDatabaseService: RoleMappingDatabaseService) {
  const roleMapping = await roleMappingDatabaseService.deleteRoleMapping(flowsourceRole,authProvider,authProviderRole);
  return roleMapping;
}

export async function createEmailToRoleMapping(email: string, authProviderRole: string, emailToRoleMappingDatabaseService: EmailToRoleMappingDatabaseService) {
  const emailToRoleMapping = await emailToRoleMappingDatabaseService.createEmailToRoleMapping(email,authProviderRole);
  return emailToRoleMapping;
}

export async function  deleteEmailToRoleMapping(email: string, authProviderRole: string, emailToRoleMappingDatabaseService: EmailToRoleMappingDatabaseService) {
  const emailToRoleMapping = await emailToRoleMappingDatabaseService.deleteRoleMapping(email,authProviderRole);
  return emailToRoleMapping;
}

export async function  getEmailToRoleMapping(email: string, authProviderRole: string, emailToRoleMappingDatabaseService: EmailToRoleMappingDatabaseService) {
  const emailToRoleMapping = await emailToRoleMappingDatabaseService.getEmailToRoleMapping(email,authProviderRole);
  return emailToRoleMapping;
}
export async function getGroupsMappings(offset:number, pageSize:number, roleMappingDatabaseService: RoleMappingDatabaseService) {
  const roleMapping = await roleMappingDatabaseService.getGroupMappings(offset,pageSize);
  return roleMapping;
}

export async function getEmailsToAuthProviderGroups(offset:number, pageSize:number, emailToRoleMappingDatabaseService: EmailToRoleMappingDatabaseService) {
    const roleMapping = await emailToRoleMappingDatabaseService.getEmailsToAuthProviderGroups(offset,pageSize);
    return roleMapping;
}
export async function  createFlowsourceMasterData(flowsourceMaster: string, masterType: string,roleMappingDatabaseService: RoleMappingDatabaseService) {
  const emailToRoleMapping = await roleMappingDatabaseService.createFlowsourceMaster(flowsourceMaster,masterType);
  return emailToRoleMapping;

}
export async function getFlowsourceMasterData(flowsourceMaster:string,masterType:string, roleMappingDatabaseService: RoleMappingDatabaseService) {
  const masterData = await roleMappingDatabaseService.getFlowsourceMasterData(flowsourceMaster,masterType);
  return masterData;
}

export async function getFlowsourceMastersByType(masterType:string,offset:number, pageSize:number, roleMappingDatabaseService: RoleMappingDatabaseService) {
  const masterData = await roleMappingDatabaseService.getFlowsourceMastersByType(masterType,offset,pageSize);
  return masterData;
}
export async function deleteFlowsourceMastersByType(masterType:string,masterIds:any, roleMappingDatabaseService: RoleMappingDatabaseService) {
  const masterData = await roleMappingDatabaseService.deleteFlowsourceMastersByType(masterType,masterIds);
  return masterData;
}

export async function deleteGroupsByIds(groupIds:any,roleMappingDatabaseService: RoleMappingDatabaseService) {
  const roleMapping = await roleMappingDatabaseService.deleteGroupsByIds(groupIds);
  return roleMapping;
}

export async function deleteEmailsToGroupsByIds(Ids:any,emailToRoleMappingDatabaseService: EmailToRoleMappingDatabaseService) {
  const roleMapping = await emailToRoleMappingDatabaseService.deleteEmailsToGroupsByIds(Ids);
  return roleMapping;
}

export async function getFlowsourceGroupRecordCount(roleMappingDatabaseService: RoleMappingDatabaseService) {
  const roleMapping = await roleMappingDatabaseService.getRecordCount();
  return roleMapping;
}

export async function getEmailToGroupRecordCount(emailToRoleMappingDatabaseService: EmailToRoleMappingDatabaseService) {
  const roleMapping = await emailToRoleMappingDatabaseService.getRecordCount();
  return roleMapping;
}

export async function getFlowsourceMasterRecordCount(masterType:string, roleMappingDatabaseService: RoleMappingDatabaseService) {
  const roleMapping = await roleMappingDatabaseService.getFlowsourceMasterRecordCount(masterType);
  return roleMapping;
}
export async function insertAuditLog(user:string,operation:string,entity:string, status:number, data:any, auditLogservice: AuditLogService) {
  if(operation === "insert") {
    return await auditLogservice.Log(user,operation,entity,status,{},data);
  }
  else  if(operation === "delete") {
    return await auditLogservice.Log(user,operation,entity,status,data,{});
  }
  return null;
}

