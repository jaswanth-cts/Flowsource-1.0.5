import { apiRequest } from './apiRequest';
import { LoggerService } from '@backstage/backend-plugin-api';

const sprintFieldKey = 'customfield_10020';

export class JiraApiService {

    jiraBaseUrl: string;
    jiraUserEmail: string;
    logger: LoggerService;
    private headers: { [key: string]: string } = {};

    constructor(
        logger: LoggerService,
        jiraBaseUrl: string,
        jiraUserEmail: string,
        jiraAccessKey: string,
    ) {
        this.logger = logger;
        this.jiraBaseUrl = jiraBaseUrl;
        this.jiraUserEmail = jiraUserEmail;
        const credentials = `${jiraUserEmail}:${jiraAccessKey}`;
        this.headers = {
            Authorization: `Basic ${Buffer.from(credentials).toString('base64')}`,
        };
    }

    /**
     * Construct JQL query string.
     * @param projectKey - The JIRA project key.
     * @param issueType - The JIRA issue type.
     * @param durationDate - The duration date.
     * @param onlyActiveSprints - Whether to include only active sprints.
     * @param excludeIssueIds - The JIRA issue IDs to exclude.
     * @param status - The status of the JIRA issues.
     * @returns The constructed JQL query string.
     */
    private constructJqlQuery(projectKey: string, issueType: string, durationDate: string, onlyActiveSprints: boolean, excludeIssueIds: string[] | undefined, status: string | undefined): string {
        let jqlQuery = `project=${projectKey}`;
        jqlQuery += ` AND type = ${issueType}`;
        jqlQuery += ` AND created >= ${durationDate}`;
        if (onlyActiveSprints) {
            jqlQuery += ` AND Sprint in openSprints()`;
        }
        if (excludeIssueIds && excludeIssueIds.length > 0) {
            const issueKeysString = excludeIssueIds.join(', ');
            jqlQuery += ` AND id NOT IN (${issueKeysString})`;
        }
        if (status) {
            jqlQuery += ` AND status = '${status}'`;
        }
        return jqlQuery;
    }

    /**
     * Get approximate count of Jira issues.
     * @param projectKey - The JIRA project key.
     * @param durationInDays - The duration in days.
     * @param issueType - The JIRA issue type.
     * @param onlyActiveSprints - Whether to include only active sprints.
     * @returns The approximate count of Jira issues.
     */
    private async getJiraIssuesCount(projectKey: string, durationInDays: number, issueType: string, onlyActiveSprints: boolean = true) {
        try {
            const durationInMilliseconds = durationInDays * 24 * 60 * 60 * 1000;
            const durationDateTime = new Date(Date.now() - durationInMilliseconds);
            const durationDate = durationDateTime.toISOString().split('T')[0];

            const jqlQuery = this.constructJqlQuery(projectKey, issueType, durationDate, onlyActiveSprints, undefined, undefined);

            const body = { jql: jqlQuery };

            const response = await apiRequest('POST', `${this.jiraBaseUrl}search/approximate-count`, this.headers, this.logger, body);
            if (!response.ok) {
                const errorText = await response.text();
                const error = new Error(`HTTP error! status: ${response.status}, Response body: ${errorText}`);
                (error as any).status = response.status; // Attach status code to error object
                (error as any).response = response; // Attach response object to error object
                this.logger.error('Error in fetching approximate Jira Issues count ', error);
                throw error;
            }

            return await response.json();
        } catch (error: any) {
            this.logger.error('Error in fetching approximate count ', error);
            throw error;
        }
    }

    /**
     * Get Jira issues.
     * @param projectKey - The JIRA project key.
     * @param durationInDays - The duration in days.
     * @param issueType - The JIRA issue type.
     * @param maxResults - The maximum number of results.
     * @param startAt - The starting index.
     * @param onlyActiveSprints - Whether to include only active sprints.
     * @param excludeIssueIds - The issue IDs to exclude.
     * @param status - The status of the JIRA issues.
     * @returns The Jira issues.
     */
    private async getJiraIssues(projectKey: string, durationInDays: number, issueType: string, maxResults: number, nextPageToken: number,
        onlyActiveSprints: boolean = true,
        excludeIssueIds?: string[], status?: string) {
        try {
            console.log('nextPageToken', nextPageToken); //temp yarn tsc fix
            const durationInMilliseconds = durationInDays * 24 * 60 * 60 * 1000;
            const durationDateTime = new Date(Date.now() - durationInMilliseconds);
            const durationDate = durationDateTime.toISOString().split('T')[0];

            const jqlQuery = this.constructJqlQuery(projectKey, issueType, durationDate, onlyActiveSprints, excludeIssueIds, status);

            const body = {
                jql: jqlQuery,
                fields: ['status', 'summary', sprintFieldKey],
                maxResults: maxResults
            };

            const response = await apiRequest('POST', `${this.jiraBaseUrl}search/jql`, this.headers, this.logger, body);
            if (!response.ok) {
                const errorText = await response.text();
                // Check if the error message indicates the project does not exist
                if (errorText.includes(`The value '${projectKey}' does not exist for the field 'project'.`)) {
                    const projectNotFoundError = new Error(`No project found`);
                    (projectNotFoundError as any).status = 400; // Set status to 404 for "Not Found"
                    throw projectNotFoundError;
                }
        
                const error = new Error(`HTTP error! status: ${response.status}, Response body: ${errorText}`);
                (error as any).status = response.status; // Attach status code to error object
                (error as any).response = response; // Attach response object to error object
                this.logger.error('Error in fetching Jira Issues ', error);
                throw error;
            }
            const total_res = await this.getJiraIssuesCount(projectKey, durationInDays, 'Bug');
            
            const data = await response.json();
            const issues = data.issues.map((issue: any) => ({
                id: issue.id,
                key: issue.key,
                link: `${this.jiraBaseUrl.split('/rest')[0]}/browse/${issue.key}`,
                summary: issue.fields?.summary,
                status: issue.fields?.status?.name,
                sprint: issue.fields?.[sprintFieldKey]?.[0]?.name ?? ""
            }));

            return {
                issues: issues,
                nextPageToken: data.nextPageToken,
                total: total_res.count
            };

        } catch (error: any) {
            this.logger.error('Error in fetching testcases ', error);
            throw error;
        }
    }

    async getJiraStories(projectKey: string, durationInDays: number, maxResults: number = 100, startAt: number = 0, onlyActiveSprints: boolean, excludeIssueIds?: string[], status?: string) {
        return await this.getJiraIssues(projectKey, durationInDays, 'Story', maxResults, startAt, onlyActiveSprints, excludeIssueIds, status);
    }

    async getJiraDefects(projectKey: string, durationInDays: number, maxResults: number = 100, page: number = 1, onlyActiveSprints: boolean, excludeIssueIds?: string[], status?: string) {
        const startAt = (page - 1) * maxResults;
        return await this.getJiraIssues(projectKey, durationInDays, 'Bug', maxResults, startAt, onlyActiveSprints, excludeIssueIds, status);
    }

    async getJiraDefectsCount(projectKey: string, durationInDays: number, onlyActiveSprints: boolean) {
        const response = await this.getJiraIssuesCount(projectKey, durationInDays, 'Bug', onlyActiveSprints);
        return response ? response.count : 0;
    }

}
