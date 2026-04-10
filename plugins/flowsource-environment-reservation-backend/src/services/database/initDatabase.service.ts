import { LoggerService } from '@backstage/backend-plugin-api';
import { Knex } from 'knex';
import { PluginDatabaseManager } from '@backstage/backend-common';

const tableName = 'maintenance_requests';
const tableNameBooking = 'bookings_requests';

const columns = {
    appid: 'appid',
    name: 'name',
    description: 'description',
    startDate: 'startDate',
    endDate: 'endDate',
    status: 'status',
    environment: 'environment',
    requestor: 'requestor',
    createdDate: 'createdDate',
};

const columnsBooking = {
    appid: 'appid',
    name: 'name',
    description: 'description',
    startDate: 'startDate',
    endDate: 'endDate',
    status: 'status',
    requestedBy: 'requestedBy',
    createdDate: 'createdDate',
};

export interface DatabaseOptions {
  logger: LoggerService;
  database: PluginDatabaseManager;
}


export async function initDatabase(
  options: DatabaseOptions,
) {
  const { logger, database } = options;
  logger.info('Initializing maintenance requests database...');

  // Get database client
  const db: Knex = await database.getClient();

  // Create the maintenance_requests table if it doesn't exist
  logger.info(`Creating table ${tableName} if it doesn't exist`);
  await createEnvironmentReservationTableIfNotExists(db, tableName, columns);
  await createBookingRequestsTableIfNotExists(db, tableNameBooking, columnsBooking);

}
async function createBookingRequestsTableIfNotExists(db: Knex<any, any[]>,tableName: string,columns: Record<string, string>) {
    if (!await db.schema.hasTable(tableName)) {
      await db.schema.createTable(tableName, table => {
        table.string(columns.appid);
        table.string(columns.name);
        table.string(columns.description);
        table.string(columns.startDate);
        table.string(columns.endDate);
        table.string(columns.status);
        table.string(columns.requestedBy);
        table.string(columns.createdDate);
        table.primary([columns.appid, columns.name]);
      });
}
}
async function createEnvironmentReservationTableIfNotExists(db: Knex<any, any[]>,
                                                    tableName: string,
                                                    columns: Record<string, string>) {
    if (!await db.schema.hasTable(tableName)) {
      await db.schema.createTable(tableName, table => {
        table.string(columns.appid);
        table.string(columns.name);
        table.string(columns.description);
        table.string(columns.startDate);
        table.string(columns.endDate);
        table.string(columns.status);
        table.string(columns.environment);
        table.string(columns.requestor);
        table.string(columns.createdDate);
        table.primary([columns.appid]);
      });
    }
}
