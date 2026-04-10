import { PluginDatabaseManager, resolvePackagePath } from '@backstage/backend-common';
import { Knex } from 'knex';
import { OrderItem } from '../database/types';
import { v4 as uuid } from 'uuid';
import { LoggerService } from '@backstage/backend-plugin-api';
 



const migrationsDir = resolvePackagePath(
  '@flowsource/plugin-flowsource-morpheus-backend',
  'migrations',
);


type Options = {
  database: PluginDatabaseManager;
  logger: LoggerService;
};

/**
 * @public
 */
export class DatabaseHandler {
  static async create(options: Options): Promise<DatabaseHandler> {
    const { database, logger } = options;
    const client:Knex<any,any[]> = await database.getClient();

    if (!database.migrations?.skip) {
      await client.migrate.latest({
        directory: migrationsDir,
      });
    }

    return new DatabaseHandler(client, logger);
  }


  private readonly client: Knex;
  logger: LoggerService;

  private constructor(client: Knex, logger: LoggerService) {
    this.client = client;
    this.logger = logger;
  }

  async listOrderItemByUser(user: string): Promise<any> {
    const result = await this.client('order_items').where('user_id', user);
    return result
  }

  async listOrderDetailyUser(user: string): Promise<any> {
    const result = await this.client('order_items').where('user_id', user);
    let orderDetail:any = []
    //considereed only valid order by validating the fetched orders from order api againest orders 
    //submitted by the current user.
    result.forEach(function(row:any){
      row.order_response.items.forEach(function (item:any){
        let order:any= item;
        order.order_id =row.id
        orderDetail.push(order)
      });
    });
    return orderDetail
  }

  
  async createOrderItem(orderItem: OrderItem) {
    try{
      return await this.client.insert(
        {
          id:uuid(),
          user_id:orderItem.userId,
          order_id:orderItem.orderId,
          catalog_id:orderItem.catalogId,
          catalog_name:orderItem.catalogName,
          catalog_code:orderItem.catalogCode,
          order_response:orderItem.orderResponse
      }).into('order_items');;
  }catch(err){
    this.logger.error('Error while creating order item',err as Error);
  }
  return null;
  }

}
