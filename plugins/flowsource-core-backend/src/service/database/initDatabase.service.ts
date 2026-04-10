import { LoggerService } from '@backstage/backend-plugin-api';
import { Knex } from 'knex';
import { PluginDatabaseManager } from '@backstage/backend-common';
import { columns } from './roleMappingColumns';
import { emailToUserRoleMappingColumns } from './emailToUserRoleMappingColumns';
import { EMAIL_TO_USER_ROLE_MAPPINGS_TABLE_NAME, 
  FLOWSOURCE_ROLE_MAPPINGS_TABLE_NAME, 
  FLOWSOURCE_GROUP_MASTER_TABLE_NAME,
  FLOWSOURCE_AUDITLOG
} from './constants';
import { flowsourceMasterColumns } from './groupMasterColumns';
import { auditLogColumns } from './auditlogColumns';
 
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
  // Create the email_to_role_mappings table if it doesn't exist
  logger.info(`Creating table ${FLOWSOURCE_GROUP_MASTER_TABLE_NAME} if it doesn't exist`);
  await createMasterTableIfNotExists(db, FLOWSOURCE_GROUP_MASTER_TABLE_NAME, flowsourceMasterColumns, logger);
  logger.info(`Creating table ${FLOWSOURCE_GROUP_MASTER_TABLE_NAME} if it doesn't exist`);
  await createAuditLogTableIfNotExists(db, FLOWSOURCE_AUDITLOG, auditLogColumns, logger);

}

// async function createRoleMappingsTableIfNotExists(db: Knex<any, any[]>,
//                                                   tableName: string,
//                                                   columns: Record<string, string>,
//                                                   logger: LoggerService) {
//     if (!await db.schema.hasTable(tableName)) {
//       logger.info(`Creating table ${tableName}`);
//       await db.schema.createTable(tableName, table => {
//         table.specificType(columns.Id, 'serial')
//         table.string(columns.flowsourceRole);
//         table.string(columns.authProvider);
//         table.string(columns.authProviderRole);
//         table.string(columns.createdDate);
//         table.primary([columns.Id, columns.authProvider, columns.authProviderRole, columns.flowsourceRole, columns.createdDate]); // Primary key constraint
//       });
//     }
// }

async function createRoleMappingsTableIfNotExists(
  db: Knex<any, any[]>,
  tableName: string,
  columns: Record<string, string>,
  logger: LoggerService
) {
  // Drop the table if it exists to avoid schema conflicts
  if (await db.schema.hasTable(tableName)) { 
    if(!await db.schema.hasColumn(tableName, columns.Id)){ 
      logger.info(`Creating column ${columns.Id}`);
      // Add the new column ID
      await db.schema.alterTable(tableName, table => {
        table.increments(columns.Id, { primaryKey: false });
      });    
      // Populate the new column with unique values
      const rows = await db.select('*').from(tableName);
        //there is any changes in table structure compared with existing table
        // and changed column def. and performed alter table operation
      for (let i = 0; i < rows.length; i++) {
        await db(tableName).where(columns.authProviderRole, rows[i][columns.authProviderRole]).andWhere(columns.authProvider, rows[i][columns.authProvider])
        .andWhere(columns.flowsourceRole, rows[i][columns.flowsourceRole])
        .update(columns.Id, i + 1);
      }
      await db.schema.alterTable(tableName, table => {
        table.dropPrimary(); // drop Old Primary Key
      }).then(() => {
          return db.schema.alterTable(tableName, table => {
            table.primary([columns.Id]); //set id as primary key 
            table.unique([columns.authProvider, columns.authProviderRole, columns.flowsourceRole]); // Add unique constraints
          });
      })
      
    }
    if(!await db.schema.hasColumn(tableName, columns.createdDate)){
      logger.info(`Creating column ${columns.createdDate}`);
      await db.schema.alterTable(tableName, table => {
        table.timestamp(columns.createdDate).defaultTo(db.fn.now()).notNullable();
      });
    }
  }else{
    logger.info(`Creating table ${tableName}`);
    await db.schema.createTable(tableName, (table) => {
      // Set the 'Id' column as auto-incrementing with 'serial'
      table.increments(columns.Id).primary(); // This makes 'Id' auto-increment
  
      // Define other columns
      table.string(columns.flowsourceRole).notNullable();
      table.string(columns.authProvider).notNullable();
      table.string(columns.authProviderRole).notNullable();
      table.timestamp(columns.createdDate).defaultTo(db.fn.now()).notNullable();
  
      // Optionally add a unique constraint
      table.unique([columns.authProvider, columns.authProviderRole, columns.flowsourceRole]);
    });
  }
}

