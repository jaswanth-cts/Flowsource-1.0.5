import { LoggerService, DatabaseService } from '@backstage/backend-plugin-api';
import { Knex } from 'knex';


const tableName = 'bookings_requests';

const columns = {
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
  database: DatabaseService;
}

export async function initDatabase(
  options: DatabaseOptions,
) {
  const { logger, database } = options;
  logger.info('Initializing booking requests database...');

  // Get database client
  const db = await database.getClient();

  // Create the bookings_requests table if it doesn't exist
  logger.info(`Creating table ${tableName} if it doesn't exist`);
  await createBookingRequestsTableIfNotExists(db, tableName, columns);

}
async function createBookingRequestsTableIfNotExists(db: Knex,
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
        table.string(columns.requestedBy);
        table.string(columns.createdDate);
        table.primary([columns.appid, columns.name]);
      });
    }
}
