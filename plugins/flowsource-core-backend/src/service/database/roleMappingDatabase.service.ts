import { Knex } from 'knex';
import { columns } from './roleMappingColumns';
import { FLOWSOURCE_ROLE_MAPPINGS_TABLE_NAME,EMAIL_TO_USER_ROLE_MAPPINGS_TABLE_NAME, FLOWSOURCE_GROUP_MASTER_TABLE_NAME } from './constants';
import { flowsourceMasterColumns } from './groupMasterColumns';
import { LoggerService } from '@backstage/backend-plugin-api';
 
 


export class RoleMappingDatabaseService {

    database: Knex;
    logger: LoggerService;

    constructor(database: Knex, logger: LoggerService) {
        this.database = database;
        this.logger = logger;
    }

    async getRoleMapping(flowsourceRole: string,authProvider: string, authProviderRole: string) {
        return this.database(FLOWSOURCE_ROLE_MAPPINGS_TABLE_NAME).where({ 
            [columns.flowsourceRole]: flowsourceRole, 
            [columns.authProvider]: authProvider, 
            [columns.authProviderRole]: authProviderRole
        }).first();
    }

    async createRoleMapping(flowsourceRole: string, authProvider: string, authProviderRole: string) {
        return this.database(FLOWSOURCE_ROLE_MAPPINGS_TABLE_NAME).insert({ 
            [columns.flowsourceRole]: flowsourceRole, 
            [columns.authProvider]: authProvider, 
            [columns.authProviderRole]: authProviderRole
        }).returning([
            `${columns.Id} as Id`,
            `${columns.flowsourceRole} as flowsourceRole`,
            `${columns.authProvider} as authProvider`,
            `${columns.authProviderRole} as authProviderRole`,
            `${columns.createdDate} as createdDate`
        ]);
    }

    async updateRoleMapping(flowsourceRole: string, authProvider: string, authProviderRole: string) {
        return this.database(FLOWSOURCE_ROLE_MAPPINGS_TABLE_NAME).where({ 
            [columns.authProvider]: authProvider, 
            [columns.authProviderRole]: authProviderRole 
        }).update({ 
            [columns.flowsourceRole]: flowsourceRole
        });
    }

    async deleteRoleMapping(flowsourceRole: string, authProvider: string, authProviderRole: string) {
        return this.database(FLOWSOURCE_ROLE_MAPPINGS_TABLE_NAME).where({ 
            [columns.flowsourceRole]: flowsourceRole, 
            [columns.authProvider]: authProvider, 
            [columns.authProviderRole]: authProviderRole 
        }).delete().returning([
            `${columns.Id} as Id`,
            `${columns.flowsourceRole} as flowsourceRole`,
            `${columns.authProvider} as authProvider`,
            `${columns.authProviderRole} as authProviderRole`,
            `${columns.createdDate} as createdDate`
        ]);
    }
    async deleteGroupsByIds(groupIds:any) {
        const flowsourceAuthProviderCol = FLOWSOURCE_ROLE_MAPPINGS_TABLE_NAME + ".auth_provider_role";
        const emailToRoleauthProvderRoleCol = EMAIL_TO_USER_ROLE_MAPPINGS_TABLE_NAME + ".auth_provider_role";
        const roleMappingIDcol = FLOWSOURCE_ROLE_MAPPINGS_TABLE_NAME + ".ID";
        try {
            const idsToDelete = await this.database(FLOWSOURCE_ROLE_MAPPINGS_TABLE_NAME)
            .join(EMAIL_TO_USER_ROLE_MAPPINGS_TABLE_NAME,flowsourceAuthProviderCol,emailToRoleauthProvderRoleCol )
            .whereIn(roleMappingIDcol, groupIds)
            .select(roleMappingIDcol);

            let IDs = groupIds;
            //logic to remove the IDs which has dependency in the 
            //email to role mapping tables.
            //if provider id or flowsource group id used in role mapping table
            //it should be excluded from deletion.
            //IDs collected in a list which does not have dependency in 
            //child table
            idsToDelete.forEach((el) =>{
                try{
                    IDs = IDs.filter((id:any)=> id != el.ID)
                }
                catch( err){
                   this.logger.error(err as any)
                   throw err;
                }
            })
            return await this.database(FLOWSOURCE_ROLE_MAPPINGS_TABLE_NAME)
                .whereIn(roleMappingIDcol, IDs)
                .delete('ID',IDs).returning([
                    `${columns.Id} as Id`,
                    `${columns.flowsourceRole} as flowsourceRole`,
                    `${columns.authProvider} as authProvider`,
                    `${columns.authProviderRole} as authProviderRole`,
                    `${columns.createdDate} as createdDate`
                ]);
        
        }catch(err){
            this.logger.error(err as any);
            throw err;
        }
    }
    async getRecordCount() {
        //required to calclate the number of pages in UI side.
        return this.database(FLOWSOURCE_ROLE_MAPPINGS_TABLE_NAME).count('ID as count');
    }

