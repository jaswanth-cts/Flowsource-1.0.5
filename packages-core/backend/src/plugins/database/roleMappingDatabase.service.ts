import { Knex } from 'knex';
import { columns } from './roleMappingColumns';
import { FLOWSOURCE_ROLE_MAPPINGS_TABLE_NAME } from './constants';

export class RoleMappingDatabaseService {

    database: Knex;

    constructor(database: Knex) {
        this.database = database;
    }
    //Note: The role entity is changed to Group
    async getRoleMappingsForAuthProvider(authProvider: string) {
        return this.database(FLOWSOURCE_ROLE_MAPPINGS_TABLE_NAME).where({ [columns.authProvider]: authProvider });
    }

}
