import { PluginDatabaseManager, errorHandler } from '@backstage/backend-common';
import express from 'express';
import Router from 'express-promise-router';
import { LoggerService , HttpAuthService, UserInfoService } from '@backstage/backend-plugin-api';
import { downloadZip } from './zipService';
import { RoleMappingDatabaseService } from './database/roleMappingDatabase.service';
import { EmailToRoleMappingDatabaseService } from './database/emailToRoleMappingDatabase.service';
import { AuditLogService } from './database/auditLog.service';
import { Knex } from 'knex';
import { createRoleMapping, 
  deleteRoleMapping, 
  createEmailToRoleMapping,
  deleteEmailToRoleMapping,
  getEmailToRoleMapping, 
  getRoleMapping,
  getGroupsMappings,
  getEmailsToAuthProviderGroups, 
  deleteGroupsByIds,
  createFlowsourceMasterData,
  getFlowsourceMastersByType,
  getFlowsourceMasterData,
  getFlowsourceGroupRecordCount,
  getEmailToGroupRecordCount,
  deleteEmailsToGroupsByIds,
  deleteFlowsourceMastersByType,
  getFlowsourceMasterRecordCount,
  insertAuditLog
  } from './helper/database-helper';
import xss from 'xss';


export interface RouterOptions {
  logger: LoggerService;
  database: PluginDatabaseManager;
  httpAuth: HttpAuthService;
  userInfo: UserInfoService;
}