    async getFlowsourceMasterRecordCount(masterType:string) {
        //required to calclate the number of pages in UI side.
        return this.database(FLOWSOURCE_GROUP_MASTER_TABLE_NAME)
        .where("master_type",masterType)
        .count('ID as count');
    }

    async getFlowsourceMasterData(flowsourceMaster: string,masterType: string) {
        return this.database(FLOWSOURCE_GROUP_MASTER_TABLE_NAME).where({ 
        [flowsourceMasterColumns.flowsourceMaster]: flowsourceMaster, 
        [flowsourceMasterColumns.masterType]: masterType, 
        }).first();
    }
    async getFlowsourceMastersByType(masterType: string,offset:number,pageSize:number) {
          //populate master data based on given input type.
        return this.database(FLOWSOURCE_GROUP_MASTER_TABLE_NAME)
        .limit(pageSize)
        .offset(offset)
        .where({ [flowsourceMasterColumns.masterType]: masterType, 
        }).orderByRaw(flowsourceMasterColumns.createdDate + ' DESC');
    }
    async deleteFlowsourceMastersByType(masterType: string, IDs:any) {
        const flowsourceRoleCol = FLOWSOURCE_ROLE_MAPPINGS_TABLE_NAME + ".flowsource_role";
        const AuthProviderCol = FLOWSOURCE_ROLE_MAPPINGS_TABLE_NAME + ".auth_provider";
        const flowsourceGroupMasterCol = FLOWSOURCE_GROUP_MASTER_TABLE_NAME + ".flowsource_master";
        const IDcol = FLOWSOURCE_GROUP_MASTER_TABLE_NAME + ".ID";
        try{
            let columnToCompare:any = flowsourceRoleCol;
            //flowsource master table used to store 2 type of data
            //1. flowsource-group
            //2. Auth Provider.
            //when populating master data, type input required to populate
            // the correct type of data.
            if(masterType == 'auth-provider'){
                columnToCompare = AuthProviderCol;
            }
            //validate the depdency in child table by checking existing data.
            const idsToDelete = await this.database(FLOWSOURCE_GROUP_MASTER_TABLE_NAME)
                .join(FLOWSOURCE_ROLE_MAPPINGS_TABLE_NAME,flowsourceGroupMasterCol,columnToCompare)
                .whereIn(IDcol, IDs)
                .distinct()
                .select(IDcol);
                //logic to remove the IDs which has dependency in the 
                //email to group mapping tables.
                //IDs collected in a list which does not have dependency in 
                //child table
                let delIDs = IDs;
                idsToDelete.forEach((el) =>{
                    try{
                        delIDs = delIDs.filter((id:any)=> id != el.ID)
                    }
                    catch( err){
                       this.logger.error(err as any)
                       throw err;
                    }
                })

      
            return await this.database(FLOWSOURCE_GROUP_MASTER_TABLE_NAME)
                .whereIn(IDcol, delIDs)
                .delete('ID',delIDs).returning([
                    `${flowsourceMasterColumns.Id} as Id`,
                    `${flowsourceMasterColumns.flowsourceMaster} as flowsourceMaster`,
                    `${flowsourceMasterColumns.masterType} as masterType`,
                    `${flowsourceMasterColumns.createdDate} as createdDate`
                ]);
          
       

        }catch(err){
            this.logger.error("data access error :" + err)
            throw err;
        }
      
    }
    

    async getGroupMappings(offset:number, pageSize:number) {
    try{
      const result = await this.database(FLOWSOURCE_ROLE_MAPPINGS_TABLE_NAME)
        .limit(pageSize)
        .offset(offset)
        .orderByRaw(columns.createdDate + ' DESC');
        return result
        }
    catch(err){
        this.logger.error("data access error :" + err)
        throw err;
    }
}

            async createFlowsourceMaster(flowsourceMaster: string, masterType: string) {
               // insert new record
                return this.database(FLOWSOURCE_GROUP_MASTER_TABLE_NAME).insert({ 
                    [flowsourceMasterColumns.flowsourceMaster]: flowsourceMaster, 
                    [flowsourceMasterColumns.masterType]:masterType, 
                }).returning([
                    `${flowsourceMasterColumns.Id} as Id`,
                    `${flowsourceMasterColumns.flowsourceMaster} as flowsourceMaster`,
                    `${flowsourceMasterColumns.masterType} as masterType`,
                    `${flowsourceMasterColumns.createdDate} as createdDate`
                ]);
            }
        
}