async function createEmailToUserRoleMappingsTableIfNotExists(db: Knex<any, any[]>,
                                                  tableName: string,
                                                  columns: Record<string, string>,
                                                  logger: LoggerService) {
    if (await db.schema.hasTable(tableName)) {
      if(!await db.schema.hasColumn(tableName, columns.Id)){
        logger.info(`Creating column ${columns.Id}`);     
        // Add the new column ID
        await db.schema.alterTable(tableName, table => {
          table.increments(columns.Id, { primaryKey: false });
        });
        // Populate the new column with unique values
        const rows = await db.select('*').from(tableName);
        //there is any changes in table structure compared with existing table
        // and changed column def. and performed alter table operation
        for (let i = 0; i < rows.length; i++) {
          await db(tableName)
            .where(columns.authProviderRole, rows[i][columns.authProviderRole])
            .andWhere(columns.email, rows[i][columns.email])
            .update(columns.Id, i + 1);
        }
        await db.schema.alterTable(tableName, table => {
          table.dropPrimary(); //drop old Primary key
        }).then(() => {
            return db.schema.alterTable(tableName, table => {
              table.primary([columns.Id]);   //set id as primary key 
              table.unique([columns.email, columns.authProviderRole]); //Add  unique constraint
            });
        })       
      }
      if(!await db.schema.hasColumn(tableName, columns.createdDate)){
        logger.info(`Creating column ${columns.createdDate}`);
        await db.schema.alterTable(tableName, table => {
          table.timestamp(columns.createdDate).defaultTo(db.fn.now()).notNullable();
        });
      }
    }else{
      logger.info(`Creating table ${tableName}`);
      await db.schema.createTable(tableName, table => {
        table.increments(columns.Id).primary();
        table.increments(columns.Id).primary();
        table.string(columns.email);
        table.string(columns.authProviderRole);
        table.timestamp(columns.createdDate).defaultTo(db.fn.now()).notNullable();
        table.unique([columns.email, columns.authProviderRole]); // Primary key constraint
        table.timestamp(columns.createdDate).defaultTo(db.fn.now()).notNullable();
        table.unique([columns.email, columns.authProviderRole]); // Primary key constraint
      });
    }
}
async function createMasterTableIfNotExists(db: Knex<any, any[]>,
  tableName: string,
  columns: Record<string, string>,
  logger: LoggerService) {
  if (await db.schema.hasTable(tableName)) {
    //if there is any new column added or udpated
    //table alter logic has to be introduce here.     
  }else{
    logger.info(`Creating table ${tableName}`);
      await db.schema.createTable(tableName, table => {
      table.increments(columns.Id).primary();
      table.string(columns.flowsourceMaster);
      table.string(columns.masterType);
      table.boolean(columns.active);
      table.timestamp(columns.createdDate).defaultTo(db.fn.now()).notNullable();
      });
    }
}

async function createAuditLogTableIfNotExists(db: Knex<any, any[]>,
  tableName: string,
  columns: Record<string, string>,
  logger: LoggerService) {
    if (await db.schema.hasTable(tableName)) { 
      logger.info(`Table already ${tableName} exist...`)
    }else{
      logger.info(`Creating table ${tableName}`);
      await db.schema.createTable(tableName, table => {
      table.increments(columns.Id).primary();
      table.string(columns.userId).notNullable();
      table.string(columns.entityId);
      table.string(columns.activity).notNullable();
      table.jsonb(columns.beforeUpdate);
      table.jsonb(columns.afterUpdate);
      table.integer(columns.status);
      table.timestamp(columns.activityDate).defaultTo(db.fn.now()).notNullable();
      });
    }
}