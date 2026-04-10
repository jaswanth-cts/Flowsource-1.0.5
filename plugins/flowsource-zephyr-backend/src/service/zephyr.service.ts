import { LoggerService } from '@backstage/backend-plugin-api';
import { ZephyrApiService } from './zephyrApi.service';
import { JiraApiService } from './jiraApi.service';

export class ZephyrService {

    logger: LoggerService;
    zephyrApiService: ZephyrApiService;
    jiraApiService: JiraApiService;

    constructor(logger: LoggerService, zephyrApiService: ZephyrApiService, jiraApiService: JiraApiService) {
        this.logger = logger;
        this.zephyrApiService = zephyrApiService;
        this.jiraApiService = jiraApiService;
    }

    /**
     * Extract issue IDs from the Zephyr response.
     * @param values - The Zephyr response values.
     * @returns An array of issue IDs.
     */
    extractIssueIds = (values: any) => {
        const issueIds: number[] = [];
        if (values) {
            values.forEach((value: any) => {
                if (value.links && value.links.issues) {
                    value.links.issues.forEach((issue: any) => {
                        if (issue.issueId) {
                            issueIds.push(issue.issueId);
                        }
                    });
                }
            });
        }
        return issueIds;
    };

    /**
     * Get the count of test cases for a given project.
     * @param projectKey - The project key.
     * @returns The count of test cases.
     */
    async getTestcasesCount(projectKey: string) {
        try {
            // Get testcases from Zephyr for the given project
            const testcases = await this.zephyrApiService.getTestcases(projectKey, 1);
            const count = testcases ? testcases.total : 0;
            this.logger.debug(`Fetched the count of test cases for project ${projectKey}`);
            return count;
        } catch (error: any) {
            this.logger.error('Error in fetching testcases count ', error);
            throw error;
        }
    }

    /**
     * Fetch all test cases for a given project.
     * @param projectKey - The JIRA project key.
     * @returns An array of all test cases.
     */
    private async fetchAllTestcases(projectKey: string) {
        let startAt = 0;
        const maxResults = 1000;
        let allTestcases: any[] = [];
        let total = 0;

        do {
            const response = await this.zephyrApiService.getTestcases(projectKey, maxResults, startAt);
            allTestcases = allTestcases.concat(response.values);
            startAt += maxResults;
            total = response.total;
        } while (startAt < total);

        this.logger.debug(`Fetched all the test cases for project ${projectKey}`);
        return allTestcases;
    }

    /**
     * Fetch all test cycles for a given project.
     * @param jiraBaseUrl - The JIRA base URL.
     * @param projectKey - The JIRA project key.
     * @param page - The page number.
     * @param maxResults - The maximum number of results per page.
     * @returns Test cycles with status.
     */
    async fetchTestCycles(jiraBaseUrl: string, projectKey: string, page: number, maxResults: number) {
        try {
            const startAt = (page - 1) * maxResults;
            const testCycles = await this.zephyrApiService.getTestcycles(projectKey, maxResults, startAt);

            const testCyclesWithStatus = await Promise.all(
                testCycles.values.map(async (testCycle: any) => {
                    const testCycleStatus = await this.zephyrApiService.getStatusByUrl(testCycle.status.self);
                    return {
                        key: testCycle.key,
                        name: testCycle.name,
                        link: `${jiraBaseUrl.split('/rest')[0]}/projects/${projectKey}?selectedItem=com.atlassian.plugins.atlassian-connect-plugin:com.kanoah.test-manager__main-project-page#!/v2/testCycle/${testCycle.key}`,
                        status: testCycleStatus?.name
                    };
                }
            ));

            return {
                values: testCyclesWithStatus,
                total: testCycles.total
            };
        } catch (error: any) {
            this.logger.error('Error in fetching test cycles', error);
            throw error;
        }
    }

