import { LoggerService } from '@backstage/backend-plugin-api';
import { Knex } from 'knex';
import { PluginDatabaseManager } from '@backstage/backend-common';
import { columns } from './roleMappingColumns';
import { emailToUserRoleMappingColumns } from './emailToUserRoleMappingColumns';
import { EMAIL_TO_USER_ROLE_MAPPINGS_TABLE_NAME, FLOWSOURCE_ROLE_MAPPINGS_TABLE_NAME } from './constants';

export interface DatabaseOptions {
  logger: LoggerService;
  database: PluginDatabaseManager;
}

export async function initDatabase(
  options: DatabaseOptions,
) {
  const { logger, database } = options;

  // Get database client
  const db: Knex = await database.getClient();

  // Create the role_mappings table if it doesn't exist
  logger.info(`Creating table ${FLOWSOURCE_ROLE_MAPPINGS_TABLE_NAME} if it doesn't exist`);
  await createRoleMappingsTableIfNotExists(db, FLOWSOURCE_ROLE_MAPPINGS_TABLE_NAME, columns, logger);

  // Create the email_to_role_mappings table if it doesn't exist
  logger.info(`Creating table ${EMAIL_TO_USER_ROLE_MAPPINGS_TABLE_NAME} if it doesn't exist`);
  await createEmailToUserRoleMappingsTableIfNotExists(db, EMAIL_TO_USER_ROLE_MAPPINGS_TABLE_NAME, emailToUserRoleMappingColumns, logger);
}

async function createRoleMappingsTableIfNotExists(db: Knex<any, any[]>,
                                                  tableName: string,
                                                  columns: Record<string, string>,
                                                  logger: LoggerService) {
    if (!await db.schema.hasTable(tableName)) {
      logger.info(`Creating table ${tableName}`);
      await db.schema.createTable(tableName, table => {
        table.string(columns.flowsourceRole);
        table.string(columns.authProvider);
        table.string(columns.authProviderRole);
        table.primary([columns.authProvider, columns.authProviderRole, columns.flowsourceRole]); // Primary key constraint
      });
    }
}

async function createEmailToUserRoleMappingsTableIfNotExists(db: Knex<any, any[]>,
                                                  tableName: string,
                                                  columns: Record<string, string>,
                                                  logger: LoggerService) {
    if (!await db.schema.hasTable(tableName)) {
      logger.info(`Creating table ${tableName}`);
      await db.schema.createTable(tableName, table => {
        table.string(columns.email);
        table.string(columns.authProviderRole);
        table.primary([columns.email, columns.authProviderRole]); // Primary key constraint
      });
    }
}
