import { LoggerService } from '@backstage/backend-plugin-api';
import { Pool } from 'pg';
import { DatabaseService } from './database.service';

export class AzureDatabaseService implements DatabaseService{

    private logger: LoggerService;
    private dbDetails: any;
    private pool: any;

    constructor(logger: LoggerService, dbDetails: any) {
        this.logger = logger;
        this.dbDetails = dbDetails; 
        this.createPool(); 
    }

    private createPool(){
        // Create a Postgresql pool 
        this.logger.info("Creating azure database pool");
        this.pool = new Pool({        
            host: this.dbDetails.host,
            port: this.dbDetails.port,
            user: this.dbDetails.user,
            password: this.dbDetails.password,
            database: this.dbDetails.database,
            options: '-c search_path='+this.dbDetails.schema,
            ssl: true,
          });
    }
    

    async getRecordsFromDatabaseForGivenQuery(queryString: any, appid: string) {
        let  client ;
        try {
            client= await this.pool.connect();
            const resultResponse =  await client.query(queryString,[appid]);
            this.logger.info(`Fetched azure data successfully for given query`);
            return resultResponse.rows;
        } catch (error) {
            this.logger.error(`Error in fetching azure data. Error: ${error}`);
            return null;
        }finally {
            client.release();
        }
    }

    async getTrendData(appid: string, tableName: string, selectFields: string, timestampConversion: string, lastMonthsLimit: number, additionalConditions: string = '') {
        this.logger.info(`Azure Querying trend data for appid - ${appid}`);
        const query = `
            SELECT 
                ${selectFields}, 
                DATE_PART('year' ,  TO_TIMESTAMP(${timestampConversion})) AS Year, 
                DATE_PART('month' , TO_TIMESTAMP(${timestampConversion})) AS Month 
            FROM 
                ${this.dbDetails.database}.${this.dbDetails.schema}.${tableName}
            WHERE 
                appid = $1 AND
                ${additionalConditions}
                TO_TIMESTAMP(${timestampConversion})>= DATE_TRUNC('month', CURRENT_DATE) - INTERVAL '${lastMonthsLimit} months'
            GROUP BY 
                DATE_PART('year' ,  TO_TIMESTAMP(${timestampConversion})), 
                DATE_PART('month' , TO_TIMESTAMP(${timestampConversion}))
            ORDER BY 
                Year, 
                Month
        `;
        const resultRecords: Array<[]> | undefined | null = await this.getRecordsFromDatabaseForGivenQuery(query,appid);
        const trendData = await this.transformRecordsToMetrics(resultRecords);
        this.logger.info(`Trend data fetched successfully for appid - ${appid}`);        
     //   this.logger.info(`Trend data for table - ${tableName} is ${JSON.stringify(trendData)}`);
        return trendData;
    }

    private async transformRecordsToMetrics(resultRecords: Array<[]> | undefined | null) {
        // If there are no records, return an empty array
        if (!resultRecords) {
            return [];
        }

        // Map over the result records
        return resultRecords.map(record => {
            const values = Object.values(record);
            // Extract values from the values
            const metricValue = values[0]!==null?values[0]: 0; // If metricValue is null, default to 0
            const year = Number(values[1]);
            const monthNumber = Number(values[2]);;

            // Create a date object for the first day of the given month and year
            // This is needed to get the month name from the month number
            const date = year && monthNumber ? new Date(year, monthNumber - 1) : null;

            // Format the date as MONTHNAME-YEARNUMBER
            const label = date ? `${date.toLocaleString('default', { month: 'long' })}-${year}` : null;

            // Return the new record
            return {
                label,
                count: metricValue
            };
        });
    }
}