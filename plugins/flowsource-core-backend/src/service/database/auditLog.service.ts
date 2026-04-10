import { Knex } from 'knex';
import { FLOWSOURCE_AUDITLOG } from './constants';
import { auditLogColumns } from './auditlogColumns';
 
 


export class AuditLogService {

    database: Knex;

    constructor(database: Knex) {
        this.database = database;
    }
    async Log(flowsourceUser: string,operation:string,entityId: string, status:number, beforeData:any,afterData:any) {
        return this.database(FLOWSOURCE_AUDITLOG).insert({ 
            [auditLogColumns.userId]: flowsourceUser, 
            [auditLogColumns.entityId]: entityId, 
            [auditLogColumns.activity]: operation,
            [auditLogColumns.beforeUpdate]: JSON.stringify(beforeData),
            [auditLogColumns.afterUpdate]: JSON.stringify(afterData),
            [auditLogColumns.status]: status,
        });
    }
}