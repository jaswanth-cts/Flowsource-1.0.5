import { apiRequest } from './apiRequest';
import { LoggerService } from '@backstage/backend-plugin-api';

export class ZephyrApiService {

    apiUrl: string;
    logger: LoggerService;
    private headers: { [key: string]: string } = {};

    constructor(logger: LoggerService, baseUrl: string, accessToken: string) {
        this.logger = logger;
        this.headers = {
            'Authorization': `Bearer ${accessToken}`,
        };
        this.apiUrl = baseUrl;
        if (!baseUrl.endsWith('/')) {
            this.apiUrl += '/';
        }
    }

    async getStatusByUrl(statusUrl: string) {
        try {
            const response = await apiRequest('GET', `${statusUrl}`, this.headers, this.logger);

            if (!response.ok) {
                const errorText = await response.text();
                const error = new Error(`HTTP error! status: ${response.status}, Response body: ${errorText}`);
                (error as any).status = response.status; // Attach status code to error object
                (error as any).response = response; // Attach response object to error object
                this.logger.error('Error in fetching status by url ', error);
                throw error;
            }

            return await response.json();

        } catch (error: any) {
            this.logger.error('Error in fetching status by url ', error);
            throw error;
        }
    }

    private async fetchByUrl(url: string, errorMessage: string) {
        try {
            const response = await apiRequest('GET', url, this.headers, this.logger);

            if (!response.ok) {
                const errorText = await response.text();
                const error = new Error(`HTTP error! status: ${response.status}, Response body: ${errorText}`);
                (error as any).status = response.status; // Attach status code to error object
                (error as any).response = response; // Attach response object to error object
                this.logger.error(errorMessage, error);
                throw error;
            }

            return await response.json();
        } catch (error: any) {
            this.logger.error(errorMessage, error);
            throw error;
        }
    }

    async getFolderByUrl(folderUrl: string) {
        return this.fetchByUrl(folderUrl, 'Error in fetching folder by url');
    }

    async getTestcaseByUrl(testCaseUrl: string) {
        return this.fetchByUrl(testCaseUrl, 'Error in fetching test case by url');
    }

    async getTestcases(projectKey: string, maxResults: number = 100, startAt: number = 0) {
        try {
            const queryParams = `projectKey=${projectKey}&maxResults=${maxResults}&startAt=${startAt}`;
            const response = await apiRequest('GET', `${this.apiUrl}testcases?${queryParams}`, this.headers, this.logger);

            if (!response.ok) {
                const errorText = await response.text();
                if (errorText.includes(`listTestCases.projectKey: must match`)) {
                    const projectNotFoundError = new Error(`No project found`);
                    (projectNotFoundError as any).status = 400; // Set status to 404 for "Not Found"
                    throw projectNotFoundError;
                }
        
                const error = new Error(`HTTP error! status: ${response.status}, Response body: ${errorText}`);
                (error as any).status = response.status; // Attach status code to error object
                (error as any).response = response; // Attach response object to error object
                this.logger.error('Error in fetching testcases ', error);
                throw error;
                
            }

            return await response.json();

        } catch (error: any) {
            this.logger.error('Error in fetching testcases ', error);
            throw error;
        }
    }

    async getTestcycles(projectKey: string, maxResults: number = 100, startAt: number = 0) {
        try {
            const queryParams = `projectKey=${projectKey}&maxResults=${maxResults}&startAt=${startAt}`;
            const response = await apiRequest('GET', `${this.apiUrl}testcycles?${queryParams}`, this.headers, this.logger);

            if (!response.ok) {
                const errorText = await response.text();
                if (errorText.includes(`listTestCycles.projectKey: must match`)) {
                    const projectNotFoundError = new Error(`No project found`);
                    (projectNotFoundError as any).status = 400; // Set status to 404 for "Not Found"
                    throw projectNotFoundError;
                }
                const error = new Error(`HTTP error! status: ${response.status}, Response body: ${errorText}`);
                (error as any).status = response.status; // Attach status code to error object
                (error as any).response = response; // Attach response object to error object
                this.logger.error('Error in fetching testcycles ', error);
                throw error;
            }

            return await response.json();

        } catch (error: any) {
            this.logger.error('Error in fetching testcycles ', error);
            throw error;
        }
    }

    async fetchAllTestExecutions(projectKey: string, testCycle?: string, actualEndDateAfter?: string, onlyLastExecutions: boolean = true) {
        let startAt = 0;
        const maxResults = 1000;
        let allTestExecutions: any[] = [];
        let total = 0;

        // Since we require the counts of passed, failed and unexecuted testcases, we need to fetch all test executions
        // This is because the API does not provide the necessary counts directly
        do {
            const response = await this.getTestExecutions(projectKey, maxResults, testCycle, actualEndDateAfter, onlyLastExecutions);
            allTestExecutions = allTestExecutions.concat(response.values);
            startAt += maxResults;
            total = response.total;
        } while (startAt < total);

        return allTestExecutions;
    }

    private async getTestExecutions(projectKey: string, maxResults: number = 100, testCycle?: string,
                            actualEndDateAfter?: string, onlyLastExecutions: boolean = true) {
        try {
            let queryParams = `projectKey=${projectKey}&maxResults=${maxResults}&onlyLastExecutions=${onlyLastExecutions}`;
            if (actualEndDateAfter) {
                queryParams += `&actualEndDateAfter=${actualEndDateAfter}`;
            }
            if (testCycle) {
                queryParams += `&testCycle=${testCycle}`;
            }
            const response = await apiRequest('GET', `${this.apiUrl}testexecutions?${queryParams}`, this.headers, this.logger);

            if (!response.ok) {
                const errorText = await response.text();
                const error = new Error(`HTTP error! status: ${response.status}, Response body: ${errorText}`);
                (error as any).status = response.status; // Attach status code to error object
                (error as any).response = response; // Attach response object to error object
                this.logger.error('Error in fetching test executions ', error);
                throw error;
            }

            return await response.json();

        } catch (error: any) {
            this.logger.error('Error in fetching test executions ', error);
            throw error;
        }
    }

}