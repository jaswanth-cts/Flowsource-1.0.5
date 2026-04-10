import { Knex } from 'knex';
import { emailToUserRoleMappingColumns } from './emailToUserRoleMappingColumns';
import { EMAIL_TO_USER_ROLE_MAPPINGS_TABLE_NAME } from './constants';
import { LoggerService } from '@backstage/backend-plugin-api';
export class EmailToRoleMappingDatabaseService {

    database: Knex;
    logger: LoggerService;

    constructor(database: Knex, logger: LoggerService) {
        this.database = database;
        this.logger = logger;
    }
    
    async getEmailToRoleMapping(email: string, authProviderRole: string): Promise<any> {
        return this.database(EMAIL_TO_USER_ROLE_MAPPINGS_TABLE_NAME).where({ 
            [emailToUserRoleMappingColumns.email]: email, 
            [emailToUserRoleMappingColumns.authProviderRole]: authProviderRole
        }).first();
    }


    async createEmailToRoleMapping(email: string, authProviderRole: string): Promise<any> {
        return this.database(EMAIL_TO_USER_ROLE_MAPPINGS_TABLE_NAME).insert({ 
            [emailToUserRoleMappingColumns.email]: email, 
            [emailToUserRoleMappingColumns.authProviderRole]: authProviderRole
        }).returning([
            `${emailToUserRoleMappingColumns.Id} as Id`,
            `${emailToUserRoleMappingColumns.email} as email`,
            `${emailToUserRoleMappingColumns.authProviderRole} as authProviderRole`,
            `${emailToUserRoleMappingColumns.createdDate} as createdDate`
        ]);
    }

    async deleteRoleMapping(email: string, authProviderRole: string) {
        return this.database(EMAIL_TO_USER_ROLE_MAPPINGS_TABLE_NAME).where({ 
            [emailToUserRoleMappingColumns.email]: email, 
            [emailToUserRoleMappingColumns.authProviderRole]: authProviderRole 
        }).delete().returning([
            `${emailToUserRoleMappingColumns.Id} as Id`,
            `${emailToUserRoleMappingColumns.email} as email`,
            `${emailToUserRoleMappingColumns.authProviderRole} as authProviderRole`,
            `${emailToUserRoleMappingColumns.createdDate} as createdDate`
        ]);
    }
    async getRecordCount() {
        return this.database(EMAIL_TO_USER_ROLE_MAPPINGS_TABLE_NAME)
            .count('ID as count');
    }
    async getEmailsToAuthProviderGroups(offset:number, pageSize:number) {
        const result = await this.database(EMAIL_TO_USER_ROLE_MAPPINGS_TABLE_NAME)
        .limit(pageSize)
        .offset(offset)
        .orderByRaw(emailToUserRoleMappingColumns.createdDate + ' DESC');
        return result
    }
    async deleteEmailsToGroupsByIds(Ids:any) {
         try {
            return await this.database(EMAIL_TO_USER_ROLE_MAPPINGS_TABLE_NAME)
                .whereIn("ID", Ids)
                .delete('ID',Ids).returning([
                    `${emailToUserRoleMappingColumns.Id} as Id`,
                    `${emailToUserRoleMappingColumns.email} as email`,
                    `${emailToUserRoleMappingColumns.authProviderRole} as authProviderRole`,
                    `${emailToUserRoleMappingColumns.createdDate} as createdDate`
                ]);

      
        }catch(err){
            this.logger.error(err as any);
            throw err;
        }
    }
}
