import { RedshiftDataClient, ExecuteStatementCommand, GetStatementResultCommand, DescribeStatementCommand, Field } from "@aws-sdk/client-redshift-data";
import { LoggerService } from '@backstage/backend-plugin-api';
import { DatabaseService } from "./database.service";

export class AwsDatabaseService implements DatabaseService{

    private logger: LoggerService;
    private dbDetails: any;

    constructor(logger: LoggerService, dbDetails: any) {
        this.logger = logger;
        this.dbDetails = dbDetails;
    }

    private createCommandParams(sqlQuery: any) {
        const commandParams: any = {
            Database: this.dbDetails.database,
            Sql: sqlQuery,
        };
        if (this.dbDetails.clusterIdentifier && this.dbDetails.dbUser) {
            // Redshift specific configuration
            commandParams.ClusterIdentifier = this.dbDetails.clusterIdentifier;
            commandParams.DbUser = this.dbDetails.dbUser;
        } else if (this.dbDetails.workgroupName && this.dbDetails.secretArn) {
            // Redshift Serverless specific configuration
            commandParams.WorkgroupName = this.dbDetails.workgroupName;
            commandParams.SecretArn = this.dbDetails.secretArn;
        } else {
            throw new Error('Invalid database configuration. Please provide either Redshift or Redshift Serverless configuration.');
        }
        return commandParams;
    }

    private async waitForCommandToFinish(client: RedshiftDataClient, commandId: string | undefined) {
        let describeCommand = new DescribeStatementCommand({
            Id: commandId
        });

        let describeResponse = await client.send(describeCommand);
        while (describeResponse.Status !== 'FINISHED' && describeResponse.Status !== 'FAILED') {
            await new Promise(resolve => setTimeout(resolve, 1000)); // Wait for 1 second
            describeResponse = await client.send(describeCommand);
        }
        return describeResponse;
    }

    async getRecordsFromDatabaseForGivenQuery(sqlQuery: any) {
        // Create a RedshiftDataClient
        const client = new RedshiftDataClient({
            region: this.dbDetails.region,
            credentials: this.dbDetails.credentials,
        });

        const commandParams = this.createCommandParams(sqlQuery);
        const command = new ExecuteStatementCommand(commandParams);

        try {
            // Send the command
            const response = await client.send(command);
            const describeResponse = await this.waitForCommandToFinish(client, response.Id);

            if (describeResponse.Status === 'FAILED') {
                this.logger.error(`Error in fetching data. Error: ${describeResponse.Error}`);
                return null;
            }

            const resultCommand = new GetStatementResultCommand({
                Id: response.Id
            });

            const resultResponse = await client.send(resultCommand);
            this.logger.info(`Fetched data successfully for given query`);
            this.logger.debug('Given sqlQuery: ' + sqlQuery);
            return resultResponse.Records;
        } catch (error) {
            this.logger.error(`Error in fetching data. Error: ${error}`);
            return null;
        }
    }

    async getTrendData(appid: string, tableName: string, selectFields: string, timestampConversion: string, lastMonthsLimit: number, additionalConditions: string = '') {
        this.logger.info(`Querying trend data for appid - ${appid}`);
        const query = `
            SELECT 
                ${selectFields}, 
                DATE_PART(year, TIMESTAMP 'epoch' + ${timestampConversion} * INTERVAL '1 second') AS Year, 
                DATE_PART(month, TIMESTAMP 'epoch' + ${timestampConversion} * INTERVAL '1 second') AS Month 
            FROM 
                ${this.dbDetails.database}.${this.dbDetails.schema}.${tableName}
            WHERE 
                appid = '${appid}' AND
                ${additionalConditions}
                (TIMESTAMP 'epoch' + ${timestampConversion} * INTERVAL '1 second') >= DATE_TRUNC('month', CURRENT_DATE) - INTERVAL '${lastMonthsLimit} months'
            GROUP BY 
                DATE_PART(year, TIMESTAMP 'epoch' + ${timestampConversion} * INTERVAL '1 second'), 
                DATE_PART(month, TIMESTAMP 'epoch' + ${timestampConversion} * INTERVAL '1 second') 
            ORDER BY 
                Year, 
                Month
        `;
        const resultRecords: Field[][] | undefined | null = await this.getRecordsFromDatabaseForGivenQuery(query);
        const trendData = await this.transformRecordsToMetrics(resultRecords);
        this.logger.info(`Trend data fetched successfully for appid - ${appid}`);
        return trendData;
    }

    private async transformRecordsToMetrics(resultRecords: Field[][] | undefined | null) {
        // If there are no records, return an empty array
        if (!resultRecords) {
            return [];
        }

        // Map over the result records
        return resultRecords.map(record => {
            // Extract values from the record
            const metricValue = record[0]?.doubleValue ?? record[0]?.longValue ?? record[0]?.stringValue ?? 0; // If metricValue is null, default to 0
            const year = record[1]?.doubleValue;
            const monthNumber = record[2]?.doubleValue;

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
