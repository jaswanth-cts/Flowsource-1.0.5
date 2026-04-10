import { apiRequest } from './apiRequest';
import { JiraBackendCommonService } from './jiraBackendCommon.service';
import { LoggerService } from '@backstage/backend-plugin-api';

export class JiraBackendGraphDataService {
  private headers: { [key: string]: string } = {};
  logger: LoggerService;
  objOptions = {
    jiraUserEmail: '',
    jiraAccessKey: '',
    jiraBaseUrl: '',
  };
  jiraBackendCommonService: any;

  constructor(
    jiraUserEmail: string,
    jiraAccessKey: string,
    jiraBaseUrl: string,
    logger: LoggerService,
  ) {
    this.objOptions.jiraUserEmail = jiraUserEmail;
    this.objOptions.jiraAccessKey =
      'Basic ' + btoa(jiraUserEmail + ':' + jiraAccessKey);
    this.objOptions.jiraBaseUrl = jiraBaseUrl;
    this.jiraBackendCommonService = new JiraBackendCommonService(
      this.objOptions.jiraUserEmail,
      this.objOptions.jiraAccessKey,
      this.objOptions.jiraBaseUrl,
      logger,
    );
    this.headers = {
      Authorization: this.objOptions.jiraAccessKey,
    };
    this.logger = logger;
  }

  async fetchIssueInfoParallel(
    projectName: string,
    nextPageToken:string,
    durationDate: string,
    issueTypes:any,
    storyPointsFieldName: string,
    jiraFilterFieldKey: string,
    jiraFilterFieldValue: string,
    filterId: string,
  ): Promise<any> {
    const res: any = { issueDetails: {}, total: 0 };
    const issueDetails : any = {};
    issueTypes = await this.getIssueTypesForProject(projectName);

    // Dynamically create arrays for each issue type
    issueTypes.forEach((issueType: any) => {
        const arrayName = issueType.replace(/[- ]/g, '').toLowerCase() + 'Details';
        issueDetails[arrayName] = [];
    });

    // Fetch initial issue info
    let response = await this.jiraBackendCommonService.getIssueInfo(
      projectName,
      nextPageToken,
      durationDate,
      issueTypes,
      storyPointsFieldName,
      jiraFilterFieldKey,
      jiraFilterFieldValue,
      filterId,
    );

    if (response) {
      // Dynamically push response data into corresponding arrays
      issueTypes.forEach((issueType: any) => {
        const arrayName = issueType.replace(/[- ]/g, '').toLowerCase() + 'Details';
        issueDetails[arrayName].push(...response[arrayName]);
      });
      const issueCount = response.total;
      if (issueCount > 100) {
        let startAtValues = Array.from(
          { length: Math.ceil(Number(issueCount) / 100) },
          (_, index) => index * 100,
        );
        startAtValues = startAtValues.slice(1);
        const additionalResponses = await Promise.all(
          startAtValues.map(() =>
            this.jiraBackendCommonService.getIssueInfo(
              projectName,
              nextPageToken,
              durationDate,
              issueTypes,
              storyPointsFieldName,
              jiraFilterFieldKey,
              jiraFilterFieldValue,
              filterId,
            ),
          ),
        );

        if (additionalResponses) {
          additionalResponses.forEach((res: any) => {
            // Dynamically push additional response data into corresponding arrays
            issueTypes.forEach((issueType: any) => {
              const arrayName = issueType.replace(/[- ]/g, '').toLowerCase() + 'Details';
              issueDetails[arrayName].push(...res[arrayName]);
            });
          });
        }
      }
    }
    res.issueDetails = issueDetails;
    res.total = response.total;
    return res;
  }

