import { apiRequest } from './apiRequest';
import AuthService from './authService';
import { LoggerService } from '@backstage/backend-plugin-api';

export class VeracodeService {
    logger: LoggerService;

    constructor(logger: LoggerService) {
        this.logger = logger;
    }

    baseUrl: string = `https://api.veracode.com/`;

    async getSummaryReport(appName: any, apiId: string, apiKey: string) {

        // Get the application GUID using the application name
        const appGUID = await this.getApplicationGUID(appName, apiId, apiKey, this.baseUrl);
        this.logger.info("Application GUID: " + appGUID.toString());

        // Api call for fetching the summary report details
        const apiUrl = `${this.baseUrl}appsec/v2/applications/${appGUID}/summary_report`;
        const authService = new AuthService();
        const HmacHeader = await authService.generateAuthHeader(apiId, apiKey, apiUrl, 'GET');
        const headers = {
            'Authorization': `${HmacHeader}`
        }
        try {
            const response = await apiRequest('GET', apiUrl, headers, this.logger, null);
            const data = await response.json();
            return data;

        } catch (error: any) {
            this.logger.error("Error Fetching summary report info from Veracode: ", error);
            throw error;
        }
    }

    async getApplicationGUID(appName: any, apiId: string, apiKey: string, baseUrl: string) {
        const apiUrl = `${baseUrl}appsec/v1/applications?name=${appName}`;
        // const params = { name: `${appName}` };
        const authService = new AuthService();
        const HmacHeader = await authService.generateAuthHeader(apiId, apiKey, apiUrl, 'GET');
        const headers = {
            'Authorization': `${HmacHeader}`
        }
        try {
            const response = await apiRequest('GET', apiUrl, headers, this.logger, null);
            const data = await response.json();
            if(!data._embedded){
                const ApplicationNotFoundError = new Error(`No application found`);
                (ApplicationNotFoundError as any).status = 400; // Set status to 400 for "Not Found"
                throw ApplicationNotFoundError;
            }
            return data._embedded.applications[0].guid;
        } catch (error: any) {
            this.logger.error("Error Fetching application GUID from Veracode: ", error);
            throw error;
        }
    }

    // Process the output from the summary report API to get the required fields
    processOutputSummaryReport(output: any) {

        // Calculate the total lines of code
        // If there are multiple modules in the output, sum up the loc of each module
        let totalLoc = 0;
        if (output['static-analysis'] && output['static-analysis'].modules && output['static-analysis'].modules.module) {
            for (const module of output['static-analysis'].modules.module) {
                totalLoc += module.loc;
            }
        }

        // Calculate the total number of flaws per level
        let totalCountPerLevel: any = {};

        // Loop through each severity level and sum up the count of each category
        for (let severity of output['severity']) {
            let level = severity.level;
            let totalCount = 0;

            for (let category of severity.category) {
                totalCount += category.count;
            }
            totalCountPerLevel["Level " + level] = totalCount;
        }

        // Get the top 5 categories by severity level and count
        let allCategories = [];

        for (let severity of output['severity']) {
            for (let category of severity.category) {
                // Add the level to each category
                category.level = severity.level;
                allCategories.push(category);
            }
        }

        // Sort the categories by level and count
        allCategories.sort((a, b) => b.level - a.level || b.count - a.count);

        // Take the top 5 categories
        const top5Categories = allCategories.slice(0, 5);

        const processedOutput = {
            app_name: output.app_name,
            policy_name: output.policy_name,
            policy_compliance_status: output.policy_compliance_status,
            last_update_time: output.last_update_time,
            score: output['static-analysis']?.score,
            rating: output['static-analysis']?.rating,
            loc: totalLoc,
            flaw_status: {
                new_flaws: output['flaw-status']?.new,
                open_flaws: output['flaw-status']?.open,
                reopen_flaws: output['flaw-status']?.reopen,
                fixed_flaws: output['flaw-status']?.fixed
            },
            flaws_by_severity: totalCountPerLevel,
            top_5_categories: top5Categories
        };
        return processedOutput;

    }

}