import { Knex } from 'knex';
import { emailToUserRoleMappingColumns } from './emailToUserRoleMappingColumns';
import { EMAIL_TO_USER_ROLE_MAPPINGS_TABLE_NAME } from './constants';

export class EmailToRoleMappingDatabaseService {

    database: Knex;

    constructor(database: Knex) {
        this.database = database;
    }

    // This function retrieves user roles from the database based on the provided email in a case-insensitive manner.
    async getUserRoles(email: string) {
        return this.database(EMAIL_TO_USER_ROLE_MAPPINGS_TABLE_NAME)
            .whereRaw(`LOWER(${emailToUserRoleMappingColumns.email}) = LOWER(?)`, [email]);
    }

}