export async function createRouter(
  options: RouterOptions,
): Promise<express.Router> {
  const { logger ,database, httpAuth, userInfo} = options;

  const router = Router();
  router.use(express.json());
  const db:Knex = await database.getClient();
  const roleMappingDatabaseService = new RoleMappingDatabaseService(db, logger);
  const emailToRoleMappingDatabaseService = new EmailToRoleMappingDatabaseService(db, logger);
  const auditLogService = new AuditLogService(db);
  router.put('/roleMapping', async (req, res)  => {
    try {
      const { flowsourceRole, authProvider, authProviderRole } = req.body;
      const existingRecord = await getRoleMapping(flowsourceRole, authProvider, authProviderRole, roleMappingDatabaseService);
      if (existingRecord) {
        res.status(409).json({ message: 'Role Mapping already exists' });
      } else {
        const result = await createRoleMapping(flowsourceRole, authProvider, authProviderRole, roleMappingDatabaseService);
        await auditLog(req,"insert","role-mapping", result, 1);
        res.status(200).json({ message: 'Role Mapping Successfull.'});
      }
    } catch (error) {
      logger.error("Unknown error:", error as Error);
      res.status(500).json({ error: 'Failed to add roleMapping' });
    }
  });

  router.delete('/roleMapping', async (req, res)  => {
    try {
      const { flowsourceRole, authProvider, authProviderRole } = req.body;
      const deleteRes = await await deleteRoleMapping(flowsourceRole, authProvider, authProviderRole, roleMappingDatabaseService);
      await auditLog(req,"delete","role-mapping", deleteRes, 1);
      res.status(200).json({ message: 'Deleting Role Mapping Successfull.'});
    } catch (error) {
      logger.error("Unknown error:", error as Error);
      res.status(500).json({ error: 'Failed to get roleMapping' });
    }
  });

  router.put('/emailtoRoleMapping', async (req, res)  => {
    try {
      const { email, authProviderRole } = req.body;
      const existingRecord = await getEmailToRoleMapping(email, authProviderRole, emailToRoleMappingDatabaseService);
      logger.info(`existingRecord ${JSON.stringify(existingRecord)}`);
      if (existingRecord) {
        res.status(409).json({ message: 'Email Role Mapping already exists' });
      } else {
        const result = await createEmailToRoleMapping(email, authProviderRole, emailToRoleMappingDatabaseService);
        auditLog(req,"insert","email-to-role-mapping", result, 1);
        res.status(200).json({ message: 'Email Role Mapping Successfull.'});
      }
    } catch (error) {
      logger.error("Unknown error:", error as Error);
      res.status(500).json({ error: 'Failed to add emailtoRoleMapping' });
    }
  });

  router.delete('/emailtoRoleMapping', async (req, res)  => {
    try {
      const { email, authProviderRole } = req.body;
      await deleteEmailToRoleMapping(email, authProviderRole, emailToRoleMappingDatabaseService);
      // res.status(200).json(emailToRoleMapping);
      res.status(200).json({ message: 'Deleting Email Role Mapping Successfull.'});
    } catch (error) {
      logger.error("Unknown error:", error as Error);
      res.status(500).json({ error: 'Failed to delete emailtoRoleMapping' });
    }
  });


  router.get('/groups', async (request, response)  => {
      try{
        const {_page = 1, _pageSize = 100} = request.query;
        const page = parseInt(_page as string, 10);
        const pageSize = parseInt(_pageSize as string, 10);
        const limit = pageSize>0 ? pageSize:1000;
        const offset = (page > 0?page-1:0) * limit;//pagination logic to skip the rows

        const groups = await getGroupsMappings(offset, limit, roleMappingDatabaseService);
        const totalRows = await getFlowsourceGroupRecordCount(roleMappingDatabaseService);
        response.set('x-total-count',JSON.stringify(totalRows));
        return response.status(200).send(JSON.stringify({'data': groups, 'total-count':totalRows[0].count}));
      }catch(err){
        return response.status(500).json({ error: 'Failed to fetch auth group mappings' });
      }
  })
  router.get('/emails-to-provider-groups', async (request, response)  => {
    try{

      const {_page = 1, _pageSize = 100} = request.query;
        const page = parseInt(_page as string, 10);
        const pageSize = parseInt(_pageSize as string, 10);
        const limit = pageSize>0 ? pageSize:1000;
        const offset = (page > 0?page-1:0) * limit; // pagination logic to skip the rows

        const groups = await getEmailsToAuthProviderGroups(offset, limit, emailToRoleMappingDatabaseService);
        const totalRows = await getEmailToGroupRecordCount(emailToRoleMappingDatabaseService);
        response.set('x-total-count',JSON.stringify(totalRows));
        return response.status(200).send(JSON.stringify({'data': groups, 'total-count':totalRows[0].count}));
    }catch(err){
      return response.status(500).json({ error: 'Failed to fetch data' });
  }
  })
  router.delete('/role-delete-by-id', async (req, res)  => {
    const deleteRes = await deleteGroupsByIds(req.body,roleMappingDatabaseService);
    await auditLog(req,"delete","groups", deleteRes, 1);
    const sanitizedOutput = xss(JSON.stringify(deleteRes));
    return res.status(200).send(sanitizedOutput);
  }) 
  router.delete('/emailstogroups-delete-by-id', async (req, res)  => {
    const deleteRes = await deleteEmailsToGroupsByIds(req.body,emailToRoleMappingDatabaseService);
    await auditLog(req,"delete","emails-to-groups", deleteRes, 1);
    const sanitizedOutput = xss(JSON.stringify(deleteRes));
    return res.status(200).send(sanitizedOutput);
  }) 

  router.delete('/delete-auth-providers', async (req, res)  => {
    const deleteRes = await deleteFlowsourceMastersByType('auth-provider', req.body,roleMappingDatabaseService);
    await auditLog(req,"delete","auth-providers", deleteRes, 1);
    const sanitizedOutput = xss(JSON.stringify(deleteRes));
    return res.status(200).send(sanitizedOutput);
  })
  router.delete('/delete-flowsource-group', async (req, res)  => {
    const deleteRes = await deleteFlowsourceMastersByType('flowsource-group', req.body,roleMappingDatabaseService);
    await auditLog(req,"delete","flowsource-group", deleteRes, 1);
    const sanitizedOutput = xss(JSON.stringify(deleteRes));
    return res.status(200).send(JSON.stringify(sanitizedOutput));
  })
  router.put('/add-auth-provider', async (req, res)  => {
    const { flowsourcemaster } = req.body;
    const sanitizedOutput = xss(flowsourcemaster);
    const masterType = 'auth-provider';
    const existingRecord = await getFlowsourceMasterData(sanitizedOutput, masterType, roleMappingDatabaseService);
    if (existingRecord) {
      res.status(409).json({ message: 'Auth Provider already exists' });
    } else {
      const result= await createFlowsourceMasterData(sanitizedOutput, masterType, roleMappingDatabaseService);
      await auditLog(req,"insert",masterType, result, 1);
      res.status(200).json({ message: 'master data inserted Successfully.'});
    }
  })
  router.put('/add-flowsource-group', async (req, res)  => {
    const { flowsourcemaster } = req.body;
    const sanitizedOutput = xss(flowsourcemaster);
    const masterType = 'flowsource-group';
    const existingRecord = await getFlowsourceMasterData(sanitizedOutput, masterType, roleMappingDatabaseService);
    if (existingRecord) {
      res.status(409).json({ message: 'Flowsource Group already exists' });
    } else {
      const result = await createFlowsourceMasterData(sanitizedOutput, masterType, roleMappingDatabaseService);
      await auditLog(req,"insert",masterType, result, 1);
      res.status(200).json({ message: 'master data inserted Successfully.'});
    }
  })
     
  router.get('/get-auth-providers', async (req, res)  => {
    const {_page = 1, _pageSize = 100} = req.query;
    const page = parseInt(_page as string, 10);
    const pageSize = parseInt(_pageSize as string, 10);
    const limit = pageSize>0 ? pageSize:1000;
    const offset = (page > 0?page-1:0) * limit; // pagination logic to skip the rows
    const totalRows = await getFlowsourceMasterRecordCount('auth-provider',roleMappingDatabaseService);
    const providers = await getFlowsourceMastersByType('auth-provider', offset, limit,roleMappingDatabaseService);
    return res.status(200).send(JSON.stringify({'data': providers, 'total-count':totalRows[0].count}));
  })

  router.get('/get-flowsource-groups', async (req, res)  => {
    const {_page = 1, _pageSize = 100} = req.query;
    const page = parseInt(_page as string, 10);
    const pageSize = parseInt(_pageSize as string, 10);
    const limit = pageSize>0 ? pageSize:1000;
    const offset = (page > 0?page-1:0) * limit; // pagination logic to skip the rows
    const totalRows = await getFlowsourceMasterRecordCount('flowsource-group',roleMappingDatabaseService);
    const groups = await getFlowsourceMastersByType('flowsource-group', offset, limit,roleMappingDatabaseService);
    return res.status(200).send(JSON.stringify({'data': groups, 'total-count':totalRows[0].count}));
  })
    

  router.get('/health', (_, response) => {
    logger.info('PONG!');
    response.json({ status: 'ok' });
  });

  router.get('/download-zip', (req, res) => downloadZip(req, res, logger));

  async function auditLog(req:any,operation:string,entity:string, data:any,status:number){
    const loggedInUser = await getLoggedInUser(req);
    await insertAuditLog(loggedInUser,operation,entity,status,data, auditLogService);
  
  }

  async function getLoggedInUser(req:any):Promise<string> {
    let userToReturn = "";
    const credentials = await httpAuth.credentials(req, { allow: ['user'] });
    const info = await userInfo.getUserInfo(credentials);
    if (info !== null && info !== undefined) {
      if (info.userEntityRef !== null && info.userEntityRef !== undefined) {
        // default/209294
        // group/username - will be return the caller.
        userToReturn = info.userEntityRef.split(":")[1];
        if (userToReturn.indexOf('/') > 0 && userToReturn.length>1) {
          userToReturn = userToReturn.slice(userToReturn.indexOf('/')+1);
        }
      }
    }
    return userToReturn;
  }

  router.use(errorHandler());

  return router;
}
