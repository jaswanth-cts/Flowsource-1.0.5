import { LoggerService } from '@backstage/backend-plugin-api';
import { Knex } from 'knex';
import { PluginDatabaseManager } from '@backstage/backend-common';

const tableName = 'chatbot_uploads';

const columns = {
    appid: 'appid',
    lastSucceededUuid: 'lastSucceededUuid',
    lastUploadedUuid: 'lastUploadedUuid',
    status: 'status',
    lastcommit: 'lastcommit',
    techDocsRef: 'techDocsRef',
};

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

  // Create the chatbot_uploads table if it doesn't exist
  logger.info(`Creating table ${tableName} if it doesn't exist`);
  await createChatbotUploadsTableIfNotExists(db, tableName, columns);

}
async function createChatbotUploadsTableIfNotExists(db: Knex<any, any[]>,
                                                    tableName: string,
                                                    columns: Record<string, string>) {
    if (!await db.schema.hasTable(tableName)) {
      await db.schema.createTable(tableName, table => {
        table.string(columns.appid).primary();
        table.string(columns.lastSucceededUuid);
        table.string(columns.lastUploadedUuid);
        table.string(columns.status);
        table.string(columns.lastcommit);
        table.string(columns.techDocsRef);
      });
    }
}