    /**
     * Fetch JIRA stories for a given project.
     * @param projectKey - The JIRA project key.
     * @param durationInDays - The duration in days.
     * @param onlyActiveSprints - Whether to include only active sprints.
     * @param excludeIssueIds - The JIRA issue IDs to exclude.
     * @returns JIRA stories
     */
    private async fetchJiraStories(projectKey: string, durationInDays: number, onlyActiveSprints: boolean, excludeIssueIds: string[],
        page: number, maxResults: number, status?: string) {
        const startAt = (page - 1) * maxResults;
        return await this.jiraApiService.getJiraStories(projectKey, durationInDays, maxResults, startAt, onlyActiveSprints, excludeIssueIds, status);
    }

    /**
     * Get stories which do not have test cases for a given project.
     * @param projectKey - The JIRA project key.
     * @param durationInDays - The duration in days.
     * @param onlyActiveSprints - Whether to include only active sprints.
     * @param page - The page number.
     * @param maxResults - The maximum number of results per page.
     * @param status - The status of the stories.
     * @returns Stories without test cases.
     */
    async getStoriesWithoutTestcases(projectKey: string, durationInDays: number, onlyActiveSprints: boolean, page: number, maxResults: number, status?: string) {
        try {
            // Get testcases from Zephyr for the given project
            const testcases = await this.fetchAllTestcases(projectKey);
            // Extract issueIds from the Zephyr response
            const storyIssueIds = this.extractIssueIds(testcases);
            const storyIssueIdSet = new Set(storyIssueIds);
            const storyIssueIdArray = Array.from(storyIssueIdSet).map((id) => id.toString());

            // Get stories from Jira for the given project and duration which do not have testcases
            // Note: Using `id NOT IN storyIssueIdArray` in the JQL query may affect performance, as we would have to send the entire list of issue keys in a single query
            const storiesWithoutTestcases = await this.fetchJiraStories(projectKey, durationInDays, onlyActiveSprints, storyIssueIdArray, page, maxResults, status);
            this.logger.debug(`Fetched the stories without test cases for project ${projectKey}`);
            return storiesWithoutTestcases;
        } catch (error: any) {
            this.logger.error('Error in fetching testcases ', error);
            throw error;
        }
    }

    /**
     * Get test cycle executions for a given project and test cycle key.
     * @param jiraBaseUrl - The JIRA base URL.
     * @param projectKey - The JIRA project key.
     * @param testCycleKey - The test cycle key.
     * @returns An array of test cases with their last execution details.
     */
    async getTestCycleExecutions(jiraBaseUrl: string, projectKey: string, testCycleKey: string) {
        try {
            const testExecutions = await this.zephyrApiService.fetchAllTestExecutions(projectKey, testCycleKey, undefined, true);

            const testCasesWithExecutions = await Promise.all(testExecutions.map(async (testExecution: any) => {

                // Fetch execution status and test case details in parallel
                const [testExecutionStatus, testCase] = await Promise.all([
                    this.zephyrApiService.getStatusByUrl(testExecution.testExecutionStatus.self),
                    this.zephyrApiService.getTestcaseByUrl(testExecution.testCase.self),
                ]);

                // Get folder name for the test case
                const folder = await this.zephyrApiService.getFolderByUrl(testCase.folder.self);

                return {
                    id: testCase.id,
                    key: testCase.key,
                    name: testCase.name,
                    link: `${jiraBaseUrl.split('/rest')[0]}/projects/${projectKey}?selectedItem=com.atlassian.plugins.atlassian-connect-plugin:com.kanoah.test-manager__main-project-page#!/v2/testCase/${testCase.key}`,
                    folder: folder.name,
                    lastExecution: {
                        id: testExecution.id,
                        key: testExecution.key,
                        testExecutionStatus: testExecutionStatus?.name
                    }
                };
            }));

            return testCasesWithExecutions;
        } catch (error: any) {
            this.logger.error('Error in fetching test cycle executions', error);
            throw error;
        }
    }

}
