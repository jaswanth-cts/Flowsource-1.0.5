import { LoggerService } from '@backstage/backend-plugin-api';
import { DatabaseService } from "./database.service";
import { BigQuery } from '@google-cloud/bigquery';

export class GoogleDatasetService implements DatabaseService {

    private logger: LoggerService;
    private dbDetails: any;

    constructor(logger: LoggerService, dbDetails: any) {
        this.logger = logger;
        this.dbDetails = dbDetails;
    }

    private getBigQueryClient() {
        if (this.dbDetails.private_key && this.dbDetails.client_email) {
            return new BigQuery({
                projectId: this.dbDetails.projectId,
                credentials: {
                    client_email: this.dbDetails.client_email,
                    private_key: this.dbDetails.private_key,
                },
            });
        } else if (this.dbDetails.projectId) {
            // Workload Identity or ADC
            return new BigQuery({
                projectId: this.dbDetails.projectId,
            });
        } else {
            throw new Error("GCP BigQuery configuration missing projectId.");
        }
    }

    async getRecordsFromDatabaseForGivenQuery(queryString: any, appid: string) {
        try {
            const bigqueryClient = this.getBigQueryClient();
            const options = {
                query: queryString,
                params: { appid: appid },
                useLegacySql: false,
            };

            const [rows] = await bigqueryClient.query(options);
            return rows;
        } catch (error) {
            this.logger.error(`Error in fetching big query data. Error: ${error}`);
            return null;
        }
    }

    async getTrendData(appid: string, tableName: string, selectFields: string, timestampConversion: string, lastMonthsLimit: number, additionalConditions: string = '') {
        this.logger.info(`Big Query Data Set  trend data for appid - ${appid}`);
        const query = `
            SELECT 
                ${selectFields}, 
                EXTRACT(YEAR FROM TIMESTAMP_SECONDS(${timestampConversion})) AS Year, 
                EXTRACT(MONTH FROM TIMESTAMP_SECONDS(${timestampConversion})) AS Month  
            FROM 
                ${this.dbDetails.projectId}.${this.dbDetails.datasetName}.${tableName}
            WHERE 
                appid = @appid AND
                ${additionalConditions}
                TIMESTAMP_SECONDS(${timestampConversion}) >= TIMESTAMP(DATE_SUB(DATE_TRUNC(CURRENT_DATE(), MONTH),  INTERVAL '${lastMonthsLimit}' MONTH))
            GROUP BY 
                Year, 
                Month
            ORDER BY 
                Year, 
                Month
        `;
        const resultRecords: Array<[]> | undefined | null = await this.getRecordsFromDatabaseForGivenQuery(query,appid);
        const trendData = await this.transformRecordsToMetrics(resultRecords);
        this.logger.info(`Trend data fetched successfully for appid - ${appid}`);
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
            const metricValue = values[0]!==null?values[0]: 0; // If metricValue is null, default to 1
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