  async getProjectId(projectName: string): Promise<any> {
    try {
        const res = await apiRequest(
            'GET',
            `${this.objOptions.jiraBaseUrl}project/${projectName}`,
            this.headers,
            this.logger,
        )
        if (!res.ok) {
            const errorText = await res.text();
            const error = new Error(`HTTP error! status: ${res.status}, Response body: ${errorText}`);
            (error as any).status = res.status; // Attach status code to error object
            (error as any).response = res; // Attach response object to error object
            throw error;
        }
        const data = await res.text();
        const jsonData = JSON.parse(data);
        const projectId = jsonData.id;


        return projectId;
    } catch (error: any) {
        if (error.response) {
            this.logger.info('Get project id - Server responded with status code:', error.response.status);
        } else if (error instanceof Error) {
            this.logger.info('Get project id - No response received:', error);
        } else {
            this.logger.info('Get project id - Error creating request:', error.message);
        }
        this.logger.error('Error in getProjectId - ', error as Error);
        throw error;
    }
}
async getIssueTypesForProject(projectName: string): Promise<any> {
    try {
        const issueTypes: string[] = [];
        const projectId = await this.getProjectId(projectName);

        const res = await apiRequest(
            'GET',
            `${this.objOptions.jiraBaseUrl}issuetype/project?projectId=${projectId}`,
            this.headers,
            this.logger,
        )
        if (!res.ok) {
            const errorText = await res.text();
            const error = new Error(`HTTP error! status: ${res.status}, Response body: ${errorText}`);
            (error as any).status = res.status; // Attach status code to error object
            (error as any).response = res; // Attach response object to error object
            throw error;
        }
        const data = await res.text();
        const jsonData = JSON.parse(data);

        for (let i = 0; i < jsonData.length; i++) {
            issueTypes.push(jsonData[i].name);
        }
        return issueTypes;
    } catch (error: any) {
        if (error.response) {
            this.logger.info('Get all Statuses - Server responded with status code:', error.response.status);
        } else if (error instanceof Error) {
            this.logger.info('Get all Statuses - No response received:', error);
        } else {
            this.logger.info('Get all Statuses - Error creating request:', error.message);
        }
        this.logger.error('Error in getStatusesForProject - ', error as Error);
        throw error;
    }
}

  async getFilterDetails(): Promise<any> {}

    async getStatusesForProject(projectName: string): Promise<any> {
        try {
            const statuses: string[] = ['All'];
            const MAX_ITERATIONS = 25;
            const res = await apiRequest(
                'GET',
                `${this.objOptions.jiraBaseUrl}project/${projectName}/statuses`,
                this.headers,
                this.logger,
            );
    
            if (!res.ok) {
                const errorText = await res.text();
                
                // Check if the error message indicates the project does not exist
                if (errorText.includes(`No project could be found with key '${projectName}'`)) {
                    const projectNotFoundError = new Error(`Project not found: ${projectName}`);
                    (projectNotFoundError as any).status = 404; // Set status to 404 for "Not Found"
                    throw projectNotFoundError;
                }
    
                const error = new Error(`HTTP error! status: ${res.status}, Response body: ${errorText}`);
                (error as any).status = res.status; // Attach status code to error object
                (error as any).response = res; // Attach response object to error object
                throw error;
            }
    
            const data = await res.text();
            const jsonData = JSON.parse(data);
            const response = jsonData[0].statuses;
            
            if (response.length < MAX_ITERATIONS) {
                for (let i = 0; i < response.length; i++) {
                    statuses.push(response[i].name);
                }
            } else {
                this.logger.info('Statuses count is more than:', MAX_ITERATIONS as any);
            }
            
            return statuses;
            
        } catch (error: any) {
            if (error.response) {
                this.logger.info('Get all Statuses - Server responded with status code:', error.response.status);
            } else if (error instanceof Error) {
                this.logger.info('Get all Statuses - No response received:', error as Error);
            } else {
                this.logger.info('Get all Statuses - Error creating request:', error.message);
            }
            this.logger.error('Error in getStatusesForProject - ', error as Error);
            throw error;
        }
    }

  async getAllPriorities(): Promise<any> {
    try {
      const priorities: string[] = [];
      const MAX_ITERATIONS = 25;
      const res = await apiRequest(
        'GET',
        `${this.objOptions.jiraBaseUrl}priority`,
        this.headers,
        this.logger,
      );
      if (!res.ok) {
        const errorText = await res.text();
        const error = new Error(
          `HTTP error! status: ${res.status}, Response body: ${errorText}`,
        );
        (error as any).status = res.status; // Attach status code to error object
        (error as any).response = res; // Attach response object to error object
        throw error;
      }
      const data = await res.text();
      const reponse = JSON.parse(data);
      if (reponse.length < MAX_ITERATIONS) {
        for (let i = 0; i < reponse.length; i++) {
          priorities.push(reponse[i].name);
        }
      } else {
        this.logger.info('Priorities count is more than:', MAX_ITERATIONS as any);
      }
      return priorities;
    } catch (error: any) {
      if (error.response) {
        this.logger.info(
          'Get all Priorities - Server responded with status code:',
          error.response.status,
        );
      } else if (error instanceof Error) {
        this.logger.info('Get all Priorities - No response received:', error);
      } else {
        this.logger.info(
          'Get all Priorities - Error creating request:',
          error.message,
        );
      }
      this.logger.error('Error in getAllPriorities - ', error as Error);
      throw error;
    }
  }

  async dataParsingForIssueType(
    issueDetails: any,
    priorities: any,
    statuses: string[],
  ): Promise<any> {
    try {
      // Initialize response object with 0 counts for each priority level
      const countByPriority: Record<string, number> = {};
      priorities.forEach((priority: string) => {
        countByPriority[priority.toLowerCase()] = 0;
      });

      // Construct response object dynamically based on the obtained statuses
      const typeCountByStatus: Record<string, number> = {};
      statuses.forEach((status: string) => {
        const formattedStatus = status;
        typeCountByStatus[formattedStatus] = 0;
      });

      // Count the occurrences of each priority level in issueDetails
      if (issueDetails !== null) {
        for (const issue of issueDetails) {
          const priority = issue.priority.toLowerCase();
          if (countByPriority.hasOwnProperty(priority)) {
            countByPriority[priority]++;
          }
          const status = issue.status;
          const formattedStatus = status;
          if (typeCountByStatus.hasOwnProperty(formattedStatus)) {
            typeCountByStatus[formattedStatus]++;
          }
        }
      }

      return { countByPriority, typeCountByStatus };
    } catch (error) {
      this.logger.error('Error in dataParsingForIssueTypeCountByPriority:', error as Error);
      throw error;
    }
  }

  async getGraphData(
    projectName: string,
    nextPageToken: string,
    durationDaysCatalog: number,
    durationConfig: number,
    jiraStoryPointsFieldCatalog: string,
    jiraStoryPointsFieldConfig: string,
    jiraFilterFieldKey: string,
    jiraFilterFieldValue: string,
    filterId: string,
  ): Promise<any> {
    try {
      const durationInDays = durationDaysCatalog || durationConfig;
      const durationInMilliseconds = durationInDays * 24 * 60 * 60 * 1000;
      const durationDateTime = new Date(Date.now() - durationInMilliseconds);
      const durationDate = durationDateTime.toISOString().split('T')[0];
      const storyPointsFieldName =
        jiraStoryPointsFieldCatalog || jiraStoryPointsFieldConfig;
      const issueTypes = await this.getIssueTypesForProject(projectName);
      const resp = await this.fetchIssueInfoParallel(
        projectName,
        nextPageToken,
        durationDate,
        issueTypes,
        storyPointsFieldName,
        jiraFilterFieldKey,
        jiraFilterFieldValue,
        filterId,
      );
      const response: any = {};

      const issueCountByStatus: Record<string, number> = {};
      const priorities = await this.getAllPriorities();

      response.priorityChart = {
        chartLabels: priorities,
      };

      const statuses = await this.getStatusesForProject(projectName);

    // Dynamically form the response based on the issue types
    for (const issueType of issueTypes) {
      const arrayName = issueType.replace(/[- ]/g, '').toLowerCase() + 'Details';
      const details = resp.issueDetails[arrayName] || [];
        const data = await this.dataParsingForIssueType(
          details,
          priorities,
          statuses,
        );
        response.priorityChart[issueType] = priorities.map(
          (priority: any) => data.countByPriority[priority.toLowerCase()],
        );

        for (const [status, count] of Object.entries<number>(
          data.typeCountByStatus,
        )) {
          issueCountByStatus[status] =
            (issueCountByStatus[status] || 0) + count;
        }
        if (issueType === 'Story') {
          response.storyDetails = {
            storyLength: details.length,
            jiraStoryInfo: details?.splice(0, 10),
            storyLink:
              this.objOptions.jiraBaseUrl.split('/rest')[0] + '/browse/',
          };
        }
      }
      const uniqueIssueCountByStatus = Object.entries(issueCountByStatus).map(
        ([statusName, statusValue]) => ({
          statusName,
          statusValue,
        }),
      );
      response.issueCountByStatus = uniqueIssueCountByStatus as {
        statusName: string;
        statusValue: number;
      }[];
      response.total = resp.total;
      return response;
    } catch (error) {
      this.logger.error('Error in getGraphData:', error as Error);
      throw error;
    }
  }
}